"use client"

import { useState } from "react"
import Link from "next/link"
import { Sparkles, Trash2, ArrowRight, Loader2 } from "lucide-react"
import { EditorialCard, MonoLabel } from "@/components/editorial"
import { DemoNotice } from "@/components/demo-notice"
import { isSupabaseConfigured } from "@/lib/supabase/client"
import type { Apu, LectorResult, PriceItem } from "@/lib/lector-types"

// price_items category (Groq label) → DB Category enum used by /api/prices
function toDbCategory(c?: string): "material" | "labor" | "equipment" {
  const v = (c ?? "").toLowerCase()
  if (v.startsWith("mano") || v === "labor") return "labor"
  if (v.startsWith("equip")) return "equipment"
  return "material"
}
// apu component type → DB Category enum used by /api/apus
function compToDbCategory(t: string): "material" | "labor" | "equipment" {
  if (t === "mano_obra") return "labor"
  if (t === "equipo") return "equipment"
  return "material"
}

const EXAMPLES: Record<string, string> = {
  "lista de precios": `Cemento Portland Tipo I  BOL  28.50
Arena gruesa  M3  55.00
Ladrillo King Kong 18 huecos  UND  0.85
Fierro corrugado 1/2"  VAR  32.00`,
  APU: `Partida: Concreto f'c=210 kg/cm2  UND: M3
Cemento Portland  BOL  8.5  28.50
Arena gruesa  M3  0.52  55.00
Piedra chancada  M3  0.53  60.00
Operario  HH  1.6  22.00
Peón  HH  8.0  16.00
Mezcladora 9-11 p3  HM  0.8  15.00`,
  URL: "https://",
}

type Row = Record<string, unknown>

export default function LectorPage() {
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<LectorResult | null>(null)
  const [rows, setRows] = useState<Row[]>([])
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState<{ count: number; kind: string } | null>(null)

  const identify = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    setApplied(null)
    try {
      const res = await fetch("/api/lector", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? "No se pudo procesar la solicitud")
        return
      }
      const data = json as LectorResult
      setResult(data)
      setRows((data.items as unknown as Row[]).map((r) => ({ ...r })))
      if (data.kind === "unknown") {
        setError("No se pudieron identificar datos estructurables. Prueba con una tabla de precios o un APU.")
      }
    } catch {
      setError("Error de red al contactar el analizador")
    } finally {
      setLoading(false)
    }
  }

  const updateCell = (i: number, key: string, value: unknown) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)))
  }
  const removeRow = (i: number) => setRows((prev) => prev.filter((_, idx) => idx !== i))

  const apply = async () => {
    if (!result) return
    setApplying(true)
    setError(null)
    let count = 0
    try {
      if (result.kind === "price_items") {
        for (const r of rows as unknown as PriceItem[]) {
          const res = await fetch("/api/prices", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code: r.supplier || undefined,
              description: r.name,
              unit: r.unit,
              unit_price: Number(r.price) || 0,
              category: toDbCategory(r.category),
            }),
          })
          if (res.ok) count++
        }
      } else if (result.kind === "apus") {
        for (const r of rows as unknown as Apu[]) {
          const res = await fetch("/api/apus", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code: r.code || undefined,
              description: r.name,
              unit: r.unit,
              components: (r.components ?? []).map((c) => ({
                category: compToDbCategory(c.type),
                description: c.name,
                unit: c.unit,
                unit_price: Number(c.unit_price) || 0,
                quantity: Number(c.quantity) || 0,
              })),
            }),
          })
          if (res.ok) count++
        }
      }
      if (count === 0) {
        setError("No se pudo guardar. ¿Sesión iniciada? Revisa tu conexión a la base de datos.")
      } else {
        setApplied({ count, kind: result.kind })
      }
    } finally {
      setApplying(false)
    }
  }

  const isApu = result?.kind === "apus"
  const canApply = isSupabaseConfigured && rows.length > 0 && result?.kind !== "unknown"

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-8">
      {!isSupabaseConfigured && <DemoNotice />}

      <header className="space-y-1">
        <MonoLabel>Lector de Datos IA</MonoLabel>
        <h1 className="text-2xl font-semibold text-[var(--ink)]">Alimenta el sistema en pocas palabras</h1>
        <p className="text-sm text-[var(--muted)]">
          Pega una tabla de precios, una lista de materiales o un APU (de un PDF, web o Excel), o una URL.
          La IA lo identifica, lo estructura y lo aplica a tu sistema.
        </p>
      </header>

      {/* Input */}
      <EditorialCard title="Entrada">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pega datos o una URL…"
          rows={8}
          className="w-full resize-y rounded-[2px] border border-[var(--hairline)] bg-[var(--paper)] p-3 font-mono text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="mono-label mr-1">Ejemplos</span>
          {Object.keys(EXAMPLES).map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setInput(EXAMPLES[label])}
              className="rounded-[2px] border border-[var(--hairline)] bg-[var(--paper)] px-2.5 py-1 text-xs text-[var(--muted)] transition-colors hover:border-[var(--brass)] hover:text-[var(--ink)]"
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={identify}
            disabled={loading || input.trim().length < 5}
            className="ml-auto inline-flex items-center gap-2 rounded-[2px] bg-[var(--brass)] px-4 py-2 text-sm font-medium text-[var(--paper)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Identificando…" : "Identificar datos"}
          </button>
        </div>
      </EditorialCard>

      {error && (
        <div className="rounded-[2px] border border-[var(--warn)]/30 bg-[var(--warn)]/10 px-4 py-3 text-sm text-[var(--warn)]">
          {error}
        </div>
      )}

      {applied && (
        <div className="flex flex-wrap items-center gap-3 rounded-[2px] border border-[var(--ok)]/30 bg-[var(--ok)]/10 px-4 py-3 text-sm text-[var(--ok)]">
          <span>
            {applied.count} {applied.kind === "apus" ? "APU(s)" : "precio(s)"} aplicado(s) al sistema.
          </span>
          <Link
            href={applied.kind === "apus" ? "/apus" : "/precios"}
            className="inline-flex items-center gap-1 font-medium underline underline-offset-2"
          >
            Ver en {applied.kind === "apus" ? "APUs" : "Base de Precios"}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Preview */}
      {result && result.kind !== "unknown" && rows.length > 0 && (
        <EditorialCard
          title="Vista previa · editable"
          action={
            <div className="flex items-center gap-2">
              <span className="rounded-[2px] border border-[var(--brass)] px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider text-[var(--brass)]">
                {isApu ? "APU" : "Precios"}
              </span>
              <span className="font-mono text-[11px] text-[var(--muted)]">
                confianza {Math.round(result.confianza * 100)}%
              </span>
            </div>
          }
        >
          {isApu ? (
            <ApuPreview rows={rows} update={updateCell} remove={removeRow} />
          ) : (
            <PricePreview rows={rows} update={updateCell} remove={removeRow} />
          )}

          <div className="mt-4 flex items-center justify-between">
            <span className="font-mono text-xs text-[var(--muted)]">{rows.length} fila(s)</span>
            <button
              type="button"
              onClick={apply}
              disabled={!canApply || applying}
              title={!isSupabaseConfigured ? "Requiere conexión a base de datos" : undefined}
              className="inline-flex items-center gap-2 rounded-[2px] bg-[var(--brass)] px-4 py-2 text-sm font-medium text-[var(--paper)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              {applying ? "Aplicando…" : "Aplicar al sistema"}
            </button>
          </div>
        </EditorialCard>
      )}
    </div>
  )
}

