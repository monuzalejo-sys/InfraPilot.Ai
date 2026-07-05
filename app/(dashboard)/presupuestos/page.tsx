"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  Download, ChevronRight, FileSpreadsheet, TrendingUp,
  Sparkles, MapPin, Calendar, DollarSign, AlertTriangle,
  ChevronDown, Info, ArrowLeft,
} from "lucide-react"
import { exportPresupuestoExcel } from "@/lib/excel-export"
import { formatCurrency, timeAgo, taxLabel, defaultTaxRate } from "@/lib/utils"
import type { GeneratedBudget } from "@/types"
import Link from "next/link"
import { isSupabaseConfigured } from "@/lib/supabase/client"
import { DemoNotice } from "@/components/demo-notice"
import { EditorialCard, MonoLabel } from "@/components/editorial"

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
  HIGH:   { text: "text-[var(--warn)]", border: "border-[var(--warn)]/30", label: "Alto" },
  MEDIUM: { text: "text-[var(--warn)]", border: "border-[var(--warn)]/20", label: "Medio" },
  LOW:    { text: "text-[var(--muted)]", border: "border-[var(--hairline)]", label: "Bajo" },
}

export default function PresupuestosPage() {
  const [budgets, setBudgets]         = useState<BudgetSummary[]>([])
  const [selected, setSelected]       = useState<BudgetRow | null>(null)
  const [loading, setLoading]         = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [fetchError, setFetchError] = useState(false)

  const loadList = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/api/budgets")
    if (res.ok) {
      const { budgets } = await res.json()
      setBudgets(budgets ?? [])
    } else {
      setFetchError(true)
    }
    setLoading(false)
  }, [])

  // Fetches on mount. `loadList` sets state synchronously as its first
  // statement (setLoading(true)), which react-hooks/set-state-in-effect
  // flags for any effect that calls it — there's no external subscription
  // to move this into, it's a plain fetch-on-mount. Suppressed narrowly
  // with rationale.
  // eslint-disable-next-line react-hooks/set-state-in-effect
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
        {(!isSupabaseConfigured || fetchError) && <DemoNotice />}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--ink)]">Presupuestos</h1>
            <p className="text-[var(--muted)] text-sm mt-0.5">Historial de presupuestos generados con IA</p>
          </div>
          <Link href="/cotizador">
            <button className="px-4 py-2 text-sm rounded-[2px] bg-[var(--brass)] text-[var(--paper)] hover:opacity-90 transition-opacity flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Nuevo presupuesto
            </button>
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center text-[var(--muted)] text-sm">Cargando…</div>
        ) : budgets.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <Sparkles className="w-10 h-10 text-[var(--hairline)] mx-auto" />
            <p className="text-[var(--muted)]">Aún no hay presupuestos generados.</p>
            <Link href="/cotizador">
              <button className="px-4 py-2 text-sm rounded-[2px] bg-[var(--brass)] text-[var(--paper)] hover:opacity-90 transition-opacity inline-flex items-center gap-2 mt-1">
                <Sparkles className="w-4 h-4" />
                Generar primer presupuesto
              </button>
            </Link>
          </div>
        ) : (
          <EditorialCard className="!p-0">
            <div className="divide-y divide-[var(--hairline)]">
              {budgets.map((b) => (
                <button
                  key={b.id}
                  onClick={() => loadDetail(b.id)}
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-[var(--paper)] transition-colors text-left group"
                >
                  <div className="w-10 h-10 rounded-[2px] border border-[var(--hairline)] bg-[var(--paper)] flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-[var(--brass)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--ink)] group-hover:text-[var(--brass)] transition-colors">
                      {b.project_name}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-[var(--muted)]">
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
                      <p className="text-sm font-semibold text-[var(--ink)] font-mono">
                        {formatCurrency(b.total_amount)}
                      </p>
                    )}
                    <div className="flex items-center gap-2 justify-end mt-0.5">
                      {b.confidence && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-[var(--brass)]/30 text-[var(--brass)]">
                          ✦ IA {b.confidence}%
                        </span>
                      )}
                      <span className="text-xs text-[var(--muted)]">{b.currency}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--hairline)] group-hover:text-[var(--muted)] shrink-0" />
                </button>
              ))}
            </div>
          </EditorialCard>
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
  const taxRate    = data.taxRate ?? defaultTaxRate(data.currency)
  const tax        = subtotal * taxRate
  const total      = subtotal + tax
  const totalPartidas = data.sections?.reduce((s, sec) => s + sec.items.length, 0) ?? 0
  const apu        = data.apuSample

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-[var(--hairline)] bg-[var(--card)] shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelected(null)}
            className="flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base font-semibold text-[var(--ink)]">{data.projectName}</h1>
            <p className="text-xs text-[var(--muted)]">
              {data.location} · {totalPartidas} partidas · {data.confidence}% confianza
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {data.confidence && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-[var(--brass)]/30 text-[var(--brass)]">
              ✦ IA {data.confidence}%
            </span>
          )}
          <button
            onClick={() => exportPresupuestoExcel(data)}
            className="px-3 py-1.5 text-sm rounded-[2px] border border-[var(--hairline)] text-[var(--ink)] hover:border-[var(--brass)] transition-colors flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-[var(--muted)]" />
            Excel
          </button>
        </div>
      </div>

      {loadingDetail ? (
        <div className="flex-1 flex items-center justify-center text-[var(--muted)] text-sm">
          Cargando presupuesto…
        </div>
      ) : (
        <div className="flex-1 overflow-hidden flex">
          {/* Left: sections tree */}
          <div className="w-64 shrink-0 border-r border-[var(--hairline)] bg-[var(--card)] overflow-y-auto">
            <div className="p-3 border-b border-[var(--hairline)]">
              <MonoLabel>{totalPartidas} partidas · {data.sections?.length} secciones</MonoLabel>
            </div>
            <div className="py-1">
              {data.sections?.map((section) => (
                <div key={section.id}>
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-[var(--paper)] transition-colors"
                  >
                    {expandedSections.has(section.id)
                      ? <ChevronDown className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" />
                      : <ChevronRight className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono text-[var(--muted)]">{section.code}</span>
                        <span className="text-xs font-medium truncate text-[var(--ink)]">{section.name}</span>
                      </div>
                      <p className="text-[11px] text-[var(--muted)] mt-0.5">{formatCurrency(section.subtotal)}</p>
                    </div>
                  </button>
                  {expandedSections.has(section.id) && (
                    <div className="bg-[var(--paper)] border-b border-[var(--hairline)]">
                      {section.items.map((item) => (
                        <div key={item.id} className="px-4 py-2 border-l-2 border-transparent">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-mono text-[var(--muted)]">{item.code}</span>
                            {item.isAiGenerated && <span className="text-[9px] text-[var(--brass)] font-bold">✦</span>}
                          </div>
                          <p className="text-xs text-[var(--ink)]/80 truncate">{item.name}</p>
                          <p className="text-[11px] text-[var(--muted)] font-mono">
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
          <div className="flex-1 overflow-y-auto bg-[var(--paper)] border-r border-[var(--hairline)]">
            <div className="p-6 space-y-6">
              {/* Info bar */}
              <div className="flex items-center gap-6 text-xs text-[var(--muted)]">
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{data.location}</span>
                <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" />{data.currency}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{timeAgo(new Date(selected.created_at))}</span>
              </div>

              {/* Partidas table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-[var(--ink)]">
                      <th className="text-left px-2 py-2 w-16"><MonoLabel>Ítem</MonoLabel></th>
                      <th className="text-left px-2 py-2"><MonoLabel>Descripción</MonoLabel></th>
                      <th className="text-center px-2 py-2 w-14"><MonoLabel>Und.</MonoLabel></th>
                      <th className="text-right px-2 py-2 w-20"><MonoLabel>Metrado</MonoLabel></th>
                      <th className="text-right px-2 py-2 w-24"><MonoLabel>P. Unit.</MonoLabel></th>
                      <th className="text-right px-2 py-2 w-28"><MonoLabel>Parcial</MonoLabel></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.sections?.map((sec) => (
                      <React.Fragment key={sec.id}>
                        <tr className="bg-[var(--card)] border-b border-t border-[var(--hairline)]">
                          <td className="px-2 py-2">
                            <span className="text-xs font-bold text-[var(--muted)] font-mono">{sec.code}</span>
                          </td>
                          <td colSpan={4} className="px-2 py-2">
                            <span className="text-xs font-bold text-[var(--ink)] uppercase tracking-wide">{sec.name}</span>
                          </td>
                          <td className="px-2 py-2 text-right">
                            <span className="text-xs font-bold text-[var(--ink)] font-mono">{formatCurrency(sec.subtotal)}</span>
                          </td>
                        </tr>
                        {sec.items.map((item) => (
                          <tr key={item.id} className="border-b border-[var(--hairline)] hover:bg-[var(--card)] transition-colors">
                            <td className="px-2 py-2.5">
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] font-mono text-[var(--muted)]">{item.code}</span>
                                {item.isAiGenerated && <span className="text-[9px] text-[var(--brass)]">✦</span>}
                              </div>
                            </td>
                            <td className="px-2 py-2.5">
                              <span className="text-xs text-[var(--ink)]/80">{item.name}</span>
                            </td>
                            <td className="px-2 py-2.5 text-center">
                              <span className="text-xs text-[var(--muted)] font-mono">{item.unit}</span>
                            </td>
                            <td className="px-2 py-2.5 text-right">
                              <span className="text-xs font-mono text-[var(--ink)]/80">{item.quantity.toLocaleString()}</span>
                            </td>
                            <td className="px-2 py-2.5 text-right">
                              <span className="text-xs font-mono text-[var(--ink)]/80">{formatCurrency(item.unitPrice)}</span>
                            </td>
                            <td className="px-2 py-2.5 text-right">
                              <span className="text-xs font-semibold font-mono text-[var(--ink)]">{formatCurrency(item.totalPrice)}</span>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-[var(--ink)] bg-[var(--card)]">
                      <td colSpan={5} className="px-2 py-3 text-xs font-bold text-[var(--ink)] uppercase tracking-wide">
                        Costo Directo
                      </td>
                      <td className="px-2 py-3 text-right text-sm font-bold text-[var(--ink)] font-mono">
                        {formatCurrency(baseCost)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Risks */}
              {data.risks?.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-[var(--ink)] flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[var(--warn)]" />
                    Análisis de riesgos
                  </h3>
                  {data.risks.map((risk, i) => {
                    const rc = riskColors[risk.level] ?? riskColors.LOW
                    return (
                      <div key={i} className={`rounded-[2px] border p-4 bg-[var(--card)] ${rc.border}`}>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className={`text-sm font-semibold ${rc.text}`}>{risk.title}</p>
                          <span className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${rc.border} ${rc.text}`}>
                            {rc.label}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--ink)]/70 leading-relaxed mb-2">{risk.description}</p>
                        <p className="text-xs text-[var(--ink)]/70">
                          <span className="font-semibold text-[var(--brass)]">✦ Recomendación:</span>{" "}
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
                  <h3 className="text-sm font-semibold text-[var(--ink)] flex items-center gap-2">
                    <Info className="w-4 h-4 text-[var(--brass)]" />
                    APU — {apu.itemName}
                  </h3>
                  <div className="border border-[var(--hairline)] rounded-[2px] overflow-hidden text-xs">
                    <div className="bg-[var(--card)] px-4 py-2 border-b border-[var(--hairline)] flex items-center justify-between">
                      <span className="font-mono text-[var(--muted)]">{apu.itemCode}</span>
                      <span className="text-[var(--muted)]">{apu.source}</span>
                    </div>
                    {[
                      { label: "Materiales",  items: apu.materials,  cost: apu.materialsCost },
                      { label: "Mano de Obra",items: apu.labor,      cost: apu.laborCost },
                      { label: "Equipos",     items: apu.equipment,  cost: apu.equipmentCost },
                    ].map((g) => (
                      <div key={g.label}>
                        <div className="bg-[var(--paper)] px-4 py-1.5 border-b border-[var(--hairline)] flex justify-between">
                          <MonoLabel>{g.label}</MonoLabel>
                          <span className="font-mono text-[var(--ink)]/70">{formatCurrency(g.cost)}</span>
                        </div>
                        {g.items.map((comp, i) => (
                          <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-1.5 border-b border-[var(--hairline)] hover:bg-[var(--paper)]">
                            <span className="text-[var(--ink)]/80 truncate">{comp.description}</span>
                            <span className="font-mono text-[var(--muted)]">{comp.unit}</span>
                            <span className="font-mono text-[var(--ink)]/80 text-right">{comp.quantity.toFixed(3)}</span>
                            <span className="font-mono text-[var(--ink)]/80 text-right">{comp.unitPrice.toFixed(2)}</span>
                            <span className="font-mono font-medium text-[var(--ink)] text-right">{comp.totalPrice.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                    <div className="px-4 py-2.5 bg-[var(--ink)] flex justify-between">
                      <span className="font-bold text-[var(--paper)]">PRECIO UNITARIO TOTAL</span>
                      <span className="font-bold text-[var(--paper)] font-mono">{formatCurrency(apu.totalCost)} / {apu.unit}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: financial summary */}
          <div className="w-64 shrink-0 bg-[var(--card)] overflow-y-auto">
            <div className="p-5 space-y-4 sticky top-0">
              <MonoLabel>Resumen financiero</MonoLabel>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--ink)]/70">Costo directo</span>
                  <span className="font-semibold font-mono text-[var(--ink)]">{formatCurrency(baseCost)}</span>
                </div>
                <div className="flex justify-between text-[var(--muted)]">
                  <span>G. Generales (10%)</span>
                  <span className="font-mono">{formatCurrency(overhead)}</span>
                </div>
                <div className="flex justify-between text-[var(--muted)]">
                  <span>Utilidad (8%)</span>
                  <span className="font-mono">{formatCurrency(profit)}</span>
                </div>
                <div className="flex justify-between text-[var(--muted)]">
                  <span>Imprevistos (5%)</span>
                  <span className="font-mono">{formatCurrency(contingency)}</span>
                </div>
                <div className="h-px bg-[var(--hairline)]" />
                <div className="flex justify-between">
                  <span className="text-[var(--ink)]/70">Subtotal</span>
                  <span className="font-semibold font-mono text-[var(--ink)]/90">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[var(--muted)]">
                  <span>{taxLabel(data.currency)} {Math.round(taxRate * 100)}%</span>
                  <span className="font-mono">{formatCurrency(tax)}</span>
                </div>
                <div className="border-t-2 border-[var(--ink)] pt-2.5 mt-1">
                  <div className="flex justify-between">
                    <span className="font-bold text-[var(--ink)]">TOTAL</span>
                    <span className="font-bold font-mono text-[var(--ink)]">{formatCurrency(total)}</span>
                  </div>
                  <p className="text-xs text-[var(--ok)] text-right mt-0.5">✓ {data.currency} · {data.confidence}% IA</p>
                </div>
              </div>
              <div className="h-px bg-[var(--hairline)]" />
              <div className="space-y-2">
                <button
                  onClick={() => exportPresupuestoExcel(data)}
                  className="w-full px-4 py-2 text-sm rounded-[2px] bg-[var(--brass)] text-[var(--paper)] hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exportar Excel
                </button>
                <Link href="/predictor">
                  <button className="w-full px-4 py-2 text-sm rounded-[2px] border border-[var(--hairline)] text-[var(--ink)] hover:border-[var(--brass)] transition-colors flex items-center justify-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Proyección financiera
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
