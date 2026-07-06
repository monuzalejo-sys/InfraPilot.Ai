"use client"

import { useMemo, useState } from "react"
import {
  Cpu, Cloud, Calculator, Download, Plus, Trash2, TriangleAlert,
} from "lucide-react"
import { Crosshair, Pin, MonoLabel } from "@/components/editorial"
import {
  calcularEstimacion, calcularPuntosFuncion,
  type Rol, type FaseProyecto, type ConteosPF,
} from "@/lib/informatica/estimacion"
import {
  calcularCostoCloud,
  type ItemCloud, type CategoriaCloud,
} from "@/lib/informatica/cloud"

type Tab = "estimacion" | "cloud"

// ── Roles y proyecto de ejemplo: ~4 fases con asignaciones realistas ────────
const SAMPLE_ROLES: Rol[] = [
  { id: "r1", nombre: "Dev Sr", tarifaHora: 65 },
  { id: "r2", nombre: "Dev Jr", tarifaHora: 35 },
  { id: "r3", nombre: "PM", tarifaHora: 55 },
  { id: "r4", nombre: "QA", tarifaHora: 40 },
]

const SAMPLE_FASES: FaseProyecto[] = [
  {
    id: "f1",
    nombre: "Análisis y diseño",
    asignaciones: [
      { rolId: "r3", horas: 60 },
      { rolId: "r1", horas: 40 },
    ],
  },
  {
    id: "f2",
    nombre: "Desarrollo backend",
    asignaciones: [
      { rolId: "r1", horas: 180 },
      { rolId: "r2", horas: 220 },
      { rolId: "r3", horas: 30 },
    ],
  },
  {
    id: "f3",
    nombre: "Desarrollo frontend",
    asignaciones: [
      { rolId: "r1", horas: 120 },
      { rolId: "r2", horas: 160 },
    ],
  },
  {
    id: "f4",
    nombre: "QA y despliegue",
    asignaciones: [
      { rolId: "r4", horas: 90 },
      { rolId: "r3", horas: 20 },
      { rolId: "r1", horas: 24 },
    ],
  },
]

const SAMPLE_PF: ConteosPF = {
  entradasExternas: 12,
  salidasExternas: 8,
  consultas: 10,
  archivosLogicos: 6,
  interfaces: 3,
}
const SAMPLE_PF_FACTOR = 1.05
const SAMPLE_PF_HORAS_POR_PF = 8

const SAMPLE_CLOUD: ItemCloud[] = [
  { id: "c1", nombre: "API principal (EC2/App Service)", categoria: "computo", cantidad: 2, unidad: "instancia", precioUnitarioMes: 85 },
  { id: "c2", nombre: "Base de datos gestionada", categoria: "computo", cantidad: 1, unidad: "instancia", precioUnitarioMes: 180 },
  { id: "c3", nombre: "Almacenamiento de objetos", categoria: "almacenamiento", cantidad: 500, unidad: "GB", precioUnitarioMes: 0.023 },
  { id: "c4", nombre: "Backups / snapshots", categoria: "almacenamiento", cantidad: 200, unidad: "GB", precioUnitarioMes: 0.05 },
  { id: "c5", nombre: "Transferencia saliente", categoria: "transferencia", cantidad: 300, unidad: "GB", precioUnitarioMes: 0.09 },
  { id: "c6", nombre: "CDN", categoria: "transferencia", cantidad: 1000, unidad: "GB", precioUnitarioMes: 0.04 },
  { id: "c7", nombre: "Monitoreo / logging", categoria: "servicio", cantidad: 1, unidad: "plan", precioUnitarioMes: 45 },
  { id: "c8", nombre: "Correo transaccional", categoria: "servicio", cantidad: 1, unidad: "plan", precioUnitarioMes: 20 },
]

const CATEGORIAS_CLOUD: { id: CategoriaCloud; label: string }[] = [
  { id: "computo", label: "Cómputo" },
  { id: "almacenamiento", label: "Almacenamiento" },
  { id: "transferencia", label: "Transferencia" },
  { id: "servicio", label: "Servicio" },
]

const fmt = (n: number, d = 2) =>
  n.toLocaleString("es-CO", { minimumFractionDigits: d, maximumFractionDigits: d })

const fmtMoney = (n: number) =>
  n.toLocaleString("es-CO", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 })

