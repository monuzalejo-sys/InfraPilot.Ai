"use client"

import { useState, useRef, useCallback } from "react"
import {
  FileText, Upload, CheckCircle, AlertTriangle, XCircle,
  ChevronDown, ChevronRight, Shield, Briefcase, Star,
  TrendingUp, Clock, DollarSign, Users, Award, Zap,
  Info, AlertOctagon, Building2,
} from "lucide-react"
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  Tooltip,
} from "recharts"

// ── Types ──────────────────────────────────────────────────────
type ComplianceStatus = "cumple" | "verificar" | "incumple" | "na"
type RiskLevel        = "HIGH" | "MEDIUM" | "LOW"
type Phase            = "idle" | "processing" | "results"
type TabKey           = "requisitos" | "riesgos" | "garantias" | "experiencia"

interface LicitacionMeta {
  nombre: string
  proceso: string
  entidad: string
  sector: string
  tipo: string
  objeto: string
  departamento?: string
  valorReferencial: number
  moneda: string
  plazoEjecucion: number
  totalPaginas: number
  compatibilidadGlobal: number
  riesgoGlobal: RiskLevel
  alertasCount: number
}

interface Compatibilidad {
  global: number
  tecnico: number
  economico: number
  experiencia: number
  administrativo: number
  ambiental: number
}

interface RequisitoItem {
  id: string
  description: string
  detail: string
  status: ComplianceStatus
  critical: boolean
  clausula?: string
}

interface RequisitoGroup {
  id: string
  title: string
  category: "tecnico" | "economico" | "administrativo"
  items: RequisitoItem[]
}

interface Riesgo {
  id: string
  titulo: string
  descripcion: string
  level: RiskLevel
  probability: string
  impacto: string
  mitigacion: string
  clausula?: string
  importeRiesgo?: string
  tipo: string
}

interface Garantia {
  id: string
  tipo: string
  descripcion: string
  monto: number
  montoPct: string
  plazo: string
  tipoDocumento: string
  momento: string
  nota?: string
  clausula?: string
}

interface ExperienciaItem {
  id: string
  titulo: string
  requisito: string
  match: ComplianceStatus
  critical: boolean
  clausula?: string
  empresaEstado: string
  detalle?: string
}

interface CriterioEvaluacion {
  factor: string
  puntaje: number
  tipo: "económico" | "técnico"
}

interface Insights {
  conclusion: string
  riesgoPrincipal: string
  recomendacion: string
}

interface LicitacionData {
  meta: LicitacionMeta
  compatibilidad: Compatibilidad
  requisitos: RequisitoGroup[]
  riesgos: Riesgo[]
  garantias: Garantia[]
  experienciaRequerida: ExperienciaItem[]
  criteriosEvaluacion: CriterioEvaluacion[]
  insights: Insights
}

// ── Helpers ────────────────────────────────────────────────────
function fmt(n: number) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", maximumFractionDigits: 0 }).format(n)
}

function StatusBadge({ status }: { status: ComplianceStatus }) {
  const cfg = {
    cumple:    { bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30", label: "Cumple",    Icon: CheckCircle },
    verificar: { bg: "bg-amber-500/10 text-amber-400 border-amber-500/30",      label: "Verificar", Icon: AlertTriangle },
    incumple:  { bg: "bg-rose-500/10 text-rose-400 border-rose-500/30",         label: "Incumple",  Icon: XCircle },
    na:        { bg: "bg-slate-500/10 text-slate-400 border-slate-500/30",      label: "N/A",       Icon: Info },
  }[status]
  const { bg, label, Icon } = cfg
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-semibold ${bg}`}>
      <Icon className="w-3 h-3" />{label}
    </span>
  )
}

function RiskBadge({ level }: { level: RiskLevel }) {
  const cfg = {
    HIGH:   { bg: "bg-rose-500/10 text-rose-400 border-rose-500/30",             label: "ALTO" },
    MEDIUM: { bg: "bg-amber-500/10 text-amber-400 border-amber-500/30",           label: "MEDIO" },
    LOW:    { bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",     label: "BAJO" },
  }[level]
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-bold tracking-wide ${cfg.bg}`}>{cfg.label}</span>
}

