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
import { isSupabaseConfigured } from "@/lib/supabase/client"
import { DemoNotice } from "@/components/demo-notice"
import { Crosshair, EditorialCard, MonoLabel } from "@/components/editorial"

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
    cumple:    { color: "var(--ok)",    border: "border-[var(--ok)]/30",    label: "Cumple",    Icon: CheckCircle },
    verificar: { color: "var(--warn)",  border: "border-[var(--warn)]/30",  label: "Verificar", Icon: AlertTriangle },
    incumple:  { color: "var(--warn)",  border: "border-[var(--warn)]/40",  label: "Incumple",  Icon: XCircle },
    na:        { color: "var(--muted)", border: "border-[var(--hairline)]", label: "N/A",       Icon: Info },
  }[status]
  const { color, border, label, Icon } = cfg
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] border text-xs font-semibold ${border}`} style={{ color }}>
      <Icon className="w-3 h-3" />{label}
    </span>
  )
}

function RiskBadge({ level }: { level: RiskLevel }) {
  const cfg = {
    HIGH:   { color: "var(--warn)", border: "border-[var(--warn)]/40",  label: "ALTO" },
    MEDIUM: { color: "var(--warn)", border: "border-[var(--warn)]/25",  label: "MEDIO" },
    LOW:    { color: "var(--ok)",   border: "border-[var(--ok)]/30",    label: "BAJO" },
  }[level]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-[2px] border text-xs font-bold tracking-wide ${cfg.border}`} style={{ color: cfg.color }}>
      {cfg.label}
    </span>
  )
}

