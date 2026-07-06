"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  Building2, Plus, LogOut, Menu, X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { getNavSections, type DisciplineModule } from "@/lib/disciplines"

interface UserInfo {
  email?: string
  full_name?: string
  company?: string
}

type NavItem = DisciplineModule

const navSections = getNavSections()

// ── Compact dark icon rail (desktop) — hover reveals labels ──────
function RailItem({ item, isActive, onClose }: {
  item: NavItem
  isActive: boolean
  onClose?: () => void
}) {
  const Icon = item.icon
  const disabled = item.disabled
  return (
    <li>
      <Link
        href={disabled ? "#" : item.href}
        onClick={(e) => { if (disabled) { e.preventDefault(); return }; onClose?.() }}
        title={item.label}
        aria-label={item.label}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "sidebar-item group relative flex items-center gap-3 px-3 py-2.5",
          isActive
            ? "sidebar-item-active text-[var(--brass)]"
            : disabled
            ? "cursor-not-allowed text-[var(--muted)]/50"
            : "text-[var(--muted)] hover:text-[var(--paper)]"
        )}
      >
        <Icon className="h-[18px] w-[18px] shrink-0" />
        {/* Label — hidden on the narrow rail, revealed on hover as a tooltip */}
        <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap border border-[var(--hairline)]/20 bg-[var(--rail)] px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide text-[var(--paper)] opacity-0 shadow-lg transition-opacity duration-100 group-hover:opacity-100">
          {item.label}
          {item.isAi && <span className="ml-1.5 text-[var(--brass)]">· IA</span>}
        </span>
        {item.isAi && !disabled && (
          <span aria-hidden className="absolute right-2 top-2 h-1 w-1 rounded-full bg-[var(--brass)]" />
        )}
      </Link>
    </li>
  )
}

// ── Desktop dark rail ────────────────────────────────────────────
function DesktopRail({ pathname, user, onLogout }: {
  pathname: string
  user: UserInfo | null
  onLogout: () => void
}) {
  const initial = (user?.full_name ?? user?.email ?? "U").charAt(0).toUpperCase()

  return (
    <aside className="flex h-full w-16 flex-col items-stretch bg-[var(--rail)]">
      {/* Logo */}
      <Link
        href="/dashboard"
        title="InfraPilot AI"
        className="flex h-14 items-center justify-center border-b border-white/5"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-sm gradient-ai">
          <Building2 className="h-4 w-4 text-[var(--paper)]" />
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        {navSections.map((section, i) => (
          <ul key={section.label} className={cn("space-y-0.5 px-2", i > 0 && "mt-2 border-t border-white/5 pt-2")}>
            {section.items.map((item) => (
              <RailItem key={item.href} item={item} isActive={pathname === item.href} />
            ))}
          </ul>
        ))}
      </nav>

      {/* Quick action */}
      <div className="px-2 pb-2">
        <Link
          href="/cotizador"
          title="Nuevo presupuesto"
          aria-label="Nuevo presupuesto"
          className="flex items-center justify-center rounded-sm border border-[var(--brass)]/40 py-2.5 text-[var(--brass)] transition-colors hover:bg-[var(--brass)] hover:text-[var(--rail)]"
        >
          <Plus className="h-4 w-4" />
        </Link>
      </div>

      {/* User + logout */}
      <div className="flex flex-col items-center gap-1 border-t border-white/5 py-3">
        <span
          title={user?.full_name ?? user?.email ?? "Usuario"}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brass)] text-xs font-bold text-[var(--rail)]"
        >
          {initial}
        </span>
        <button
          onClick={onLogout}
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
          className="flex h-8 w-8 items-center justify-center text-[var(--muted)] transition-colors hover:text-[var(--warn)]"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  )
}

