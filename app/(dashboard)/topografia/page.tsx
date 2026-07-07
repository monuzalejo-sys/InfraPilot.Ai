"use client"

import { useMemo, useRef, useState } from "react"
import {
  Mountain, Ruler, Calculator, Download, Plus, Trash2,
  TriangleAlert, CircleCheckBig, Upload, Layers, Waypoints,
  FileSpreadsheet,
} from "lucide-react"
import { Crosshair, Pin, MonoLabel } from "@/components/editorial"
import {
  cubicar, defaultCellSize,
  type TopoPoint, type CubicacionResult,
} from "@/lib/topo/cubicacion"
import { parseTopoCsv, toCsv } from "@/lib/topo/csv"
import {
  nivelar,
  type LevelStation, type NivelacionResult,
} from "@/lib/topo/nivelacion"
import {
  calcularPoligonal,
  type PolyStation, type PoligonalResult, type AngleUnit,
} from "@/lib/topo/poligonal"
import { crearLibroConFormulas } from "@/lib/excel-export"
import { ProfesionQuips } from "@/components/profesion-quips"

type Tab = "cubicacion" | "nivelacion" | "poligonal"

// ── Dataset de ejemplo: ~20 puntos de un levantamiento realista (loma suave) ──
// Coordenadas locales (m). Cota entre ~99.4 y ~101.8 sobre una plataforma 40×40.
const SAMPLE_CSV = `PUNTO,ESTE,NORTE,COTA
P1,1000.00,2000.00,100.20
P2,1010.00,2000.00,100.55
P3,1020.00,2000.00,100.90
P4,1030.00,2000.00,101.30
P5,1040.00,2000.00,101.75
P6,1000.00,2010.00,100.05
P7,1010.00,2010.00,100.40
P8,1020.00,2010.00,100.85
P9,1030.00,2010.00,101.20
P10,1040.00,2010.00,101.60
P11,1000.00,2020.00,99.85
P12,1010.00,2020.00,100.15
P13,1020.00,2020.00,100.55
P14,1030.00,2020.00,101.00
P15,1040.00,2020.00,101.40
P16,1000.00,2030.00,99.60
P17,1010.00,2030.00,99.95
P18,1020.00,2030.00,100.30
P19,1030.00,2030.00,100.75
P20,1040.00,2030.00,101.15`

// ── Ejemplo de nivelación: circuito cerrado que regresa al BM (Ec ≈ +8 mm) ──
const SAMPLE_LEVEL: LevelStation[] = [
  { name: "BM-1", backsight: 1.532, distance: 40 },
  { name: "PC-1", backsight: 1.874, foresight: 0.998, distance: 45 },
  { name: "PC-2", backsight: 2.101, foresight: 1.203, distance: 50 },
  { name: "PC-3", backsight: 1.455, foresight: 1.987, distance: 42 },
  { name: "BM-1", foresight: 2.766, distance: 38 },
]

// ── Ejemplo de poligonal cerrada REAL (derivada de un pentágono medido en obra) ──
// 5 vértices recorridos en sentido horario, ángulos internos sexagesimales.
// Σ observada = 540.0036° → Eα ≈ +13″ (dentro de ±30″·√5). Cierre lineal ~7 cm,
// precisión ≈ 1/11700, área ≈ 4.37 ha. Sirve para verificar toda la compensación.
const SAMPLE_POLY: PolyStation[] = [
  { name: "E-1", angle: 85.0788, distance: 172.66 },
  { name: "E-2", angle: 124.9912, distance: 169.66 },
  { name: "E-3", angle: 92.4909, distance: 162.83 },
  { name: "E-4", angle: 109.3107, distance: 152.30 },
  { name: "E-5", angle: 128.1320, distance: 155.30 },
]
const SAMPLE_POLY_AZ0 = "349.9920"
const SAMPLE_POLY_E0 = "1000.000"
const SAMPLE_POLY_N0 = "1000.000"

const fmt = (n: number, d = 2) =>
  n.toLocaleString("es-CO", { minimumFractionDigits: d, maximumFractionDigits: d })

// Grados decimales → "GG°MM′SS″" para lectura de topógrafo.
function toDMS(deg: number): string {
  const sign = deg < 0 ? "−" : ""
  let x = Math.abs(deg)
  let g = Math.floor(x)
  x = (x - g) * 60
  let m = Math.floor(x)
  let s = (x - m) * 60
  if (s >= 59.995) { s = 0; m += 1 }
  if (m >= 60) { m = 0; g += 1 }
  return `${sign}${g}°${String(m).padStart(2, "0")}′${s.toFixed(2).padStart(5, "0")}″`
}

