"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  Download, ChevronRight, FileSpreadsheet, TrendingUp,
  Sparkles, MapPin, Calendar, DollarSign, AlertTriangle,
  ChevronDown, Info, ArrowLeft,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { exportPresupuestoExcel } from "@/lib/excel-export"
import { formatCurrency, timeAgo } from "@/lib/utils"
import type { GeneratedBudget } from "@/types"
import Link from "next/link"

interface BudgetSummary {
  id: string
  project_name: string
  location?: string
  currency: string
  confidence?: number
  total_amount?: number
  created_at: string
}

interface BudgetRow {
  id: string
  description: string
  project_name: string
  location?: string
  currency: string
  confidence?: number
  total_amount?: number
  budget_data: GeneratedBudget
  created_at: string
}

const riskColors = {
  HIGH:   { bg: "bg-rose-50",  border: "border-rose-200",  text: "text-rose-700",  label: "Alto" },
  MEDIUM: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", label: "Medio" },
  LOW:    { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-600", label: "Bajo" },
}

export default function PresupuestosPage() {
  const [budgets, setBudgets]         = useState<BudgetSummary[]>([])
  const [selected, setSelected]       = useState<BudgetRow | null>(null)
  const [loading, setLoading]         = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  const loadList = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/api/budgets")
    if (res.ok) {
      const { budgets } = await res.json()
      setBudgets(budgets ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadList() }, [loadList])

  const loadDetail = async (id: string) => {
    setLoadingDetail(true)
    const res = await fetch(`/api/budgets/${id}`)
    if (res.ok) {
      const { budget } = await res.json()
      setSelected(budget)
      // expand first section by default
      const firstId = budget.budget_data?.sections?.[0]?.id
      if (firstId) setExpandedSections(new Set([firstId]))
    }
    setLoadingDetail(false)
  }

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  // ── List view ─────────────────────────────────────────────────
  if (!selected) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Presupuestos</h1>
            <p className="text-slate-500 text-sm mt-0.5">Historial de presupuestos generados con IA</p>
          </div>
          <Link href="/cotizador">
            <Button variant="ai" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Nuevo presupuesto
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">Cargando...</div>
        ) : budgets.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-slate-500">Aún no hay presupuestos generados.</p>
            <Link href="/cotizador">
              <Button variant="ai" className="gap-2 mt-1">
                <Sparkles className="w-4 h-4" />
                Generar primer presupuesto
              </Button>
            </Link>
          </div>
        ) : (
          <Card>
            <div className="divide-y divide-slate-100">
              {budgets.map((b) => (
                <button
                  key={b.id}
                  onClick={() => loadDetail(b.id)}
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {b.project_name}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
                      {b.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{b.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{timeAgo(new Date(b.created_at))}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {b.total_amount && (
                      <p className="text-sm font-bold text-slate-900 font-mono">
                        {formatCurrency(b.total_amount)}
                      </p>
                    )}
                    <div className="flex items-center gap-2 justify-end mt-0.5">
                      {b.confidence && <Badge variant="ai">✦ IA {b.confidence}%</Badge>}
                      <span className="text-xs text-slate-400">{b.currency}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 shrink-0" />
                </button>
              ))}
            </div>
          </Card>
        )}
      </div>
    )
  }

  // ── Detail view ───────────────────────────────────────────────
  const data    = selected.budget_data
  const baseCost   = data.baseCost ?? 0
  const overhead   = baseCost * (data.overheadPct ?? 0.10)
  const profit     = baseCost * (data.profitPct ?? 0.08)
  const contingency = data.contingencyAmount ?? baseCost * 0.05
  const subtotal   = baseCost + overhead + profit + contingency
  const tax        = subtotal * (data.taxRate ?? 0.18)
  const total      = subtotal + tax
  const totalPartidas = data.sections?.reduce((s, sec) => s + sec.items.length, 0) ?? 0
  const apu        = data.apuSample

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-slate-200 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelected(null)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base font-semibold text-slate-900">{data.projectName}</h1>
            <p className="text-xs text-slate-500">
              {data.location} · {totalPartidas} partidas · {data.confidence}% confianza
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {data.confidence && <Badge variant="ai">✦ IA {data.confidence}%</Badge>}
          <Button variant="outline" size="sm" className="gap-2" onClick={exportPresupuestoExcel}>
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            Excel
          </Button>
        </div>
      </div>

      {loadingDetail ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
          Cargando presupuesto...
        </div>
      ) : (
        <div className="flex-1 overflow-hidden flex">
          {/* Left: sections tree */}
          <div className="w-64 shrink-0 border-r border-slate-200 bg-white overflow-y-auto">
            <div className="p-3 border-b border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {totalPartidas} partidas · {data.sections?.length} secciones
              </p>
            </div>
            <div className="py-1">
              {data.sections?.map((section) => (
                <div key={section.id}>
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-slate-50 transition-colors"
                  >
                    {expandedSections.has(section.id)
                      ? <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      : <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono text-slate-400">{section.code}</span>
                        <span className="text-xs font-medium truncate text-slate-700">{section.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{formatCurrency(section.subtotal)}</p>
                    </div>
                  </button>
                  {expandedSections.has(section.id) && (
                    <div className="bg-slate-50 border-b border-slate-100">
                      {section.items.map((item) => (
                        <div key={item.id} className="px-4 py-2 border-l-2 border-transparent">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-mono text-slate-400">{item.code}</span>
                            {item.isAiGenerated && <span className="text-[9px] text-violet-500 font-bold">✦</span>}
                          </div>
                          <p className="text-xs text-slate-600 truncate">{item.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {item.unit} · {formatCurrency(item.unitPrice)}/{item.unit}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Center: partidas table */}
          <div className="flex-1 overflow-y-auto bg-white border-r border-slate-200">
            <div className="p-6 space-y-6">
              {/* Info bar */}
              <div className="flex items-center gap-6 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{data.location}</span>
                <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" />{data.currency}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{timeAgo(new Date(selected.created_at))}</span>
              </div>

              {/* Partidas table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-slate-900">
                      <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-2 w-16">Ítem</th>
                      <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-2">Descripción</th>
                      <th className="text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-2 w-14">Und.</th>
                      <th className="text-right text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-2 w-20">Metrado</th>
                      <th className="text-right text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-2 w-24">P. Unit.</th>
                      <th className="text-right text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-2 w-28">Parcial</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.sections?.map((sec) => (
                      <React.Fragment key={sec.id}>
                        <tr className="bg-slate-50 border-b border-t border-slate-100">
                          <td className="px-2 py-2">
                            <span className="text-xs font-bold text-slate-500 font-mono">{sec.code}</span>
                          </td>
                          <td colSpan={4} className="px-2 py-2">
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">{sec.name}</span>
                          </td>
                          <td className="px-2 py-2 text-right">
                            <span className="text-xs font-bold text-slate-800 font-mono">{formatCurrency(sec.subtotal)}</span>
                          </td>
                        </tr>
                        {sec.items.map((item) => (
                          <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                            <td className="px-2 py-2.5">
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] font-mono text-slate-400">{item.code}</span>
                                {item.isAiGenerated && <span className="text-[9px] text-violet-500">✦</span>}
                              </div>
                            </td>
                            <td className="px-2 py-2.5">
                              <span className="text-xs text-slate-700">{item.name}</span>
                            </td>
                            <td className="px-2 py-2.5 text-center">
                              <span className="text-xs text-slate-500 font-mono">{item.unit}</span>
                            </td>
                            <td className="px-2 py-2.5 text-right">
                              <span className="text-xs font-mono text-slate-700">{item.quantity.toLocaleString()}</span>
                            </td>
                            <td className="px-2 py-2.5 text-right">
                              <span className="text-xs font-mono text-slate-700">{formatCurrency(item.unitPrice)}</span>
                            </td>
                            <td className="px-2 py-2.5 text-right">
                              <span className="text-xs font-semibold font-mono text-slate-800">{formatCurrency(item.totalPrice)}</span>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-900 bg-slate-50">
                      <td colSpan={5} className="px-2 py-3 text-xs font-bold text-slate-900 uppercase tracking-wide">
                        Costo Directo
                      </td>
                      <td className="px-2 py-3 text-right text-sm font-bold text-slate-900 font-mono">
                        {formatCurrency(baseCost)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Risks */}
              {data.risks?.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Análisis de riesgos
                  </h3>
                  {data.risks.map((risk, i) => {
                    const rc = riskColors[risk.level] ?? riskColors.LOW
                    return (
                      <div key={i} className={`rounded-lg border p-4 ${rc.bg} ${rc.border}`}>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className={`text-sm font-semibold ${rc.text}`}>{risk.title}</p>
                          <Badge variant={risk.level === "HIGH" ? "danger" : risk.level === "MEDIUM" ? "warning" : "default"} className="shrink-0">
                            {rc.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed mb-2">{risk.description}</p>
                        <p className="text-xs text-slate-600">
                          <span className="font-semibold text-violet-700">✦ Recomendación:</span>{" "}
                          {risk.recommendation}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* APU Sample */}
              {apu && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <Info className="w-4 h-4 text-indigo-500" />
                    APU — {apu.itemName}
                  </h3>
                  <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                      <span className="font-mono text-slate-500">{apu.itemCode}</span>
                      <span className="text-slate-500">{apu.source}</span>
                    </div>
                    {[
                      { label: "Materiales",  items: apu.materials,  cost: apu.materialsCost },
                      { label: "Mano de Obra",items: apu.labor,      cost: apu.laborCost },
                      { label: "Equipos",     items: apu.equipment,  cost: apu.equipmentCost },
                    ].map((g) => (
                      <div key={g.label}>
                        <div className="bg-slate-100 px-4 py-1.5 border-b border-slate-200 flex justify-between">
                          <span className="font-semibold text-slate-600 uppercase tracking-wider text-[10px]">{g.label}</span>
                          <span className="font-mono text-slate-600">{formatCurrency(g.cost)}</span>
                        </div>
                        {g.items.map((comp, i) => (
                          <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-1.5 border-b border-slate-50 hover:bg-slate-50">
                            <span className="text-slate-700 truncate">{comp.description}</span>
                            <span className="font-mono text-slate-500">{comp.unit}</span>
                            <span className="font-mono text-slate-700 text-right">{comp.quantity.toFixed(3)}</span>
                            <span className="font-mono text-slate-700 text-right">{comp.unitPrice.toFixed(2)}</span>
                            <span className="font-mono font-medium text-slate-800 text-right">{comp.totalPrice.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                    <div className="px-4 py-2.5 bg-slate-900 flex justify-between">
                      <span className="font-bold text-white">PRECIO UNITARIO TOTAL</span>
                      <span className="font-bold text-white font-mono">{formatCurrency(apu.totalCost)} / {apu.unit}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: financial summary */}
          <div className="w-64 shrink-0 bg-white overflow-y-auto">
            <div className="p-5 space-y-4 sticky top-0">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resumen financiero</p>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Costo directo</span>
                  <span className="font-semibold font-mono text-slate-900">{formatCurrency(baseCost)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>G. Generales (10%)</span>
                  <span className="font-mono">{formatCurrency(overhead)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Utilidad (8%)</span>
                  <span className="font-mono">{formatCurrency(profit)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Imprevistos (5%)</span>
                  <span className="font-mono">{formatCurrency(contingency)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-semibold font-mono text-slate-800">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>IGV 18%</span>
                  <span className="font-mono">{formatCurrency(tax)}</span>
                </div>
                <div className="border-t-2 border-slate-900 pt-2.5 mt-1">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-900">TOTAL</span>
                    <span className="font-bold font-mono text-slate-900">{formatCurrency(total)}</span>
                  </div>
                  <p className="text-xs text-emerald-600 text-right mt-0.5">✓ {data.currency} · {data.confidence}% IA</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Button variant="ai" className="w-full gap-2 text-sm" onClick={exportPresupuestoExcel}>
                  <Download className="w-4 h-4" />
                  Exportar Excel
                </Button>
                <Link href="/predictor">
                  <Button variant="outline" className="w-full gap-2 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    Proyección financiera
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
