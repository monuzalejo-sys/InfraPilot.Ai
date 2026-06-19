"use client"

import {
  Download, Share2, Printer, ChevronRight,
  FileSpreadsheet, TrendingUp, AlertTriangle,
  Sparkles, Building2, MapPin, Calendar, User,
  Package, HardHat, Wrench, DollarSign, BarChart3,
  CheckCircle, Clock, Info,
} from "lucide-react"
import {
  ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip as ReTooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { exportPresupuestoExcel } from "@/lib/excel-export"
import {
  budgetMeta,
  costBreakdown,
  sectionBreakdown,
  topMaterials,
  laborBreakdown,
  laborBySection,
  equipmentBreakdown,
  apusSummary,
  financialSummary,
  monthlyCashflow,
} from "@/lib/mock-budget-detail"
import { mockGeneratedBudget } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils"

// ── helpers ──────────────────────────────────────────────────
const pct = (n: number, total: number) => ((n / total) * 100).toFixed(1)
const maxSection = Math.max(...sectionBreakdown.map((s) => s.total))

const DONUT_COLORS = {
  materials: "#6366f1",
  labor:     "#8b5cf6",
  equipment: "#10b981",
  otros:     "#f59e0b",
}

const donutData = [
  { name: "Materiales",  value: costBreakdown.materials.amount, color: DONUT_COLORS.materials },
  { name: "Mano de Obra",value: costBreakdown.labor.amount,     color: DONUT_COLORS.labor },
  { name: "Equipos",     value: costBreakdown.equipment.amount,  color: DONUT_COLORS.equipment },
  { name: "Otros",       value: costBreakdown.otros.amount,      color: DONUT_COLORS.otros },
]

const cashflowData = monthlyCashflow.map((m) => ({
  ...m,
  plannedM: m.planned / 1_000_000,
  actualM: m.actual ? m.actual / 1_000_000 : undefined,
}))

// Custom donut center label
function DonutCenterLabel() {
  return (
    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
      <tspan x="50%" dy="-8" fontSize="20" fontWeight="700" fill="#0f172a">
        S/ 7.2M
      </tspan>
      <tspan x="50%" dy="18" fontSize="11" fill="#64748b">
        Costo Directo
      </tspan>
    </text>
  )
}

// ── Custom tooltip ────────────────────────────────────────────
function ChartTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number; color: string }[] }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2">
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-600">{p.name}:</span>
          <span className="font-semibold text-slate-900">S/ {(p.value).toLocaleString("es-PE", { maximumFractionDigits: 0 })}</span>
        </div>
      ))}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────