function CompatMeter({ pct, color = "#6366f1" }: { pct: number; color?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-sm font-bold text-white w-10 text-right">{pct}%</span>
    </div>
  )
}

// ── Processing steps (generic) ─────────────────────────────────
const GENERIC_STEPS = [
  { id: "s1", label: "Cargando y procesando documento" },
  { id: "s2", label: "Identificando entidad y proceso licitatorio" },
  { id: "s3", label: "Extrayendo valor referencial y plazos" },
  { id: "s4", label: "Analizando requisitos técnicos y administrativos" },
  { id: "s5", label: "Evaluando criterios de calificación" },
  { id: "s6", label: "Detectando cláusulas de riesgo" },
  { id: "s7", label: "Verificando garantías exigidas" },
  { id: "s8", label: "Calculando compatibilidad empresa" },
]

// ── Upload Phase ───────────────────────────────────────────────
function UploadPhase({ onStart }: { onStart: (file: File | null) => void }) {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f?.type === "application/pdf") setFile(f)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-violet-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Analizador de Licitaciones</h1>
        <p className="text-slate-400 max-w-lg">
          Sube el expediente técnico en PDF. La IA extrae requisitos, detecta riesgos,
          verifica garantías y calcula tu compatibilidad en segundos.
        </p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`w-full max-w-xl border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-4 cursor-pointer transition-all
          ${dragging ? "border-violet-500 bg-violet-500/5" : "border-slate-600 hover:border-violet-500/60 hover:bg-slate-800/40"}`}
      >
        <input ref={inputRef} type="file" accept=".pdf" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f) }} />
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${dragging ? "bg-violet-500/20" : "bg-slate-700"}`}>
          <Upload className={`w-7 h-7 ${dragging ? "text-violet-400" : "text-slate-400"}`} />
        </div>
        {file ? (
          <>
            <div className="text-center">
              <p className="text-white font-medium">{file.name}</p>
              <p className="text-slate-400 text-sm">{(file.size / 1024 / 1024).toFixed(1)} MB · PDF</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onStart(file) }}
              className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-colors"
            >
              Analizar con IA
            </button>
          </>
        ) : (
          <>
            <div className="text-center">
              <p className="text-white font-medium">Arrastra el PDF aquí</p>
              <p className="text-slate-400 text-sm">o haz clic para seleccionar</p>
            </div>
            <p className="text-xs text-slate-500">PDF hasta 50 MB · Bases de licitación, TdR o expediente técnico</p>
          </>
        )}
      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="text-slate-500 text-sm">o prueba una licitación de ejemplo</p>
        <button
          onClick={() => onStart(null)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-violet-500/40 text-violet-400 hover:bg-violet-500/10 transition-colors font-medium text-sm"
        >
          <Zap className="w-4 h-4" />
          Generar análisis de ejemplo
        </button>
      </div>
    </div>
  )
}

// ── Processing Phase ───────────────────────────────────────────
function ProcessingPhase({ step }: { step: number }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
          <Zap className="w-8 h-8 text-white animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">Analizando licitación…</h2>
        <p className="text-slate-400">La IA está procesando el documento</p>
      </div>
      <div className="w-full max-w-lg space-y-2">
        {GENERIC_STEPS.map((s, i) => {
          const done = i < step, active = i === step
          return (
            <div key={s.id} className={`flex items-start gap-3 p-3 rounded-xl transition-all ${active ? "bg-violet-500/10 border border-violet-500/30" : "border border-transparent"}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${done ? "bg-emerald-500" : active ? "bg-violet-500 animate-pulse" : "bg-slate-700"}`}>
                {done ? <CheckCircle className="w-3.5 h-3.5 text-white" /> : <span className="text-xs font-bold text-white">{i + 1}</span>}
              </div>
              <p className={`text-sm font-medium mt-0.5 ${done ? "text-slate-400 line-through" : active ? "text-white" : "text-slate-500"}`}>{s.label}</p>
            </div>
          )
        })}
      </div>
      <div className="w-full max-w-lg">
        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
          <span>Procesando…</span>
          <span>{Math.round((step / GENERIC_STEPS.length) * 100)}%</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${(step / GENERIC_STEPS.length) * 100}%`, background: "linear-gradient(90deg, #7c3aed, #4f46e5)" }} />
        </div>
      </div>
    </div>
  )
}

