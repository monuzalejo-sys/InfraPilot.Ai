"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Plus, Trash2, Edit2, Check, X, Building2, Globe, Phone, Mail,
} from "lucide-react"
import { isSupabaseConfigured } from "@/lib/supabase/client"
import { DemoNotice } from "@/components/demo-notice"
import { MigrationNotice } from "@/components/migration-notice"
import { EditorialCard, MonoLabel } from "@/components/editorial"

interface Supplier {
  id: string
  name: string
  contact?: string
  phone?: string
  email?: string
  website?: string
  notes?: string
}

type SupplierForm = Omit<Supplier, "id">

const EMPTY: SupplierForm = { name: "", contact: "", phone: "", email: "", website: "", notes: "" }

export default function ProveedoresPage() {
  const [items, setItems]                 = useState<Supplier[]>([])
  const [loading, setLoading]             = useState(true)
  const [showForm, setShowForm]           = useState(false)
  const [editId, setEditId]               = useState<string | null>(null)
  const [form, setForm]                   = useState<SupplierForm>(EMPTY)
  const [saving, setSaving]               = useState(false)
  const [fetchError, setFetchError]       = useState(false)
  const [migrationRequired, setMigrationRequired] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setFetchError(false)
    setMigrationRequired(false)
    try {
      const res = await fetch("/api/suppliers")
      if (res.status === 503) {
        const json = await res.json().catch(() => null)
        if (json?.error === "MIGRATION_002_REQUIRED") { setMigrationRequired(true) } else { setFetchError(true) }
      } else if (res.ok) {
        const { items } = await res.json()
        setItems(items ?? [])
      } else {
        setFetchError(true)
      }
    } catch {
      setFetchError(true)
    }
    setLoading(false)
  }, [])

  // Fetches on mount. `load` sets state synchronously as its first statement
  // (setLoading(true)), which react-hooks/set-state-in-effect flags — there's
  // no external subscription to move this into, it's a plain fetch-on-mount.
  // Suppressed narrowly with rationale.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

  const save = async () => {
    setSaving(true)
    const method = editId ? "PATCH" : "POST"
    const url    = editId ? `/api/suppliers/${editId}` : "/api/suppliers"
    const res    = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    if (res.ok) { setShowForm(false); setEditId(null); setForm(EMPTY); load() }
    setSaving(false)
  }

  const del = async (id: string) => {
    if (!confirm("¿Eliminar este proveedor?")) return
    await fetch(`/api/suppliers/${id}`, { method: "DELETE" })
    load()
  }

  const startEdit = (item: Supplier) => {
    setEditId(item.id)
    setForm({
      name: item.name,
      contact: item.contact ?? "",
      phone: item.phone ?? "",
      email: item.email ?? "",
      website: item.website ?? "",
      notes: item.notes ?? "",
    })
    setShowForm(true)
  }

  const disabled = !isSupabaseConfigured || migrationRequired

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {!isSupabaseConfigured && <DemoNotice />}
      {isSupabaseConfigured && migrationRequired && <MigrationNotice />}
      {isSupabaseConfigured && !migrationRequired && fetchError && <DemoNotice />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--ink)]">Proveedores</h1>
          <p className="text-[var(--muted)] text-sm mt-0.5">{items.length} proveedores registrados</p>
        </div>
        <button onClick={() => { setEditId(null); setForm(EMPTY); setShowForm(true) }} disabled={disabled}
          className="px-3 py-1.5 text-sm rounded-[2px] bg-[var(--brass)] text-[var(--paper)] hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none">
          <Plus className="w-4 h-4" />
          Nuevo proveedor
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <EditorialCard title={editId ? "Editar proveedor" : "Nuevo proveedor"}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Nombre *" className="md:col-span-2 px-3 py-2 text-sm bg-transparent border border-[var(--hairline)] rounded-[2px] outline-none focus:border-[var(--brass)] transition-colors" />
            <input value={form.contact ?? ""} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
              placeholder="Contacto" className="px-3 py-2 text-sm bg-transparent border border-[var(--hairline)] rounded-[2px] outline-none focus:border-[var(--brass)] transition-colors" />
            <input value={form.phone ?? ""} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="Teléfono" className="px-3 py-2 text-sm bg-transparent border border-[var(--hairline)] rounded-[2px] outline-none focus:border-[var(--brass)] transition-colors" />
            <input value={form.email ?? ""} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="Email" className="px-3 py-2 text-sm bg-transparent border border-[var(--hairline)] rounded-[2px] outline-none focus:border-[var(--brass)] transition-colors" />
            <input value={form.website ?? ""} onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
              placeholder="Sitio web" className="px-3 py-2 text-sm bg-transparent border border-[var(--hairline)] rounded-[2px] outline-none focus:border-[var(--brass)] transition-colors" />
            <textarea value={form.notes ?? ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Notas" rows={1}
              className="md:col-span-3 px-3 py-2 text-sm bg-transparent border border-[var(--hairline)] rounded-[2px] outline-none focus:border-[var(--brass)] transition-colors resize-none" />
          </div>
          <div className="flex items-center gap-2 mt-3 justify-end">
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY) }}
              className="px-3 py-1.5 text-sm rounded-[2px] border border-[var(--hairline)] text-[var(--ink)] hover:bg-[var(--paper)] transition-colors">
              <X className="w-4 h-4" />
            </button>
            <button onClick={save} disabled={saving || !form.name}
              className="px-3 py-1.5 text-sm rounded-[2px] bg-[var(--brass)] text-[var(--paper)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:pointer-events-none flex items-center">
              <Check className="w-4 h-4 mr-1" />{saving ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </EditorialCard>
      )}

      {/* List */}
      <EditorialCard className="!p-0">
        {loading ? (
          <div className="py-16 text-center text-[var(--muted)] text-sm">Cargando…</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Building2 className="w-8 h-8 text-[var(--hairline)] mx-auto" />
            <p className="text-[var(--muted)] text-sm">Aún no tienes proveedores.</p>
            <button onClick={() => { setEditId(null); setForm(EMPTY); setShowForm(true) }} disabled={disabled}
              className="px-3 py-1.5 text-sm rounded-[2px] bg-[var(--brass)] text-[var(--paper)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:pointer-events-none inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Agregar el primero
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--hairline)]">
                  <th className="text-left px-4 py-3"><MonoLabel>Nombre</MonoLabel></th>
                  <th className="text-left px-4 py-3"><MonoLabel>Contacto</MonoLabel></th>
                  <th className="text-left px-4 py-3"><MonoLabel>Web</MonoLabel></th>
                  <th className="text-left px-4 py-3"><MonoLabel>Notas</MonoLabel></th>
                  <th className="w-16 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-[var(--hairline)] hover:bg-[var(--paper)] transition-colors group">
                    <td className="px-4 py-2.5">
                      <span className="text-[var(--ink)] font-medium">{item.name}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-col gap-0.5 text-xs text-[var(--muted)]">
                        {item.contact && <span>{item.contact}</span>}
                        {item.phone && (
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3" />{item.phone}
                          </span>
                        )}
                        {item.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />{item.email}
                          </span>
                        )}
                        {!item.contact && !item.phone && !item.email && "—"}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      {item.website ? (
                        <a href={item.website} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-[var(--brass)] hover:underline">
                          <Globe className="w-3 h-3" />{item.website}
                        </a>
                      ) : (
                        <span className="text-xs text-[var(--muted)]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 max-w-xs">
                      <span className="text-xs text-[var(--muted)] truncate block">{item.notes || "—"}</span>
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
                ))}
              </tbody>
            </table>
            <div className="px-4 py-2 border-t border-[var(--hairline)] text-xs text-[var(--muted)]">
              {items.length} proveedores
            </div>
          </div>
        )}
      </EditorialCard>
    </div>
  )
}