export default function PresupuestoDetallado() {
  const fin = financialSummary
  const aiu = fin.aiu

  return (
    <div className="min-h-full bg-slate-50">
      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 sticky top-0 z-10">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <span>Presupuestos</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-600 font-medium">{budgetMeta.code}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">{budgetMeta.projectName}</h1>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {budgetMeta.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {budgetMeta.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" /> {budgetMeta.preparedBy}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="review">En revisión</Badge>
            <Badge variant="ai">✦ IA {budgetMeta.confidence}%</Badge>
            <Button variant="ghost" size="sm"><Printer className="w-4 h-4" /></Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="w-4 h-4" /> Compartir
            </Button>
            <Button variant="ai" size="sm" className="gap-2" onClick={exportPresupuestoExcel}>
              <Download className="w-4 h-4" /> Exportar Excel
            </Button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6 max-w-screen-xl mx-auto">

        {/* ── Executive Summary Strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          {[
            {
              label: "Total con IGV",
              value: formatCurrency(fin.total),
              sub: `${fin.igv.rate}% IGV incluido`,
              icon: <DollarSign className="w-4 h-4 text-indigo-600" />,
              bg: "bg-indigo-50",
              bold: true,
            },
            {
              label: "Costo Directo",
              value: formatCurrency(fin.directCost),
              sub: `${budgetMeta.totalArea.toLocaleString()} m² construidos`,
              icon: <BarChart3 className="w-4 h-4 text-slate-600" />,
              bg: "bg-slate-50",
            },
            {
              label: "AIU Total",
              value: formatCurrency(aiu.totalAmount),
              sub: `${aiu.totalPct}% sobre costo directo`,
              icon: <TrendingUp className="w-4 h-4 text-violet-600" />,
              bg: "bg-violet-50",
            },
            {
              label: "IGV (18%)",
              value: formatCurrency(fin.igv.amount),
              sub: "Sobre subtotal c/AIU",
              icon: <CheckCircle className="w-4 h-4 text-emerald-600" />,
              bg: "bg-emerald-50",
            },
            {
              label: "Costo / m²",
              value: `$ ${fin.perSqm.totalUSD} USD`,
              sub: `S/ ${fin.perSqm.total.toLocaleString()} PEN/m²`,
              icon: <Building2 className="w-4 h-4 text-amber-600" />,
              bg: "bg-amber-50",
            },
            {
              label: "Partidas",
              value: `${mockGeneratedBudget.sections.reduce((s, sec) => s + sec.items.length, 0)}`,
              sub: `${mockGeneratedBudget.sections.length} secciones · ${budgetMeta.duration} meses`,
              icon: <Clock className="w-4 h-4 text-slate-500" />,
              bg: "bg-slate-50",
            },
          ].map((c) => (
            <Card key={c.label} className={`${c.bold ? "border-indigo-200 bg-indigo-50/50" : ""}`}>
              <CardContent className="pt-4 pb-3 px-4">
                <div className={`w-7 h-7 rounded-md ${c.bg} flex items-center justify-center mb-2`}>
                  {c.icon}
                </div>
                <div className={`text-lg font-bold leading-tight ${c.bold ? "text-indigo-700" : "text-slate-900"}`}>
                  {c.value}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{c.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{c.sub}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Donut — cost composition */}
          <Card className="xl:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Composición del costo directo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%" cy="50%"
                      innerRadius={65} outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {donutData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <ReTooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null
                        const d = payload[0].payload
                        return (
                          <div className="bg-white border border-slate-200 rounded-lg shadow px-3 py-2 text-xs">
                            <p className="font-semibold text-slate-800">{d.name}</p>
                            <p className="text-slate-500">{formatCurrency(d.value)}</p>
                            <p className="text-slate-400">{pct(d.value, costBreakdown.total)}%</p>
                          </div>
                        )
                      }}
                    />
                    <text x="50%" y="44%" textAnchor="middle" dominantBaseline="middle" className="font-bold">
                      <tspan fontSize="18" fontWeight="700" fill="#0f172a">S/ 7.2M</tspan>
                    </text>
                    <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle">
                      <tspan fontSize="10" fill="#94a3b8">Costo Directo</tspan>
                    </text>
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 w-full mt-1">
                  {donutData.map((d) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                      <div className="min-w-0">
                        <p className="text-xs text-slate-700 truncate">{d.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{pct(d.value, costBreakdown.total)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cashflow Area Chart */}
          <Card className="xl:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Curva S — Flujo de Caja Proyectado</CardTitle>
                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-indigo-400 inline-block" /> Planificado</span>
                  <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-emerald-400 inline-block" /> Real</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={230}>
                <AreaChart data={cashflowData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="planGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    axisLine={false} tickLine={false}
                    tickFormatter={(v) => `S/${v}M`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null
                      return (
                        <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs space-y-1">
                          <p className="font-semibold text-slate-700">{label}</p>
                          {payload.map((p, idx) => p.value != null && (
                            <div key={idx} className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ background: String(p.color) }} />
                              <span className="text-slate-500">{String(p.name)}:</span>
                              <span className="font-medium text-slate-800">S/ {(Number(p.value) * 1_000_000).toLocaleString("es-PE", { maximumFractionDigits: 0 })}</span>
                            </div>
                          ))}
                        </div>
                      )
                    }}
                  />
                  <Area type="monotone" dataKey="plannedM" name="Planificado" stroke="#6366f1" strokeWidth={2} fill="url(#planGrad)" dot={false} />
                  <Area type="monotone" dataKey="actualM"  name="Real"        stroke="#10b981" strokeWidth={2} fill="url(#actualGrad)" dot={{ r: 3, fill: "#10b981" }} connectNulls={false} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* ── Section Bar Chart ── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Costo por sección — desglose Materiales / MO / Equipos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={sectionBreakdown}
                layout="vertical"
                margin={{ top: 0, right: 60, left: 0, bottom: 0 }}
                barSize={14}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 9, fill: "#94a3b8" }}
                  axisLine={false} tickLine={false}
                  tickFormatter={(v) => `S/${(v/1000).toFixed(0)}k`}
                />
                <YAxis
                  dataKey="code"
                  type="category"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  axisLine={false} tickLine={false}
                  width={28}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    const sec = sectionBreakdown.find((s) => s.code === label)
                    return (
                      <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2.5 text-xs max-w-xs">
                        <p className="font-semibold text-slate-800 mb-1.5">{sec?.name}</p>
                        {payload.map((p, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-4">
                            <span className="flex items-center gap-1.5 text-slate-500">
                              <div className="w-2 h-2 rounded-sm" style={{ background: String(p.color) }} />
                              {String(p.name)}
                            </span>
                            <span className="font-mono font-medium text-slate-700">{formatCurrency(Number(p.value))}</span>
                          </div>
                        ))}
                        <div className="border-t border-slate-100 mt-1.5 pt-1.5 flex justify-between">
                          <span className="text-slate-500">Total</span>
                          <span className="font-mono font-bold text-slate-800">{formatCurrency(sec?.total ?? 0)}</span>
                        </div>
                      </div>
                    )
                  }}
                />
                <Legend
                  iconType="square"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "10px", paddingTop: "4px" }}
                />
                <Bar dataKey="materials" name="Materiales" stackId="a" fill="#6366f1" radius={[0,0,0,0]} />
                <Bar dataKey="labor"     name="Mano de Obra" stackId="a" fill="#8b5cf6" />
                <Bar dataKey="equipment" name="Equipos"    stackId="a" fill="#10b981" radius={[0,2,2,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ── Tabs ── */}
        <Tabs defaultValue="actividades">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 pt-4">
              <TabsList>
                <TabsTrigger value="actividades" className="gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Actividades
                </TabsTrigger>
                <TabsTrigger value="apus" className="gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> APUs utilizados
                </TabsTrigger>
                <TabsTrigger value="materiales" className="gap-1.5">
                  <Package className="w-3.5 h-3.5" /> Materiales
                </TabsTrigger>
                <TabsTrigger value="mo" className="gap-1.5">
                  <HardHat className="w-3.5 h-3.5" /> Mano de Obra
                </TabsTrigger>
                <TabsTrigger value="equipos" className="gap-1.5">
                  <Wrench className="w-3.5 h-3.5" /> Equipos
                </TabsTrigger>
                <TabsTrigger value="financiero" className="gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" /> AIU · IGV · Utilidad
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB: Actividades */}
            <TabsContent value="actividades">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-6 py-3 w-20">Código</th>
                      <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-3">Descripción</th>
                      <th className="text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-3 w-16">Und.</th>
                      <th className="text-right text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-3 w-24">Metrado</th>
                      <th className="text-right text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-3 w-28">P. Unitario</th>
                      <th className="text-right text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-6 py-3 w-32">Parcial</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockGeneratedBudget.sections.map((sec) => (
                      <>
                        <tr key={sec.id} className="bg-slate-50 border-b border-t border-slate-100">
                          <td className="px-6 py-2.5">
                            <span className="text-xs font-bold text-slate-500 font-mono">{sec.code}</span>
                          </td>
                          <td colSpan={4} className="px-3 py-2.5">
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">{sec.name}</span>
                          </td>
                          <td className="px-6 py-2.5 text-right">
                            <span className="text-xs font-bold text-slate-800 font-mono">{formatCurrency(sec.subtotal)}</span>
                          </td>
                        </tr>
                        {sec.items.map((item) => (
                          <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                            <td className="px-6 py-2.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-slate-400 font-mono">{item.code}</span>
                                {item.isAiGenerated && (
                                  <span className="text-[8px] font-bold text-violet-400">✦</span>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-2.5">
                              <span className="text-sm text-slate-700">{item.name}</span>
                              {item.isAiGenerated && item.confidence && (
                                <span className="ml-2 text-[10px] text-violet-400">{Math.round(item.confidence * 100)}%</span>
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <span className="text-xs text-slate-500 font-mono">{item.unit}</span>
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              <span className="text-sm font-mono text-slate-700">{item.quantity.toLocaleString()}</span>
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              <span className="text-sm font-mono text-slate-700">{formatCurrency(item.unitPrice)}</span>
                            </td>
                            <td className="px-6 py-2.5 text-right">
                              <span className="text-sm font-semibold font-mono text-slate-800">{formatCurrency(item.totalPrice)}</span>
                            </td>
                          </tr>
                        ))}
                      </>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-900 bg-slate-50">
                      <td colSpan={5} className="px-6 py-3">
                        <span className="text-sm font-bold text-slate-900 uppercase tracking-wide">COSTO DIRECTO TOTAL</span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span className="text-base font-bold text-slate-900 font-mono">{formatCurrency(fin.directCost)}</span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </TabsContent>

            {/* TAB: APUs */}
            <TabsContent value="apus">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-violet-500" />
                  <p className="text-sm text-slate-600">{apusSummary.length} análisis de precios unitarios generados por IA</p>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {apusSummary.map((apu) => {
                    const matPct = (apu.materialsCost / apu.total) * 100
                    const labPct = (apu.laborCost / apu.total) * 100
                    const eqPct  = (apu.equipCost / apu.total) * 100
                    return (
                      <div key={apu.code} className="border border-slate-200 rounded-xl p-4 hover:border-indigo-200 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-mono text-slate-400">{apu.code}</span>
                              {apu.isAi && (
                                <Badge variant="ai">✦ IA {Math.round(apu.confidence * 100)}%</Badge>
                              )}
                            </div>
                            <h4 className="text-sm font-semibold text-slate-800">{apu.partida}</h4>
                            <p className="text-xs text-slate-400 mt-0.5">{apu.mainMaterial}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-slate-900 font-mono">{formatCurrency(apu.total)}</div>
                            <div className="text-xs text-slate-400">por {apu.unit}</div>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          {[
                            { label: "Materiales", value: apu.materialsCost, pct: matPct, color: "bg-indigo-500" },
                            { label: "Mano de Obra", value: apu.laborCost, pct: labPct, color: "bg-violet-500" },
                            { label: "Equipos", value: apu.equipCost, pct: eqPct, color: "bg-emerald-500" },
                          ].map((row) => (
                            <div key={row.label} className="flex items-center gap-2">
                              <span className="text-xs text-slate-500 w-20 shrink-0">{row.label}</span>
                              <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                                <div className={`h-1.5 rounded-full ${row.color}`} style={{ width: `${row.pct}%` }} />
                              </div>
                              <span className="text-xs font-mono text-slate-600 w-16 text-right">{formatCurrency(row.value)}</span>
                              <span className="text-[10px] text-slate-400 w-8 text-right">{row.pct.toFixed(0)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </TabsContent>

            {/* TAB: Materiales */}
            <TabsContent value="materiales">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-indigo-500" />
                    <p className="text-sm text-slate-600">
                      Total materiales: <span className="font-semibold text-slate-800">{formatCurrency(costBreakdown.materials.amount)}</span>
                      <span className="text-slate-400 ml-1">({costBreakdown.materials.pct}% del costo directo)</span>
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Info className="w-3 h-3" /> Precios CAPECO Jun-2026
                  </span>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-2.5 pr-3">Material</th>
                      <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-2.5 px-3 hidden xl:table-cell">Especificación</th>
                      <th className="text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-2.5 px-3 w-16">Und.</th>
                      <th className="text-right text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-2.5 px-3 w-24">Cantidad</th>
                      <th className="text-right text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-2.5 px-3 w-24">P. Unit.</th>
                      <th className="text-right text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-2.5 pl-3 w-28">Total</th>
                      <th className="text-right text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-2.5 pl-3 w-12">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topMaterials.map((m, i) => (
                      <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="py-3 pr-3">
                          <span className="text-sm font-medium text-slate-800">{m.name}</span>
                        </td>
                        <td className="py-3 px-3 hidden xl:table-cell">
                          <span className="text-xs text-slate-400">{m.spec}</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="text-xs text-slate-500 font-mono">{m.unit}</span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="text-sm font-mono text-slate-700">{m.qty.toLocaleString()}</span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="text-sm font-mono text-slate-700">
                            {m.unit === "—" ? "—" : formatCurrency(m.unitPrice)}
                          </span>
                        </td>
                        <td className="py-3 pl-3 text-right">
                          <span className="text-sm font-semibold font-mono text-slate-800">{formatCurrency(m.total)}</span>
                        </td>
                        <td className="py-3 pl-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <div className="w-12 bg-slate-100 rounded-full h-1">
                              <div className="h-1 rounded-full bg-indigo-400" style={{ width: `${m.pct}%` }} />
                            </div>
                            <span className="text-[10px] text-slate-400 w-8 text-right">{m.pct}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-200">
                      <td colSpan={5} className="py-3 pr-3 text-sm font-bold text-slate-800">TOTAL MATERIALES</td>
                      <td className="py-3 pl-3 text-right text-sm font-bold font-mono text-slate-900">{formatCurrency(costBreakdown.materials.amount)}</td>
                      <td className="py-3 pl-3 text-right text-xs font-bold text-indigo-600">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </TabsContent>

            {/* TAB: MO */}
            <TabsContent value="mo">
              <div className="p-6 space-y-6">
                {/* MO Summary */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <HardHat className="w-4 h-4 text-violet-500" />
                    <p className="text-sm text-slate-600">
                      Total mano de obra: <span className="font-semibold text-slate-800">{formatCurrency(costBreakdown.labor.amount)}</span>
                      <span className="text-slate-400 ml-1">({costBreakdown.labor.pct}% del costo directo)</span>
                    </p>
                  </div>
                  <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
                    {laborBreakdown.map((lb) => (
                      <div key={lb.category} className="border border-slate-200 rounded-xl p-4">
                        <div className="text-lg mb-0.5">{lb.icon}</div>
                        <div className="text-base font-bold text-slate-900 font-mono">{formatCurrency(lb.total)}</div>
                        <div className="text-sm font-medium text-slate-700">{lb.category}</div>
                        <div className="text-xs text-slate-400 mt-1">
                          {lb.hh.toLocaleString()} HH · S/ {lb.unitPrice.toFixed(2)}/HH
                        </div>
                        <div className="mt-2">
                          <Progress value={lb.pct} className="h-1" indicatorClassName="bg-violet-500" />
                          <span className="text-[10px] text-slate-400">{lb.pct}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">MO por sección</h4>
                  <div className="space-y-2">
                    {laborBySection.map((row) => (
                      <div key={row.section} className="flex items-center gap-3">
                        <span className="text-xs text-slate-600 w-48 truncate shrink-0">{row.section}</span>
                        <div className="flex-1 bg-slate-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-violet-400"
                            style={{ width: `${(row.total / Math.max(...laborBySection.map(l => l.total))) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-slate-700 w-28 text-right shrink-0">{formatCurrency(row.total)}</span>
                        <span className="text-[10px] text-slate-400 w-20 text-right shrink-0">{row.hh.toLocaleString()} HH</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB: Equipos */}
            <TabsContent value="equipos">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Wrench className="w-4 h-4 text-emerald-500" />
                  <p className="text-sm text-slate-600">
                    Total equipos: <span className="font-semibold text-slate-800">{formatCurrency(costBreakdown.equipment.amount)}</span>
                    <span className="text-slate-400 ml-1">({costBreakdown.equipment.pct}% del costo directo)</span>
                  </p>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                  {equipmentBreakdown.map((eq, i) => (
                    <div key={i} className="flex items-start gap-4 border border-slate-200 rounded-xl p-4 hover:border-emerald-200 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                        <Wrench className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{eq.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{eq.spec}</p>
                          </div>
                          <span className="text-sm font-bold font-mono text-slate-900 shrink-0">{formatCurrency(eq.total)}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                          <span>{eq.qty.toLocaleString()} {eq.unit}</span>
                          <span>·</span>
                          <span>S/ {eq.unitPrice.toLocaleString()}/{eq.unit}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full bg-emerald-400" style={{ width: `${eq.pct}%` }} />
                          </div>
                          <span className="text-[10px] text-slate-400 w-8 text-right">{eq.pct}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* TAB: Financiero */}
            <TabsContent value="financiero">
              <div className="p-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {/* Left: Waterfall */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4">Estructura financiera del presupuesto</h3>

                    {/* Direct cost */}
                    <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Costo Directo</p>
                        <p className="text-xs text-slate-500">Materiales + MO + Equipos</p>
                      </div>
                      <span className="text-base font-bold font-mono text-slate-900">{formatCurrency(fin.directCost)}</span>
                    </div>

                    <Separator className="my-2" />
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">AIU — Administración, Imprevistos y Utilidad</p>

                    {/* AIU items */}
                    {[
                      { ...aiu.admin,       letter: "A", color: "bg-indigo-100 text-indigo-700", barColor: "bg-indigo-500" },
                      { ...aiu.contingency, letter: "I", color: "bg-amber-100 text-amber-700",   barColor: "bg-amber-500" },
                      { ...aiu.profit,      letter: "U", color: "bg-emerald-100 text-emerald-700",barColor: "bg-emerald-500" },
                    ].map((item) => (
                      <div key={item.letter} className="flex items-center gap-3 px-4 py-3 border border-slate-100 rounded-lg hover:border-slate-200 transition-colors">
                        <div className={`w-7 h-7 rounded-lg ${item.color} flex items-center justify-center text-sm font-bold shrink-0`}>
                          {item.letter}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm text-slate-700">{item.label}</p>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs text-slate-400">{item.pct}%</span>
                              <span className="text-sm font-semibold font-mono text-slate-800">{formatCurrency(item.amount)}</span>
                            </div>
                          </div>
                          <div className="mt-1.5 bg-slate-100 rounded-full h-1">
                            <div className={`h-1 rounded-full ${item.barColor}`} style={{ width: `${(item.pct / aiu.totalPct) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* AIU Total */}
                    <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Subtotal + AIU</p>
                        <p className="text-xs text-slate-500">AIU: {aiu.totalPct}% · {formatCurrency(aiu.totalAmount)}</p>
                      </div>
                      <span className="text-base font-bold font-mono text-slate-900">{formatCurrency(fin.subtotal)}</span>
                    </div>

                    <Separator className="my-2" />

                    {/* IGV */}
                    <div className="flex items-center justify-between py-3 px-4 border border-slate-200 rounded-lg">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">IGV ({fin.igv.rate}%)</p>
                        <p className="text-xs text-slate-500">Impuesto General a las Ventas</p>
                      </div>
                      <span className="text-base font-mono text-slate-700">{formatCurrency(fin.igv.amount)}</span>
                    </div>

                    {/* TOTAL */}
                    <div className="flex items-center justify-between py-4 px-4 bg-indigo-600 rounded-xl mt-3">
                      <div>
                        <p className="text-sm font-bold text-white">TOTAL PRESUPUESTO</p>
                        <p className="text-xs text-indigo-200">Incluye IGV · {budgetMeta.currency}</p>
                      </div>
                      <span className="text-2xl font-bold text-white font-mono">{formatCurrency(fin.total)}</span>
                    </div>
                  </div>

                  {/* Right: Summary ratios */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-700">Indicadores del presupuesto</h3>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Costo directo / m²", value: `S/ ${fin.perSqm.direct.toLocaleString()}`, sub: "PEN por m² construido", good: true },
                        { label: "Costo total / m²",   value: `$ ${fin.perSqm.totalUSD}`, sub: "USD/m² con AIU e IGV", good: true },
                        { label: "Utilidad bruta",      value: formatCurrency(aiu.profit.amount), sub: `${aiu.profit.pct}% sobre directo`, good: true },
                        { label: "Ratio AIU / Directo", value: `${aiu.totalPct}%`, sub: "Parámetro de mercado: 18–28%", good: true },
                      ].map((ind) => (
                        <div key={ind.label} className="border border-slate-200 rounded-xl p-4">
                          <div className="text-lg font-bold text-slate-900 mb-0.5">{ind.value}</div>
                          <div className="text-xs font-medium text-slate-600">{ind.label}</div>
                          <div className="text-[10px] text-slate-400 mt-1">{ind.sub}</div>
                          {ind.good && (
                            <div className="flex items-center gap-1 mt-2">
                              <CheckCircle className="w-3 h-3 text-emerald-500" />
                              <span className="text-[10px] text-emerald-600 font-medium">Dentro del rango esperado</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                        <span className="text-xs font-semibold text-violet-700">Análisis IA</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        El costo de <strong>$ {fin.perSqm.totalUSD} USD/m²</strong> está dentro del rango de mercado para oficinas corporativas primera categoría en Miraflores, Lima (rango esperado: $380–$480 USD/m²). El ratio de MO ({costBreakdown.labor.pct}%) es coherente con obra de alta complejidad estructural.
                      </p>
                      <div className="flex items-center gap-1 mt-2.5">
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                        <p className="text-[10px] text-amber-600">El acero (18.4% del directo) tiene alta volatilidad. Incluir cláusula de reajuste.</p>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 flex items-start gap-1.5 p-3 bg-slate-50 rounded-lg">
                      <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>
                        Precios vigentes al {budgetMeta.date} · Fuente: {budgetMeta.priceSource} · Válido hasta: {budgetMeta.validUntil}. Sujeto a reajuste según variaciones del mercado.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