function downloadBlob(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function toCsv(headers: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => {
    const s = String(v)
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n")
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

// ═══════════════════════════ ESTIMACIÓN DE PROYECTO ═══════════════════════
function EstimacionPanel() {
  const [roles, setRoles] = useState<Rol[]>([
    { id: "r1", nombre: "Dev Sr", tarifaHora: 65 },
    { id: "r2", nombre: "Dev Jr", tarifaHora: 35 },
    { id: "r3", nombre: "PM", tarifaHora: 55 },
    { id: "r4", nombre: "QA", tarifaHora: 40 },
  ])
  const [fases, setFases] = useState<FaseProyecto[]>([
    { id: "f1", nombre: "Fase 1", asignaciones: [{ rolId: "r1", horas: 40 }] },
  ])
  const [contingenciaPct, setContingenciaPct] = useState("10")
  const [overheadPct, setOverheadPct] = useState("15")

  const [pf, setPf] = useState<ConteosPF>({
    entradasExternas: 0, salidasExternas: 0, consultas: 0, archivosLogicos: 0, interfaces: 0,
  })
  const [pfFactorAjuste, setPfFactorAjuste] = useState("1")
  const [pfHorasPorPF, setPfHorasPorPF] = useState("8")

  const nextId = (prefix: string, list: { id: string }[]) => {
    let n = list.length + 1
    while (list.some((x) => x.id === `${prefix}${n}`)) n++
    return `${prefix}${n}`
  }

  const addRol = () =>
    setRoles((prev) => [...prev, { id: nextId("r", prev), nombre: "", tarifaHora: 0 }])
  const removeRol = (id: string) => {
    setRoles((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)))
    setFases((prev) => prev.map((f) => ({ ...f, asignaciones: f.asignaciones.filter((a) => a.rolId !== id) })))
  }
  const updateRol = (id: string, field: keyof Rol, value: string) => {
    setRoles((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r
        if (field === "nombre") return { ...r, nombre: value }
        const n = Number(value.replace(",", "."))
        return { ...r, tarifaHora: Number.isFinite(n) ? n : 0 }
      }),
    )
  }

  const addFase = () =>
    setFases((prev) => [
      ...prev,
      { id: nextId("f", prev), nombre: `Fase ${prev.length + 1}`, asignaciones: [] },
    ])
  const removeFase = (id: string) =>
    setFases((prev) => (prev.length <= 1 ? prev : prev.filter((f) => f.id !== id)))
  const updateFaseName = (id: string, nombre: string) =>
    setFases((prev) => prev.map((f) => (f.id === id ? { ...f, nombre } : f)))

  const addAsignacion = (faseId: string) =>
    setFases((prev) =>
      prev.map((f) =>
        f.id === faseId
          ? { ...f, asignaciones: [...f.asignaciones, { rolId: roles[0]?.id ?? "", horas: 0 }] }
          : f,
      ),
    )
  const removeAsignacion = (faseId: string, idx: number) =>
    setFases((prev) =>
      prev.map((f) =>
        f.id === faseId ? { ...f, asignaciones: f.asignaciones.filter((_, i) => i !== idx) } : f,
      ),
    )
  const updateAsignacion = (faseId: string, idx: number, field: "rolId" | "horas", value: string) =>
    setFases((prev) =>
      prev.map((f) => {
        if (f.id !== faseId) return f
        return {
          ...f,
          asignaciones: f.asignaciones.map((a, i) => {
            if (i !== idx) return a
            if (field === "rolId") return { ...a, rolId: value }
            const n = Number(value.replace(",", "."))
            return { ...a, horas: Number.isFinite(n) ? n : 0 }
          }),
        }
      }),
    )

  const loadSample = () => {
    setRoles(SAMPLE_ROLES.map((r) => ({ ...r })))
    setFases(SAMPLE_FASES.map((f) => ({ ...f, asignaciones: f.asignaciones.map((a) => ({ ...a })) })))
    setContingenciaPct("10")
    setOverheadPct("15")
    setPf({ ...SAMPLE_PF })
    setPfFactorAjuste(String(SAMPLE_PF_FACTOR))
    setPfHorasPorPF(String(SAMPLE_PF_HORAS_POR_PF))
  }

  const { result, error } = useMemo(() => {
    try {
      const c = Number(contingenciaPct.replace(",", "."))
      const o = Number(overheadPct.replace(",", "."))
      const r = calcularEstimacion({
        fases,
        roles,
        contingenciaPct: Number.isFinite(c) ? c / 100 : 0,
        overheadPct: Number.isFinite(o) ? o / 100 : 0,
      })
      return { result: r, error: null as string | null }
    } catch (e) {
      return { result: null, error: e instanceof Error ? e.message : "Error en el cálculo." }
    }
  }, [fases, roles, contingenciaPct, overheadPct])

  const tarifaPromedio = useMemo(() => {
    if (roles.length === 0) return 0
    return roles.reduce((s, r) => s + r.tarifaHora, 0) / roles.length
  }, [roles])

  const pfResult = useMemo(() => {
    try {
      const factorAjuste = Number(pfFactorAjuste.replace(",", "."))
      const horasPorPF = Number(pfHorasPorPF.replace(",", "."))
      return calcularPuntosFuncion({
        conteos: pf,
        factorAjuste: Number.isFinite(factorAjuste) ? factorAjuste : 1,
        horasPorPF: Number.isFinite(horasPorPF) ? horasPorPF : 8,
        tarifaPromedioHora: tarifaPromedio,
      })
    } catch {
      return null
    }
  }, [pf, pfFactorAjuste, pfHorasPorPF, tarifaPromedio])

  const exportCsv = () => {
    if (!result) return
    const rows: (string | number)[][] = [
      ["Total directo (USD)", fmt(result.totalDirecto)],
      ["Contingencia (USD)", fmt(result.contingencia)],
      ["Overhead (USD)", fmt(result.overhead)],
      ["TOTAL (USD)", fmt(result.total)],
      [],
      ["Fase", "Horas", "Costo (USD)"],
      ...result.fases.map((f) => [f.nombre, fmt(f.horas, 1), fmt(f.subtotal)]),
      [],
      ["Rol", "Horas", "Costo (USD)"],
      ...result.horasTotalesPorRol.map((r) => [r.nombre, fmt(r.horas, 1), fmt(r.costo)]),
    ]
    downloadBlob("estimacion-proyecto.csv", toCsv(["Concepto", "Valor", ""], rows))
  }

  return (
    <div className="space-y-6">
      {/* Roles */}
      <section className="editorial-card relative p-5">
        <Crosshair className="pointer-events-none absolute right-2 top-2 h-3 w-3 text-[var(--hairline)]" />
        <div className="mb-4 flex items-center justify-between gap-3">
          <MonoLabel>Roles y tarifas</MonoLabel>
          <button
            onClick={loadSample}
            className="mono-label rounded-[2px] border border-[var(--hairline)] px-2.5 py-1 text-[var(--ink)] transition-colors hover:border-[var(--brass)] hover:text-[var(--brass)]"
          >
            Cargar ejemplo
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="text-left">
                {["Rol", "Tarifa/hora (USD)", ""].map((h) => (
                  <th key={h} className="mono-label pb-2 pr-3 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="font-mono">
              {roles.map((r) => (
                <tr key={r.id} className="border-t border-[var(--hairline)]">
                  <td className="py-1.5 pr-2">
                    <input
                      value={r.nombre}
                      onChange={(e) => updateRol(r.id, "nombre", e.target.value)}
                      className="h-8 w-full rounded-[2px] border border-[var(--hairline)] bg-white px-2 text-xs text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                    />
                  </td>
                  <td className="py-1.5 pr-2">
                    <input
                      value={r.tarifaHora}
                      onChange={(e) => updateRol(r.id, "tarifaHora", e.target.value)}
                      inputMode="decimal"
                      className="h-8 w-full rounded-[2px] border border-[var(--hairline)] bg-white px-2 text-right text-xs text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                    />
                  </td>
                  <td className="py-1.5">
                    <button
                      onClick={() => removeRol(r.id)}
                      disabled={roles.length <= 1}
                      title="Quitar rol"
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
        <button
          onClick={addRol}
          className="mono-label mt-3 flex items-center gap-1.5 rounded-[2px] border border-[var(--hairline)] px-2.5 py-1.5 text-[var(--ink)] transition-colors hover:border-[var(--brass)] hover:text-[var(--brass)]"
        >
          <Plus className="h-3.5 w-3.5" /> Agregar rol
        </button>
      </section>

      {/* Fases */}
      <section className="editorial-card relative p-5">
        <Crosshair className="pointer-events-none absolute right-2 top-2 h-3 w-3 text-[var(--hairline)]" />
        <div className="mb-4 flex items-center justify-between gap-3">
          <MonoLabel>Fases del proyecto</MonoLabel>
          <div className="flex items-center gap-3">
            <MonoLabel>Contingencia %</MonoLabel>
            <input
              value={contingenciaPct}
              onChange={(e) => setContingenciaPct(e.target.value)}
              inputMode="decimal"
              className="h-8 w-16 rounded-[2px] border border-[var(--hairline)] bg-white px-2 text-right font-mono text-xs text-[var(--ink)] outline-none focus:border-[var(--brass)]"
            />
            <MonoLabel>Overhead %</MonoLabel>
            <input
              value={overheadPct}
              onChange={(e) => setOverheadPct(e.target.value)}
              inputMode="decimal"
              className="h-8 w-16 rounded-[2px] border border-[var(--hairline)] bg-white px-2 text-right font-mono text-xs text-[var(--ink)] outline-none focus:border-[var(--brass)]"
            />
          </div>
        </div>

        <div className="space-y-4">
          {fases.map((f) => (
            <div key={f.id} className="rounded-[2px] border border-[var(--hairline)] p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <input
                  value={f.nombre}
                  onChange={(e) => updateFaseName(f.id, e.target.value)}
                  className="h-8 flex-1 rounded-[2px] border border-[var(--hairline)] bg-white px-2 text-sm font-medium text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                />
                <button
                  onClick={() => removeFase(f.id)}
                  disabled={fases.length <= 1}
                  title="Quitar fase"
                  className="flex h-8 w-8 items-center justify-center rounded-[2px] text-[var(--muted)] transition-colors hover:text-[var(--warn)] disabled:opacity-30"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-1.5">
                {f.asignaciones.map((a, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <select
                      value={a.rolId}
                      onChange={(e) => updateAsignacion(f.id, idx, "rolId", e.target.value)}
                      className="h-8 flex-1 rounded-[2px] border border-[var(--hairline)] bg-white px-2 font-mono text-xs text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>{r.nombre || r.id}</option>
                      ))}
                    </select>
                    <input
                      value={a.horas}
                      onChange={(e) => updateAsignacion(f.id, idx, "horas", e.target.value)}
                      inputMode="decimal"
                      placeholder="horas"
                      className="h-8 w-24 rounded-[2px] border border-[var(--hairline)] bg-white px-2 text-right font-mono text-xs text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--brass)]"
                    />
                    <button
                      onClick={() => removeAsignacion(f.id, idx)}
                      title="Quitar asignación"
                      className="flex h-8 w-8 items-center justify-center rounded-[2px] text-[var(--muted)] transition-colors hover:text-[var(--warn)]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => addAsignacion(f.id)}
                className="mono-label mt-2 flex items-center gap-1.5 rounded-[2px] border border-[var(--hairline)] px-2 py-1 text-[var(--ink)] transition-colors hover:border-[var(--brass)] hover:text-[var(--brass)]"
              >
                <Plus className="h-3 w-3" /> Agregar asignación
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addFase}
          className="mono-label mt-4 flex items-center gap-1.5 rounded-[2px] border border-[var(--hairline)] px-2.5 py-1.5 text-[var(--ink)] transition-colors hover:border-[var(--brass)] hover:text-[var(--brass)]"
        >
          <Plus className="h-3.5 w-3.5" /> Agregar fase
        </button>

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
            <StatCard label="Total directo" value={fmtMoney(result.totalDirecto)} />
            <StatCard label="Contingencia" value={fmtMoney(result.contingencia)} tone="warn" />
            <StatCard label="Overhead" value={fmtMoney(result.overhead)} tone="warn" />
            <StatCard label="TOTAL" value={fmtMoney(result.total)} tone="brass" />
          </div>

          <div className="editorial-card relative p-5">
            <Crosshair className="pointer-events-none absolute right-2 top-2 h-3 w-3 text-[var(--hairline)]" />
            <div className="mb-4 flex items-center justify-between gap-3">
              <MonoLabel>Desglose por fase y rol</MonoLabel>
              <button
                onClick={exportCsv}
                className="mono-label flex items-center gap-1.5 rounded-[2px] border border-[var(--hairline)] px-2.5 py-1 text-[var(--ink)] transition-colors hover:border-[var(--brass)] hover:text-[var(--brass)]"
              >
                <Download className="h-3.5 w-3.5" /> Descargar CSV
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <p className="mono-label mb-2">Por fase</p>
                <table className="w-full text-sm">
                  <tbody className="font-mono">
                    {result.fases.map((f, i) => (
                      <tr key={i} className="border-t border-[var(--hairline)] first:border-t-0">
                        <td className="py-2 pr-4 font-sans text-[var(--muted)]">{f.nombre}</td>
                        <td className="py-2 pr-4 text-right text-[var(--ink)]">{fmt(f.horas, 1)} h</td>
                        <td className="py-2 text-right text-[var(--ink)]">{fmtMoney(f.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <p className="mono-label mb-2">Por rol</p>
                <table className="w-full text-sm">
                  <tbody className="font-mono">
                    {result.horasTotalesPorRol.map((r, i) => (
                      <tr key={i} className="border-t border-[var(--hairline)] first:border-t-0">
                        <td className="py-2 pr-4 font-sans text-[var(--muted)]">{r.nombre}</td>
                        <td className="py-2 pr-4 text-right text-[var(--ink)]">{fmt(r.horas, 1)} h</td>
                        <td className="py-2 text-right text-[var(--ink)]">{fmtMoney(r.costo)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Puntos de función */}
      <section className="editorial-card relative p-5">
        <Crosshair className="pointer-events-none absolute right-2 top-2 h-3 w-3 text-[var(--hairline)]" />
        <MonoLabel>Puntos de función</MonoLabel>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {([
            ["entradasExternas", "Entradas externas"],
            ["salidasExternas", "Salidas externas"],
            ["consultas", "Consultas externas"],
            ["archivosLogicos", "Archivos lógicos"],
            ["interfaces", "Interfaces externas"],
          ] as const).map(([field, label]) => (
            <div key={field}>
              <MonoLabel>{label}</MonoLabel>
              <input
                value={pf[field]}
                onChange={(e) => {
                  const n = Number(e.target.value.replace(",", "."))
                  setPf((prev) => ({ ...prev, [field]: Number.isFinite(n) ? n : 0 }))
                }}
                inputMode="decimal"
                className="mt-1.5 h-9 w-full rounded-[2px] border border-[var(--hairline)] bg-white px-3 font-mono text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
              />
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div>
            <MonoLabel>Factor de ajuste</MonoLabel>
            <input
              value={pfFactorAjuste}
              onChange={(e) => setPfFactorAjuste(e.target.value)}
              inputMode="decimal"
              className="mt-1.5 h-9 w-full rounded-[2px] border border-[var(--hairline)] bg-white px-3 font-mono text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
            />
          </div>
          <div>
            <MonoLabel>Horas por PF</MonoLabel>
            <input
              value={pfHorasPorPF}
              onChange={(e) => setPfHorasPorPF(e.target.value)}
              inputMode="decimal"
              className="mt-1.5 h-9 w-full rounded-[2px] border border-[var(--hairline)] bg-white px-3 font-mono text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
            />
          </div>
        </div>

        {pfResult && (
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard label="Puntos de función" value={fmt(pfResult.pfAjustados, 1)} unit="PF" />
            <StatCard label="Horas estimadas" value={fmt(pfResult.horasEstimadas, 1)} unit="h" />
            <StatCard
              label="Costo estimado"
              value={fmtMoney(pfResult.costoEstimado ?? 0)}
              tone="brass"
            />
          </div>
        )}
      </section>
    </div>
  )
}

// ═══════════════════════════ COSTOS CLOUD ══════════════════════════════════
function CloudPanel() {
  const [items, setItems] = useState<ItemCloud[]>([
    { id: "c1", nombre: "", categoria: "computo", cantidad: 1, unidad: "und", precioUnitarioMes: 0 },
  ])
  const [anual, setAnual] = useState(false)
  const [descuentoAnualPct, setDescuentoAnualPct] = useState("15")

  const nextId = () => {
    let n = items.length + 1
    while (items.some((x) => x.id === `c${n}`)) n++
    return `c${n}`
  }

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      { id: nextId(), nombre: "", categoria: "computo", cantidad: 1, unidad: "und", precioUnitarioMes: 0 },
    ])
  const removeItem = (id: string) =>
    setItems((prev) => (prev.length <= 1 ? prev : prev.filter((it) => it.id !== id)))
  const updateItem = (id: string, field: keyof ItemCloud, value: string) =>
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it
        if (field === "nombre" || field === "unidad") return { ...it, [field]: value }
        if (field === "categoria") return { ...it, categoria: value as CategoriaCloud }
        const n = Number(value.replace(",", "."))
        return { ...it, [field]: Number.isFinite(n) ? n : 0 }
      }),
    )

  const loadSample = () => {
    setItems(SAMPLE_CLOUD.map((it) => ({ ...it })))
    setAnual(false)
    setDescuentoAnualPct("15")
  }

  const { result, error } = useMemo(() => {
    try {
      const d = Number(descuentoAnualPct.replace(",", "."))
      const r = calcularCostoCloud(items, {
        anual,
        descuentoAnualPct: Number.isFinite(d) ? d / 100 : 0,
      })
      return { result: r, error: null as string | null }
    } catch (e) {
      return { result: null, error: e instanceof Error ? e.message : "Error en el cálculo." }
    }
  }, [items, anual, descuentoAnualPct])

  const totalMostrado = result ? (result.anual ? result.totalAnual ?? result.totalMensual : result.totalMensual) : 0

  const exportCsv = () => {
    if (!result) return
    const rows: (string | number)[][] = [
      ...result.subtotalesPorCategoria.map((s) => [
        CATEGORIAS_CLOUD.find((c) => c.id === s.categoria)?.label ?? s.categoria,
        fmt(s.costoMes),
      ]),
      [],
      ["TOTAL", fmt(totalMostrado)],
    ]
    downloadBlob("costos-cloud.csv", toCsv(["Categoría", "Subtotal (USD)"], rows))
  }

  return (
    <div className="space-y-6">
      <section className="editorial-card relative p-5">
        <Crosshair className="pointer-events-none absolute right-2 top-2 h-3 w-3 text-[var(--hairline)]" />
        <div className="mb-4 flex items-center justify-between gap-3">
          <MonoLabel>Items de infraestructura cloud</MonoLabel>
          <div className="flex items-center gap-3">
            <label className="mono-label flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={anual}
                onChange={(e) => setAnual(e.target.checked)}
                className="h-3.5 w-3.5 accent-[var(--brass)]"
              />
              Facturación anual
            </label>
            {anual && (
              <>
                <MonoLabel>Descuento %</MonoLabel>
                <input
                  value={descuentoAnualPct}
                  onChange={(e) => setDescuentoAnualPct(e.target.value)}
                  inputMode="decimal"
                  className="h-8 w-16 rounded-[2px] border border-[var(--hairline)] bg-white px-2 text-right font-mono text-xs text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                />
              </>
            )}
            <button
              onClick={loadSample}
              className="mono-label rounded-[2px] border border-[var(--hairline)] px-2.5 py-1 text-[var(--ink)] transition-colors hover:border-[var(--brass)] hover:text-[var(--brass)]"
            >
              Cargar ejemplo
            </button>
          </div>
        </div>

        <p className="mono-label mb-3">precios referenciales — edítalos según tu proveedor</p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="text-left">
                {["Nombre", "Categoría", "Cantidad", "Unidad", "Precio/mes (USD)", ""].map((h) => (
                  <th key={h} className="mono-label pb-2 pr-3 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="font-mono">
              {items.map((it) => (
                <tr key={it.id} className="border-t border-[var(--hairline)]">
                  <td className="py-1.5 pr-2">
                    <input
                      value={it.nombre}
                      onChange={(e) => updateItem(it.id, "nombre", e.target.value)}
                      className="h-8 w-full min-w-[180px] rounded-[2px] border border-[var(--hairline)] bg-white px-2 text-xs text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                    />
                  </td>
                  <td className="py-1.5 pr-2">
                    <select
                      value={it.categoria}
                      onChange={(e) => updateItem(it.id, "categoria", e.target.value)}
                      className="h-8 w-full rounded-[2px] border border-[var(--hairline)] bg-white px-2 text-xs text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                    >
                      {CATEGORIAS_CLOUD.map((c) => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-1.5 pr-2">
                    <input
                      value={it.cantidad}
                      onChange={(e) => updateItem(it.id, "cantidad", e.target.value)}
                      inputMode="decimal"
                      className="h-8 w-20 rounded-[2px] border border-[var(--hairline)] bg-white px-2 text-right text-xs text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                    />
                  </td>
                  <td className="py-1.5 pr-2">
                    <input
                      value={it.unidad}
                      onChange={(e) => updateItem(it.id, "unidad", e.target.value)}
                      className="h-8 w-20 rounded-[2px] border border-[var(--hairline)] bg-white px-2 text-xs text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                    />
                  </td>
                  <td className="py-1.5 pr-2">
                    <input
                      value={it.precioUnitarioMes}
                      onChange={(e) => updateItem(it.id, "precioUnitarioMes", e.target.value)}
                      inputMode="decimal"
                      className="h-8 w-24 rounded-[2px] border border-[var(--hairline)] bg-white px-2 text-right text-xs text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                    />
                  </td>
                  <td className="py-1.5">
                    <button
                      onClick={() => removeItem(it.id)}
                      disabled={items.length <= 1}
                      title="Quitar item"
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

        <button
          onClick={addItem}
          className="mono-label mt-3 flex items-center gap-1.5 rounded-[2px] border border-[var(--hairline)] px-2.5 py-1.5 text-[var(--ink)] transition-colors hover:border-[var(--brass)] hover:text-[var(--brass)]"
        >
          <Plus className="h-3.5 w-3.5" /> Agregar item
        </button>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-[2px] border border-[var(--warn)]/40 bg-[var(--warn)]/8 px-3 py-2 text-xs" style={{ color: "var(--warn)" }}>
            <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </section>

      {result && (
        <section className="animate-fade-in space-y-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CATEGORIAS_CLOUD.map((c) => {
              const costoMes = result.subtotalesPorCategoria.find((s) => s.categoria === c.id)?.costoMes ?? 0
              const factor = result.anual ? 12 * (1 - result.descuentoAnualPct) : 1
              return <StatCard key={c.id} label={c.label} value={fmtMoney(costoMes * factor)} />
            })}
          </div>

          <div className="editorial-card relative p-5">
            <Crosshair className="pointer-events-none absolute right-2 top-2 h-3 w-3 text-[var(--hairline)]" />
            <div className="mb-4 flex items-center justify-between gap-3">
              <MonoLabel>Total {anual ? "anual" : "mensual"}</MonoLabel>
              <button
                onClick={exportCsv}
                className="mono-label flex items-center gap-1.5 rounded-[2px] border border-[var(--hairline)] px-2.5 py-1 text-[var(--ink)] transition-colors hover:border-[var(--brass)] hover:text-[var(--brass)]"
              >
                <Download className="h-3.5 w-3.5" /> Descargar CSV
              </button>
            </div>
            <p className="font-mono text-2xl leading-none tracking-tight" style={{ color: "var(--brass)" }}>
              {fmtMoney(totalMostrado)}
            </p>
          </div>
        </section>
      )}
    </div>
  )
}

// ═══════════════════════════ PÁGINA ════════════════════════════════════════
export default function InformaticaPage() {
  const [tab, setTab] = useState<Tab>("estimacion")

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 lg:px-10">
      {/* Encabezado */}
      <header className="mb-6">
        <div className="mb-1 flex items-center gap-2">
          <Pin className="relative" />
          <MonoLabel>Módulo informática</MonoLabel>
        </div>
        <h1 className="flex items-center gap-2.5 text-xl font-semibold tracking-tight text-[var(--ink)]">
          <Cpu className="h-5 w-5 text-[var(--brass)]" />
          Estimación de proyectos e infraestructura
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Estimación por fases y puntos de función, y costos de infraestructura cloud — todo el cálculo se ejecuta en tu navegador.
        </p>
      </header>

      {/* Pestañas */}
      <div className="mb-6 flex gap-1 border-b border-[var(--hairline)]">
        {([
          { id: "estimacion", label: "Estimación de proyecto", icon: Calculator },
          { id: "cloud", label: "Costos cloud", icon: Cloud },
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
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-[var(--brass)]" />
            )}
          </button>
        ))}
      </div>

      {tab === "estimacion" ? <EstimacionPanel /> : <CloudPanel />}
    </div>
  )
}
