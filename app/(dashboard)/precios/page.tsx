"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  Search, Plus, Trash2, Edit2, Check, X,
  Package, HardHat, Wrench, FileSpreadsheet,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
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

const CAT_CONFIG: Record<Category, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  material:  { label: "Material",    color: "text-indigo-600",  bg: "bg-indigo-50",  icon: Package },
  labor:     { label: "Mano de Obra",color: "text-violet-600",  bg: "bg-violet-50",  icon: HardHat },
  equipment: { label: "Equipo",      color: "text-emerald-600", bg: "bg-emerald-50", icon: Wrench  },
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
          <h1 className="text-2xl font-bold text-slate-900">Base de Precios</h1>
          <p className="text-slate-500 text-sm mt-0.5">{items.length} items — materiales, mano de obra y equipos</p>
        </div>
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) importExcel(f); e.target.value = "" }} />
          <Button variant="outline" size="sm" className="gap-2" onClick={() => fileRef.current?.click()} disabled={importing}>
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            {importing ? "Importando…" : "Importar Excel"}
          </Button>
          <Button variant="ai" size="sm" className="gap-2" onClick={() => { setEditId(null); setForm(EMPTY); setShowForm(true) }}>
            <Plus className="w-4 h-4" />
            Nuevo precio
          </Button>
        </div>
      </div>

      {importMsg && (
        <div className={`text-sm px-4 py-3 rounded-xl ${importMsg.startsWith("✓") ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
          {importMsg}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar descripción o código…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "material", "labor", "equipment"] as const).map((cat) => {
            const isAll = cat === "all"
            const cfg   = isAll ? null : CAT_CONFIG[cat]
            const count = counts[cat]
            return (
              <button key={cat} onClick={() => setCatFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${catFilter === cat ? (isAll ? "bg-slate-900 text-white" : `${cfg!.bg} ${cfg!.color} ring-2 ring-current`) : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                {isAll ? `Todos (${count})` : `${cfg!.label} (${count})`}
              </button>
            )
          })}
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="p-5 border-indigo-200 bg-indigo-50/30">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">{editId ? "Editar precio" : "Nuevo precio"}</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <input value={form.code ?? ""} onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
              placeholder="Código (opcional)" className="px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400" />
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Descripción *" className="md:col-span-2 px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400" />
            <input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
              placeholder="Und (M3, ML…)" className="px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400" />
            <input type="number" value={form.unit_price} onChange={e => setForm(f => ({ ...f, unit_price: +e.target.value }))}
              placeholder="Precio unit." className="px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400" />
          </div>
          <div className="flex items-center gap-3 mt-3">
            <div className="flex gap-2">
              {(Object.entries(CAT_CONFIG) as [Category, typeof CAT_CONFIG[Category]][]).map(([key, cfg]) => {
                const Icon = cfg.icon
                return (
                  <button key={key} onClick={() => setForm(f => ({ ...f, category: key }))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${form.category === key ? `${cfg.bg} ${cfg.color} border-current` : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                    <Icon className="w-3.5 h-3.5" />{cfg.label}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" size="sm" onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY) }}>
                <X className="w-4 h-4" />
              </Button>
              <Button variant="ai" size="sm" onClick={save} disabled={saving || !form.description || !form.unit}>
                <Check className="w-4 h-4 mr-1" />{saving ? "Guardando…" : "Guardar"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Table */}
      <Card>
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">Cargando…</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Package className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-slate-500 text-sm">
              {items.length === 0 ? "Importa tu Excel o agrega precios manualmente." : "No hay items que coincidan."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-20">Código</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Descripción</th>
                  <th className="text-center px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-16">Und</th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-32">Precio Unit.</th>
                  <th className="text-center px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-28">Categoría</th>
                  <th className="w-16 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const cfg  = CAT_CONFIG[item.category]
                  const Icon = cfg.icon
                  return (
                    <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                      <td className="px-4 py-2.5">
                        <span className="text-xs font-mono text-slate-400">{item.code ?? "—"}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-slate-800 font-medium">{item.description}</span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="text-xs font-mono text-slate-500">{item.unit}</span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span className="font-mono font-semibold text-slate-800">{formatCurrency(item.unit_price)}</span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${cfg.bg} ${cfg.color}`}>
                          <Icon className="w-3 h-3" />{cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEdit(item)} className="p-1 rounded hover:bg-indigo-100 text-indigo-500 transition-colors">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => del(item.id)} className="p-1 rounded hover:bg-rose-100 text-rose-500 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div className="px-4 py-2 border-t border-slate-50 text-xs text-slate-400">
              {filtered.length} items · Precios en COP
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