function downloadBlob(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ── Micro tarjeta de resultado (número grande mono) ────────────────────────
function StatCard({
  label, value, unit, tone = "ink",
}: {
  label: string
  value: string
  unit?: string
  tone?: "ink" | "brass" | "ok" | "warn"
}) {
  const color =
    tone === "brass" ? "var(--brass)" : tone === "ok" ? "var(--ok)" : tone === "warn" ? "var(--warn)" : "var(--ink)"
  return (
    <div className="editorial-card relative p-4">
      <Crosshair className="pointer-events-none absolute right-2 top-2 h-3 w-3 text-[var(--hairline)]" />
      <MonoLabel>{label}</MonoLabel>
      <p className="mt-2 font-mono text-2xl leading-none tracking-tight" style={{ color }}>
        {value}
        {unit && <span className="ml-1 text-sm text-[var(--muted)]">{unit}</span>}
      </p>
    </div>
  )
}

// ═══════════════════════════ CUBICACIÓN ════════════════════════════════════
function CubicacionPanel() {
  const [raw, setRaw] = useState("")
  const [designZ, setDesignZ] = useState("100.00")
  const [cellInput, setCellInput] = useState("") // vacío = automático
  const [result, setResult] = useState<CubicacionResult | null>(null)
  const [points, setPoints] = useState<TopoPoint[]>([])
  const [parseWarns, setParseWarns] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const suggestedCell = useMemo(() => {
    if (points.length < 3) return null
    try { return defaultCellSize(points) } catch { return null }
  }, [points])

  const loadSample = () => {
    setRaw(SAMPLE_CSV)
    setDesignZ("100.00")
    setCellInput("")
    setResult(null)
    setError(null)
    setParseWarns([])
    setPoints([])
  }

  const onFile = async (file: File) => {
    const text = await file.text()
    setRaw(text)
  }

  const calc = () => {
    setError(null)
    const parsed = parseTopoCsv(raw)
    setParseWarns(parsed.warnings)
    setPoints(parsed.points)
    if (parsed.points.length < 3) {
      setError("No se reconocieron al menos 3 puntos (X/Este, Y/Norte, Z/Cota). Revisa el formato del CSV.")
      setResult(null)
      return
    }
    const z0 = Number(String(designZ).replace(",", "."))
    if (!Number.isFinite(z0)) {
      setError("La cota de diseño no es un número válido.")
      setResult(null)
      return
    }
    const cell = cellInput.trim() === "" ? undefined : Number(cellInput.replace(",", "."))
    try {
      setResult(cubicar(parsed.points, { z0 }, cell && cell > 0 ? { cellSize: cell } : {}))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error en el cálculo.")
      setResult(null)
    }
  }

  const exportResult = () => {
    if (!result) return
    const rows: (string | number)[][] = [
      ["Volumen corte (m3)", fmt(result.cutVolume)],
      ["Volumen relleno (m3)", fmt(result.fillVolume)],
      ["Neto corte-relleno (m3)", fmt(result.netVolume)],
      ["Area cubicada (m2)", fmt(result.area)],
      ["Puntos usados", result.pointsUsed],
      ["Tamano de celda (m)", fmt(result.cellSize)],
      ["Celdas evaluadas", result.cellsEvaluated],
      ["Cota diseno (m)", designZ],
    ]
    downloadBlob("cubicacion.csv", toCsv(["Parametro", "Valor"], rows))
  }

  return (
    <div className="space-y-6">
      {/* Entrada */}
      <section className="editorial-card relative p-5">
        <Crosshair className="pointer-events-none absolute right-2 top-2 h-3 w-3 text-[var(--hairline)]" />
        <div className="mb-4 flex items-center justify-between gap-3">
          <MonoLabel>Puntos del levantamiento</MonoLabel>
          <div className="flex items-center gap-2">
            <button
              onClick={loadSample}
              className="mono-label rounded-[2px] border border-[var(--hairline)] px-2.5 py-1 text-[var(--ink)] transition-colors hover:border-[var(--brass)] hover:text-[var(--brass)]"
            >
              Cargar ejemplo
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="mono-label flex items-center gap-1.5 rounded-[2px] border border-[var(--hairline)] px-2.5 py-1 text-[var(--ink)] transition-colors hover:border-[var(--brass)] hover:text-[var(--brass)]"
            >
              <Upload className="h-3.5 w-3.5" /> Subir CSV
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = "" }}
            />
          </div>
        </div>

        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder={"Pega o sube tu CSV. Headers flexibles:\nX,Y,Z  |  E,N,Z  |  ESTE,NORTE,COTA  |  PUNTO,X,Y,Z\nSeparador coma, ; o tab. Decimales con punto o coma."}
          spellCheck={false}
          className="h-44 w-full resize-y rounded-[2px] border border-[var(--hairline)] bg-white p-3 font-mono text-xs leading-relaxed text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--brass)]"
        />

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <MonoLabel>Cota de diseño (m)</MonoLabel>
            <input
              value={designZ}
              onChange={(e) => setDesignZ(e.target.value)}
              inputMode="decimal"
              className="mt-1.5 h-9 w-full rounded-[2px] border border-[var(--hairline)] bg-white px-3 font-mono text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
            />
            <p className="mt-1 text-[11px] text-[var(--muted)]">Plano horizontal de referencia.</p>
          </div>
          <div>
            <MonoLabel>Tamaño de celda (m)</MonoLabel>
            <input
              value={cellInput}
              onChange={(e) => setCellInput(e.target.value)}
              inputMode="decimal"
              placeholder={suggestedCell ? `auto ≈ ${fmt(suggestedCell)}` : "automático"}
              className="mt-1.5 h-9 w-full rounded-[2px] border border-[var(--hairline)] bg-white px-3 font-mono text-sm text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--brass)]"
            />
            <p className="mt-1 text-[11px] text-[var(--muted)]">Vacío = según densidad de puntos.</p>
          </div>
          <div className="flex items-end">
            <button
              onClick={calc}
              className="flex h-9 w-full items-center justify-center gap-2 rounded-[2px] bg-[var(--brass)] px-4 text-sm font-semibold text-[var(--paper)] transition-opacity hover:opacity-90"
            >
              <Calculator className="h-4 w-4" /> Calcular
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-[2px] border border-[var(--warn)]/40 bg-[var(--warn)]/8 px-3 py-2 text-xs" style={{ color: "var(--warn)" }}>
            <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </section>

      {/* Resultados */}
      {result && (
        <section className="animate-fade-in space-y-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Corte" value={fmt(result.cutVolume)} unit="m³" tone="warn" />
            <StatCard label="Relleno" value={fmt(result.fillVolume)} unit="m³" tone="ok" />
            <StatCard
              label="Neto (corte−relleno)"
              value={fmt(result.netVolume)}
              unit="m³"
              tone="brass"
            />
            <StatCard label="Área cubicada" value={fmt(result.area)} unit="m²" />
          </div>

          <div className="editorial-card relative p-5">
            <Crosshair className="pointer-events-none absolute right-2 top-2 h-3 w-3 text-[var(--hairline)]" />
            <div className="mb-4 flex items-center justify-between gap-3">
              <MonoLabel>Resumen del cálculo</MonoLabel>
              <button
                onClick={exportResult}
                className="mono-label flex items-center gap-1.5 rounded-[2px] border border-[var(--hairline)] px-2.5 py-1 text-[var(--ink)] transition-colors hover:border-[var(--brass)] hover:text-[var(--brass)]"
              >
                <Download className="h-3.5 w-3.5" /> Descargar CSV
              </button>
            </div>
            <table className="w-full text-sm">
              <tbody className="font-mono">
                {[
                  ["Puntos usados", String(result.pointsUsed)],
                  ["Tamaño de celda", `${fmt(result.cellSize)} m`],
                  ["Celdas evaluadas", String(result.cellsEvaluated)],
                  ["Cota de diseño", `${designZ} m`],
                  ["Bounding box X", `${fmt(result.bbox.minX)} … ${fmt(result.bbox.maxX)}`],
                  ["Bounding box Y", `${fmt(result.bbox.minY)} … ${fmt(result.bbox.maxY)}`],
                ].map(([k, v], i) => (
                  <tr key={i} className="border-t border-[var(--hairline)] first:border-t-0">
                    <td className="py-2 pr-4 font-sans text-[var(--muted)]">{k}</td>
                    <td className="py-2 text-right text-[var(--ink)]">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Advertencia honesta de precisión */}
          <div className="rounded-[2px] border border-[var(--hairline)] bg-[var(--card)] p-4">
            <div className="mb-2 flex items-center gap-2">
              <TriangleAlert className="h-4 w-4" style={{ color: "var(--warn)" }} />
              <MonoLabel>Precisión del método</MonoLabel>
            </div>
            <ul className="space-y-1.5 text-xs leading-relaxed text-[var(--muted)]">
              {[...result.warnings, ...parseWarns].map((w, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-[var(--brass)]">·</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  )
}

// ═══════════════════════════ NIVELACIÓN ════════════════════════════════════
function NivelacionPanel() {
  const [startZ, setStartZ] = useState("100.000")
  const [coef, setCoef] = useState("12")
  const [stations, setStations] = useState<LevelStation[]>([
    { name: "BM-1", backsight: undefined, foresight: undefined, distance: undefined },
    { name: "", backsight: undefined, foresight: undefined, distance: undefined },
  ])
  const [result, setResult] = useState<NivelacionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const update = (i: number, field: keyof LevelStation, value: string) => {
    setStations((prev) =>
      prev.map((s, idx) => {
        if (idx !== i) return s
        if (field === "name") return { ...s, name: value }
        const n = value.trim() === "" ? undefined : Number(value.replace(",", "."))
        return { ...s, [field]: Number.isFinite(n as number) ? n : undefined }
      }),
    )
  }

  const addRow = () =>
    setStations((prev) => [...prev, { name: "", backsight: undefined, foresight: undefined, distance: undefined }])
  const removeRow = (i: number) =>
    setStations((prev) => (prev.length <= 2 ? prev : prev.filter((_, idx) => idx !== i)))

  const loadSample = () => {
    setStartZ("100.000")
    setCoef("12")
    setStations(SAMPLE_LEVEL.map((s) => ({ ...s })))
    setResult(null)
    setError(null)
  }

  const calc = () => {
    setError(null)
    const z0 = Number(String(startZ).replace(",", "."))
    if (!Number.isFinite(z0)) { setError("La cota del BM inicial no es válida."); return }
    const C = Number(String(coef).replace(",", "."))
    try {
      setResult(nivelar({ startElevation: z0, stations, toleranceCoef: C > 0 ? C : undefined }))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error en el cálculo.")
      setResult(null)
    }
  }

  const exportResult = () => {
    if (!result) return
    const rows = result.rows.map((r) => [
      r.name,
      r.backsight ?? "",
      r.foresight ?? "",
      r.instrumentHeight != null ? fmt(r.instrumentHeight, 3) : "",
      fmt(r.rawElevation, 3),
      fmt(r.correction, 4),
      fmt(r.adjustedElevation, 3),
      r.distance ?? "",
    ])
    downloadBlob(
      "nivelacion.csv",
      toCsv(["Punto", "VA", "VD", "AI", "Cota", "Correccion", "Cota_ajustada", "Distancia"], rows),
    )
  }

  return (
    <div className="space-y-6">
      {/* Parámetros + tabla editable */}
      <section className="editorial-card relative p-5">
        <Crosshair className="pointer-events-none absolute right-2 top-2 h-3 w-3 text-[var(--hairline)]" />
        <div className="mb-4 flex items-center justify-between gap-3">
          <MonoLabel>Libreta de nivelación cerrada</MonoLabel>
          <button
            onClick={loadSample}
            className="mono-label rounded-[2px] border border-[var(--hairline)] px-2.5 py-1 text-[var(--ink)] transition-colors hover:border-[var(--brass)] hover:text-[var(--brass)]"
          >
            Cargar ejemplo
          </button>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <MonoLabel>Cota BM inicial (m)</MonoLabel>
            <input
              value={startZ}
              onChange={(e) => setStartZ(e.target.value)}
              inputMode="decimal"
              className="mt-1.5 h-9 w-full rounded-[2px] border border-[var(--hairline)] bg-white px-3 font-mono text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
            />
          </div>
          <div>
            <MonoLabel>Coef. tolerancia C (mm)</MonoLabel>
            <input
              value={coef}
              onChange={(e) => setCoef(e.target.value)}
              inputMode="decimal"
              className="mt-1.5 h-9 w-full rounded-[2px] border border-[var(--hairline)] bg-white px-3 font-mono text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
            />
            <p className="mt-1 text-[11px] text-[var(--muted)]">Tolerancia T = ±C·√K (K en km).</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-left">
                {["Punto", "VA (m)", "VD (m)", "Dist (m)", ""].map((h) => (
                  <th key={h} className="mono-label pb-2 pr-3 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="font-mono">
              {stations.map((s, i) => (
                <tr key={i} className="border-t border-[var(--hairline)]">
                  <td className="py-1.5 pr-2">
                    <input
                      value={s.name}
                      onChange={(e) => update(i, "name", e.target.value)}
                      placeholder={i === 0 ? "BM-1" : `P${i}`}
                      className="h-8 w-full rounded-[2px] border border-[var(--hairline)] bg-white px-2 text-xs text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                    />
                  </td>
                  {(["backsight", "foresight", "distance"] as const).map((field) => (
                    <td key={field} className="py-1.5 pr-2">
                      <input
                        value={s[field] ?? ""}
                        onChange={(e) => update(i, field, e.target.value)}
                        inputMode="decimal"
                        className="h-8 w-full rounded-[2px] border border-[var(--hairline)] bg-white px-2 text-right text-xs text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                      />
                    </td>
                  ))}
                  <td className="py-1.5">
                    <button
                      onClick={() => removeRow(i)}
                      disabled={stations.length <= 2}
                      title="Quitar fila"
                      className="flex h-8 w-8 items-center justify-center rounded-[2px] text-[var(--muted)] transition-colors hover:text-[var(--warn)] disabled:opacity-30"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={addRow}
            className="mono-label flex items-center gap-1.5 rounded-[2px] border border-[var(--hairline)] px-2.5 py-1.5 text-[var(--ink)] transition-colors hover:border-[var(--brass)] hover:text-[var(--brass)]"
          >
            <Plus className="h-3.5 w-3.5" /> Agregar fila
          </button>
          <button
            onClick={calc}
            className="flex items-center gap-2 rounded-[2px] bg-[var(--brass)] px-4 py-1.5 text-sm font-semibold text-[var(--paper)] transition-opacity hover:opacity-90"
          >
            <Calculator className="h-4 w-4" /> Calcular
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-[2px] border border-[var(--warn)]/40 bg-[var(--warn)]/8 px-3 py-2 text-xs" style={{ color: "var(--warn)" }}>
            <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </section>

      {/* Resultados */}
      {result && (
        <section className="animate-fade-in space-y-5">
          {/* Veredicto */}
          <div
            className="flex items-center gap-3 rounded-[2px] border p-4"
            style={{
              borderColor: result.withinTolerance ? "var(--ok)" : "var(--warn)",
              color: result.withinTolerance ? "var(--ok)" : "var(--warn)",
              background: result.withinTolerance ? "rgba(91,122,94,0.06)" : "rgba(168,98,59,0.06)",
            }}
          >
            {result.withinTolerance
              ? <CircleCheckBig className="h-5 w-5 shrink-0" />
              : <TriangleAlert className="h-5 w-5 shrink-0" />}
            <div>
              <p className="text-sm font-semibold">
                {result.withinTolerance ? "Dentro de tolerancia" : "Fuera de tolerancia"}
              </p>
              <p className="font-mono text-xs opacity-90">
                Cierre {fmt(result.closureErrorMm, 1)} mm · Tolerancia ±{fmt(result.toleranceMm, 1)} mm · K {fmt(result.totalDistanceKm, 3)} km
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="ΣVista atrás" value={fmt(result.sumBacksight, 3)} unit="m" />
            <StatCard label="ΣVista adelante" value={fmt(result.sumForesight, 3)} unit="m" />
            <StatCard
              label="Error de cierre"
              value={fmt(result.closureErrorMm, 1)}
              unit="mm"
              tone={result.withinTolerance ? "ok" : "warn"}
            />
            <StatCard label="Compensación" value={result.method === "distance" ? "por dist." : "por armadas"} />
          </div>

          <div className="editorial-card relative p-5">
            <Crosshair className="pointer-events-none absolute right-2 top-2 h-3 w-3 text-[var(--hairline)]" />
            <div className="mb-4 flex items-center justify-between gap-3">
              <MonoLabel>Tabla compensada</MonoLabel>
              <button
                onClick={exportResult}
                className="mono-label flex items-center gap-1.5 rounded-[2px] border border-[var(--hairline)] px-2.5 py-1 text-[var(--ink)] transition-colors hover:border-[var(--brass)] hover:text-[var(--brass)]"
              >
                <Download className="h-3.5 w-3.5" /> Descargar CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-sm">
                <thead>
                  <tr className="text-left">
                    {["Punto", "VA", "VD", "AI", "Cota", "Corr.", "Cota ajust."].map((h) => (
                      <th key={h} className="mono-label pb-2 pr-3 font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="font-mono text-xs">
                  {result.rows.map((r, i) => (
                    <tr key={i} className="border-t border-[var(--hairline)]">
                      <td className="py-2 pr-3 font-sans text-[var(--ink)]">{r.name}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted)]">{r.backsight != null ? fmt(r.backsight, 3) : "—"}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted)]">{r.foresight != null ? fmt(r.foresight, 3) : "—"}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted)]">{r.instrumentHeight != null ? fmt(r.instrumentHeight, 3) : "—"}</td>
                      <td className="py-2 pr-3 text-right text-[var(--ink)]">{fmt(r.rawElevation, 3)}</td>
                      <td className="py-2 pr-3 text-right" style={{ color: "var(--brass)" }}>{fmt(r.correction, 4)}</td>
                      <td className="py-2 text-right font-semibold text-[var(--ink)]">{fmt(r.adjustedElevation, 3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {result.warnings.length > 0 && (
            <div className="rounded-[2px] border border-[var(--hairline)] bg-[var(--card)] p-4">
              <ul className="space-y-1.5 text-xs leading-relaxed text-[var(--muted)]">
                {result.warnings.map((w, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-[var(--brass)]">·</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  )
}

// ═══════════════════════════ POLIGONAL ═════════════════════════════════════
function PoligonalPanel() {
  const [az0, setAz0] = useState("0.0000")
  const [east0, setEast0] = useState("1000.000")
  const [north0, setNorth0] = useState("1000.000")
  const [unit, setUnit] = useState<AngleUnit>("deg")
  const [tolSec, setTolSec] = useState("30")
  const [stations, setStations] = useState<PolyStation[]>([
    { name: "E-1", angle: NaN, distance: NaN },
    { name: "E-2", angle: NaN, distance: NaN },
    { name: "E-3", angle: NaN, distance: NaN },
  ])
  const [result, setResult] = useState<PoligonalResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const update = (i: number, field: keyof PolyStation, value: string) => {
    setStations((prev) =>
      prev.map((s, idx) => {
        if (idx !== i) return s
        if (field === "name") return { ...s, name: value }
        const n = value.trim() === "" ? NaN : Number(value.replace(",", "."))
        return { ...s, [field]: n }
      }),
    )
  }

  const addRow = () =>
    setStations((prev) => [...prev, { name: `E-${prev.length + 1}`, angle: NaN, distance: NaN }])
  const removeRow = (i: number) =>
    setStations((prev) => (prev.length <= 3 ? prev : prev.filter((_, idx) => idx !== i)))

  const loadSample = () => {
    setAz0(SAMPLE_POLY_AZ0)
    setEast0(SAMPLE_POLY_E0)
    setNorth0(SAMPLE_POLY_N0)
    setUnit("deg")
    setTolSec("30")
    setStations(SAMPLE_POLY.map((s) => ({ ...s })))
    setResult(null)
    setError(null)
  }

  const calc = () => {
    setError(null)
    const azimuth = Number(String(az0).replace(",", "."))
    const e0 = Number(String(east0).replace(",", "."))
    const n0 = Number(String(north0).replace(",", "."))
    if (!Number.isFinite(azimuth)) { setError("El azimut inicial no es válido."); return }
    if (!Number.isFinite(e0) || !Number.isFinite(n0)) { setError("Las coordenadas de partida no son válidas."); return }
    if (stations.some((s) => !Number.isFinite(s.angle) || !Number.isFinite(s.distance))) {
      setError("Completa el ángulo y la distancia de cada vértice."); return
    }
    const a = Number(String(tolSec).replace(",", "."))
    try {
      setResult(calcularPoligonal({
        stations,
        initialAzimuth: azimuth,
        startEast: e0,
        startNorth: n0,
        angleUnit: unit,
        toleranceSec: a > 0 ? a : undefined,
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error en el cálculo.")
      setResult(null)
    }
  }

  const exportResult = () => {
    if (!result) return
    const rows = result.rows.map((r) => [
      r.name,
      fmt(r.angleAdjusted, 6),
      fmt(r.azimuth, 6),
      fmt(r.distance, 3),
      fmt(r.deltaE, 4),
      fmt(r.deltaN, 4),
      fmt(r.correctionE, 4),
      fmt(r.correctionN, 4),
      fmt(r.east, 4),
      fmt(r.north, 4),
    ])
    downloadBlob(
      "poligonal.csv",
      toCsv(
        ["Vertice", "Angulo_comp", "Azimut", "Distancia", "dE", "dN", "corrE", "corrN", "Este", "Norte"],
        rows,
      ),
    )
  }

  // Las proyecciones se exportan como FÓRMULA =dist*SIN(RADIANES(az)) para
  // que el cliente recalcule al cambiar distancias/azimuts en Excel.
  const exportExcel = () => {
    if (!result) return
    const celdas: Record<string, string | number | { f: string }> = {}
    celdas["A1"] = "Vertice"; celdas["B1"] = "Angulo"; celdas["C1"] = "Azimut"
    celdas["D1"] = "Distancia"; celdas["E1"] = "dE"; celdas["F1"] = "dN"; celdas["G1"] = "Este"; celdas["H1"] = "Norte"
    result.rows.forEach((r, i) => {
      const row = i + 2
      celdas[`A${row}`] = r.name
      celdas[`B${row}`] = r.angleAdjusted
      celdas[`C${row}`] = r.azimuth            // valor (az corrido ya resuelto)
      celdas[`D${row}`] = r.distance
      celdas[`E${row}`] = { f: `D${row}*SIN(RADIANES(C${row}))` } // ΔE = d·sen(Az)
      celdas[`F${row}`] = { f: `D${row}*COS(RADIANES(C${row}))` } // ΔN = d·cos(Az)
      celdas[`G${row}`] = r.east
      celdas[`H${row}`] = r.north
    })
    crearLibroConFormulas(
      [{ nombre: "Poligonal", celdas, anchosColumnas: [10, 14, 14, 12, 14, 14, 14, 14] }],
      "poligonal.xlsx",
    )
  }

  return (
    <div className="space-y-6">
      {/* Parámetros + tabla editable */}
      <section className="editorial-card relative p-5">
        <Crosshair className="pointer-events-none absolute right-2 top-2 h-3 w-3 text-[var(--hairline)]" />
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MonoLabel>Poligonal cerrada · ángulos internos</MonoLabel>
            <span className="mono-label text-[var(--muted)]">ESC 1:500 · GSD —</span>
          </div>
          <button
            onClick={loadSample}
            className="mono-label rounded-[2px] border border-[var(--hairline)] px-2.5 py-1 text-[var(--ink)] transition-colors hover:border-[var(--brass)] hover:text-[var(--brass)]"
          >
            Cargar ejemplo
          </button>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <MonoLabel>Azimut inicial (°)</MonoLabel>
            <input
              value={az0}
              onChange={(e) => setAz0(e.target.value)}
              inputMode="decimal"
              className="mt-1.5 h-9 w-full rounded-[2px] border border-[var(--hairline)] bg-white px-3 font-mono text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
            />
          </div>
          <div>
            <MonoLabel>Este partida (m)</MonoLabel>
            <input
              value={east0}
              onChange={(e) => setEast0(e.target.value)}
              inputMode="decimal"
              className="mt-1.5 h-9 w-full rounded-[2px] border border-[var(--hairline)] bg-white px-3 font-mono text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
            />
          </div>
          <div>
            <MonoLabel>Norte partida (m)</MonoLabel>
            <input
              value={north0}
              onChange={(e) => setNorth0(e.target.value)}
              inputMode="decimal"
              className="mt-1.5 h-9 w-full rounded-[2px] border border-[var(--hairline)] bg-white px-3 font-mono text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
            />
          </div>
          <div>
            <MonoLabel>Unidad angular</MonoLabel>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as AngleUnit)}
              className="mt-1.5 h-9 w-full rounded-[2px] border border-[var(--hairline)] bg-white px-2 font-mono text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
            >
              <option value="deg">Sexagesimal (°)</option>
              <option value="gon">Centesimal (gon)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="text-left">
                {["Vértice", unit === "gon" ? "Áng. int. (gon)" : "Áng. int. (°)", "Distancia (m)", ""].map((h) => (
                  <th key={h} className="mono-label pb-2 pr-3 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="font-mono">
              {stations.map((s, i) => (
                <tr key={i} className="border-t border-[var(--hairline)]">
                  <td className="py-1.5 pr-2">
                    <input
                      value={s.name}
                      onChange={(e) => update(i, "name", e.target.value)}
                      placeholder={`E-${i + 1}`}
                      className="h-8 w-full rounded-[2px] border border-[var(--hairline)] bg-white px-2 text-xs text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                    />
                  </td>
                  {(["angle", "distance"] as const).map((field) => (
                    <td key={field} className="py-1.5 pr-2">
                      <input
                        value={Number.isFinite(s[field]) ? s[field] : ""}
                        onChange={(e) => update(i, field, e.target.value)}
                        inputMode="decimal"
                        className="h-8 w-full rounded-[2px] border border-[var(--hairline)] bg-white px-2 text-right text-xs text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                      />
                    </td>
                  ))}
                  <td className="py-1.5">
                    <button
                      onClick={() => removeRow(i)}
                      disabled={stations.length <= 3}
                      title="Quitar vértice"
                      className="flex h-8 w-8 items-center justify-center rounded-[2px] text-[var(--muted)] transition-colors hover:text-[var(--warn)] disabled:opacity-30"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={addRow}
            className="mono-label flex items-center gap-1.5 rounded-[2px] border border-[var(--hairline)] px-2.5 py-1.5 text-[var(--ink)] transition-colors hover:border-[var(--brass)] hover:text-[var(--brass)]"
          >
            <Plus className="h-3.5 w-3.5" /> Agregar vértice
          </button>
          <div className="flex items-center gap-1.5">
            <span className="mono-label text-[var(--muted)]">Tol. a (″)</span>
            <input
              value={tolSec}
              onChange={(e) => setTolSec(e.target.value)}
              inputMode="decimal"
              title="Tolerancia angular T = ±a·√n"
              className="h-8 w-16 rounded-[2px] border border-[var(--hairline)] bg-white px-2 text-right font-mono text-xs text-[var(--ink)] outline-none focus:border-[var(--brass)]"
            />
          </div>
          <button
            onClick={calc}
            className="flex items-center gap-2 rounded-[2px] bg-[var(--brass)] px-4 py-1.5 text-sm font-semibold text-[var(--paper)] transition-opacity hover:opacity-90"
          >
            <Calculator className="h-4 w-4" /> Calcular
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-[2px] border border-[var(--warn)]/40 bg-[var(--warn)]/8 px-3 py-2 text-xs" style={{ color: "var(--warn)" }}>
            <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </section>

      {/* Resultados */}
      {result && (
        <section className="animate-fade-in space-y-5">
          {/* Veredicto angular */}
          <div
            className="flex items-center gap-3 rounded-[2px] border p-4"
            style={{
              borderColor: result.angularWithinTolerance ? "var(--ok)" : "var(--warn)",
              color: result.angularWithinTolerance ? "var(--ok)" : "var(--warn)",
              background: result.angularWithinTolerance ? "rgba(91,122,94,0.06)" : "rgba(168,98,59,0.06)",
            }}
          >
            {result.angularWithinTolerance
              ? <CircleCheckBig className="h-5 w-5 shrink-0" />
              : <TriangleAlert className="h-5 w-5 shrink-0" />}
            <div>
              <p className="text-sm font-semibold">
                {result.angularWithinTolerance ? "Cierre angular dentro de tolerancia" : "Cierre angular fuera de tolerancia"}
              </p>
              <p className="font-mono text-xs opacity-90">
                Eα {fmt(result.angularErrorSec, 1)}″ · Tolerancia ±{fmt(result.toleranceSec, 1)}″ (a·√{result.n}) · corrección {fmt(result.angularCorrectionPerStation, 2)}″/vértice
              </p>
            </div>
          </div>

          {/* Cierre lineal + precisión + área en cards grandes */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Error lineal ε" value={fmt(result.linearError, 4)} unit="m" tone={result.linearError < 0.05 ? "ok" : "warn"} />
            <StatCard
              label="Precisión relativa"
              value={result.relativePrecision === Infinity ? "exacta" : `1 / ${fmt(result.relativePrecision, 0)}`}
              tone="brass"
            />
            <StatCard label="Perímetro" value={fmt(result.perimeter, 2)} unit="m" />
            <StatCard label="Área (coords)" value={fmt(result.area, 2)} unit="m²" tone="brass" />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard label="εE (cierre Este)" value={fmt(result.closureE, 4)} unit="m" />
            <StatCard label="εN (cierre Norte)" value={fmt(result.closureN, 4)} unit="m" />
            <StatCard label="Σ áng. observada" value={`${fmt(result.sumAnglesObserved, 4)}°`} />
          </div>

          {/* Tabla compensada */}
          <div className="editorial-card relative p-5">
            <Crosshair className="pointer-events-none absolute right-2 top-2 h-3 w-3 text-[var(--hairline)]" />
            <div className="mb-4 flex items-center justify-between gap-3">
              <MonoLabel>Cuadro de coordenadas compensadas</MonoLabel>
              <div className="flex items-center gap-2">
                <button
                  onClick={exportExcel}
                  className="mono-label flex items-center gap-1.5 rounded-[2px] border border-[var(--hairline)] px-2.5 py-1 text-[var(--ink)] transition-colors hover:border-[var(--brass)] hover:text-[var(--brass)]"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" /> Descargar Excel
                </button>
                <button
                  onClick={exportResult}
                  className="mono-label flex items-center gap-1.5 rounded-[2px] border border-[var(--hairline)] px-2.5 py-1 text-[var(--ink)] transition-colors hover:border-[var(--brass)] hover:text-[var(--brass)]"
                >
                  <Download className="h-3.5 w-3.5" /> Descargar CSV
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="text-left">
                    {["Vértice", "Áng. comp.", "Azimut", "Dist.", "ΔE", "ΔN", "cE", "cN", "Este", "Norte"].map((h) => (
                      <th key={h} className="mono-label pb-2 pr-3 font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="font-mono text-xs">
                  {result.rows.map((r, i) => (
                    <tr key={i} className="border-t border-[var(--hairline)]">
                      <td className="py-2 pr-3 font-sans text-[var(--ink)]">{r.name}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted)]">{toDMS(r.angleAdjusted)}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted)]">{toDMS(r.azimuth)}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted)]">{fmt(r.distance, 3)}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted)]">{fmt(r.deltaE, 3)}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted)]">{fmt(r.deltaN, 3)}</td>
                      <td className="py-2 pr-3 text-right" style={{ color: "var(--brass)" }}>{fmt(r.correctionE, 4)}</td>
                      <td className="py-2 pr-3 text-right" style={{ color: "var(--brass)" }}>{fmt(r.correctionN, 4)}</td>
                      <td className="py-2 pr-3 text-right font-semibold text-[var(--ink)]">{fmt(r.east, 3)}</td>
                      <td className="py-2 text-right font-semibold text-[var(--ink)]">{fmt(r.north, 3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {result.warnings.length > 0 && (
            <div className="rounded-[2px] border border-[var(--hairline)] bg-[var(--card)] p-4">
              <ul className="space-y-1.5 text-xs leading-relaxed text-[var(--muted)]">
                {result.warnings.map((w, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-[var(--brass)]">·</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  )
}

// ═══════════════════════════ PÁGINA ════════════════════════════════════════
export default function TopografiaPage() {
  const [tab, setTab] = useState<Tab>("cubicacion")

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 lg:px-10">
      {/* Encabezado */}
      <header className="mb-6">
        <div className="mb-1 flex items-center gap-2">
          <Pin className="relative" />
          <MonoLabel>Módulo topografía</MonoLabel>
        </div>
        <h1 className="flex items-center gap-2.5 text-xl font-semibold tracking-tight text-[var(--ink)]">
          <Mountain className="h-5 w-5 text-[var(--brass)]" />
          Cubicación, nivelación y poligonal
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Corte/relleno, nivelación cerrada y poligonal compensada — todo el cálculo se ejecuta en tu navegador.
        </p>
      </header>

      {/* Pestañas */}
      <div className="mb-6 flex gap-1 border-b border-[var(--hairline)]">
        {([
          { id: "cubicacion", label: "Cubicación", icon: Layers },
          { id: "nivelacion", label: "Nivelación", icon: Ruler },
          { id: "poligonal", label: "Poligonal", icon: Waypoints },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors"
            style={{ color: tab === id ? "var(--ink)" : "var(--muted)" }}
          >
            <Icon className="h-4 w-4" style={{ color: tab === id ? "var(--brass)" : "var(--muted)" }} />
            {label}
            {tab === id && (
              <>
                <Crosshair className="h-3 w-3 text-[var(--brass)]/60" />
                <span className="absolute inset-x-0 -bottom-px h-0.5 bg-[var(--brass)]" />
              </>
            )}
          </button>
        ))}
      </div>

      {tab === "cubicacion" && <CubicacionPanel />}
      {tab === "nivelacion" && <NivelacionPanel />}
      {tab === "poligonal" && <PoligonalPanel />}

      <div className="mt-10">
        <ProfesionQuips discipline="topografia" />
      </div>
    </div>
  )
}
