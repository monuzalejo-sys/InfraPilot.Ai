"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Plus, Trash2, Edit2, Calculator,
  Package, HardHat, Wrench, Search, Check, X, ArrowLeft,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatCurrency, timeAgo } from "@/lib/utils"
import { isSupabaseConfigured } from "@/lib/supabase/client"
import { DemoNotice } from "@/components/demo-notice"

type Category = "material" | "labor" | "equipment"

interface PriceItem {
  id: string
  code?: string
  description: string
  unit: string
  unit_price: number
  category: Category
}

interface Component {
  id?: string
  price_item_id?: string
  category: Category
  description: string
  unit: string
  unit_price: number
  quantity: number
}

interface APU {
  id: string
  code?: string
  description: string
  unit: string
  total_cost: number
  notes?: string
  created_at: string
  apu_components: Component[]
}

const CAT_CONFIG: Record<Category, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  material:  { label: "Material",     color: "text-indigo-700",  bg: "bg-indigo-50",  border: "border-indigo-200", icon: Package },
  labor:     { label: "Mano de Obra", color: "text-violet-700",  bg: "bg-violet-50",  border: "border-violet-200", icon: HardHat },
  equipment: { label: "Equipo",       color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200",icon: Wrench  },
}

const CATS: Category[] = ["material", "labor", "equipment"]

const EMPTY_COMP = (): Component => ({ category: "material", description: "", unit: "", unit_price: 0, quantity: 1 })