function CompatMeter({ pct, color = "var(--brass)" }: { pct: number; color?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-[var(--hairline)] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-sm font-bold text-[var(--ink)] font-mono w-10 text-right">{pct}%</span>
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
        <div className="w-16 h-16 rounded-[2px] bg-[var(--brass)]/10 border border-[var(--brass)]/30 flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-[var(--brass)]" />
        </div>
        <h1 className="text-3xl font-semibold text-[var(--ink)] mb-2">Analizador de Licitaciones</h1>
        <p className="text-[var(--muted)] max-w-lg">
          Sube el expediente técnico en PDF. La IA extrae requisitos, detecta riesgos,
          verifica garantías y calcula tu compatibilidad en segundos.
        </p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`w-full max-w-xl border-2 border-dashed rounded-[2px] p-10 flex flex-col items-center gap-4 cursor-pointer transition-all
          ${dragging ? "border-[var(--brass)] bg-[var(--brass)]/5" : "border-[var(--hairline)] hover:border-[var(--brass)]/60 hover:bg-[var(--card)]"}`}
      >
        <input ref={inputRef} type="file" accept=".pdf" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f) }} />
        <div className={`w-14 h-14 rounded-[2px] flex items-center justify-center transition-colors ${dragging ? "bg-[var(--brass)]/20" : "bg-[var(--card)] border border-[var(--hairline)]"}`}>
          <Upload className={`w-7 h-7 ${dragging ? "text-[var(--brass)]" : "text-[var(--muted)]"}`} />
        </div>
        {file ? (
          <>
            <div className="text-center">
              <p className="text-[var(--ink)] font-medium">{file.name}</p>
              <p className="text-[var(--muted)] text-sm">{(file.size / 1024 / 1024).toFixed(1)} MB · PDF</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onStart(file) }}
              className="px-6 py-2.5 rounded-[2px] bg-[var(--brass)] hover:opacity-90 text-[var(--paper)] font-semibold transition-opacity"
            >
              Analizar con IA
            </button>
          </>
        ) : (
          <>
            <div className="text-center">
              <p className="text-[var(--ink)] font-medium">Arrastra el PDF aquí</p>
              <p className="text-[var(--muted)] text-sm">o haz clic para seleccionar</p>
            </div>
            <p className="text-xs text-[var(--muted)]">PDF hasta 50 MB · Bases de licitación, TdR o expediente técnico</p>
          </>
        )}
      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="text-[var(--muted)] text-sm">o prueba una licitación de ejemplo</p>
        <button
          onClick={() => onStart(null)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-[2px] border border-[var(--brass)]/40 text-[var(--brass)] hover:bg-[var(--brass)]/10 transition-colors font-medium text-sm"
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
        <div className="w-16 h-16 rounded-[2px] mx-auto mb-4 flex items-center justify-center bg-[var(--brass)]">
          <Zap className="w-8 h-8 text-[var(--paper)] animate-pulse" />
        </div>
        <h2 className="text-2xl font-semibold text-[var(--ink)] mb-1">Analizando licitación…</h2>
        <p className="text-[var(--muted)]">La IA está procesando el documento</p>
      </div>
      <div className="w-full max-w-lg space-y-2">
        {GENERIC_STEPS.map((s, i) => {
          const done = i < step, active = i === step
          return (
            <div key={s.id} className={`flex items-start gap-3 p-3 rounded-[2px] transition-all ${active ? "bg-[var(--brass)]/10 border border-[var(--brass)]/30" : "border border-transparent"}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${done ? "bg-[var(--ok)]" : active ? "bg-[var(--brass)] animate-pulse" : "bg-[var(--hairline)]"}`}>
                {done ? <CheckCircle className="w-3.5 h-3.5 text-[var(--paper)]" /> : <span className="text-xs font-bold text-[var(--paper)]">{i + 1}</span>}
              </div>
              <p className={`text-sm font-medium mt-0.5 ${done ? "text-[var(--muted)] line-through" : active ? "text-[var(--ink)]" : "text-[var(--muted)]"}`}>{s.label}</p>
            </div>
          )
        })}
      </div>
      <div className="w-full max-w-lg">
        <div className="flex justify-between text-xs text-[var(--muted)] mb-1.5">
          <span>Procesando…</span>
          <span>{Math.round((step / GENERIC_STEPS.length) * 100)}%</span>
        </div>
        <div className="h-2 bg-[var(--hairline)] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700 bg-[var(--brass)]"
            style={{ width: `${(step / GENERIC_STEPS.length) * 100}%` }} />
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
            <span className="px-2 py-0.5 rounded-[2px] bg-[var(--brass)]/10 border border-[var(--brass)]/30 text-[var(--brass)] text-xs font-semibold">{meta.proceso}</span>
            <span className="text-[var(--muted)] text-xs">{meta.tipo} · {meta.entidad}</span>
          </div>
          <h1 className="text-2xl font-semibold text-[var(--ink)]">{meta.nombre}</h1>
          <p className="text-[var(--muted)] text-sm mt-0.5">{meta.objeto}</p>
        </div>
        <button onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-[2px] border border-[var(--hairline)] text-[var(--ink)] hover:border-[var(--brass)] text-sm font-medium transition-colors flex items-center gap-2">
          <Upload className="w-4 h-4" /> Nueva licitación
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Valor Referencial",  value: fmt(meta.valorReferencial), icon: DollarSign },
          { label: "Plazo de ejecución", value: `${meta.plazoEjecucion} meses`,  icon: Clock },
          { label: "Páginas analizadas", value: `${meta.totalPaginas}`,           icon: FileText },
          { label: "Sector",             value: meta.sector,                       icon: Building2 },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="editorial-card relative p-4">
            <Crosshair className="pointer-events-none absolute right-2 top-2 h-3 w-3 text-[var(--hairline)]" />
            <div className="w-9 h-9 rounded-[2px] flex items-center justify-center mb-3 bg-[var(--brass)]/10">
              <Icon className="w-5 h-5 text-[var(--brass)]" />
            </div>
            <MonoLabel>{label}</MonoLabel>
            <p className="text-lg font-semibold text-[var(--ink)] font-mono mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Compatibility + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <EditorialCard title="Compatibilidad Global" className="space-y-4">
          <div className="text-center py-2">
            <div className="relative w-28 h-28 mx-auto">
              <svg viewBox="0 0 100 100" className="w-28 h-28 -rotate-90">
                <circle cx="50" cy="50" r="38" fill="none" stroke="var(--hairline)" strokeWidth="10" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="var(--brass)" strokeWidth="10"
                  strokeDasharray={`${(compatibilidad.global / 100) * 238.76} 238.76`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-[var(--ink)] font-mono">{compatibilidad.global}%</span>
              </div>
            </div>
            <p className="text-[var(--muted)] text-sm mt-1">Compatibilidad estimada</p>
          </div>
          <div className="space-y-2.5">
            {[
              { label: "Técnico",        pct: compatibilidad.tecnico },
              { label: "Económico",      pct: compatibilidad.economico },
              { label: "Experiencia",    pct: compatibilidad.experiencia },
              { label: "Administrativo", pct: compatibilidad.administrativo },
              { label: "Ambiental",      pct: compatibilidad.ambiental },
            ].map(({ label, pct }) => (
              <div key={label}>
                <div className="flex justify-between text-xs text-[var(--muted)] mb-1">
                  <span>{label}</span><span className="font-medium text-[var(--ink)] font-mono">{pct}%</span>
                </div>
                <CompatMeter pct={pct} />
              </div>
            ))}
          </div>
        </EditorialCard>

        <div className="lg:col-span-2 editorial-card relative p-5">
          <Crosshair className="pointer-events-none absolute right-2 top-2 h-3 w-3 text-[var(--hairline)]" />
          <h3 className="text-sm font-semibold text-[var(--ink)] mb-1">Radar de Compatibilidad</h3>
          <p className="text-xs text-[var(--muted)] mb-4">Tu empresa vs. requisitos de la licitación</p>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData} margin={{ top: 5, right: 30, bottom: 5, left: 30 }}>
              <PolarGrid stroke="var(--hairline)" />
              <PolarAngleAxis dataKey="dimension" tick={{ fill: "#8A857C", fontSize: 12 }} />
              <Radar name="Requerido" dataKey="requerido" stroke="#E5E0D6" fill="#E5E0D6" fillOpacity={0.4} />
              <Radar name="Empresa" dataKey="empresa" stroke="#A8895B" fill="#A8895B" fillOpacity={0.25} dot={{ fill: "#A8895B", r: 4 }} />
              <Tooltip contentStyle={{ background: "#FBFAF7", border: "1px solid #E5E0D6", borderRadius: 2 }} labelStyle={{ color: "#8A857C" }} itemStyle={{ color: "#1B1A17" }} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-4 gap-3 mt-3">
            {[
              { label: "Cumple",    count: stats.cumple,    color: "var(--ok)" },
              { label: "Verificar", count: stats.verificar, color: "var(--warn)" },
              { label: "Incumple",  count: stats.incumple,  color: "var(--warn)" },
              { label: "N/A",       count: stats.na,        color: "var(--muted)" },
            ].map(({ label, count, color }) => (
              <div key={label} className="bg-[var(--paper)] border border-[var(--hairline)] rounded-[2px] p-3 text-center">
                <p className="text-2xl font-bold font-mono" style={{ color }}>{count}</p>
                <p className="text-xs text-[var(--muted)]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Criterios */}
      <div className="editorial-card relative p-5">
        <Crosshair className="pointer-events-none absolute right-2 top-2 h-3 w-3 text-[var(--hairline)]" />
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-4 h-4 text-[var(--brass)]" />
          <h3 className="text-sm font-semibold text-[var(--ink)]">Criterios de Evaluación</h3>
          <span className="text-xs text-[var(--muted)] ml-auto">Factores de calificación — total 100 puntos</span>
        </div>
        <div className="flex gap-4 flex-wrap">
          {criteriosEvaluacion.map((c) => (
            <div key={c.factor} className="flex-1 min-w-40">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--ink)]/70">{c.factor}</span>
                <span className="font-bold text-[var(--ink)] font-mono">{c.puntaje} pts</span>
              </div>
              <div className="h-2 bg-[var(--hairline)] rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-[var(--brass)]" style={{ width: `${c.puntaje}%`, opacity: c.tipo === "económico" ? 1 : 0.6 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="editorial-card overflow-hidden">
        <div className="flex border-b border-[var(--hairline)] overflow-x-auto">
          {tabs.map(({ key, label, count, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2
                ${tab === key ? "border-[var(--brass)] text-[var(--brass)] bg-[var(--brass)]/5" : "border-transparent text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--paper)]"}`}>
              <Icon className="w-4 h-4" />
              {label}
              {count && <span className={`text-xs px-1.5 py-0.5 rounded-[2px] font-mono ${tab === key ? "bg-[var(--brass)]/20 text-[var(--brass)]" : "bg-[var(--hairline)] text-[var(--muted)]"}`}>{count}</span>}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* REQUISITOS */}
          {tab === "requisitos" && (
            <div className="space-y-3">
              {requisitos.map((group) => (
                <div key={group.id} className="border border-[var(--hairline)] rounded-[2px] overflow-hidden">
                  <button onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-[var(--paper)] transition-colors">
                    <div className="flex items-center gap-3">
                      {expandedGroup === group.id ? <ChevronDown className="w-4 h-4 text-[var(--muted)]" /> : <ChevronRight className="w-4 h-4 text-[var(--muted)]" />}
                      <span className="font-semibold text-[var(--ink)]">{group.title}</span>
                      <span className="text-xs text-[var(--muted)]">{group.items.length} criterios</span>
                    </div>
                    <div className="flex gap-1.5">
                      {(["cumple", "verificar", "incumple"] as ComplianceStatus[]).map((s) => {
                        const c = group.items.filter((i) => i.status === s).length
                        if (!c) return null
                        const colors: Record<ComplianceStatus, string> = { cumple: "var(--ok)", verificar: "var(--warn)", incumple: "var(--warn)", na: "var(--muted)" }
                        return (
                          <span key={s} className="text-xs px-2 py-0.5 rounded-[2px] font-semibold font-mono" style={{ color: colors[s], background: `color-mix(in srgb, ${colors[s]} 12%, transparent)` }}>
                            {c}
                          </span>
                        )
                      })}
                    </div>
                  </button>
                  {expandedGroup === group.id && (
                    <div className="border-t border-[var(--hairline)] divide-y divide-[var(--hairline)]">
                      {group.items.map((item) => (
                        <div key={item.id} className="p-4 flex gap-4 hover:bg-[var(--paper)] transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <p className="font-medium text-[var(--ink)] text-sm">{item.description}</p>
                              {item.critical && <span className="text-xs px-1.5 py-0.5 rounded-[2px] border border-[var(--warn)]/30" style={{ color: "var(--warn)" }}>Crítico</span>}
                              {item.clausula && <span className="text-xs text-[var(--muted)]">{item.clausula}</span>}
                            </div>
                            <p className="text-xs text-[var(--muted)]">{item.detail}</p>
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
                  { label: "Riesgo Alto",  count: stats.riesgosHigh,   color: "var(--warn)" },
                  { label: "Riesgo Medio", count: stats.riesgosMedium, color: "var(--warn)" },
                  { label: "Riesgo Bajo",  count: stats.riesgosLow,    color: "var(--ok)" },
                ].map(({ label, count, color }) => (
                  <div key={label} className="border border-[var(--hairline)] rounded-[2px] p-3 text-center">
                    <p className="text-2xl font-bold font-mono" style={{ color }}>{count}</p>
                    <p className="text-xs text-[var(--muted)]">{label}</p>
                  </div>
                ))}
              </div>
              {riesgos.map((risk) => (
                <div key={risk.id} className="border border-[var(--hairline)] rounded-[2px] overflow-hidden">
                  <button onClick={() => setExpandedRisk(expandedRisk === risk.id ? null : risk.id)}
                    className="w-full flex items-start gap-3 p-4 hover:bg-[var(--paper)] transition-colors text-left">
                    <div className="mt-0.5">{expandedRisk === risk.id ? <ChevronDown className="w-4 h-4 text-[var(--muted)]" /> : <ChevronRight className="w-4 h-4 text-[var(--muted)]" />}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <RiskBadge level={risk.level} />
                        <span className="text-xs text-[var(--muted)] capitalize">{risk.tipo}</span>
                        {risk.clausula && <span className="text-xs text-[var(--muted)]">{risk.clausula}</span>}
                      </div>
                      <p className="font-semibold text-[var(--ink)]">{risk.titulo}</p>
                    </div>
                    {risk.importeRiesgo && <span className="text-xs text-[var(--muted)] font-mono flex-shrink-0">{risk.importeRiesgo}</span>}
                  </button>
                  {expandedRisk === risk.id && (
                    <div className="border-t border-[var(--hairline)] p-4 space-y-3">
                      <p className="text-sm text-[var(--ink)]/80">{risk.descripcion}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-[var(--paper)] border border-[var(--hairline)] rounded-[2px] p-3">
                          <MonoLabel>Probabilidad / Impacto</MonoLabel>
                          <p className="text-xs text-[var(--ink)]/80 mt-1">{risk.probability}</p>
                          <p className="text-xs mt-1" style={{ color: "var(--warn)" }}>{risk.impacto}</p>
                        </div>
                        <div className="bg-[var(--ok)]/5 border border-[var(--ok)]/20 rounded-[2px] p-3">
                          <MonoLabel className="!text-[var(--ok)]">Mitigación recomendada</MonoLabel>
                          <p className="text-xs text-[var(--ink)]/80 mt-1">{risk.mitigacion}</p>
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
              <div className="bg-[var(--paper)] border border-[var(--hairline)] rounded-[2px] p-4 flex justify-between items-center">
                <div>
                  <MonoLabel>Monto total de garantías estimadas</MonoLabel>
                  <p className="text-xl font-bold text-[var(--ink)] font-mono mt-1">{fmt(stats.garantiasTotal)}</p>
                </div>
                <Shield className="w-8 h-8 text-[var(--brass)]" />
              </div>
              <div className="space-y-3">
                {garantias.map((g) => (
                  <div key={g.id} className="border border-[var(--hairline)] rounded-[2px] p-5 space-y-3">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <p className="font-bold text-[var(--ink)]">{g.tipo}</p>
                        <p className="text-xs text-[var(--muted)] mt-0.5">{g.descripcion}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-[var(--brass)] font-mono">{fmt(g.monto)}</p>
                        <p className="text-xs text-[var(--muted)]">{g.montoPct}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="bg-[var(--paper)] rounded-[2px] p-2.5">
                        <p className="text-[var(--muted)] mb-0.5">Plazo</p>
                        <p className="text-[var(--ink)]/80">{g.plazo}</p>
                      </div>
                      <div className="bg-[var(--paper)] rounded-[2px] p-2.5">
                        <p className="text-[var(--muted)] mb-0.5">Tipo de documento</p>
                        <p className="text-[var(--ink)]/80">{g.tipoDocumento}</p>
                      </div>
                      <div className="bg-[var(--paper)] rounded-[2px] p-2.5">
                        <p className="text-[var(--muted)] mb-0.5">Momento</p>
                        <p className="text-[var(--ink)]/80">{g.momento}</p>
                      </div>
                    </div>
                    {g.nota && (
                      <div className="flex gap-2 bg-[var(--warn)]/5 border border-[var(--warn)]/20 rounded-[2px] p-3">
                        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--warn)" }} />
                        <p className="text-xs" style={{ color: "var(--warn)" }}>{g.nota}</p>
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
                    cumple:    { color: "var(--ok)",   label: "Cumple" },
                    verificar: { color: "var(--warn)", label: "Verificar" },
                    incumple:  { color: "var(--warn)", label: "Incumple" },
                    na:        { color: "var(--muted)", label: "N/A" },
                  }[s]
                  return (
                    <div key={s} className="border border-[var(--hairline)] rounded-[2px] p-3 text-center">
                      <p className="text-2xl font-bold font-mono" style={{ color: cfg.color }}>{count}</p>
                      <p className="text-xs text-[var(--muted)]">{cfg.label}</p>
                    </div>
                  )
                })}
              </div>
              {experienciaRequerida.map((exp) => (
                <div key={exp.id} className={`border rounded-[2px] p-5 space-y-3
                  ${exp.match === "incumple" ? "border-[var(--warn)]/30 bg-[var(--warn)]/5" :
                    exp.match === "verificar" ? "border-[var(--warn)]/25 bg-[var(--warn)]/5" : "border-[var(--hairline)]"}`}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <StatusBadge status={exp.match} />
                        {exp.critical && <span className="text-xs px-1.5 py-0.5 rounded-[2px] border border-[var(--warn)]/30" style={{ color: "var(--warn)" }}>Crítico</span>}
                        {exp.clausula && <span className="text-xs text-[var(--muted)]">{exp.clausula}</span>}
                      </div>
                      <p className="font-bold text-[var(--ink)]">{exp.titulo}</p>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--muted)]">{exp.requisito}</p>
                  <div className={`flex gap-2 rounded-[2px] p-3 border
                    ${exp.match === "incumple" ? "bg-[var(--warn)]/10 border-[var(--warn)]/20" :
                      exp.match === "verificar" ? "bg-[var(--warn)]/10 border-[var(--warn)]/20" :
                      "bg-[var(--ok)]/5 border-[var(--ok)]/20"}`}>
                    {exp.match === "cumple" ? <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--ok)" }} /> :
                     exp.match === "verificar" ? <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--warn)" }} /> :
                     <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--warn)" }} />}
                    <p className="text-xs" style={{ color: exp.match === "cumple" ? "var(--ok)" : "var(--warn)" }}>
                      {exp.empresaEstado}
                    </p>
                  </div>
                  {exp.detalle && <p className="text-xs text-[var(--muted)] italic">{exp.detalle}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI summary */}
      <div className="rounded-[2px] p-5 border border-[var(--brass)]/30 bg-[var(--brass)]/5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-[2px] flex items-center justify-center bg-[var(--brass)]">
            <Zap className="w-4 h-4 text-[var(--paper)]" />
          </div>
          <span className="font-semibold text-[var(--brass)]">Recomendación IA</span>
        </div>
        <p className="text-[var(--ink)]/80 text-sm leading-relaxed mb-4">{insights.conclusion}</p>
        <div className="space-y-2">
          <div className="flex gap-2 bg-[var(--warn)]/10 border border-[var(--warn)]/20 rounded-[2px] p-3">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--warn)" }} />
            <p className="text-xs" style={{ color: "var(--warn)" }}>{insights.riesgoPrincipal}</p>
          </div>
          <div className="flex gap-2 bg-[var(--ok)]/10 border border-[var(--ok)]/20 rounded-[2px] p-3">
            <TrendingUp className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--ok)" }} />
            <p className="text-xs" style={{ color: "var(--ok)" }}>{insights.recomendacion}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { icon: Users,      label: "Revisar capacidad del consorcio" },
            { icon: Briefcase,  label: "Verificar requisitos críticos" },
            { icon: TrendingUp, label: "Preparar oferta técnica sólida" },
          ].map(({ icon: Icon, label }) => (
            <span key={label} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-[2px] border border-[var(--brass)]/20 text-[var(--brass)]">
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
    <div className="min-h-screen bg-[var(--paper)] p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        {!isSupabaseConfigured && <DemoNotice className="mb-4" />}
        {error && (
          <div className="mb-4 p-4 rounded-[2px] bg-[var(--warn)]/10 border border-[var(--warn)]/30 text-sm flex items-center gap-2" style={{ color: "var(--warn)" }}>
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
