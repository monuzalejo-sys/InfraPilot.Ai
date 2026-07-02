import { NextRequest, NextResponse } from "next/server"
import Groq from "groq-sdk"

const SYSTEM_PROMPT = `Eres un especialista en análisis de licitaciones públicas en Latinoamérica. Analiza el texto del documento de licitación y devuelve ÚNICAMENTE un JSON válido sin texto adicional.

Estructura exacta del JSON (respeta los nombres de campos):
{
  "meta": {
    "nombre": "nombre del proyecto",
    "proceso": "código proceso ej: LP-001-2026-ENTIDAD",
    "entidad": "nombre de la entidad contratante",
    "sector": "ej: Infraestructura, Saneamiento, Vial",
    "tipo": "ej: Licitación Pública",
    "objeto": "descripción del objeto contractual",
    "departamento": "departamento o región",
    "valorReferencial": 5000000,
    "moneda": "PEN",
    "plazoEjecucion": 12,
    "totalPaginas": 40,
    "compatibilidadGlobal": 75,
    "riesgoGlobal": "MEDIUM",
    "alertasCount": 3
  },
  "compatibilidad": {
    "global": 75,
    "tecnico": 70,
    "economico": 80,
    "experiencia": 65,
    "administrativo": 90,
    "ambiental": 60
  },
  "requisitos": [
    {
      "id": "g1",
      "title": "Personal Clave",
      "category": "tecnico",
      "items": [
        {
          "id": "r01",
          "description": "Residente de obra",
          "detail": "Ing. Civil, mínimo 5 años experiencia en obras similares",
          "status": "cumple",
          "critical": true,
          "clausula": "Cláusula 3.1"
        }
      ]
    }
  ],
  "riesgos": [
    {
      "id": "rsk1",
      "titulo": "título del riesgo",
      "descripcion": "descripción detallada del riesgo",
      "level": "HIGH",
      "probability": "Alta (75%)",
      "impacto": "Sobrecosto estimado S/ 500,000",
      "mitigacion": "estrategia de mitigación concreta",
      "clausula": "Cláusula 15",
      "importeRiesgo": "S/ 500K",
      "tipo": "contractual"
    }
  ],
  "garantias": [
    {
      "id": "gar1",
      "tipo": "Garantía de Seriedad de Oferta",
      "descripcion": "Garantía requerida al momento de presentar propuesta",
      "monto": 100000,
      "montoPct": "2% del VR",
      "tipoDocumento": "Carta Fianza Bancaria",
      "momento": "Al presentar oferta",
      "clausula": "Cláusula 20",
      "nota": "Vigencia mínima 60 días calendario"
    }
  ],
  "experienciaRequerida": [
    {
      "id": "exp1",
      "titulo": "Experiencia en obras similares",
      "requisito": "Facturación acumulada en obras similares ≥ 50% del VR en los últimos 10 años",
      "match": "verificar",
      "critical": true,
      "clausula": "Cláusula 4.1",
      "empresaEstado": "Se requiere verificar la facturación acumulada. Presentar contratos y valorizaciones.",
      "detalle": "Incluir obras de similar complejidad y envergadura"
    }
  ],
  "criteriosEvaluacion": [
    { "factor": "Precio", "puntaje": 60, "tipo": "económico" },
    { "factor": "Propuesta técnica", "puntaje": 30, "tipo": "técnico" },
    { "factor": "Experiencia", "puntaje": 10, "tipo": "técnico" }
  ],
  "insights": {
    "conclusion": "Resumen de viabilidad de la licitación con datos reales del documento. Menciona compatibilidad, valor referencial y plazo.",
    "riesgoPrincipal": "El riesgo más importante identificado y su impacto potencial.",
    "recomendacion": "Recomendación concreta y accionable para el equipo comercial."
  }
}

Reglas:
- Todos los valores numéricos deben ser números, no strings
- riesgoGlobal: "HIGH", "MEDIUM" o "LOW"
- status en requisitos: "cumple", "verificar", "incumple" o "na"
- match en experiencia: "cumple", "verificar" o "incumple"
- level en riesgos: "HIGH", "MEDIUM" o "LOW"
- tipo en criterios: "económico" o "técnico"
- tipo en riesgos: "contractual", "tecnico", "financiero", "legal" o "ambiental"
- Incluye mínimo 3 grupos de requisitos con items, 3 riesgos, 2 garantías, 2 experiencias, 3 criterios
- Para compatibilidad: asume empresa constructora mediana con 10 años de experiencia e ISO básico`

export async function POST(req: NextRequest) {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { error: "GROQ_API_KEY no configurada. Agrega la clave en .env.local" },
      { status: 500 }
    )
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

  try {
    const formData  = await req.formData()
    const file      = formData.get("file") as File | null
    const demoMode  = formData.get("demo") === "true"

    let pdfText = ""

    if (demoMode) {
      pdfText = `LICITACIÓN PÚBLICA DE EJEMPLO
Proceso: LP-0045-2026-MTC
Entidad: Ministerio de Transportes y Comunicaciones
Objeto: Mejoramiento y rehabilitación de carretera regional, longitud 28 km, incluyendo obras de arte, señalización vial y puentes.
Departamento: Cundinamarca / Región Central
Sector: Infraestructura Vial
Valor Referencial: S/ 12,500,000 (doce millones quinientos mil soles)
Plazo de ejecución: 18 meses
Total páginas del expediente: 52 páginas
Sistema: SEACE - OSCE
Fecha convocatoria: 2026-06-01
Personal clave requerido: Residente de Obra (Ing. Civil o Vial, 10 años exp.), Especialista en Pavimentos (Ing. Civil, 5 años), Especialista en Obras de Arte (Ing. Civil, 5 años), Especialista en Seguridad Vial.
Equipamiento mínimo: Motoniveladora, rodillo compactador, camión volquete, retroexcavadora, planta de asfalto (propia o alquilada).
Requisitos económicos: Capital de trabajo ≥ 20% VR (S/2,500,000). Facturación promedio últimos 5 años ≥ 50% VR (S/6,250,000/año).
Garantías: Seriedad de oferta 2% VR, Fiel cumplimiento 10% VR al firma contrato, Adelanto en efectivo si se otorga adelanto.
Criterios de evaluación: Precio 70 puntos, Propuesta técnica 20 puntos, Experiencia del postor 10 puntos.
Penalidades: 0.10% del contrato por día de atraso, hasta 10%.
Riesgos identificados: interferencias con redes de servicios, condiciones geotécnicas adversas en zonas de ladera, variaciones de precios de insumos.`
    } else if (file) {
      // Import the internal lib directly to skip pdf-parse's test-file check
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse    = require("pdf-parse/lib/pdf-parse") as (buf: Buffer) => Promise<{ text: string }>
      const arrayBuffer = await file.arrayBuffer()
      const buffer      = Buffer.from(arrayBuffer)
      const parsed      = await pdfParse(buffer)
      pdfText           = parsed.text.slice(0, 12000)
    } else {
      return NextResponse.json({ error: "No se proporcionó archivo PDF" }, { status: 400 })
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 4096,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user",   content: `Analiza el siguiente texto de licitación y devuelve el JSON:\n\n${pdfText}` },
      ],
    })

    const raw = completion.choices[0]?.message?.content ?? ""

    let analysis
    try {
      const match = raw.match(/\{[\s\S]*\}/)
      if (!match) throw new Error("No JSON found")
      analysis = JSON.parse(match[0])
    } catch {
      return NextResponse.json({ error: "Error al parsear respuesta de IA", raw }, { status: 500 })
    }

    return NextResponse.json({ analysis })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
