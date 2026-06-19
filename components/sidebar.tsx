"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Sparkles,
  FileText,
  BookOpen,
  Gavel,
  FolderOpen,
  TrendingUp,
  Bot,
  ChevronRight,
  Building2,
  Plus,
  Settings,
  CreditCard,
  LogOut,
  CheckSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { mockUser, mockOrg } from "@/lib/mock-data"

const navSections = [
  {
    label: "Workspace",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/cotizador", label: "Cotizador IA", icon: Sparkles, isAi: true },
      { href: "/presupuestos", label: "Presupuestos", icon: FileText },
      { href: "/biblioteca", label: "Biblioteca APUs", icon: BookOpen, disabled: true },
    ],
  },
  {
    label: "Licitaciones",
    items: [
      { href: "/licitaciones", label: "Licitaciones", icon: Gavel, isAi: true },
      { href: "/documentos", label: "Centro Documental", icon: FolderOpen, disabled: true },
    ],
  },
  {
    label: "Análisis",
    items: [
      { href: "/predictor", label: "Predictor Financiero", icon: TrendingUp },
      { href: "/copiloto", label: "Copiloto IA", icon: Bot, isAi: true, disabled: true },
    ],
  },
]

const recentProjects = [
  { name: "Edificio Los Álamos", type: "edificacion", status: "approved" },
  { name: "Vía San Martín km 12", type: "vial", status: "review" },
  { name: "PTAR Lurín", type: "hidraulica", status: "draft" },
]

const statusDot: Record<string, string> = {
  approved: "bg-emerald-400",
  review: "bg-amber-400",
  draft: "bg-slate-500",
}

const planLabel: Record<string, string> = {
  free: "Free",
  starter: "Starter",
  professional: "Pro",
  enterprise: "Enterprise",
}

export function Sidebar() {
  const pathname = usePathname()

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
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.disabled ? "#" : item.href}
                      onClick={item.disabled ? (e) => e.preventDefault() : undefined}
                      className={cn(
                        "sidebar-item flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-all duration-100 group",
                        isActive
                          ? "sidebar-item-active text-white"
                          : item.disabled
                          ? "text-slate-600 cursor-not-allowed"
                          : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-4 h-4 shrink-0 transition-colors",
                          isActive
                            ? item.isAi
                              ? "text-violet-400"
                              : "text-indigo-400"
                            : item.disabled
                            ? "text-slate-600"
                            : item.isAi
                            ? "text-violet-500 group-hover:text-violet-400"
                            : "text-slate-500 group-hover:text-slate-300"
                        )}
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.isAi && !item.disabled && (
                        <span className="text-[9px] font-bold text-violet-400 bg-violet-900/40 border border-violet-800/50 px-1 py-0.5 rounded-sm">
                          IA
                        </span>
                      )}
                      {item.disabled && (
                        <ChevronRight className="w-3 h-3 text-slate-700 opacity-50" />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}

        {/* Recent Projects */}
        <div className="mb-4">
          <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Proyectos recientes
          </p>
          <ul className="space-y-0.5">
            {recentProjects.map((p) => (
              <li key={p.name}>
                <Link
                  href="/"
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all duration-100 group"
                >
                  <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", statusDot[p.status])} />
                  <span className="truncate flex-1">{p.name}</span>
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/cotizador"
                className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all duration-100"
              >
                <Plus className="w-3 h-3" />
                <span>Nuevo proyecto</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* User */}
      <div className="border-t border-slate-800 p-3">
        <div className="flex items-center gap-2.5 px-1 py-1 rounded-md hover:bg-white/5 cursor-pointer transition-colors group">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold shrink-0">
            {mockUser.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-300 truncate">{mockUser.name}</p>
            <div className="flex items-center gap-1">
              <p className="text-[11px] text-slate-500 truncate">{mockOrg.name}</p>
              <span className="text-[9px] font-semibold text-indigo-400 bg-indigo-900/40 border border-indigo-800/50 px-1 rounded-sm">
                {planLabel[mockOrg.plan]}
              </span>
            </div>
          </div>
          <Settings className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
        </div>
      </div>
    </aside>
  )
}