// ── Mobile drawer (full labels) ──────────────────────────────────
function MobileDrawer({ onClose, user, pathname, onLogout }: {
  onClose: () => void
  user: UserInfo | null
  pathname: string
  onLogout: () => void
}) {
  const initial = (user?.full_name ?? user?.email ?? "U").charAt(0).toUpperCase()

  return (
    <aside className="flex h-full w-64 flex-col bg-[var(--rail)]">
      {/* Logo */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-sm gradient-ai">
            <Building2 className="h-4 w-4 text-[var(--paper)]" />
          </span>
          <span className="text-sm font-semibold tracking-tight text-[var(--paper)]">InfraPilot AI</span>
        </div>
        <button onClick={onClose} className="p-1 text-[var(--muted)] hover:text-[var(--paper)]">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {navSections.map((section) => (
          <div key={section.label} className="mb-5">
            <p className="mb-1 px-2 font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href
                const Icon     = item.icon
                const disabled = item.disabled
                return (
                  <li key={item.href}>
                    <Link
                      href={disabled ? "#" : item.href}
                      onClick={(e) => { if (disabled) { e.preventDefault(); return }; onClose() }}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "sidebar-item flex items-center gap-2.5 px-2 py-2 text-sm transition-colors",
                        isActive
                          ? "sidebar-item-active text-[var(--brass)]"
                          : disabled
                          ? "cursor-not-allowed text-[var(--muted)]/50"
                          : "text-[var(--muted)] hover:text-[var(--paper)]"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.isAi && !disabled && (
                        <span className="rounded-sm border border-[var(--brass)]/40 px-1 py-0.5 font-mono text-[9px] font-bold text-[var(--brass)]">
                          IA
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}

        <div className="mb-4">
          <p className="mb-1 px-2 font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
            Acceso rápido
          </p>
          <Link
            href="/cotizador"
            onClick={onClose}
            className="flex items-center gap-2 px-2 py-2 font-mono text-xs text-[var(--muted)] transition-colors hover:text-[var(--paper)]"
          >
            <Plus className="h-3 w-3" />
            <span>Nuevo presupuesto</span>
          </Link>
        </div>
      </nav>

      {/* User */}
      <div className="space-y-1 border-t border-white/5 p-3">
        <div className="flex items-center gap-2.5 px-1 py-1">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--brass)] text-xs font-bold text-[var(--rail)]">
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-[var(--paper)]">
              {user?.full_name ?? user?.email ?? "Usuario"}
            </p>
            <p className="truncate text-[11px] text-[var(--muted)]">
              {user?.company ?? user?.email ?? ""}
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-2 px-2 py-1.5 text-xs text-[var(--muted)] transition-colors hover:text-[var(--warn)]"
        >
          <LogOut className="h-3.5 w-3.5" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const [user, setUser] = useState<UserInfo | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Derive the drawer's open state from the route: whenever navigation lands
  // on a new path (link click OR browser back/forward), collapse the drawer.
  // Render-phase reset is React's recommended alternative to a setState effect
  // (https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes).
  const [lastPath, setLastPath] = useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    if (mobileOpen) setMobileOpen(false)
  }

  // Resolves the authenticated user on mount. Launching this during render
  // (lazy guard) fires setState before mount under StrictMode; a mount effect
  // is the correct place. createClient() returns null in demo mode, which the
  // initial state covers.
  useEffect(() => {
    const supabase = createClient()
    supabase?.auth.getUser().then(({ data: { user: authUser } }) => {
      if (authUser) {
        setUser({
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name,
          company: authUser.user_metadata?.company,
        })
      }
    })
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    if (!supabase) { window.location.href = "/"; return }
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <>
      {/* Desktop dark icon rail */}
      <div className="hidden h-full shrink-0 lg:flex">
        <DesktopRail pathname={pathname} user={user} onLogout={handleLogout} />
      </div>

      {/* Mobile top bar */}
      <div className="fixed left-0 right-0 top-0 z-40 flex items-center gap-3 border-b border-white/5 bg-[var(--rail)] px-4 py-3 lg:hidden">
        <button onClick={() => setMobileOpen(true)} className="p-1 text-[var(--muted)] hover:text-[var(--paper)]">
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-sm gradient-ai">
            <Building2 className="h-3.5 w-3.5 text-[var(--paper)]" />
          </span>
          <span className="text-sm font-semibold text-[var(--paper)]">InfraPilot AI</span>
        </div>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full">
            <MobileDrawer
              onClose={() => setMobileOpen(false)}
              user={user}
              pathname={pathname}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}
    </>
  )
}
