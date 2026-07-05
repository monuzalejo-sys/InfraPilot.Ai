"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Plus, Trash2, Edit2, Calculator,
  Package, HardHat, Wrench, Search, Check, X, ArrowLeft,
} from "lucide-react"
import { formatCurrency, timeAgo } from "@/lib/utils"
import { isSupabaseConfigured } from "@/lib/supabase/client"
import { DemoNotice } from "@/components/demo-notice"
import { EditorialCard, MonoLabel } from "@/components/editorial"

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

const CAT_CONFIG: Record<Category, { label: string; icon: React.ElementType }> = {
  material:  { label: "Material",     icon: Package },
  labor:     { label: "Mano de Obra", icon: HardHat },
  equipment: { label: "Equipo",       icon: Wrench  },
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
        <button onClick={onCancel} className="text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-[var(--ink)]">{initial ? "Editar APU" : "Nuevo APU"}</h2>
      </div>

      {/* APU Header */}
      <EditorialCard>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <input value={code} onChange={e => setCode(e.target.value)}
            placeholder="Código (ej: 01.01)" className="px-3 py-2 text-sm bg-transparent border border-[var(--hairline)] rounded-[2px] outline-none focus:border-[var(--brass)] transition-colors" />
          <input value={description} onChange={e => setDesc(e.target.value)}
            placeholder="Descripción de la actividad *" className="md:col-span-2 px-3 py-2 text-sm bg-transparent border border-[var(--hairline)] rounded-[2px] outline-none focus:border-[var(--brass)] transition-colors" />
          <input value={unit} onChange={e => setUnit(e.target.value)}
            placeholder="Unidad (M3, ML, UND…) *" className="px-3 py-2 text-sm bg-transparent border border-[var(--hairline)] rounded-[2px] outline-none focus:border-[var(--brass)] transition-colors" />
        </div>
        {notes !== undefined && (
          <input value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Notas adicionales (opcional)" className="mt-3 w-full px-3 py-2 text-sm bg-transparent border border-[var(--hairline)] rounded-[2px] outline-none focus:border-[var(--brass)] transition-colors" />
        )}
      </EditorialCard>

      {/* Components by category */}
      {CATS.map((cat) => {
        const cfg   = CAT_CONFIG[cat]
        const Icon  = cfg.icon
        const comps = components.filter(c => c.category === cat)
        const subtotal = comps.reduce((s, c) => s + c.unit_price * c.quantity, 0)

        return (
          <div key={cat} className="border border-[var(--hairline)] rounded-[2px] overflow-hidden">
            <div className="bg-[var(--card)] px-5 py-3 flex items-center justify-between border-b border-[var(--hairline)]">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-[var(--muted)]" />
                <MonoLabel>{cfg.label}</MonoLabel>
                <span className="text-xs text-[var(--muted)]">{comps.length} items</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold font-mono text-[var(--ink)]">{formatCurrency(subtotal)}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => { setPickerCat(cat); setAddingCat(cat); setShowPicker(true) }}
                    className="text-xs px-2 py-1 rounded-[2px] border border-[var(--hairline)] hover:border-[var(--brass)] transition-colors flex items-center gap-1 text-[var(--muted)]"
                  >
                    <Search className="w-3 h-3" /> De mis precios
                  </button>
                  <button
                    onClick={() => addManual(cat)}
                    className="text-xs px-2 py-1 rounded-[2px] border border-[var(--hairline)] hover:border-[var(--brass)] transition-colors flex items-center gap-1 text-[var(--muted)]"
                  >
                    <Plus className="w-3 h-3" /> Manual
                  </button>
                </div>
              </div>
            </div>

            {comps.length > 0 ? (
              <div className="divide-y divide-[var(--hairline)]">
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_32px] gap-2 px-5 py-2 mono-label">
                  <span>Descripción</span><span className="text-center">Und</span><span className="text-right">Precio Unit.</span><span className="text-right">Parcial</span><span></span>
                </div>
                {comps.map((c, idx) => {
                  const globalIdx = components.indexOf(c)
                  return (
                    <div key={idx} className="grid grid-cols-[2fr_1fr_1fr_1fr_32px] gap-2 px-5 py-2 items-center">
                      <input value={c.description} onChange={e => updateComp(globalIdx, "description", e.target.value)}
                        className="text-sm text-[var(--ink)] bg-transparent outline-none border-b border-transparent focus:border-[var(--brass)] transition-colors" />
                      <input value={c.unit} onChange={e => updateComp(globalIdx, "unit", e.target.value)}
                        className="text-xs font-mono text-center text-[var(--muted)] bg-transparent outline-none border-b border-transparent focus:border-[var(--brass)] transition-colors" />
                      <div className="text-right flex items-center justify-end gap-1">
                        <input type="number" value={c.unit_price} onChange={e => updateComp(globalIdx, "unit_price", +e.target.value)}
                          className="w-24 text-xs font-mono text-right text-[var(--ink)] bg-transparent outline-none border-b border-transparent focus:border-[var(--brass)] transition-colors" />
                        <span className="text-[10px] text-[var(--muted)]">× </span>
                        <input type="number" step="0.001" value={c.quantity} onChange={e => updateComp(globalIdx, "quantity", +e.target.value)}
                          className="w-16 text-xs font-mono text-right text-[var(--ink)] bg-transparent outline-none border-b border-transparent focus:border-[var(--brass)] transition-colors" />
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-mono font-semibold text-[var(--ink)]">{formatCurrency(c.unit_price * c.quantity)}</span>
                      </div>
                      <button onClick={() => removeComp(globalIdx)} className="p-1 rounded-[2px] hover:bg-[var(--warn)]/10 text-[var(--warn)] transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="px-5 py-4 text-xs text-[var(--muted)] text-center">
                Sin items — usa los botones para agregar
              </div>
            )}
          </div>
        )
      })}

      {/* Price picker modal */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--ink)]/40 p-4" onClick={() => setShowPicker(false)}>
          <div className="bg-[var(--card)] rounded-[2px] shadow-2xl w-full max-w-lg max-h-[70vh] flex flex-col border border-[var(--hairline)]" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 bg-[var(--paper)] border-b border-[var(--hairline)]">
              <h3 className="text-sm font-semibold text-[var(--ink)]">Seleccionar {CAT_CONFIG[addingCat].label}</h3>
              <div className="flex gap-2 mt-2">
                {CATS.map(c => (
                  <button key={c} onClick={() => setPickerCat(c)}
                    className={`text-xs px-2 py-1 rounded-[2px] font-medium transition-colors ${pickerCat === c ? "bg-[var(--brass)] text-[var(--paper)]" : "text-[var(--muted)] hover:bg-[var(--card)] border border-[var(--hairline)]"}`}>
                    {CAT_CONFIG[c].label}
                  </button>
                ))}
              </div>
            </div>
            <div className="px-4 py-3 border-b border-[var(--hairline)]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                <input value={pickerSearch} onChange={e => setPickerSearch(e.target.value)} autoFocus
                  placeholder="Buscar…" className="w-full pl-9 pr-4 py-2 text-sm bg-transparent border border-[var(--hairline)] rounded-[2px] outline-none focus:border-[var(--brass)]" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {pickerFiltered.length === 0 ? (
                <div className="py-8 text-center text-[var(--muted)] text-sm">No hay items en esta categoría</div>
              ) : pickerFiltered.map(item => (
                <button key={item.id} onClick={() => addComponent(item)}
                  className="w-full flex items-center justify-between px-5 py-3 hover:bg-[var(--paper)] transition-colors text-left border-b border-[var(--hairline)]">
                  <div>
                    <p className="text-sm font-medium text-[var(--ink)]">{item.description}</p>
                    <p className="text-xs text-[var(--muted)]">{item.unit} · {item.code ?? ""}</p>
                  </div>
                  <span className="text-sm font-mono font-semibold text-[var(--brass)] shrink-0">{formatCurrency(item.unit_price)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Total */}
      <EditorialCard>
        <div className="space-y-2 text-sm">
          {CATS.map(cat => {
            const sub = components.filter(c => c.category === cat).reduce((s,c) => s + c.unit_price * c.quantity, 0)
            if (!sub) return null
            return (
              <div key={cat} className="flex justify-between text-[var(--muted)]">
                <span>{CAT_CONFIG[cat].label}</span>
                <span className="font-mono">{formatCurrency(sub)}</span>
              </div>
            )
          })}
          {components.some(c => c.category === "labor") && (
            <div className="flex justify-between text-[var(--muted)] text-xs">
              <span>Herramienta menor (5% M.O.) — se agrega automáticamente</span>
              <span className="font-mono">{formatCurrency(byTool)}</span>
            </div>
          )}
          <div className="h-px bg-[var(--hairline)]" />
          <div className="flex justify-between font-semibold text-[var(--ink)] text-base">
            <span>TOTAL COSTO DIRECTO / {unit || "UND"}</span>
            <span className="font-mono">{formatCurrency(total + (components.some(c => c.category === "labor") ? byTool : 0))}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-5 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm rounded-[2px] border border-[var(--hairline)] text-[var(--ink)] hover:bg-[var(--paper)] transition-colors">
            Cancelar
          </button>
          <button onClick={save} disabled={saving || !description || !unit}
            className="px-4 py-2 text-sm rounded-[2px] bg-[var(--brass)] text-[var(--paper)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2">
            <Check className="w-4 h-4" />{saving ? "Guardando…" : "Guardar APU"}
          </button>
        </div>
      </EditorialCard>
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

  // Initial + refetch load. `load` sets state synchronously as its first
  // statement (setLoading(true)) — react-hooks/set-state-in-effect flags any
  // setState reachable synchronously from the effect body, including through
  // a called function. There's no external-system subscription here (it's a
  // plain fetch-on-mount), so there's no rewrite that removes the setState
  // without changing the loading-flag UX; suppressed narrowly with rationale.
  // eslint-disable-next-line react-hooks/set-state-in-effect
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
          <h1 className="text-2xl font-semibold text-[var(--ink)]">APUs</h1>
          <p className="text-[var(--muted)] text-sm mt-0.5">Análisis de Precios Unitarios — {apus.length} APUs guardados</p>
        </div>
        <button
          onClick={() => { setEditApu(null); setView("builder") }}
          className="px-4 py-2 text-sm rounded-[2px] bg-[var(--brass)] text-[var(--paper)] hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo APU
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-[var(--muted)] text-sm">Cargando…</div>
      ) : apus.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <Calculator className="w-10 h-10 text-[var(--hairline)] mx-auto" />
          <p className="text-[var(--muted)]">Aún no hay APUs. Crea el primero con tu base de precios.</p>
          <button
            onClick={() => setView("builder")}
            className="px-4 py-2 text-sm rounded-[2px] bg-[var(--brass)] text-[var(--paper)] hover:opacity-90 transition-opacity inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Crear APU
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {apus.map((apu) => {
            const matSub = apu.apu_components?.filter(c => c.category === "material").reduce((s,c) => s + c.unit_price * c.quantity, 0) ?? 0
            const labSub = apu.apu_components?.filter(c => c.category === "labor").reduce((s,c) => s + c.unit_price * c.quantity, 0) ?? 0
            const eqSub  = apu.apu_components?.filter(c => c.category === "equipment").reduce((s,c) => s + c.unit_price * c.quantity, 0) ?? 0
            return (
              <EditorialCard key={apu.id} className="hover:border-[var(--brass)] transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {apu.code && <span className="text-xs font-mono text-[var(--muted)] bg-[var(--paper)] px-2 py-0.5 rounded-[2px]">{apu.code}</span>}
                      <h3 className="font-semibold text-[var(--ink)] truncate">{apu.description}</h3>
                      <span className="text-xs text-[var(--muted)] shrink-0">/ {apu.unit}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
                      {matSub > 0 && <span className="flex items-center gap-1"><Package className="w-3 h-3" /> Mat: {formatCurrency(matSub)}</span>}
                      {labSub > 0 && <span className="flex items-center gap-1"><HardHat className="w-3 h-3" /> M.O.: {formatCurrency(labSub)}</span>}
                      {eqSub  > 0 && <span className="flex items-center gap-1"><Wrench  className="w-3 h-3" /> Eq: {formatCurrency(eqSub)}</span>}
                      <span>{timeAgo(new Date(apu.created_at))}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 ml-4">
                    <div className="text-right">
                      <p className="text-lg font-semibold font-mono text-[var(--ink)]">{formatCurrency(apu.total_cost)}</p>
                      <p className="text-xs text-[var(--muted)]">/ {apu.unit}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditApu(apu); setView("builder") }}
                        className="p-2 rounded-[2px] hover:bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--brass)] transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => del(apu.id)}
                        className="p-2 rounded-[2px] hover:bg-[var(--warn)]/10 text-[var(--muted)] hover:text-[var(--warn)] transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </EditorialCard>
            )
          })}
        </div>
      )}
    </div>
  )
}