// ── Results Phase ──────────────────────────────────────────────
function ResultsPhase({ data }: { data: LicitacionData }) {
  const [tab, setTab] = useState<TabKey>("requisitos")
  const [expandedGroup, setExpandedGroup] = useState<string | null>(data.requisitos[0]?.id ?? null)
  const [expandedRisk, setExpandedRisk] = useState<string | null>(data.riesgos[0]?.id ?? null)

  const { meta, compatibilidad, requisitos, riesgos, garantias, experienciaRequerida, criteriosEvaluacion, insights } = data

  const allItems = requisitos.flatMap((g) => g.items)
  const stats = {
    totalRequisitos: allItems.length,
    cumple:          allItems.filter((i) => i.status === "cumple").length,
    verificar:       allItems.filter((i) => i.status === "verificar").length,
    incumple:        allItems.filter((i) => i.status === "incumple").length,
    na:              allItems.filter((i) => i.status === "na").length,
    riesgosHigh:     riesgos.filter((r) => r.level === "HIGH").length,
    riesgosMedium:   riesgos.filter((r) => r.level === "MEDIUM").length,
    riesgosLow:      riesgos.filter((r) => r.level === "LOW").length,
    garantiasTotal:  garantias.reduce((s, g) => s + (g.monto ?? 0), 0),
  }

  const radarData = [
    { dimension: "Técnico",        empresa: compatibilidad.tecnico,        requerido: 100 },
    { dimension: "Económico",      empresa: compatibilidad.economico,      requerido: 100 },
    { dimension: "Experiencia",    empresa: compatibilidad.experiencia,    requerido: 100 },
    { dimension: "Administrativo", empresa: compatibilidad.administrativo, requerido: 100 },
    { dimension: "Ambiental",      empresa: compatibilidad.ambiental,      requerido: 100 },
  ]

  const tabs: { key: TabKey; label: string; count?: string; icon: React.ElementType }[] = [
    { key: "requisitos",  label: "Requisitos",  count: `${stats.totalRequisitos}`, icon: FileText },
    { key: "riesgos",     label: "Riesgos",     count: `${riesgos.length}`,        icon: AlertOctagon },
    { key: "garantias",   label: "Garantías",   count: `${garantias.length}`,      icon: Shield },
    { key: "experiencia", label: "Experiencia", count: `${experienciaRequerida.length}`, icon: Award },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-semibold">{meta.proceso}</span>
            <span className="text-slate-500 text-xs">{meta.tipo} · {meta.entidad}</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{meta.nombre}</h1>
          <p className="text-slate-400 text-sm mt-0.5">{meta.objeto}</p>
        </div>
        <button onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 text-sm font-medium transition-colors flex items-center gap-2">
          <Upload className="w-4 h-4" /> Nueva licitación
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Valor Referencial",  value: fmt(meta.valorReferencial), icon: DollarSign, color: "text-indigo-400", bg: "bg-indigo-500/10" },
          { label: "Plazo de ejecución", value: `${meta.plazoEjecucion} meses`,  icon: Clock,     color: "text-cyan-400",   bg: "bg-cyan-500/10" },
          { label: "Páginas analizadas", value: `${meta.totalPaginas}`,           icon: FileText,  color: "text-violet-400", bg: "bg-violet-500/10" },
          { label: "Sector",             value: meta.sector,                       icon: Building2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-xs text-slate-400">{label}</p>
            <p className="text-lg font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Compatibility + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white">Compatibilidad Global</h3>
          <div className="text-center py-2">
            <div className="relative w-28 h-28 mx-auto">
              <svg viewBox="0 0 100 100" className="w-28 h-28 -rotate-90">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#1e293b" strokeWidth="10" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#6366f1" strokeWidth="10"
                  strokeDasharray={`${(compatibilidad.global / 100) * 238.76} 238.76`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white">{compatibilidad.global}%</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm mt-1">Compatibilidad estimada</p>
          </div>
          <div className="space-y-2.5">
            {[
              { label: "Técnico",        pct: compatibilidad.tecnico,        color: "#6366f1" },
              { label: "Económico",      pct: compatibilidad.economico,      color: "#22d3ee" },
              { label: "Experiencia",    pct: compatibilidad.experiencia,    color: "#f59e0b" },
              { label: "Administrativo", pct: compatibilidad.administrativo, color: "#10b981" },
              { label: "Ambiental",      pct: compatibilidad.ambiental,      color: "#f43f5e" },
            ].map(({ label, pct, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{label}</span><span className="font-medium text-white">{pct}%</span>
                </div>
                <CompatMeter pct={pct} color={color} />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Radar de Compatibilidad</h3>
          <p className="text-xs text-slate-400 mb-4">Tu empresa vs. requisitos de la licitación</p>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData} margin={{ top: 5, right: 30, bottom: 5, left: 30 }}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="dimension" tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <Radar name="Requerido" dataKey="requerido" stroke="#334155" fill="#334155" fillOpacity={0.3} />
              <Radar name="Empresa" dataKey="empresa" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} dot={{ fill: "#6366f1", r: 4 }} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }} labelStyle={{ color: "#94a3b8" }} itemStyle={{ color: "#c7d2fe" }} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-4 gap-3 mt-3">
            {[
              { label: "Cumple",    count: stats.cumple,    color: "text-emerald-400", bg: "bg-emerald-500/10" },
              { label: "Verificar", count: stats.verificar, color: "text-amber-400",   bg: "bg-amber-500/10" },
              { label: "Incumple",  count: stats.incumple,  color: "text-rose-400",    bg: "bg-rose-500/10" },
              { label: "N/A",       count: stats.na,        color: "text-slate-400",   bg: "bg-slate-700" },
            ].map(({ label, count, color, bg }) => (
              <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
                <p className={`text-2xl font-black ${color}`}>{count}</p>
                <p className="text-xs text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Criterios */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-white">Criterios de Evaluación</h3>
          <span className="text-xs text-slate-400 ml-auto">Factores de calificación — total 100 puntos</span>
        </div>
        <div className="flex gap-4 flex-wrap">
          {criteriosEvaluacion.map((c) => (
            <div key={c.factor} className="flex-1 min-w-40">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">{c.factor}</span>
                <span className="font-bold text-white">{c.puntaje} pts</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${c.puntaje}%`, background: c.tipo === "económico" ? "#6366f1" : "#8b5cf6" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="flex border-b border-slate-700 overflow-x-auto">
          {tabs.map(({ key, label, count, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2
                ${tab === key ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-400 hover:text-white hover:bg-slate-700/30"}`}>
              <Icon className="w-4 h-4" />
              {label}
              {count && <span className={`text-xs px-1.5 py-0.5 rounded-md ${tab === key ? "bg-indigo-500/20 text-indigo-300" : "bg-slate-700 text-slate-400"}`}>{count}</span>}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* REQUISITOS */}
          {tab === "requisitos" && (
            <div className="space-y-3">
              {requisitos.map((group) => (
                <div key={group.id} className="border border-slate-700 rounded-xl overflow-hidden">
                  <button onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors">
                    <div className="flex items-center gap-3">
                      {expandedGroup === group.id ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                      <span className="font-semibold text-white">{group.title}</span>
                      <span className="text-xs text-slate-400">{group.items.length} criterios</span>
                    </div>
                    <div className="flex gap-1.5">
                      {(["cumple", "verificar", "incumple"] as ComplianceStatus[]).map((s) => {
                        const c = group.items.filter((i) => i.status === s).length
                        if (!c) return null
                        const colors = { cumple: "bg-emerald-500/10 text-emerald-400", verificar: "bg-amber-500/10 text-amber-400", incumple: "bg-rose-500/10 text-rose-400", na: "" }
                        return <span key={s} className={`text-xs px-2 py-0.5 rounded-md font-semibold ${colors[s]}`}>{c}</span>
                      })}
                    </div>
                  </button>
                  {expandedGroup === group.id && (
                    <div className="border-t border-slate-700 divide-y divide-slate-700/50">
                      {group.items.map((item) => (
                        <div key={item.id} className="p-4 flex gap-4 hover:bg-slate-700/20 transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <p className="font-medium text-white text-sm">{item.description}</p>
                              {item.critical && <span className="text-xs px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">Crítico</span>}
                              {item.clausula && <span className="text-xs text-slate-500">{item.clausula}</span>}
                            </div>
                            <p className="text-xs text-slate-400">{item.detail}</p>
                          </div>
                          <div className="flex-shrink-0"><StatusBadge status={item.status} /></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* RIESGOS */}
          {tab === "riesgos" && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: "Riesgo Alto",  count: stats.riesgosHigh,   color: "text-rose-400",    bg: "bg-rose-500/10 border-rose-500/20" },
                  { label: "Riesgo Medio", count: stats.riesgosMedium, color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20" },
                  { label: "Riesgo Bajo",  count: stats.riesgosLow,    color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
                ].map(({ label, count, color, bg }) => (
                  <div key={label} className={`border rounded-xl p-3 text-center ${bg}`}>
                    <p className={`text-2xl font-black ${color}`}>{count}</p>
                    <p className="text-xs text-slate-400">{label}</p>
                  </div>
                ))}
              </div>
              {riesgos.map((risk) => (
                <div key={risk.id} className="border border-slate-700 rounded-xl overflow-hidden">
                  <button onClick={() => setExpandedRisk(expandedRisk === risk.id ? null : risk.id)}
                    className="w-full flex items-start gap-3 p-4 hover:bg-slate-700/30 transition-colors text-left">
                    <div className="mt-0.5">{expandedRisk === risk.id ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <RiskBadge level={risk.level} />
                        <span className="text-xs text-slate-400 capitalize">{risk.tipo}</span>
                        {risk.clausula && <span className="text-xs text-slate-500">{risk.clausula}</span>}
                      </div>
                      <p className="font-semibold text-white">{risk.titulo}</p>
                    </div>
                    {risk.importeRiesgo && <span className="text-xs text-slate-400 flex-shrink-0">{risk.importeRiesgo}</span>}
                  </button>
                  {expandedRisk === risk.id && (
                    <div className="border-t border-slate-700 p-4 space-y-3">
                      <p className="text-sm text-slate-300">{risk.descripcion}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-slate-900/50 rounded-xl p-3">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Probabilidad / Impacto</p>
                          <p className="text-xs text-slate-300">{risk.probability}</p>
                          <p className="text-xs text-rose-300 mt-1">{risk.impacto}</p>
                        </div>
                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
                          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wide mb-1">Mitigación recomendada</p>
                          <p className="text-xs text-slate-300">{risk.mitigacion}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* GARANTÍAS */}
          {tab === "garantias" && (
            <div className="space-y-4">
              <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-400">Monto total de garantías estimadas</p>
                  <p className="text-xl font-black text-white">{fmt(stats.garantiasTotal)}</p>
                </div>
                <Shield className="w-8 h-8 text-indigo-400" />
              </div>
              <div className="space-y-3">
                {garantias.map((g) => (
                  <div key={g.id} className="border border-slate-700 rounded-xl p-5 space-y-3">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <p className="font-bold text-white">{g.tipo}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{g.descripcion}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-indigo-400">{fmt(g.monto)}</p>
                        <p className="text-xs text-slate-400">{g.montoPct}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="bg-slate-900/50 rounded-lg p-2.5">
                        <p className="text-slate-500 mb-0.5">Plazo</p>
                        <p className="text-slate-200">{g.plazo}</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-2.5">
                        <p className="text-slate-500 mb-0.5">Tipo de documento</p>
                        <p className="text-slate-200">{g.tipoDocumento}</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-2.5">
                        <p className="text-slate-500 mb-0.5">Momento</p>
                        <p className="text-slate-200">{g.momento}</p>
                      </div>
                    </div>
                    {g.nota && (
                      <div className="flex gap-2 bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                        <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-200">{g.nota}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EXPERIENCIA */}
          {tab === "experiencia" && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3 mb-4">
                {(["cumple", "verificar", "incumple"] as ComplianceStatus[]).map((s) => {
                  const count = experienciaRequerida.filter((e) => e.match === s).length
                  const cfg = {
                    cumple:    { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", label: "Cumple" },
                    verificar: { color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20",    label: "Verificar" },
                    incumple:  { color: "text-rose-400",    bg: "bg-rose-500/10 border-rose-500/20",      label: "Incumple" },
                    na:        { color: "text-slate-400",   bg: "bg-slate-700",                           label: "N/A" },
                  }[s]
                  return (
                    <div key={s} className={`border rounded-xl p-3 text-center ${cfg.bg}`}>
                      <p className={`text-2xl font-black ${cfg.color}`}>{count}</p>
                      <p className="text-xs text-slate-400">{cfg.label}</p>
                    </div>
                  )
                })}
              </div>
              {experienciaRequerida.map((exp) => (
                <div key={exp.id} className={`border rounded-xl p-5 space-y-3
                  ${exp.match === "incumple" ? "border-rose-500/30 bg-rose-500/5" :
                    exp.match === "verificar" ? "border-amber-500/30 bg-amber-500/5" : "border-slate-700"}`}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <StatusBadge status={exp.match} />
                        {exp.critical && <span className="text-xs px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">Crítico</span>}
                        {exp.clausula && <span className="text-xs text-slate-500">{exp.clausula}</span>}
                      </div>
                      <p className="font-bold text-white">{exp.titulo}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">{exp.requisito}</p>
                  <div className={`flex gap-2 rounded-lg p-3
                    ${exp.match === "incumple" ? "bg-rose-500/10 border border-rose-500/20" :
                      exp.match === "verificar" ? "bg-amber-500/10 border border-amber-500/20" :
                      "bg-emerald-500/5 border border-emerald-500/20"}`}>
                    {exp.match === "cumple" ? <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" /> :
                     exp.match === "verificar" ? <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" /> :
                     <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />}
                    <p className={`text-xs ${exp.match === "cumple" ? "text-emerald-200" : exp.match === "verificar" ? "text-amber-200" : "text-rose-200"}`}>
                      {exp.empresaEstado}
                    </p>
                  </div>
                  {exp.detalle && <p className="text-xs text-slate-500 italic">{exp.detalle}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI summary */}
      <div className="rounded-2xl p-5 text-white" style={{ background: "linear-gradient(135deg, #7c3aed22, #4f46e522)", border: "1px solid #7c3aed44" }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-violet-300">Recomendación IA</span>
        </div>
        <p className="text-slate-200 text-sm leading-relaxed mb-4">{insights.conclusion}</p>
        <div className="space-y-2">
          <div className="flex gap-2 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-xs text-rose-200">{insights.riesgoPrincipal}</p>
          </div>
          <div className="flex gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
            <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-200">{insights.recomendacion}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { icon: Users,      label: "Revisar capacidad del consorcio" },
            { icon: Briefcase,  label: "Verificar requisitos críticos" },
            { icon: TrendingUp, label: "Preparar oferta técnica sólida" },
          ].map(({ icon: Icon, label }) => (
            <span key={label} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800/60 text-violet-300">
              <Icon className="w-3.5 h-3.5" /> {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────
export default function LicitacionesPage() {
  const [phase, setPhase]       = useState<Phase>("idle")
  const [step, setStep]         = useState(0)
  const [analysis, setAnalysis] = useState<LicitacionData | null>(null)
  const [error, setError]       = useState<string | null>(null)

  async function startAnalysis(file: File | null) {
    setPhase("processing")
    setStep(0)
    setError(null)

    // Animate steps while API call runs in parallel
    let current = 0
    const animInterval = setInterval(() => {
      current++
      setStep(current)
      if (current >= GENERIC_STEPS.length - 1) clearInterval(animInterval)
    }, 900)

    try {
      const form = new FormData()
      if (file) {
        form.append("file", file)
      } else {
        form.append("demo", "true")
      }

      const res  = await fetch("/api/licitaciones/analyze", { method: "POST", body: form })
      const json = await res.json()

      clearInterval(animInterval)
      setStep(GENERIC_STEPS.length)

      if (!res.ok || json.error) {
        setError(json.error ?? "Error al analizar")
        setPhase("idle")
        return
      }

      await new Promise((r) => setTimeout(r, 600))
      setAnalysis(json.analysis)
      setPhase("results")
    } catch (e) {
      clearInterval(animInterval)
      setError(e instanceof Error ? e.message : "Error de conexión")
      setPhase("idle")
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
        {phase === "idle"       && <UploadPhase onStart={startAnalysis} />}
        {phase === "processing" && <ProcessingPhase step={step} />}
        {phase === "results" && analysis && <ResultsPhase data={analysis} />}
      </div>
    </div>
  )
}
