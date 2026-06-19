"use client"

import { useState } from "react"
import {
  TrendingUp, TrendingDown, Building2, MapPin,
  Calendar, Info, Sparkles, AlertTriangle,
  ChevronRight, DollarSign, Percent, Clock,
  Target, Shield, Zap,
} from "lucide-react"
import {
  ResponsiveContainer,
  ComposedChart, Line, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, Legend,
  BarChart, Bar,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/utils"
import {
  proyectoInfo, SCENARIO_META, ESCENARIOS,
  valueChartData, noiChartData, acumReturnData, MILESTONES,
  type EscenarioKey,
} from "@/lib/mock-predictor"

// ── Tooltip helper ────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTip(props: any & { prefix?: string; suffix?: string; multiplier?: number }) {
  const { active, payload, label, prefix = "S/", suffix = "M", multiplier = 1 } = props
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-xl shadow-xl px-4 py-3 text-xs min-w-[160px]">
      <p className="font-semibold text-slate-700 mb-2">{String(label ?? "")}</p>
      {(payload as { name?: unknown; value?: unknown; color?: unknown }[]).map((p, i) => {
        const val = Number(p.value) * multiplier
        return (
          <div key={i} className="flex items-center justify-between gap-4 mb-1">
            <span className="flex items-center gap-1.5 text-slate-500">
              <div className="w-2 h-2 rounded-full" style={{ background: String(p.color ?? "") }} />
              {String(p.name ?? "")}
            </span>
            <span className="font-semibold text-slate-800 font-mono">
              {prefix}{val.toLocaleString("es-PE", { maximumFractionDigits: 2 })}{suffix}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ── Gauge component ───────────────────────────────────────────
function TirGauge({ value, max = 35, color }: { value: number | null; max?: number; color: string }) {
  if (value === null) return (
    <div className="flex items-center justify-center h-16">
      <span className="text-sm text-slate-400">No aplica</span>
    </div>
  )
  const pct = Math.min((value / max) * 100, 100)
  const R = 36, C = 2 * Math.PI * R
  const dash = (pct / 100) * C * 0.75 // 3/4 arc
  return (
    <div className="flex flex-col items-center">
      <svg width="90" height="60" viewBox="0 0 90 60">
        <path
          d={`M 9 54 A ${R} ${R} 0 0 1 81 54`}
          fill="none" stroke="#f1f5f9" strokeWidth="8" strokeLinecap="round"
        />
        <path
          d={`M 9 54 A ${R} ${R} 0 0 1 81 54`}
          fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${dash} ${C}`}
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
        <text x="45" y="48" textAnchor="middle" fontSize="16" fontWeight="700" fill="#0f172a">
          {value.toFixed(1)}%
        </text>
      </svg>
      <span className="text-[10px] text-slate-400 -mt-1">TIR</span>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────
export default function PredictorPage() {
  const [activeEsc, setActiveEsc] = useState<EscenarioKey>("probable")

  const meta = SCENARIO_META[activeEsc]
  const esc  = ESCENARIOS[activeEsc]
  const inv  = proyectoInfo.inversion.total

  const inversionReal = activeEsc === "critico"
    ? (ESCENARIOS.critico as typeof ESCENARIOS.critico & { inversionReal?: number }).inversionReal ?? inv
    : inv

  const plusvaliaActual = esc.valorCompletado - inv
  const plusvaliaAnio5  = esc.valores[5] - inv
  const retorno5anios   = plusvaliaAnio5 + esc.noiAcum[5]

  return (
    <div className="min-h-full bg-slate-50">

      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Predictor Financiero</h1>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {proyectoInfo.nombre}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {proyectoInfo.ubicacion}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Análisis {proyectoInfo.fechaAnalisis}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="ai">✦ IA Análisis</Badge>
            <Badge variant="default" className="text-xs">
              {proyectoInfo.superficie.toLocaleString()} m² · {proyectoInfo.pisos}P+{proyectoInfo.sotanos}S
            </Badge>
          </div>
        </div>

        {/* Scenario selector */}
        <div className="flex items-center gap-2 mt-5">
          {(["probable", "conservador", "critico"] as EscenarioKey[]).map((key) => {
            const m = SCENARIO_META[key]
            const isActive = activeEsc === key
            return (
              <button
                key={key}
                onClick={() => setActiveEsc(key)}
                className={[
                  "flex items-center gap-2.5 px-5 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all duration-200",
                  isActive
                    ? `${m.activeBg} ${m.activeBorder} ${m.activeText} shadow-md`
                    : `bg-white ${m.border} ${m.text} hover:opacity-80`,
                ].join(" ")}
              >
                <div className={[
                  "w-2 h-2 rounded-full",
                  isActive ? "bg-white/80" : m.dotColor,
                ].join(" ")} />
                {m.label}
                {isActive && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            )
          })}
          <span className="ml-2 text-xs text-slate-400 flex items-center gap-1">
            <Info className="w-3 h-3" />
            {meta.description}
          </span>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6 max-w-screen-xl mx-auto">

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
          {/* Inversión */}
          <Card className="col-span-1">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-slate-500" />
                <span className="text-xs text-slate-500">Inversión total</span>
              </div>
              <div className="text-xl font-bold text-slate-900 font-mono">
                {formatCurrency(inversionReal)}
              </div>
              {activeEsc === "critico" && (
                <div className="text-[10px] text-rose-500 mt-1">+15% sobrecosto incluido</div>
              )}
              <div className="text-xs text-slate-400 mt-1">
                S/ {Math.round(inversionReal / proyectoInfo.superficie).toLocaleString()}/m²
              </div>
            </CardContent>
          </Card>

          {/* Valor al completar */}
          <Card className={`col-span-1 border-2 ${meta.border}`}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className={`w-4 h-4 ${meta.text}`} />
                <span className="text-xs text-slate-500">Valor al completar</span>
              </div>
              <div className={`text-xl font-bold font-mono ${meta.text}`}>
                {formatCurrency(esc.valorCompletado)}
              </div>
              <div className={`text-xs mt-1 font-medium flex items-center gap-1 ${plusvaliaActual >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                {plusvaliaActual >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {plusvaliaActual >= 0 ? "+" : ""}{formatCurrency(plusvaliaActual)} plusvalía
              </div>
            </CardContent>
          </Card>

          {/* VAN */}
          <Card className="col-span-1">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-slate-500" />
                <span className="text-xs text-slate-500">VAN ({esc.supuestos.wacc}% WACC)</span>
              </div>
              <div className={`text-xl font-bold font-mono ${esc.metricas.van >= 0 ? "text-slate-900" : "text-rose-600"}`}>
                {esc.metricas.van >= 0 ? "+" : ""}{formatCurrency(esc.metricas.van)}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {esc.metricas.van >= 0 ? "Proyecto viable" : "Por debajo del umbral"}
              </div>
            </CardContent>
          </Card>

          {/* TIR */}
          <Card className="col-span-1">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="w-4 h-4 text-slate-500" />
                <span className="text-xs text-slate-500">TIR proyectado</span>
              </div>
              <div className={`text-xl font-bold font-mono ${esc.metricas.tir >= 15 ? "text-emerald-600" : esc.metricas.tir >= 8 ? "text-amber-600" : "text-rose-600"}`}>
                {esc.metricas.tir.toFixed(1)}%
              </div>
              <div className="mt-2">
                <Progress
                  value={Math.min((esc.metricas.tir / 35) * 100, 100)}
                  className="h-1.5"
                  indicatorClassName={esc.metricas.tir >= 15 ? "bg-emerald-500" : esc.metricas.tir >= 8 ? "bg-amber-500" : "bg-rose-500"}
                />
              </div>
              <div className="text-[10px] text-slate-400 mt-1">WACC umbral: {esc.supuestos.wacc}%</div>
            </CardContent>
          </Card>

          {/* Payback */}
          <Card className="col-span-1">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <span className="text-xs text-slate-500">Payback</span>
              </div>
              {esc.metricas.paybackAnos !== null ? (
                <>
                  <div className="text-xl font-bold text-slate-900 font-mono">
                    {esc.metricas.paybackAnos} años
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Retorno de inversión
                  </div>
                </>
              ) : (
                <>
                  <div className="text-lg font-bold text-rose-600">N/A</div>
                  <div className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> No recupera en 5 años
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Main value projection chart ── */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Proyección del valor de mercado — 5 años</CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">Los tres escenarios vs. inversión inicial · en millones PEN</p>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-slate-500">
                {(["probable", "conservador", "critico"] as EscenarioKey[]).map((k) => (
                  <span key={k} className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5" style={{ background: SCENARIO_META[k].color, height: k === "probable" ? 3 : 2 }} />
                    {SCENARIO_META[k].label}
                  </span>
                ))}
                <span className="flex items-center gap-1.5">
                  <div className="w-3 border-t-2 border-dashed border-slate-400" />
                  Inversión
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={valueChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="probGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false} tickLine={false}
                  tickFormatter={(v) => `S/${v}M`}
                  domain={[14, 46]}
                />
                <Tooltip content={(props) => (
                  <ChartTip {...props} prefix="S/ " suffix="M" />
                )} />
                {/* Shaded probable area */}
                <Area
                  type="monotone" dataKey="probable" name="Probable"
                  stroke="#6366f1" strokeWidth={2.5} fill="url(#probGrad)"
                  dot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone" dataKey="conservador" name="Conservador"
                  stroke="#10b981" strokeWidth={2}
                  dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone" dataKey="critico" name="Crítico"
                  stroke="#f43f5e" strokeWidth={2} strokeDasharray="6 3"
                  dot={{ r: 3, fill: "#f43f5e", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
                <ReferenceLine
                  y={+(proyectoInfo.inversion.total / 1_000_000).toFixed(2)}
                  stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1.5}
                  label={{ value: "Inversión S/15.9M", position: "insideTopRight", fontSize: 10, fill: "#94a3b8" }}
                />
                {/* Milestone markers */}
                {[1, 3, 5].map((y) => (
                  <ReferenceLine
                    key={y} x={`Año ${y}`}
                    stroke="#e2e8f0" strokeDasharray="3 3"
                    label={{ value: `Y${y}`, position: "insideTop", fontSize: 9, fill: "#cbd5e1" }}
                  />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ── Milestone comparison + NOI ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Milestones 1, 3, 5 años */}
          <Card className="xl:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle>Proyección a 1, 3 y 5 años — todos los escenarios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-2 pr-4 w-28">Horizonte</th>
                      {(["probable", "conservador", "critico"] as EscenarioKey[]).map((k) => (
                        <th
                          key={k}
                          className={[
                            "text-center text-[10px] font-semibold uppercase tracking-wider py-2 px-3",
                            activeEsc === k ? SCENARIO_META[k].text : "text-slate-400",
                          ].join(" ")}
                        >
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
                      <>
                        {/* Value row */}
                        <tr key={`${ms.year}-val`} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="py-3 pr-4">
                            <div>
                              <span className="text-sm font-bold text-slate-800">{ms.label}</span>
                              <div className="text-[10px] text-slate-400">Valor mercado</div>
                            </div>
                          </td>
                          {(["probable", "conservador", "critico"] as EscenarioKey[]).map((k) => {
                            const val = ms[k].valor
                            const pct = ((val - inv) / inv * 100).toFixed(1)
                            const isPos = val > inv
                            return (
                              <td key={k} className="py-3 px-3 text-center">
                                <div className={`text-sm font-bold font-mono ${activeEsc === k ? SCENARIO_META[k].text : "text-slate-700"}`}>
                                  {formatCurrency(val)}
                                </div>
                                <div className={`text-[10px] mt-0.5 font-medium ${isPos ? "text-emerald-600" : "text-rose-500"}`}>
                                  {isPos ? "+" : ""}{pct}% vs. inv.
                                </div>
                              </td>
                            )
                          })}
                        </tr>
                        {/* Return row */}
                        <tr key={`${ms.year}-ret`} className="border-b border-slate-100 bg-slate-50/50">
                          <td className="py-2 pr-4">
                            <div className="text-[10px] text-slate-400 pl-2">NOI acumulado</div>
                          </td>
                          {(["probable", "conservador", "critico"] as EscenarioKey[]).map((k) => (
                            <td key={k} className="py-2 px-3 text-center">
                              <div className="text-xs font-mono text-emerald-600 font-medium">
                                +{formatCurrency(ms[k].noiAcum)}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                Retorno total: <span className="font-semibold text-slate-600">{ms[k].retornoPct}%</span>
                              </div>
                            </td>
                          ))}
                        </tr>
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* NOI chart */}
          <Card className="xl:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">NOI anual por escenario</CardTitle>
              <p className="text-[11px] text-slate-400">Ingreso operativo neto · millones PEN</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={noiChartData} barSize={14} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `${v}M`}
                  />
                  <Tooltip content={(props) => <ChartTip {...props} prefix="" suffix="M" />} />
                  <Bar dataKey="probable"    name="Probable"    fill="#6366f1" radius={[3,3,0,0]} />
                  <Bar dataKey="conservador" name="Conservador" fill="#10b981" radius={[3,3,0,0]} />
                  <Bar dataKey="critico"     name="Crítico"     fill="#f43f5e" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* ── Accumulated return ── */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Retorno acumulado — Plusvalía + NOI (escenario probable)</CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">Stacked: plusvalía inmobiliaria + ingresos operativos · millones PEN</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={acumReturnData} barSize={40} margin={{ top: 4, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `S/${v}M`} />
                <Tooltip content={(props) => <ChartTip {...props} prefix="S/" suffix="M" />} />
                <Legend
                  iconType="square" iconSize={8}
                  wrapperStyle={{ fontSize: "10px", paddingTop: "8px" }}
                />
                <Bar dataKey="probablePlusval" name="Plusvalía" stackId="a" fill="#6366f1" radius={[0,0,0,0]} />
                <Bar dataKey="probableNoi"     name="NOI acumulado" stackId="a" fill="#a5b4fc" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ── Scenario Detail Cards ── */}
        <div>
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4" /> Detalle por escenario
          </h2>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            {(["probable", "conservador", "critico"] as EscenarioKey[]).map((key) => {
              const m    = SCENARIO_META[key]
              const e    = ESCENARIOS[key]
              const isAc = activeEsc === key
              return (
                <button
                  key={key}
                  onClick={() => setActiveEsc(key)}
                  className={[
                    "text-left border-2 rounded-2xl p-5 transition-all duration-200 hover:shadow-lg",
                    isAc
                      ? `${m.border} shadow-md ring-2 ${m.ring} ring-offset-2`
                      : "border-slate-200 bg-white hover:border-slate-300",
                  ].join(" ")}
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold mb-2 ${m.badge}`}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: m.color }} />
                        {m.label}
                      </div>
                      <p className="text-xs text-slate-500">{m.description}</p>
                    </div>
                    <TirGauge value={e.metricas.tir} color={m.color} />
                  </div>

                  <Separator className="mb-4" />

                  {/* Key metrics */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      {
                        label: "Valor año 5",
                        value: formatCurrency(e.valores[5]),
                        color: m.text,
                      },
                      {
                        label: "VAN",
                        value: (e.metricas.van >= 0 ? "+" : "") + formatCurrency(e.metricas.van),
                        color: e.metricas.van >= 0 ? "text-emerald-600" : "text-rose-600",
                      },
                      {
                        label: "NOI año 1",
                        value: formatCurrency(e.noi[1]),
                        color: "text-slate-700",
                      },
                      {
                        label: "Payback",
                        value: e.metricas.paybackAnos ? `${e.metricas.paybackAnos} años` : "N/A",
                        color: e.metricas.paybackAnos ? "text-slate-700" : "text-rose-600",
                      },
                    ].map((row) => (
                      <div key={row.label} className="bg-slate-50 rounded-lg p-3">
                        <div className={`text-sm font-bold font-mono ${row.color}`}>{row.value}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{row.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Assumptions */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Supuestos</p>
                    {[
                      {
                        label: "Apreciación anual",
                        value: `${e.supuestos.apreciacionAnual > 0 ? "+" : ""}${e.supuestos.apreciacionAnual}%`,
                        positive: e.supuestos.apreciacionAnual > 0,
                      },
                      {
                        label: "Vacancia",
                        value: `${e.supuestos.vacancia}%`,
                        positive: e.supuestos.vacancia <= 15,
                      },
                      {
                        label: "Crec. arriendo",
                        value: `+${e.supuestos.crecimientoArriendo}%/año`,
                        positive: e.supuestos.crecimientoArriendo > 0,
                      },
                      {
                        label: "WACC",
                        value: `${e.supuestos.wacc}%`,
                        positive: e.supuestos.wacc <= 9,
                      },
                      ...(e.supuestos.sobrecosteObra > 0 ? [{
                        label: "Sobrecosto obra",
                        value: `+${e.supuestos.sobrecosteObra}%`,
                        positive: false,
                      }] : []),
                    ].map((sup) => (
                      <div key={sup.label} className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">{sup.label}</span>
                        <span className={`font-semibold font-mono ${sup.positive ? "text-emerald-600" : "text-rose-500"}`}>
                          {sup.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* 5-year return bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-500">Retorno bruto 5 años</span>
                      <span className={`font-bold ${m.text}`}>{e.metricas.retornoBruto}%</span>
                    </div>
                    <Progress
                      value={Math.min(e.metricas.retornoBruto / 2, 100)}
                      className="h-2"
                      indicatorClassName={`bg-gradient-to-r ${m.gradient}`}
                    />
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Sensitivity + AI insight ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pb-6">
          {/* Sensitivity table */}
          <Card className="xl:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle>Análisis de sensibilidad — Impacto en VAN</CardTitle>
              <p className="text-xs text-slate-400">Variación de ±1pp en cada variable sobre el escenario {meta.label}</p>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-2 pr-4">Variable</th>
                    <th className="text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-2 px-3">Valor base</th>
                    <th className="text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-2 px-3">−1pp (impacto VAN)</th>
                    <th className="text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-2 px-3">+1pp (impacto VAN)</th>
                    <th className="text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-2">Sensibilidad</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      variable: "Apreciación de mercado",
                      base: `${esc.supuestos.apreciacionAnual}%`,
                      menos: "−S/ 1,840,000",
                      mas: "+S/ 1,840,000",
                      nivel: 90,
                      color: "bg-rose-500",
                    },
                    {
                      variable: "Tasa de vacancia",
                      base: `${esc.supuestos.vacancia}%`,
                      menos: "+S/ 960,000",
                      mas: "−S/ 960,000",
                      nivel: 75,
                      color: "bg-amber-500",
                    },
                    {
                      variable: "Crecimiento del arriendo",
                      base: `${esc.supuestos.crecimientoArriendo}%`,
                      menos: "−S/ 720,000",
                      mas: "+S/ 720,000",
                      nivel: 60,
                      color: "bg-amber-400",
                    },
                    {
                      variable: "Costos operativos",
                      base: `${esc.supuestos.costosOperativos}%`,
                      menos: "+S/ 380,000",
                      mas: "−S/ 380,000",
                      nivel: 35,
                      color: "bg-emerald-400",
                    },
                    {
                      variable: "WACC (tasa de descuento)",
                      base: `${esc.supuestos.wacc}%`,
                      menos: "+S/ 1,120,000",
                      mas: "−S/ 1,120,000",
                      nivel: 80,
                      color: "bg-rose-400",
                    },
                  ].map((row) => (
                    <tr key={row.variable} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-3 pr-4 text-sm font-medium text-slate-700">{row.variable}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-xs font-mono text-slate-600">{row.base}</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-xs font-mono text-rose-600">{row.menos}</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-xs font-mono text-emerald-600">{row.mas}</span>
                      </td>
                      <td className="py-3 pl-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${row.color}`} style={{ width: `${row.nivel}%` }} />
                          </div>
                          <span className="text-[10px] text-slate-400 w-8 text-right">{row.nivel}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* AI Insight */}
          <div className="space-y-4">
            <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-sm text-violet-800">Análisis IA</CardTitle>
                    <p className="text-[10px] text-violet-400">claude-sonnet-4-6</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-white/70 rounded-xl p-3.5 border border-violet-100">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Zap className="w-3 h-3 text-indigo-500" />
                    <span className="text-xs font-semibold text-indigo-700">Conclusión principal</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    En el escenario probable, el proyecto genera una <strong>TIR de 27.8%</strong> superando el WACC de 8%. El VAN positivo de S/ 14.2M confirma que el proyecto crea valor significativo.
                  </p>
                </div>

                <div className="bg-white/70 rounded-xl p-3.5 border border-amber-100">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                    <span className="text-xs font-semibold text-amber-700">Riesgo principal</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    La <strong>apreciación de mercado</strong> es la variable más sensible (90%). Una desaceleración del mercado inmobiliario en Lima podría acercar el proyecto al escenario conservador.
                  </p>
                </div>

                <div className="bg-white/70 rounded-xl p-3.5 border border-emerald-100">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Target className="w-3 h-3 text-emerald-500" />
                    <span className="text-xs font-semibold text-emerald-700">Recomendación</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Asegurar contratos de arriendo a largo plazo (&gt;3 años) antes de la entrega para reducir la vacancia al 5-8% y consolidar el escenario probable.
                  </p>
                </div>

                <div className="text-[10px] text-slate-400 text-center pt-1">
                  Basado en datos CAPECO, BCRP y BNB Perú 2026
                </div>
              </CardContent>
            </Card>

            {/* Quick stats */}
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Resumen financiero — año 5</p>
                {[
                  { label: "Valor mercado", value: formatCurrency(esc.valores[5]), color: meta.text },
                  { label: "NOI acumulado", value: formatCurrency(esc.noiAcum[5]), color: "text-emerald-600" },
                  { label: "Retorno total", value: formatCurrency(retorno5anios), color: "text-slate-800" },
                  { label: "ROI 5 años", value: `${((retorno5anios / inv) * 100).toFixed(1)}%`, color: "text-indigo-600" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <span className="text-xs text-slate-500">{row.label}</span>
                    <span className={`text-sm font-bold font-mono ${row.color}`}>{row.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
