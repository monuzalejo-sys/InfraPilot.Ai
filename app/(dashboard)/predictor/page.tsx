"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  TrendingUp, TrendingDown, Building2, MapPin,
  Calendar, Info, Sparkles, AlertTriangle,
  ChevronRight, DollarSign, Percent, Clock,
  Target, Shield, Zap, ChevronDown,
} from "lucide-react"
import {
  ResponsiveContainer,
  ComposedChart, Line, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine,
  BarChart, Bar, Legend,
} from "recharts"
import { formatCurrency } from "@/lib/utils"
import { SCENARIO_META, ESCENARIOS, type EscenarioKey } from "@/lib/financial-model"
import { isSupabaseConfigured } from "@/lib/supabase/client"
import { DemoNotice } from "@/components/demo-notice"
import { EditorialCard, MonoLabel } from "@/components/editorial"

// ── Base investment (used to scale scenarios proportionally) ──────
const BASE_INV = 15_932_621

// ── Scenario style map (local — lib/financial-model.ts SCENARIO_META
// carries its own baked-in Tailwind color classes out of this page's
// ownership scope; we key off `activeEsc`/scenario key only and map
// to editorial tokens here). `color` (raw hex) is still read from
// SCENARIO_META for chart strokes/dots, which is presentation-neutral. ──
const SCENARIO_STYLE: Record<EscenarioKey, { text: string; border: string; badge: string; dot: string }> = {
  probable:    { text: "text-[var(--ink)]",  border: "border-[var(--brass)]",  badge: "bg-[var(--brass)] text-[var(--paper)]",  dot: "bg-[var(--brass)]" },
  conservador: { text: "text-[var(--ok)]",   border: "border-[var(--ok)]",     badge: "bg-[var(--ok)] text-[var(--paper)]",     dot: "bg-[var(--ok)]" },
  critico:     { text: "text-[var(--warn)]", border: "border-[var(--warn)]",   badge: "bg-[var(--warn)] text-[var(--paper)]",   dot: "bg-[var(--warn)]" },
}

// ── Budget selector ────────────────────────────────────────────────
interface BudgetOption {
  id: string
  project_name: string
  location?: string
  total_amount?: number
  created_at: string
}

