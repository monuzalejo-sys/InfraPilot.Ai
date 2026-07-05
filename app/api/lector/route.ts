import Groq from "groq-sdk"
import { NextRequest, NextResponse } from "next/server"
import type {
  Apu,
  ApuComponent,
  ApuComponentType,
  LectorKind,
  LectorResult,
  PriceItem,
} from "@/lib/lector-types"

const MAX_INPUT = 60_000 // 60KB cap on the text handed to Groq
const FETCH_TIMEOUT = 10_000

// ── URL ingestion ─────────────────────────────────────────────
// Fetches a URL server-side, accepts text/html|plain|csv, caps at 60KB and
// strips HTML down to plain text. Returns null-shaped errors via thrown Error
// so the handler can answer 422 with a clear message.
async function fetchUrlAsText(url: string): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT)

  let res: Response
  try {
    res = await fetch(url, {
      signal: controller.signal,
      headers: { "user-agent": "InfraPilot-Lector/1.0" },
      redirect: "follow",
    })
  } catch {
    throw new Error("No se pudo acceder a la URL (tiempo agotado o inalcanzable).")
  } finally {
    clearTimeout(timer)
  }

  if (!res.ok) throw new Error(`La URL respondió ${res.status}. Verifica el enlace.`)

  const contentType = res.headers.get("content-type") ?? ""
  const ok = ["text/html", "text/plain", "text/csv"].some((t) => contentType.includes(t))
  if (!ok) throw new Error("La URL no devuelve texto legible (se esperaba HTML, texto o CSV).")

  const raw = (await res.text()).slice(0, MAX_INPUT)
  const text = stripHtml(raw)
  if (text.trim().length < 20) throw new Error("La URL no contiene texto suficiente para analizar.")
  return text
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

// ── Sanitizers ────────────────────────────────────────────────
function num(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v
  if (typeof v === "string") {
    const n = parseFloat(v.replace(/[^0-9.,-]/g, "").replace(/\.(?=\d{3}\b)/g, "").replace(",", "."))
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : ""
}

function sanitizePriceItems(raw: unknown[]): PriceItem[] {
  return raw
    .map((r) => {
      const o = (r ?? {}) as Record<string, unknown>
      return {
        name: str(o.name),
        unit: str(o.unit),
        price: num(o.price),
        category: str(o.category) || undefined,
        supplier: str(o.supplier) || undefined,
      }
    })
    .filter((p) => p.name.length > 0)
}

const COMP_TYPES: ApuComponentType[] = ["material", "mano_obra", "equipo"]

function sanitizeComponents(raw: unknown[]): ApuComponent[] {
  return raw
    .map((r) => {
      const o = (r ?? {}) as Record<string, unknown>
      const t = str(o.type).toLowerCase().replace(/\s+/g, "_")
      return {
        type: (COMP_TYPES.includes(t as ApuComponentType) ? t : "material") as ApuComponentType,
        name: str(o.name),
        unit: str(o.unit),
        quantity: num(o.quantity),
        unit_price: num(o.unit_price),
      }
    })
    .filter((c) => c.name.length > 0)
}

function sanitizeApus(raw: unknown[]): Apu[] {
  return raw
    .map((r) => {
      const o = (r ?? {}) as Record<string, unknown>
      const components = sanitizeComponents(Array.isArray(o.components) ? o.components : [])
      return {
        code: str(o.code) || undefined,
        name: str(o.name),
        unit: str(o.unit),
        total: o.total != null ? num(o.total) : undefined,
        components,
      }
    })
    .filter((a) => a.name.length > 0)
}

const SYSTEM_PROMPT = `Eres un asistente que estructura datos de construcción a partir de texto crudo (tablas de precios, listas de materiales o APUs copiados de un PDF, web o Excel).

Devuelve ÚNICAMENTE un objeto JSON válido, sin explicaciones ni markdown, con esta forma exacta:
{
  "kind": "price_items" | "apus" | "unknown",
  "confianza": number,   // 0 a 1, qué tan seguro estás de la clasificación
  "items": [ ... ]
}

Reglas:
- Si el texto es una lista/tabla de precios de insumos o materiales, kind = "price_items" e items = objetos:
  { "name": string, "unit": string, "price": number, "category"?: string, "supplier"?: string }
  (category sugerida: material, mano_obra o equipo cuando sea evidente).
- Si el texto son análisis de precios unitarios (partidas con componentes de material/mano de obra/equipo), kind = "apus" e items = objetos:
  { "code"?: string, "name": string, "unit": string, "total"?: number,
    "components": [ { "type": "material"|"mano_obra"|"equipo", "name": string, "unit": string, "quantity": number, "unit_price": number } ] }
- Si no puedes identificarlo, kind = "unknown" e items = [].
- price / unit_price / quantity / total son números sin símbolos de moneda ni separadores de miles.
- No inventes filas: extrae sólo lo que esté en el texto.`

export async function POST(req: NextRequest) {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { error: "GROQ_API_KEY no configurada. Agrega la clave en .env.local" },
      { status: 500 }
    )
  }

  let input: string
  try {
    const body = await req.json()
    input = typeof body?.input === "string" ? body.input.trim() : ""
  } catch {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido" }, { status: 400 })
  }

  if (input.length < 5) {
    return NextResponse.json({ error: "Pega algún dato o una URL para analizar" }, { status: 400 })
  }

  // Resolve URLs to plain text before structuring.
  let text = input
  if (/^https?:\/\//i.test(input)) {
    try {
      text = await fetchUrlAsText(input)
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo leer la URL"
      return NextResponse.json({ error: message }, { status: 422 })
    }
  }

  text = text.slice(0, MAX_INPUT)

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 8000,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Estructura estos datos:\n\n${text}` },
      ],
    })

    const raw = completion.choices[0]?.message?.content ?? ""

    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(raw)
    } catch {
      const match = raw.match(/\{[\s\S]*\}/)
      if (!match) throw new Error("El modelo no devolvió JSON válido. Intenta de nuevo.")
      parsed = JSON.parse(match[0])
    }

    const rawKind = str(parsed.kind)
    const kind: LectorKind =
      rawKind === "price_items" || rawKind === "apus" ? rawKind : "unknown"

    let confianza = num(parsed.confianza)
    if (confianza > 1) confianza = confianza / 100 // tolerate 0–100 answers
    confianza = Math.max(0, Math.min(1, confianza))

    const rawItems = Array.isArray(parsed.items) ? parsed.items : []
    const items =
      kind === "price_items"
        ? sanitizePriceItems(rawItems)
        : kind === "apus"
          ? sanitizeApus(rawItems)
          : []

    const result: LectorResult = {
      kind: items.length === 0 ? "unknown" : kind,
      confianza,
      items,
    }

    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
