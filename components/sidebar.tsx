"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  LayoutDashboard, Sparkles, FileText, Gavel, TrendingUp,
  Bot, ChevronRight, Building2, Plus, Settings, LogOut,
  Database, Calculator,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

interface UserInfo {
  email?: string
  full_name?: string
  company?: string
}

const navSections = [
  {
    label: "Workspace",
    items: [
      { href: "/dashboard",    label: "Dashboard",          icon: LayoutDashboard },
      { href: "/cotizador",    label: "Cotizador IA",       icon: Sparkles,  isAi: true },
      { href: "/presupuestos", label: "Presupuestos",       icon: FileText },
      { href: "/precios",      label: "Base de Precios",    icon: Database },
      { href: "/apus",         label: "APUs",               icon: Calculator },
    ],
  },
  {
    label: "Licitaciones",
    items: [
      { href: "/licitaciones", label: "Licitaciones",       icon: Gavel,     isAi: true },
    ],
  },
  {
    label: "Análisis",
    items: [
      { href: "/predictor",    label: "Predictor Financiero",icon: TrendingUp },
      { href: "/copiloto",     label: "Copiloto IA",        icon: Bot,       isAi: true, disabled: true },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const [user, setUser] = useState<UserInfo | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser({
          email:     user.email,
          full_name: user.user_metadata?.full_name,
          company:   user.user_metadata?.company,
        })
      }
    })
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const initial = (user?.full_name ?? user?.email ?? "U").charAt(0).toUpperCase()

  return (
    <aside className="flex flex-col h-full w-60 shrink-0 bg-slate-900 border-r border-slate-800">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-slate-800">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg gradient-ai">
          <Building2 className="w-4 h-4 text-white" />
        </div>
        <span className="text-white font-semibold text-sm tracking-tight">InfraPilot AI</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {navSections.map((section) => (
          <div key={section.label} className="mb-5">
            <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href
                const Icon     = item.icon
                const disabled = "disabled" in item && item.disabled
                return (
                  <li key={item.href}>
                    <Link
                      href={disabled ? "#" : item.href}
                      onClick={disabled ? (e) => e.preventDefault() : undefined}
                      className={cn(
                        "sidebar-item flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-all duration-100 group",
                        isActive
                          ? "sidebar-item-active text-white"
                          : disabled
                          ? "text-slate-600 cursor-not-allowed"
                          : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                      )}
                    >
                      <Icon className={cn(
                        "w-4 h-4 shrink-0 transition-colors",
                        isActive  ? (item.isAi ? "text-violet-400" : "text-indigo-400")
                          : disabled ? "text-slate-600"
                          : item.isAi ? "text-violet-500 group-hover:text-violet-400"
                          : "text-slate-500 group-hover:text-slate-300"
                      )} />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.isAi && !disabled && (
                        <span className="text-[9px] font-bold text-violet-400 bg-violet-900/40 border border-violet-800/50 px-1 py-0.5 rounded-sm">
                          IA
                        </span>
                      )}
                      {disabled && <ChevronRight className="w-3 h-3 text-slate-700 opacity-50" />}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}

        {/* New project shortcut */}
        <div className="mb-4">
          <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Acceso rápido
          </p>
          <Link
            href="/cotizador"
            className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all duration-100"
          >
            <Plus className="w-3 h-3" />
            <span>Nuevo presupuesto</span>
          </Link>
        </div>
      </nav>

      {/* User */}
      <div className="border-t border-slate-800 p-3 space-y-1">
        <div className="flex items-center gap-2.5 px-1 py-1 rounded-md">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-300 truncate">
              {user?.full_name ?? user?.email ?? "Usuario"}
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {user?.company ?? user?.email ?? ""}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-xs text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-100"
        >
          <LogOut className="w-3.5 h-3.5" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
