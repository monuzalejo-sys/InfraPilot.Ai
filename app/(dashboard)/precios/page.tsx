"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  Search, Plus, Trash2, Edit2, Check, X,
  Package, HardHat, Wrench, FileSpreadsheet,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
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

const CAT_CONFIG: Record<Category, { label: string; icon: React.ElementType }> = {
  material:  { label: "Material",     icon: Package },
  labor:     { label: "Mano de Obra", icon: HardHat },
  equipment: { label: "Equipo",       icon: Wrench  },
}

const EMPTY: Omit<PriceItem, "id"> = { code: "", description: "", unit: "", unit_price: 0, category: "material" }

export default function PreciosPage() {
  const [items, setItems]           = useState<PriceItem[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState("")
  const [catFilter, setCatFilter]   = useState<Category | "all">("all")
  const [showForm, setShowForm]     = useState(false)
  const [editId, setEditId]         = useState<string | null>(null)
  const [form, setForm]             = useState<Omit<PriceItem, "id">>(EMPTY)
  const [saving, setSaving]         = useState(false)
  const [importing, setImporting]   = useState(false)
  const [importMsg, setImportMsg]   = useState<string | null>(null)
  const [fetchError, setFetchError] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (catFilter !== "all") params.set("category", catFilter)
    if (search)              params.set("q", search)
    const res = await fetch(`/api/prices?${params}`)
    if (res.ok) { const { items } = await res.json(); setItems(items ?? []) } else { setFetchError(true) }
    setLoading(false)
  }, [catFilter, search])

  // Fetches on mount and whenever filters change. `load` sets state
  // synchronously as its first statement (setLoading(true)), which
  // react-hooks/set-state-in-effect flags for any effect that calls it —
  // there's no external subscription to move this into, it's a plain
  // fetch-on-filter-change. Suppressed narrowly with rationale.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

  const save = async () => {
    setSaving(true)
    const method = editId ? "PUT" : "POST"
    const url    = editId ? `/api/prices/${editId}` : "/api/prices"
    const res    = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    if (res.ok) { setShowForm(false); setEditId(null); setForm(EMPTY); load() }
    setSaving(false)
  }

  const del = async (id: string) => {
    if (!confirm("¿Eliminar este precio?")) return
    await fetch(`/api/prices/${id}`, { method: "DELETE" })
    load()
  }

  const startEdit = (item: PriceItem) => {
    setEditId(item.id)
    setForm({ code: item.code ?? "", description: item.description, unit: item.unit, unit_price: item.unit_price, category: item.category })
    setShowForm(true)
  }

  const importExcel = async (file: File) => {
    setImporting(true)
    setImportMsg(null)
    const form = new FormData()
    form.append("file", file)
    const res  = await fetch("/api/prices/import", { method: "POST", body: form })
    const json = await res.json()
    if (res.ok) {
      setImportMsg(`✓ ${json.imported} precios importados`)
      load()
    } else {
      setImportMsg(`Error: ${json.error}`)
    }
    setImporting(false)
  }

  const filtered = items.filter(i =>
    i.description.toLowerCase().includes(search.toLowerCase()) ||
    (i.code ?? "").toLowerCase().includes(search.toLowerCase())
  )

  const counts = {
    all:       items.length,
    material:  items.filter(i => i.category === "material").length,
    labor:     items.filter(i => i.category === "labor").length,
    equipment: items.filter(i => i.category === "equipment").length,
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {(!isSupabaseConfigured || fetchError) && <DemoNotice />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--ink)]">Base de Precios</h1>
          <p className="text-[var(--muted)] text-sm mt-0.5">{items.length} items — materiales, mano de obra y equipos</p>
        </div>
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) importExcel(f); e.target.value = "" }} />
          <button onClick={() => fileRef.current?.click()} disabled={importing}
            className="px-3 py-1.5 text-sm rounded-[2px] border border-[var(--hairline)] text-[var(--ink)] hover:border-[var(--brass)] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none">
            <FileSpreadsheet className="w-4 h-4 text-[var(--muted)]" />
            {importing ? "Importando…" : "Importar Excel"}
          </button>
          <button onClick={() => { setEditId(null); setForm(EMPTY); setShowForm(true) }}
            className="px-3 py-1.5 text-sm rounded-[2px] bg-[var(--brass)] text-[var(--paper)] hover:opacity-90 transition-opacity flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nuevo precio
          </button>
        </div>
      </div>

      {importMsg && (
        <div className={`text-sm px-4 py-3 rounded-[2px] border ${importMsg.startsWith("✓") ? "border-[var(--ok)]/30 text-[var(--ok)]" : "border-[var(--warn)]/30 text-[var(--warn)]"}`}>
          {importMsg}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar descripción o código…"
            className="w-full pl-9 pr-4 py-2 text-sm bg-transparent border border-[var(--hairline)] rounded-[2px] outline-none focus:border-[var(--brass)] transition-colors"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "material", "labor", "equipment"] as const).map((cat) => {
            const isAll = cat === "all"
            const cfg   = isAll ? null : CAT_CONFIG[cat]
            const count = counts[cat]
            const active = catFilter === cat
            return (
              <button key={cat} onClick={() => setCatFilter(cat)}
                className={`px-3 py-1.5 rounded-[2px] text-xs font-medium transition-colors border ${active ? "bg-[var(--brass)] text-[var(--paper)] border-[var(--brass)]" : "border-[var(--hairline)] text-[var(--muted)] hover:border-[var(--brass)]"}`}>
                {isAll ? `Todos (${count})` : `${cfg!.label} (${count})`}
              </button>
            )
          })}
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <EditorialCard title={editId ? "Editar precio" : "Nuevo precio"}>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <input value={form.code ?? ""} onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
              placeholder="Código (opcional)" className="px-3 py-2 text-sm bg-transparent border border-[var(--hairline)] rounded-[2px] outline-none focus:border-[var(--brass)] transition-colors" />
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Descripción *" className="md:col-span-2 px-3 py-2 text-sm bg-transparent border border-[var(--hairline)] rounded-[2px] outline-none focus:border-[var(--brass)] transition-colors" />
            <input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
              placeholder="Und (M3, ML…)" className="px-3 py-2 text-sm bg-transparent border border-[var(--hairline)] rounded-[2px] outline-none focus:border-[var(--brass)] transition-colors" />
            <input type="number" value={form.unit_price} onChange={e => setForm(f => ({ ...f, unit_price: +e.target.value }))}
              placeholder="Precio unit." className="px-3 py-2 text-sm bg-transparent border border-[var(--hairline)] rounded-[2px] outline-none focus:border-[var(--brass)] transition-colors" />
          </div>
          <div className="flex items-center gap-3 mt-3">
            <div className="flex gap-2">
              {(Object.entries(CAT_CONFIG) as [Category, typeof CAT_CONFIG[Category]][]).map(([key, cfg]) => {
                const Icon = cfg.icon
                const active = form.category === key
                return (
                  <button key={key} onClick={() => setForm(f => ({ ...f, category: key }))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] text-xs font-medium border transition-colors ${active ? "bg-[var(--brass)] text-[var(--paper)] border-[var(--brass)]" : "border-[var(--hairline)] text-[var(--muted)] hover:border-[var(--brass)]"}`}>
                    <Icon className="w-3.5 h-3.5" />{cfg.label}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-2 ml-auto">
              <button onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY) }}
                className="px-3 py-1.5 text-sm rounded-[2px] border border-[var(--hairline)] text-[var(--ink)] hover:bg-[var(--paper)] transition-colors">
                <X className="w-4 h-4" />
              </button>
              <button onClick={save} disabled={saving || !form.description || !form.unit}
                className="px-3 py-1.5 text-sm rounded-[2px] bg-[var(--brass)] text-[var(--paper)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:pointer-events-none flex items-center">
                <Check className="w-4 h-4 mr-1" />{saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        </EditorialCard>
      )}

      {/* Table */}
      <EditorialCard className="!p-0">
        {loading ? (
          <div className="py-16 text-center text-[var(--muted)] text-sm">Cargando…</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Package className="w-8 h-8 text-[var(--hairline)] mx-auto" />
            <p className="text-[var(--muted)] text-sm">
              {items.length === 0 ? "Importa tu Excel o agrega precios manualmente." : "No hay items que coincidan."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--hairline)]">
                  <th className="text-left px-4 py-3 w-20"><MonoLabel>Código</MonoLabel></th>
                  <th className="text-left px-4 py-3"><MonoLabel>Descripción</MonoLabel></th>
                  <th className="text-center px-4 py-3 w-16"><MonoLabel>Und</MonoLabel></th>
                  <th className="text-right px-4 py-3 w-32"><MonoLabel>Precio Unit.</MonoLabel></th>
                  <th className="text-center px-4 py-3 w-28"><MonoLabel>Categoría</MonoLabel></th>
                  <th className="w-16 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const cfg  = CAT_CONFIG[item.category]
                  const Icon = cfg.icon
                  return (
                    <tr key={item.id} className="border-b border-[var(--hairline)] hover:bg-[var(--paper)] transition-colors group">
                      <td className="px-4 py-2.5">
                        <span className="text-xs font-mono text-[var(--muted)]">{item.code ?? "—"}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-[var(--ink)] font-medium">{item.description}</span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="text-xs font-mono text-[var(--muted)]">{item.unit}</span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span className="font-mono font-semibold text-[var(--ink)]">{formatCurrency(item.unit_price)}</span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border border-[var(--hairline)] text-[var(--muted)]">
                          <Icon className="w-3 h-3" />{cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEdit(item)} className="p-1 rounded-[2px] hover:bg-[var(--card)] text-[var(--muted)] hover:text-[var(--brass)] transition-colors">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => del(item.id)} className="p-1 rounded-[2px] hover:bg-[var(--warn)]/10 text-[var(--muted)] hover:text-[var(--warn)] transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div className="px-4 py-2 border-t border-[var(--hairline)] text-xs text-[var(--muted)]">
              {filtered.length} items · Precios en COP
            </div>
          </div>
        )}
      </EditorialCard>
    </div>
  )
}