// ── APU Builder ─────────────────────────────────────────────────
function APUBuilder({
  initial,
  onSave,
  onCancel,
}: {
  initial?: APU | null
  onSave: () => void
  onCancel: () => void
}) {
  const [code, setCode]         = useState(initial?.code ?? "")
  const [description, setDesc]  = useState(initial?.description ?? "")
  const [unit, setUnit]         = useState(initial?.unit ?? "")
  const [notes, setNotes]       = useState(initial?.notes ?? "")
  const [components, setComps]  = useState<Component[]>(initial?.apu_components ?? [])
  const [saving, setSaving]     = useState(false)
  const [priceItems, setPrices] = useState<PriceItem[]>([])
  const [pickerCat, setPickerCat] = useState<Category>("material")
  const [pickerSearch, setPickerSearch] = useState("")
  const [showPicker, setShowPicker]     = useState(false)
  const [addingCat, setAddingCat]       = useState<Category>("material")

  useEffect(() => {
    fetch("/api/prices").then(r => r.json()).then(({ items }) => setPrices(items ?? []))
  }, [])

  const total = components.reduce((s, c) => s + c.unit_price * c.quantity, 0)
  const byTool = total * 0.05  // herramienta menor 5%

  const addComponent = (item: PriceItem) => {
    setComps(cs => [...cs, {
      price_item_id: item.id,
      category:      item.category,
      description:   item.description,
      unit:          item.unit,
      unit_price:    item.unit_price,
      quantity:      1,
    }])
    setShowPicker(false)
    setPickerSearch("")
  }

  const addManual = (cat: Category) => {
    setComps(cs => [...cs, { ...EMPTY_COMP(), category: cat }])
  }

  const updateComp = (i: number, field: keyof Component, value: string | number) => {
    setComps(cs => cs.map((c, idx) => idx === i ? { ...c, [field]: value } : c))
  }

  const removeComp = (i: number) => setComps(cs => cs.filter((_, idx) => idx !== i))

  const save = async () => {
    if (!description || !unit) return
    setSaving(true)
    const method = initial ? "PUT" : "POST"
    const url    = initial ? `/api/apus/${initial.id}` : "/api/apus"
    const allComps = [
      ...components,
      // Auto-add herramienta menor if there's labor
      ...(components.some(c => c.category === "labor") ? [{
        category:    "equipment" as Category,
        description: "Herramienta menor 5% M.O.",
        unit:        "%",
        unit_price:  byTool,
        quantity:    1,
      }] : [])
    ]
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, description, unit, notes, components: allComps }),
    })
    setSaving(false)
    onSave()
  }

  const pickerFiltered = priceItems
    .filter(p => p.category === pickerCat)
    .filter(p => !pickerSearch || p.description.toLowerCase().includes(pickerSearch.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onCancel} className="text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-slate-900">{initial ? "Editar APU" : "Nuevo APU"}</h2>
      </div>

      {/* APU Header */}
      <Card className="p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <input value={code} onChange={e => setCode(e.target.value)}
            placeholder="Código (ej: 01.01)" className="px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400" />
          <input value={description} onChange={e => setDesc(e.target.value)}
            placeholder="Descripción de la actividad *" className="md:col-span-2 px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400" />
          <input value={unit} onChange={e => setUnit(e.target.value)}
            placeholder="Unidad (M3, ML, UND…) *" className="px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400" />
        </div>
        {notes !== undefined && (
          <input value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Notas adicionales (opcional)" className="mt-3 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400" />
        )}
      </Card>

      {/* Components by category */}
      {CATS.map((cat) => {
        const cfg   = CAT_CONFIG[cat]
        const Icon  = cfg.icon
        const comps = components.filter(c => c.category === cat)
        const subtotal = comps.reduce((s, c) => s + c.unit_price * c.quantity, 0)

        return (
          <div key={cat} className={`border ${cfg.border} rounded-2xl overflow-hidden`}>
            <div className={`${cfg.bg} px-5 py-3 flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${cfg.color}`} />
                <span className={`text-sm font-bold uppercase tracking-wide ${cfg.color}`}>{cfg.label}</span>
                <span className="text-xs text-slate-400">{comps.length} items</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-bold font-mono ${cfg.color}`}>{formatCurrency(subtotal)}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => { setPickerCat(cat); setAddingCat(cat); setShowPicker(true) }}
                    className="text-xs px-2 py-1 rounded-lg bg-white/70 border border-current/20 hover:bg-white transition-colors flex items-center gap-1"
                  >
                    <Search className={`w-3 h-3 ${cfg.color}`} /> De mis precios
                  </button>
                  <button
                    onClick={() => addManual(cat)}
                    className="text-xs px-2 py-1 rounded-lg bg-white/70 border border-current/20 hover:bg-white transition-colors flex items-center gap-1"
                  >
                    <Plus className={`w-3 h-3 ${cfg.color}`} /> Manual
                  </button>
                </div>
              </div>
            </div>

            {comps.length > 0 ? (
              <div className="divide-y divide-slate-100">
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_32px] gap-2 px-5 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  <span>Descripción</span><span className="text-center">Und</span><span className="text-right">Precio Unit.</span><span className="text-right">Parcial</span><span></span>
                </div>
                {comps.map((c, idx) => {
                  const globalIdx = components.indexOf(c)
                  return (
                    <div key={idx} className="grid grid-cols-[2fr_1fr_1fr_1fr_32px] gap-2 px-5 py-2 items-center">
                      <input value={c.description} onChange={e => updateComp(globalIdx, "description", e.target.value)}
                        className="text-sm text-slate-700 bg-transparent outline-none border-b border-transparent focus:border-indigo-300 transition-colors" />
                      <input value={c.unit} onChange={e => updateComp(globalIdx, "unit", e.target.value)}
                        className="text-xs font-mono text-center text-slate-500 bg-transparent outline-none border-b border-transparent focus:border-indigo-300 transition-colors" />
                      <div className="text-right flex items-center justify-end gap-1">
                        <input type="number" value={c.unit_price} onChange={e => updateComp(globalIdx, "unit_price", +e.target.value)}
                          className="w-24 text-xs font-mono text-right text-slate-700 bg-transparent outline-none border-b border-transparent focus:border-indigo-300 transition-colors" />
                        <span className="text-[10px] text-slate-400">× </span>
                        <input type="number" step="0.001" value={c.quantity} onChange={e => updateComp(globalIdx, "quantity", +e.target.value)}
                          className="w-16 text-xs font-mono text-right text-slate-700 bg-transparent outline-none border-b border-transparent focus:border-indigo-300 transition-colors" />
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-mono font-semibold text-slate-800">{formatCurrency(c.unit_price * c.quantity)}</span>
                      </div>
                      <button onClick={() => removeComp(globalIdx)} className="p-1 rounded hover:bg-rose-100 text-rose-400 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="px-5 py-4 text-xs text-slate-400 text-center">
                Sin items — usa los botones para agregar
              </div>
            )}
          </div>
        )
      })}

      {/* Price picker modal */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowPicker(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[70vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className={`px-5 py-4 ${CAT_CONFIG[addingCat].bg} border-b border-slate-200 rounded-t-2xl`}>
              <h3 className={`text-sm font-bold ${CAT_CONFIG[addingCat].color}`}>Seleccionar {CAT_CONFIG[addingCat].label}</h3>
              <div className="flex gap-2 mt-2">
                {CATS.map(c => (
                  <button key={c} onClick={() => setPickerCat(c)}
                    className={`text-xs px-2 py-1 rounded-lg font-medium transition-colors ${pickerCat === c ? "bg-white shadow text-slate-800" : "text-slate-500 hover:bg-white/50"}`}>
                    {CAT_CONFIG[c].label}
                  </button>
                ))}
              </div>
            </div>
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input value={pickerSearch} onChange={e => setPickerSearch(e.target.value)} autoFocus
                  placeholder="Buscar…" className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {pickerFiltered.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">No hay items en esta categoría</div>
              ) : pickerFiltered.map(item => (
                <button key={item.id} onClick={() => addComponent(item)}
                  className="w-full flex items-center justify-between px-5 py-3 hover:bg-indigo-50 transition-colors text-left border-b border-slate-50">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{item.description}</p>
                    <p className="text-xs text-slate-400">{item.unit} · {item.code ?? ""}</p>
                  </div>
                  <span className="text-sm font-mono font-bold text-indigo-600 shrink-0">{formatCurrency(item.unit_price)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Total */}
      <Card className="p-5">
        <div className="space-y-2 text-sm">
          {CATS.map(cat => {
            const sub = components.filter(c => c.category === cat).reduce((s,c) => s + c.unit_price * c.quantity, 0)
            if (!sub) return null
            return (
              <div key={cat} className="flex justify-between text-slate-500">
                <span>{CAT_CONFIG[cat].label}</span>
                <span className="font-mono">{formatCurrency(sub)}</span>
              </div>
            )
          })}
          {components.some(c => c.category === "labor") && (
            <div className="flex justify-between text-slate-400 text-xs">
              <span>Herramienta menor (5% M.O.) — se agrega automáticamente</span>
              <span className="font-mono">{formatCurrency(byTool)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-bold text-slate-900 text-base">
            <span>TOTAL COSTO DIRECTO / {unit || "UND"}</span>
            <span className="font-mono">{formatCurrency(total + (components.some(c => c.category === "labor") ? byTool : 0))}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-5 justify-end">
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button variant="ai" onClick={save} disabled={saving || !description || !unit} className="gap-2">
            <Check className="w-4 h-4" />{saving ? "Guardando…" : "Guardar APU"}
          </Button>
        </div>
      </Card>
    </div>
  )
}

// ── List view ─────────────────────────────────────────────────
export default function APUsPage() {
  const [apus, setApus]           = useState<APU[]>([])
  const [loading, setLoading]     = useState(true)
  const [view, setView]           = useState<"list" | "builder">("list")
  const [editApu, setEditApu]     = useState<APU | null>(null)
  const [fetchError, setFetchError] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/api/apus")
    if (res.ok) { const { apus } = await res.json(); setApus(apus ?? []) } else { setFetchError(true) }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const del = async (id: string) => {
    if (!confirm("¿Eliminar este APU?")) return
    await fetch(`/api/apus/${id}`, { method: "DELETE" })
    load()
  }

  if (view === "builder") {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <APUBuilder
          initial={editApu}
          onSave={() => { setView("list"); setEditApu(null); load() }}
          onCancel={() => { setView("list"); setEditApu(null) }}
        />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {(!isSupabaseConfigured || fetchError) && <DemoNotice />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">APUs</h1>
          <p className="text-slate-500 text-sm mt-0.5">Análisis de Precios Unitarios — {apus.length} APUs guardados</p>
        </div>
        <Button variant="ai" className="gap-2" onClick={() => { setEditApu(null); setView("builder") }}>
          <Plus className="w-4 h-4" />
          Nuevo APU
        </Button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Cargando…</div>
      ) : apus.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <Calculator className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-slate-500">Aún no hay APUs. Crea el primero con tu base de precios.</p>
          <Button variant="ai" onClick={() => setView("builder")} className="gap-2">
            <Plus className="w-4 h-4" /> Crear APU
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {apus.map((apu) => {
            const matSub = apu.apu_components?.filter(c => c.category === "material").reduce((s,c) => s + c.unit_price * c.quantity, 0) ?? 0
            const labSub = apu.apu_components?.filter(c => c.category === "labor").reduce((s,c) => s + c.unit_price * c.quantity, 0) ?? 0
            const eqSub  = apu.apu_components?.filter(c => c.category === "equipment").reduce((s,c) => s + c.unit_price * c.quantity, 0) ?? 0
            return (
              <Card key={apu.id} className="p-5 hover:border-indigo-200 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {apu.code && <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{apu.code}</span>}
                      <h3 className="font-semibold text-slate-900 truncate">{apu.description}</h3>
                      <span className="text-xs text-slate-400 shrink-0">/ {apu.unit}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      {matSub > 0 && <span className="flex items-center gap-1"><Package className="w-3 h-3 text-indigo-400" /> Mat: {formatCurrency(matSub)}</span>}
                      {labSub > 0 && <span className="flex items-center gap-1"><HardHat className="w-3 h-3 text-violet-400" /> M.O.: {formatCurrency(labSub)}</span>}
                      {eqSub  > 0 && <span className="flex items-center gap-1"><Wrench  className="w-3 h-3 text-emerald-400" /> Eq: {formatCurrency(eqSub)}</span>}
                      <span>{timeAgo(new Date(apu.created_at))}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 ml-4">
                    <div className="text-right">
                      <p className="text-lg font-bold font-mono text-slate-900">{formatCurrency(apu.total_cost)}</p>
                      <p className="text-xs text-slate-400">/ {apu.unit}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditApu(apu); setView("builder") }}
                        className="p-2 rounded-lg hover:bg-indigo-100 text-indigo-500 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => del(apu.id)}
                        className="p-2 rounded-lg hover:bg-rose-100 text-rose-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