// ── Editable cell ─────────────────────────────────────────────
function Cell({
  value,
  onChange,
  type = "text",
  align = "left",
}: {
  value: unknown
  onChange: (v: string) => void
  type?: "text" | "number"
  align?: "left" | "right"
}) {
  return (
    <input
      type={type}
      value={value == null ? "" : String(value)}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-[2px] border border-transparent bg-transparent px-1.5 py-1 text-sm text-[var(--ink)] outline-none hover:border-[var(--hairline)] focus:border-[var(--brass)] focus:bg-[var(--paper)] ${
        type === "number" || align === "right" ? "text-right font-mono" : ""
      }`}
    />
  )
}

const TH = "px-2 py-2 text-left mono-label"

function PricePreview({
  rows,
  update,
  remove,
}: {
  rows: Row[]
  update: (i: number, key: string, v: unknown) => void
  remove: (i: number) => void
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--hairline)]">
            <th className={TH}>Descripción</th>
            <th className={`${TH} w-20`}>Und</th>
            <th className={`${TH} w-28 text-right`}>Precio</th>
            <th className={`${TH} w-28`}>Categoría</th>
            <th className="w-10 px-2 py-2" />
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-[var(--hairline)]/60">
              <td className="px-1">
                <Cell value={r.name} onChange={(v) => update(i, "name", v)} />
              </td>
              <td className="px-1">
                <Cell value={r.unit} onChange={(v) => update(i, "unit", v)} />
              </td>
              <td className="px-1">
                <Cell value={r.price} type="number" onChange={(v) => update(i, "price", v)} />
              </td>
              <td className="px-1">
                <Cell value={r.category} onChange={(v) => update(i, "category", v)} />
              </td>
              <td className="px-1 text-center">
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="rounded p-1 text-[var(--muted)] transition-colors hover:text-[var(--warn)]"
                  aria-label="Quitar fila"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ApuPreview({
  rows,
  update,
  remove,
}: {
  rows: Row[]
  update: (i: number, key: string, v: unknown) => void
  remove: (i: number) => void
}) {
  return (
    <div className="space-y-3">
      {rows.map((r, i) => {
        const comps = Array.isArray(r.components) ? (r.components as Row[]) : []
        return (
          <div key={i} className="rounded-[2px] border border-[var(--hairline)] p-3">
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-1">
                <Cell value={r.name} onChange={(v) => update(i, "name", v)} />
                <div className="flex gap-2">
                  <span className="mono-label pt-1">Und</span>
                  <Cell value={r.unit} onChange={(v) => update(i, "unit", v)} />
                </div>
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                className="rounded p-1 text-[var(--muted)] transition-colors hover:text-[var(--warn)]"
                aria-label="Quitar APU"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            {comps.length > 0 && (
              <table className="mt-2 w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--hairline)]/60">
                    <th className={TH}>Tipo</th>
                    <th className={TH}>Insumo</th>
                    <th className={`${TH} w-16`}>Und</th>
                    <th className={`${TH} w-20 text-right`}>Cant.</th>
                    <th className={`${TH} w-24 text-right`}>P. Unit.</th>
                  </tr>
                </thead>
                <tbody>
                  {comps.map((c, j) => (
                    <tr key={j}>
                      <td className="px-1 font-mono text-[var(--muted)]">{String(c.type ?? "")}</td>
                      <td className="px-1 text-[var(--ink)]">{String(c.name ?? "")}</td>
                      <td className="px-1 font-mono text-[var(--muted)]">{String(c.unit ?? "")}</td>
                      <td className="px-1 text-right font-mono">{String(c.quantity ?? "")}</td>
                      <td className="px-1 text-right font-mono">{String(c.unit_price ?? "")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )
      })}
    </div>
  )
}