// ── Tooltip helper ─────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTip(props: any & { prefix?: string; suffix?: string }) {
  const { active, payload, label, prefix = "S/", suffix = "M" } = props
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[var(--card)]/95 backdrop-blur border border-[var(--hairline)] rounded-[2px] shadow-xl px-4 py-3 text-xs min-w-[160px]">
      <p className="font-semibold text-[var(--ink)] mb-2">{String(label ?? "")}</p>
      {(payload as { name?: unknown; value?: unknown; color?: unknown }[]).map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4 mb-1">
          <span className="flex items-center gap-1.5 text-[var(--muted)]">
            <div className="w-2 h-2 rounded-full" style={{ background: String(p.color ?? "") }} />
            {String(p.name ?? "")}
          </span>
          <span className="font-semibold text-[var(--ink)] font-mono">
            {prefix}{Number(p.value).toLocaleString("es-PE", { maximumFractionDigits: 2 })}{suffix}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Gauge ──────────────────────────────────────────────────────────
function TirGauge({ value, color }: { value: number | null; color: string }) {
  if (value === null) return (
    <div className="flex items-center justify-center h-16">
      <span className="text-sm text-[var(--muted)]">No aplica</span>
    </div>
  )
  const pct = Math.min((value / 35) * 100, 100)
  const R = 36, C = 2 * Math.PI * R
  const dash = (pct / 100) * C * 0.75
  return (
    <div className="flex flex-col items-center">
      <svg width="90" height="60" viewBox="0 0 90 60">
        <path d={`M 9 54 A ${R} ${R} 0 0 1 81 54`} fill="none" stroke="var(--hairline)" strokeWidth="8" strokeLinecap="round" />
        <path d={`M 9 54 A ${R} ${R} 0 0 1 81 54`} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${dash} ${C}`} style={{ transition: "stroke-dasharray 0.8s ease" }} />
        <text x="45" y="48" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--ink)">
          {value.toFixed(1)}%
        </text>
      </svg>
      <span className="text-[10px] text-[var(--muted)] -mt-1">TIR</span>
    </div>
  )
}

// ── Scale scenarios proportionally to real investment ──────────────
function scaleEscenario(esc: typeof ESCENARIOS[EscenarioKey], factor: number) {
  return {
    ...esc,
    valorCompletado: Math.round(esc.valorCompletado * factor),
    valores:   esc.valores.map((v) => Math.round(v * factor)),
    noi:       esc.noi.map((v) => Math.round(v * factor)),
    noiAcum:   esc.noiAcum.map((v) => Math.round(v * factor)),
    metricas: {
      ...esc.metricas,
      van: Math.round(esc.metricas.van * factor),
    },
  }
}

// ── Page ──────────────────────────────────────────────────────────
export default function PredictorPage() {
  const [activeEsc, setActiveEsc] = useState<EscenarioKey>("probable")
  const [budgets, setBudgets]     = useState<BudgetOption[]>([])
  const [selected, setSelected]   = useState<BudgetOption | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [loadingBudgets, setLoadingBudgets] = useState(true)
  const [fetchError, setFetchError] = useState(false)

  const loadBudgets = useCallback(async () => {
    const res = await fetch("/api/budgets")
    if (res.ok) {
      const { budgets } = await res.json()
      setBudgets(budgets ?? [])
      if (budgets?.length > 0) setSelected(budgets[0])
    } else {
      setFetchError(true)
    }
    setLoadingBudgets(false)
  }, [])

  // Fetches on mount. `loadBudgets` sets state (setBudgets/setSelected/
  // setFetchError/setLoadingBudgets) reachable synchronously from this
  // effect body, which react-hooks/set-state-in-effect flags — there's no
  // external subscription to move this into, it's a plain fetch-on-mount.
  // Suppressed narrowly with rationale.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadBudgets() }, [loadBudgets])

  // Scale factor relative to mock base investment
  const inv        = selected?.total_amount ?? BASE_INV
  const factor     = inv / BASE_INV
  const invCritico = (selected?.total_amount ?? BASE_INV) * 1.15

  // Scaled scenarios
  const ESC = {
    probable:    scaleEscenario(ESCENARIOS.probable,    factor),
    conservador: scaleEscenario(ESCENARIOS.conservador, factor),
    critico:     scaleEscenario(ESCENARIOS.critico,     factor),
  }

  const meta = SCENARIO_META[activeEsc]
  const esc  = ESC[activeEsc]

  const inversionReal  = activeEsc === "critico" ? invCritico : inv
  const plusvaliaActual = esc.valorCompletado - inv
  const retorno5anios   = esc.valores[5] - inv + esc.noiAcum[5]

  // Chart data scaled
  const valueChartData = [0, 1, 2, 3, 4, 5].map((year) => ({
    label:       year === 0 ? "Inicial" : `Año ${year}`,
    probable:    +(ESC.probable.valores[year]    / 1_000_000).toFixed(2),
    conservador: +(ESC.conservador.valores[year] / 1_000_000).toFixed(2),
    critico:     +(ESC.critico.valores[year]     / 1_000_000).toFixed(2),
  }))

  const noiChartData = [1, 2, 3, 4, 5].map((year) => ({
    label:       `Año ${year}`,
    probable:    +(ESC.probable.noi[year]    / 1_000_000).toFixed(2),
    conservador: +(ESC.conservador.noi[year] / 1_000_000).toFixed(2),
    critico:     +(ESC.critico.noi[year]     / 1_000_000).toFixed(2),
  }))

  const acumReturnData = [1, 3, 5].map((year) => ({
    label:          `Año ${year}`,
    probablePlusval: +((ESC.probable.valores[year] - inv)     / 1_000_000).toFixed(2),
    probableNoi:     +(ESC.probable.noiAcum[year]             / 1_000_000).toFixed(2),
  }))

  const MILESTONES = [1, 3, 5].map((year) => ({
    year,
    label: `Año ${year}`,
    probable:    { valor: ESC.probable.valores[year],    noiAcum: ESC.probable.noiAcum[year],    retornoPct: +((( ESC.probable.valores[year]    + ESC.probable.noiAcum[year]    - inv) / inv * 100).toFixed(1)) },
    conservador: { valor: ESC.conservador.valores[year], noiAcum: ESC.conservador.noiAcum[year], retornoPct: +((( ESC.conservador.valores[year] + ESC.conservador.noiAcum[year] - inv) / inv * 100).toFixed(1)) },
    critico:     { valor: ESC.critico.valores[year],     noiAcum: ESC.critico.noiAcum[year],     retornoPct: +((( ESC.critico.valores[year]     + ESC.critico.noiAcum[year]     - inv) / inv * 100).toFixed(1)) },
  }))

  // Date label
  const fechaLabel = new Date().toLocaleDateString("es-PE", { month: "long", year: "numeric" })

  // ── Budget picker dropdown ─────────────────────────────────────
  if (!loadingBudgets && budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-8">
        {(!isSupabaseConfigured || fetchError) && <DemoNotice className="max-w-md" />}
        <div className="w-14 h-14 rounded-[2px] border border-[var(--hairline)] bg-[var(--card)] flex items-center justify-center">
          <TrendingUp className="w-7 h-7 text-[var(--brass)]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[var(--ink)]">Predictor Financiero</h2>
          <p className="text-[var(--muted)] text-sm mt-1 max-w-xs">
            Genera un presupuesto en el Cotizador primero. El predictor usará esos datos como inversión base.
          </p>
        </div>
        <a href="/cotizador">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[2px] bg-[var(--brass)] text-[var(--paper)] text-sm font-semibold hover:opacity-90 transition-opacity">
            <Sparkles className="w-4 h-4" />
            Ir al Cotizador
          </button>
        </a>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-[var(--paper)]">

      {(!isSupabaseConfigured || fetchError) && (
        <div className="px-8 pt-4">
          <DemoNotice />
        </div>
      )}

      {/* ── Header ── */}
      <div className="bg-[var(--card)] border-b border-[var(--hairline)] px-8 py-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[2px] border border-[var(--hairline)] bg-[var(--paper)] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[var(--brass)]" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[var(--ink)]">Predictor Financiero</h1>
              <div className="flex items-center gap-3 text-xs text-[var(--muted)] mt-0.5">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {selected?.project_name ?? "—"}
                </span>
                {selected?.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {selected.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Análisis {fechaLabel}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Budget picker */}
            {budgets.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => setShowPicker(!showPicker)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] border border-[var(--hairline)] text-xs text-[var(--ink)] hover:border-[var(--brass)] transition-colors font-medium"
                >
                  Cambiar proyecto
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {showPicker && (
                  <div className="absolute right-0 top-full mt-1 z-50 w-72 bg-[var(--card)] border border-[var(--hairline)] rounded-[2px] shadow-xl overflow-hidden">
                    {budgets.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => { setSelected(b); setShowPicker(false) }}
                        className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-[var(--paper)] transition-colors border-b border-[var(--hairline)] last:border-0 ${selected?.id === b.id ? "bg-[var(--paper)]" : ""}`}
                      >
                        <Sparkles className="w-4 h-4 text-[var(--brass)] mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-[var(--ink)]">{b.project_name}</p>
                          {b.location && <p className="text-[10px] text-[var(--muted)]">{b.location}</p>}
                          {b.total_amount && (
                            <p className="text-[10px] font-mono text-[var(--brass)] mt-0.5">{formatCurrency(b.total_amount)}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-[var(--brass)]/30 text-[var(--brass)]">
              ✦ IA Análisis
            </span>
          </div>
        </div>

        {/* Scenario selector */}
        <div className="flex items-center gap-2 mt-5">
          {(["probable", "conservador", "critico"] as EscenarioKey[]).map((key) => {
            const m = SCENARIO_META[key]
            const s = SCENARIO_STYLE[key]
            const isActive = activeEsc === key
            return (
              <button
                key={key}
                onClick={() => setActiveEsc(key)}
                className={[
                  "flex items-center gap-2.5 px-5 py-2.5 rounded-[2px] border-2 font-semibold text-sm transition-all duration-200",
                  isActive
                    ? `${s.badge} ${s.border} shadow-md`
                    : `bg-[var(--card)] border-[var(--hairline)] ${s.text} hover:opacity-80`,
                ].join(" ")}
              >
                <div className={["w-2 h-2 rounded-full", isActive ? "bg-[var(--paper)]/80" : s.dot].join(" ")} />
                {m.label}
                {isActive && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            )
          })}
          <span className="ml-2 text-xs text-[var(--muted)] flex items-center gap-1">
            <Info className="w-3 h-3" />
            {meta.description}
          </span>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6 max-w-screen-xl mx-auto">

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
          {/* Inversión */}
          <EditorialCard className="col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-[var(--muted)]" />
              <span className="text-xs text-[var(--muted)]">Inversión total</span>
            </div>
            <div className="text-xl font-semibold text-[var(--ink)] font-mono">
              {formatCurrency(inversionReal)}
            </div>
            {activeEsc === "critico" && (
              <div className="text-[10px] text-[var(--warn)] mt-1">+15% sobrecosto incluido</div>
            )}
          </EditorialCard>

          {/* Valor al completar */}
          <EditorialCard className={`col-span-1 border-2 !${SCENARIO_STYLE[activeEsc].border}`}>
            <div className="flex items-center gap-2 mb-2">
              <Building2 className={`w-4 h-4 ${SCENARIO_STYLE[activeEsc].text}`} />
              <span className="text-xs text-[var(--muted)]">Valor al completar</span>
            </div>
            <div className={`text-xl font-semibold font-mono ${SCENARIO_STYLE[activeEsc].text}`}>
              {formatCurrency(esc.valorCompletado)}
            </div>
            <div className={`text-xs mt-1 font-medium flex items-center gap-1 ${plusvaliaActual >= 0 ? "text-[var(--ok)]" : "text-[var(--warn)]"}`}>
              {plusvaliaActual >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {plusvaliaActual >= 0 ? "+" : ""}{formatCurrency(plusvaliaActual)} plusvalía
            </div>
          </EditorialCard>

          {/* VAN */}
          <EditorialCard className="col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-[var(--muted)]" />
              <span className="text-xs text-[var(--muted)]">VAN ({esc.supuestos.wacc}% WACC)</span>
            </div>
            <div className={`text-xl font-semibold font-mono ${esc.metricas.van >= 0 ? "text-[var(--ink)]" : "text-[var(--warn)]"}`}>
              {esc.metricas.van >= 0 ? "+" : ""}{formatCurrency(esc.metricas.van)}
            </div>
            <div className="text-xs text-[var(--muted)] mt-1">
              {esc.metricas.van >= 0 ? "Proyecto viable" : "Por debajo del umbral"}
            </div>
          </EditorialCard>

          {/* TIR */}
          <EditorialCard className="col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="w-4 h-4 text-[var(--muted)]" />
              <span className="text-xs text-[var(--muted)]">TIR proyectado</span>
            </div>
            <div className={`text-xl font-semibold font-mono ${esc.metricas.tir >= 15 ? "text-[var(--ok)]" : esc.metricas.tir >= 8 ? "text-[var(--brass)]" : "text-[var(--warn)]"}`}>
              {esc.metricas.tir.toFixed(1)}%
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--hairline)]">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${esc.metricas.tir >= 15 ? "bg-[var(--ok)]" : esc.metricas.tir >= 8 ? "bg-[var(--brass)]" : "bg-[var(--warn)]"}`}
                style={{ width: `${Math.min((esc.metricas.tir / 35) * 100, 100)}%` }}
              />
            </div>
            <div className="text-[10px] text-[var(--muted)] mt-1">WACC umbral: {esc.supuestos.wacc}%</div>
          </EditorialCard>

          {/* Payback */}
          <EditorialCard className="col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-[var(--muted)]" />
              <span className="text-xs text-[var(--muted)]">Payback</span>
            </div>
            {esc.metricas.paybackAnos !== null ? (
              <>
                <div className="text-xl font-semibold text-[var(--ink)] font-mono">
                  {esc.metricas.paybackAnos} años
                </div>
                <div className="text-xs text-[var(--muted)] mt-1">Retorno de inversión</div>
              </>
            ) : (
              <>
                <div className="text-lg font-semibold text-[var(--warn)]">N/A</div>
                <div className="text-xs text-[var(--warn)] mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> No recupera en 5 años
                </div>
              </>
            )}
          </EditorialCard>
        </div>

        {/* ── Main value projection chart ── */}
        <EditorialCard>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-[var(--ink)]">Proyección del valor de mercado — 5 años</h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">Los tres escenarios vs. inversión inicial · en millones PEN</p>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-[var(--muted)]">
              {(["probable", "conservador", "critico"] as EscenarioKey[]).map((k) => (
                <span key={k} className="flex items-center gap-1.5">
                  <div className="w-3" style={{ background: SCENARIO_META[k].color, height: k === "probable" ? 3 : 2 }} />
                  {SCENARIO_META[k].label}
                </span>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={valueChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="probGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#a8895b" stopOpacity={0.16} />
                  <stop offset="95%" stopColor="#a8895b" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e0d6" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#8a857c" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#8a857c" }} axisLine={false} tickLine={false} tickFormatter={(v) => `S/${v}M`} />
              <Tooltip content={(props) => <ChartTip {...props} prefix="S/ " suffix="M" />} />
              <Area type="monotone" dataKey="probable" name="Probable"
                stroke="#a8895b" strokeWidth={2.5} fill="url(#probGrad)"
                dot={{ r: 4, fill: "#a8895b", strokeWidth: 0 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="conservador" name="Conservador"
                stroke="#5b7a5e" strokeWidth={2}
                dot={{ r: 3, fill: "#5b7a5e", strokeWidth: 0 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="critico" name="Crítico"
                stroke="#a8623b" strokeWidth={2} strokeDasharray="6 3"
                dot={{ r: 3, fill: "#a8623b", strokeWidth: 0 }} activeDot={{ r: 5 }} />
              <ReferenceLine
                y={+(inv / 1_000_000).toFixed(2)}
                stroke="#8a857c" strokeDasharray="4 4" strokeWidth={1.5}
                label={{ value: `Inversión ${formatCurrency(inv)}`, position: "insideTopRight", fontSize: 10, fill: "#8a857c" }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </EditorialCard>

        {/* ── Milestone comparison + NOI ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <EditorialCard className="xl:col-span-2">
            <h2 className="text-base font-semibold text-[var(--ink)] mb-3">Proyección a 1, 3 y 5 años — todos los escenarios</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--hairline)]">
                    <th className="text-left px-0 py-2 pr-4 w-28"><MonoLabel>Horizonte</MonoLabel></th>
                    {(["probable", "conservador", "critico"] as EscenarioKey[]).map((k) => (
                      <th key={k} className={["text-center text-[10px] font-semibold uppercase tracking-wider py-2 px-3", activeEsc === k ? SCENARIO_STYLE[k].text : "text-[var(--muted)]"].join(" ")}>
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="w-2 h-2 rounded-full mx-auto" style={{ background: SCENARIO_META[k].color }} />
                          {SCENARIO_META[k].label}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MILESTONES.map((ms) => (
                    <React.Fragment key={ms.year}>
                      <tr className="border-b border-[var(--hairline)] hover:bg-[var(--paper)] transition-colors">
                        <td className="py-3 pr-4">
                          <span className="text-sm font-semibold text-[var(--ink)]">{ms.label}</span>
                          <div className="text-[10px] text-[var(--muted)]">Valor mercado</div>
                        </td>
                        {(["probable", "conservador", "critico"] as EscenarioKey[]).map((k) => {
                          const val  = ms[k].valor
                          const isPos = val > inv
                          const pct  = ((val - inv) / inv * 100).toFixed(1)
                          return (
                            <td key={k} className="py-3 px-3 text-center">
                              <div className={`text-sm font-semibold font-mono ${activeEsc === k ? SCENARIO_STYLE[k].text : "text-[var(--ink)]/80"}`}>
                                {formatCurrency(val)}
                              </div>
                              <div className={`text-[10px] mt-0.5 font-medium ${isPos ? "text-[var(--ok)]" : "text-[var(--warn)]"}`}>
                                {isPos ? "+" : ""}{pct}% vs. inv.
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                      <tr className="border-b border-[var(--hairline)] bg-[var(--paper)]/50">
                        <td className="py-2 pr-4">
                          <div className="text-[10px] text-[var(--muted)] pl-2">NOI acumulado</div>
                        </td>
                        {(["probable", "conservador", "critico"] as EscenarioKey[]).map((k) => (
                          <td key={k} className="py-2 px-3 text-center">
                            <div className="text-xs font-mono text-[var(--ok)] font-medium">
                              +{formatCurrency(ms[k].noiAcum)}
                            </div>
                            <div className="text-[10px] text-[var(--muted)]">
                              Retorno total: <span className="font-semibold text-[var(--ink)]/80">{ms[k].retornoPct}%</span>
                            </div>
                          </td>
                        ))}
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </EditorialCard>

          <EditorialCard className="xl:col-span-1">
            <h2 className="text-sm font-semibold text-[var(--ink)]">NOI anual por escenario</h2>
            <p className="text-[11px] text-[var(--muted)] mb-3">Ingreso operativo neto · millones PEN</p>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={noiChartData} barSize={14} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e0d6" />
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#8a857c" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#8a857c" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}M`} />
                <Tooltip content={(props) => <ChartTip {...props} prefix="" suffix="M" />} />
                <Bar dataKey="probable"    name="Probable"    fill="#a8895b" radius={[3,3,0,0]} />
                <Bar dataKey="conservador" name="Conservador" fill="#5b7a5e" radius={[3,3,0,0]} />
                <Bar dataKey="critico"     name="Crítico"     fill="#a8623b" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </EditorialCard>
        </div>

        {/* ── Accumulated return ── */}
        <EditorialCard>
          <h2 className="text-base font-semibold text-[var(--ink)]">Retorno acumulado — Plusvalía + NOI (escenario probable)</h2>
          <p className="text-xs text-[var(--muted)] mt-0.5 mb-3">Stacked: plusvalía inmobiliaria + ingresos operativos · millones PEN</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={acumReturnData} barSize={40} margin={{ top: 4, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e0d6" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#8a857c" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#8a857c" }} axisLine={false} tickLine={false} tickFormatter={(v) => `S/${v}M`} />
              <Tooltip content={(props) => <ChartTip {...props} prefix="S/" suffix="M" />} />
              <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: "10px", paddingTop: "8px" }} />
              <Bar dataKey="probablePlusval" name="Plusvalía"    stackId="a" fill="#a8895b" radius={[0,0,0,0]} />
              <Bar dataKey="probableNoi"     name="NOI acumulado" stackId="a" fill="#d9c7ac" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </EditorialCard>

        {/* ── Scenario Detail Cards ── */}
        <div>
          <h2 className="mono-label mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4" /> Detalle por escenario
          </h2>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            {(["probable", "conservador", "critico"] as EscenarioKey[]).map((key) => {
              const m   = SCENARIO_META[key]
              const s   = SCENARIO_STYLE[key]
              const e   = ESC[key]
              const isAc = activeEsc === key
              return (
                <button
                  key={key}
                  onClick={() => setActiveEsc(key)}
                  className={["text-left border-2 rounded-[2px] p-5 transition-all duration-200 hover:shadow-lg bg-[var(--card)]",
                    isAc ? `${s.border} shadow-md ring-2 ring-[var(--brass)]/30 ring-offset-2` : "border-[var(--hairline)] hover:border-[var(--muted)]"].join(" ")}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold mb-2 ${s.badge}`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--paper)]" />
                        {m.label}
                      </div>
                      <p className="text-xs text-[var(--muted)]">{m.description}</p>
                    </div>
                    <TirGauge value={e.metricas.tir} color={m.color} />
                  </div>
                  <div className="h-px bg-[var(--hairline)] mb-4" />
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { label: "Valor año 5",  value: formatCurrency(e.valores[5]),                                            color: s.text },
                      { label: "VAN",           value: (e.metricas.van >= 0 ? "+" : "") + formatCurrency(e.metricas.van),      color: e.metricas.van >= 0 ? "text-[var(--ok)]" : "text-[var(--warn)]" },
                      { label: "NOI año 1",     value: formatCurrency(e.noi[1]),                                                color: "text-[var(--ink)]/80" },
                      { label: "Payback",       value: e.metricas.paybackAnos ? `${e.metricas.paybackAnos} años` : "N/A",     color: e.metricas.paybackAnos ? "text-[var(--ink)]/80" : "text-[var(--warn)]" },
                    ].map((row) => (
                      <div key={row.label} className="bg-[var(--paper)] rounded-[2px] p-3">
                        <div className={`text-sm font-semibold font-mono ${row.color}`}>{row.value}</div>
                        <div className="text-[10px] text-[var(--muted)] mt-0.5">{row.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    <MonoLabel className="mb-2">Supuestos</MonoLabel>
                    {[
                      { label: "Apreciación anual", value: `${e.supuestos.apreciacionAnual > 0 ? "+" : ""}${e.supuestos.apreciacionAnual}%`, positive: e.supuestos.apreciacionAnual > 0 },
                      { label: "Vacancia",           value: `${e.supuestos.vacancia}%`,                                                       positive: e.supuestos.vacancia <= 15 },
                      { label: "Crec. arriendo",     value: `+${e.supuestos.crecimientoArriendo}%/año`,                                       positive: e.supuestos.crecimientoArriendo > 0 },
                      { label: "WACC",               value: `${e.supuestos.wacc}%`,                                                           positive: e.supuestos.wacc <= 9 },
                      ...(e.supuestos.sobrecosteObra > 0 ? [{ label: "Sobrecosto obra", value: `+${e.supuestos.sobrecosteObra}%`, positive: false }] : []),
                    ].map((sup) => (
                      <div key={sup.label} className="flex items-center justify-between text-xs">
                        <span className="text-[var(--muted)]">{sup.label}</span>
                        <span className={`font-semibold font-mono ${sup.positive ? "text-[var(--ok)]" : "text-[var(--warn)]"}`}>{sup.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-[var(--hairline)]">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-[var(--muted)]">Retorno bruto 5 años</span>
                      <span className={`font-bold ${s.text}`}>{e.metricas.retornoBruto}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--hairline)]">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ease-out ${s.dot}`}
                        style={{ width: `${Math.min(e.metricas.retornoBruto / 2, 100)}%` }}
                      />
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Sensitivity + AI insight ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pb-6">
          <EditorialCard className="xl:col-span-2">
            <h2 className="text-base font-semibold text-[var(--ink)]">Análisis de sensibilidad — Impacto en VAN</h2>
            <p className="text-xs text-[var(--muted)] mb-3">Variación de ±1pp en cada variable sobre el escenario {meta.label}</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--hairline)]">
                  <th className="text-left py-2 pr-4"><MonoLabel>Variable</MonoLabel></th>
                  <th className="text-center py-2 px-3"><MonoLabel>Valor base</MonoLabel></th>
                  <th className="text-center py-2 px-3"><MonoLabel>−1pp</MonoLabel></th>
                  <th className="text-center py-2 px-3"><MonoLabel>+1pp</MonoLabel></th>
                  <th className="text-center py-2"><MonoLabel>Sensibilidad</MonoLabel></th>
                </tr>
              </thead>
              <tbody>
                {[
                  { variable: "Apreciación de mercado",  base: `${esc.supuestos.apreciacionAnual}%`,     menos: `−${formatCurrency(Math.round(1_840_000 * factor))}`, mas: `+${formatCurrency(Math.round(1_840_000 * factor))}`, nivel: 90, color: "bg-[var(--warn)]" },
                  { variable: "Tasa de vacancia",         base: `${esc.supuestos.vacancia}%`,             menos: `+${formatCurrency(Math.round(960_000 * factor))}`,   mas: `−${formatCurrency(Math.round(960_000 * factor))}`,   nivel: 75, color: "bg-[var(--brass)]" },
                  { variable: "Crecimiento del arriendo", base: `${esc.supuestos.crecimientoArriendo}%`,  menos: `−${formatCurrency(Math.round(720_000 * factor))}`,   mas: `+${formatCurrency(Math.round(720_000 * factor))}`,   nivel: 60, color: "bg-[var(--brass)]" },
                  { variable: "Costos operativos",        base: `${esc.supuestos.costosOperativos}%`,     menos: `+${formatCurrency(Math.round(380_000 * factor))}`,   mas: `−${formatCurrency(Math.round(380_000 * factor))}`,   nivel: 35, color: "bg-[var(--ok)]" },
                  { variable: "WACC (tasa de descuento)", base: `${esc.supuestos.wacc}%`,                 menos: `+${formatCurrency(Math.round(1_120_000 * factor))}`, mas: `−${formatCurrency(Math.round(1_120_000 * factor))}`, nivel: 80, color: "bg-[var(--warn)]" },
                ].map((row) => (
                  <tr key={row.variable} className="border-b border-[var(--hairline)] hover:bg-[var(--paper)] transition-colors">
                    <td className="py-3 pr-4 text-sm font-medium text-[var(--ink)]/80">{row.variable}</td>
                    <td className="py-3 px-3 text-center"><span className="text-xs font-mono text-[var(--ink)]/70">{row.base}</span></td>
                    <td className="py-3 px-3 text-center"><span className="text-xs font-mono text-[var(--warn)]">{row.menos}</span></td>
                    <td className="py-3 px-3 text-center"><span className="text-xs font-mono text-[var(--ok)]">{row.mas}</span></td>
                    <td className="py-3 pl-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-[var(--hairline)] rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${row.color}`} style={{ width: `${row.nivel}%` }} />
                        </div>
                        <span className="text-[10px] text-[var(--muted)] w-8 text-right">{row.nivel}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </EditorialCard>

          <div className="space-y-4">
            <EditorialCard className="border-[var(--brass)]/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-[2px] bg-[var(--brass)] flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--paper)]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--ink)]">Análisis IA</h3>
                  <p className="text-[10px] text-[var(--muted)]">claude-sonnet-4-6</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-[var(--paper)] rounded-[2px] p-3.5 border border-[var(--hairline)]">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Zap className="w-3 h-3 text-[var(--brass)]" />
                    <span className="text-xs font-semibold text-[var(--brass)]">Conclusión principal</span>
                  </div>
                  <p className="text-xs text-[var(--ink)]/80 leading-relaxed">
                    En el escenario probable, el proyecto genera una <strong>TIR de {ESC.probable.metricas.tir.toFixed(1)}%</strong> superando
                    el WACC de {ESC.probable.supuestos.wacc}%. El VAN positivo de{" "}
                    <strong>{formatCurrency(ESC.probable.metricas.van)}</strong> confirma que el proyecto crea valor significativo.
                  </p>
                </div>
                <div className="bg-[var(--paper)] rounded-[2px] p-3.5 border border-[var(--hairline)]">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <AlertTriangle className="w-3 h-3 text-[var(--warn)]" />
                    <span className="text-xs font-semibold text-[var(--warn)]">Riesgo principal</span>
                  </div>
                  <p className="text-xs text-[var(--ink)]/80 leading-relaxed">
                    La <strong>apreciación de mercado</strong> es la variable más sensible (90%). Una desaceleración
                    del mercado inmobiliario podría acercar el proyecto al escenario conservador.
                  </p>
                </div>
                <div className="bg-[var(--paper)] rounded-[2px] p-3.5 border border-[var(--hairline)]">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Target className="w-3 h-3 text-[var(--ok)]" />
                    <span className="text-xs font-semibold text-[var(--ok)]">Recomendación</span>
                  </div>
                  <p className="text-xs text-[var(--ink)]/80 leading-relaxed">
                    Asegurar contratos de arriendo a largo plazo (&gt;3 años) antes de la entrega para reducir
                    la vacancia y consolidar el escenario probable.
                  </p>
                </div>
                <div className="text-[10px] text-[var(--muted)] text-center pt-1">
                  Proyecciones basadas en el presupuesto seleccionado · {fechaLabel}
                </div>
              </div>
            </EditorialCard>

            <EditorialCard>
              <MonoLabel className="mb-3">Resumen financiero — año 5</MonoLabel>
              {[
                { label: "Valor mercado",  value: formatCurrency(esc.valores[5]),  color: SCENARIO_STYLE[activeEsc].text },
                { label: "NOI acumulado",  value: formatCurrency(esc.noiAcum[5]),  color: "text-[var(--ok)]" },
                { label: "Retorno total",  value: formatCurrency(retorno5anios),   color: "text-[var(--ink)]/80" },
                { label: "ROI 5 años",     value: `${((retorno5anios / inv) * 100).toFixed(1)}%`, color: "text-[var(--brass)]" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-2 border-b border-[var(--hairline)] last:border-0">
                  <span className="text-xs text-[var(--muted)]">{row.label}</span>
                  <span className={`text-sm font-bold font-mono ${row.color}`}>{row.value}</span>
                </div>
              ))}
            </EditorialCard>
          </div>
        </div>
      </div>

      {/* Close picker on outside click */}
      {showPicker && (
        <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)} />
      )}
    </div>
  )
}
