"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import {
  FolderOpen, Gavel, Sparkles, ChevronRight,
} from "lucide-react"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"
import { formatCurrency, getGreeting, timeAgo } from "@/lib/utils"
import { DemoNotice } from "@/components/demo-notice"
import { EditorialCard, MonoLabel, Crosshair } from "@/components/editorial"
import {
  RadarPrecios, TimelineLicitaciones, ChipRiesgoIA, HubIngenierias,
  type PriceRow, type TimelinePoint,
} from "@/components/dashboard-widgets"

interface Project {
  id: string
  code?: string
  name: string
  type: string
  status: string
  location?: string
  total_budget?: number
  currency: string
  progress: number
  partidas: number
  created_at: string
  updated_at: string
}

interface Budget {
  id: string
  project_name: string
  location?: string
  currency: string
  confidence?: number
  total_amount?: number
  created_at: string
}

const statusConfig: Record<string, { label: string; dot: string }> = {
  APPROVED:    { label: "Aprobado",    dot: "var(--ok)" },
  IN_PROGRESS: { label: "En revisión", dot: "var(--brass)" },
  DRAFT:       { label: "Borrador",    dot: "var(--muted)" },
  COMPLETED:   { label: "Completado",  dot: "var(--ok)" },
  ARCHIVED:    { label: "Archivado",   dot: "var(--muted)" },
}

const typeLabel: Record<string, string> = {
  EDIFICACION: "Edificación",
  VIAL:        "Vial",
  HIDRAULICA:  "Hidráulica",
  SANEAMIENTO: "Saneamiento",
  ELECTRICO:   "Eléctrico",
  TOPOGRAFIA:  "Topografía",
  OTRO:        "Otro",
}

// Static reference readings for the price radar (editorial demo data — the
// live feed lands in a later step; presentation is decoupled from source).
const priceRows: PriceRow[] = [
  { label: "Cemento · bolsa", value: "S/ 28.90", delta: 2.4 },
  { label: "Acero fy=4200",   value: "S/ 4.35",  delta: -1.1 },
  { label: "Concreto f'c210", value: "S/ 385",   delta: 0.8 },
  { label: "Mano de obra",    value: "S/ 78/día", delta: 0 },
]

const licitacionTimeline: TimelinePoint[] = [
  { label: "Feb", value: 3 },
  { label: "Mar", value: 5 },
  { label: "Abr", value: 4 },
  { label: "May", value: 7 },
  { label: "Jun", value: 6 },
  { label: "Jul", value: 9 },
]

export default function DashboardPage() {
  const [user, setUser] = useState<{ email?: string; full_name?: string } | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [recentBudgets, setRecentBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)

  const load = useCallback(async () => {
    const supabase = createClient()
    if (supabase) {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        setUser({
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name,
        })
      }
    }

    const [projectsRes, budgetsRes] = await Promise.all([
      fetch("/api/projects"),
      fetch("/api/budgets"),
    ])

    if (projectsRes.ok) {
      const { projects } = await projectsRes.json()
      setProjects(projects ?? [])
    } else {
      setFetchError(true)
    }
    if (budgetsRes.ok) {
      const { budgets } = await budgetsRes.json()
      setRecentBudgets(budgets ?? [])
    } else {
      setFetchError(true)
    }
    setLoading(false)
  }, [])

  // Fetches on mount. Launching load() during render (lazy guard) fires its
  // post-await setStates before mount under StrictMode; a mount effect is the
  // correct place. No external store to restructure into — suppressed
  // narrowly, same convention as the other data pages.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load() }, [load])

  const today = new Intl.DateTimeFormat("es-PE", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  }).format(new Date())

  const firstName = user?.full_name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "Usuario"

  const stats = [
    { icon: FolderOpen, label: "Proyectos activos", value: loading ? "—" : String(projects.length) },
    { icon: Sparkles,   label: "Presupuestos IA",   value: loading ? "—" : String(recentBudgets.length) },
    { icon: Gavel,      label: "Licitaciones",      value: "0" },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 sm:p-8">
      {(!isSupabaseConfigured || fetchError) && <DemoNotice />}

      {/* Header — saludo + fecha + stats compactos en una fila */}
      <header className="flex flex-col gap-5 border-b border-[var(--hairline)] pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <MonoLabel>Tablero de control</MonoLabel>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--ink)]">
              {getGreeting()}, {firstName}
            </h1>
            <p className="mt-1 font-mono text-xs uppercase tracking-wide text-[var(--muted)]">{today}</p>
          </div>
          <Link
            href="/cotizador"
            className="inline-flex items-center gap-2 self-start rounded-sm bg-[var(--brass)] px-5 py-2.5 text-sm font-semibold text-[var(--paper)] transition-opacity hover:opacity-90 sm:self-auto"
          >
            <Sparkles className="h-4 w-4" />
            Nuevo presupuesto
          </Link>
        </div>

        {/* Stats compactos — inline sobre el hairline */}
        <div className="grid grid-cols-3 divide-x divide-[var(--hairline)] rounded-sm border border-[var(--hairline)]">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 px-4 py-3">
              <Icon className="h-4 w-4 shrink-0 text-[var(--brass)]" />
              <div className="min-w-0">
                <div className="text-xl font-bold tracking-tight tabular-nums text-[var(--ink)]">{value}</div>
                <MonoLabel className="mt-0.5 truncate">{label}</MonoLabel>
              </div>
            </div>
          ))}
        </div>
      </header>

      {/* Sección protagonista — hub de ingenierías */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <MonoLabel>Ingenierías</MonoLabel>
          <MonoLabel className="text-[var(--muted)]">Plataforma multi-ingeniería</MonoLabel>
        </div>
        <HubIngenierias />
      </section>

      {/* Widgets secundarios bajo el hub — compactados */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <RadarPrecios rows={priceRows} updatedLabel="Ref · hoy" />
        <TimelineLicitaciones points={licitacionTimeline} caption="6 meses" />
        <ChipRiesgoIA message="Sobrecosto en cimentación proyectado: el precio del acero fy=4200 supera el margen del presupuesto INF-024 en 6.2%. Revisa la partida 02.01." />
      </div>

      {/* Recent budgets */}
      <EditorialCard
        title="Presupuestos recientes"
        action={
          <Link href="/presupuestos" className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-wide text-[var(--brass)] hover:opacity-80">
            Ver todos <ChevronRight className="h-3 w-3" />
          </Link>
        }
      >
        {loading ? (
          <div className="py-8 text-center text-sm text-[var(--muted)]">Cargando…</div>
        ) : recentBudgets.length === 0 ? (
          <div className="space-y-3 py-10 text-center">
            <Sparkles className="mx-auto h-7 w-7 text-[var(--hairline)]" />
            <p className="text-sm text-[var(--muted)]">Aún no hay presupuestos generados.</p>
            <Link
              href="/cotizador"
              className="inline-flex items-center gap-2 rounded-sm bg-[var(--brass)] px-4 py-2 text-xs font-semibold text-[var(--paper)] transition-opacity hover:opacity-90"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Generar primer presupuesto
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--hairline)]">
            {recentBudgets.slice(0, 6).map((b) => (
              <li key={b.id} className="flex items-start justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--ink)]">{b.project_name}</p>
                  <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wide text-[var(--muted)]">{b.location}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    {b.total_amount && (
                      <span className="font-mono text-xs tabular-nums text-[var(--ink)]">
                        {formatCurrency(b.total_amount)}
                      </span>
                    )}
                    {b.confidence && (
                      <>
                        <span className="text-[var(--hairline)]">·</span>
                        <span className="font-mono text-[10px] uppercase tracking-wide text-[var(--brass)]">
                          IA {b.confidence}%
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <span className="shrink-0 whitespace-nowrap font-mono text-[11px] text-[var(--muted)]">
                  {timeAgo(new Date(b.created_at))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </EditorialCard>

      {/* Projects table */}
      {projects.length > 0 && (
        <EditorialCard title="Proyectos activos">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 border-b border-[var(--hairline)] px-1 pb-2">
            {["Proyecto", "Tipo", "Estado", "Presupuesto", "Avance"].map((h) => (
              <MonoLabel key={h}>{h}</MonoLabel>
            ))}
          </div>
          {projects.map((project) => {
            const sc = statusConfig[project.status] ?? { label: project.status, dot: "var(--muted)" }
            return (
              <div
                key={project.id}
                className="group grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center gap-4 border-b border-[var(--hairline)] px-1 py-3.5 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--ink)] transition-colors group-hover:text-[var(--brass)]">
                    {project.name}
                  </p>
                  <p className="truncate font-mono text-[11px] uppercase tracking-wide text-[var(--muted)]">{project.location}</p>
                </div>
                <div className="text-xs text-[var(--muted)]">
                  {typeLabel[project.type] ?? project.type}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: sc.dot }} />
                  <span className="text-xs text-[var(--ink)]">{sc.label}</span>
                </div>
                <div className="font-mono text-sm tabular-nums text-[var(--ink)]">
                  {project.total_budget ? formatCurrency(project.total_budget) : <span className="text-[var(--muted)]">—</span>}
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--hairline)]">
                    <div className="h-full rounded-full bg-[var(--brass)]" style={{ width: `${project.progress}%` }} />
                  </div>
                  <span className="w-8 text-right font-mono text-[11px] tabular-nums text-[var(--muted)]">{project.progress}%</span>
                </div>
              </div>
            )
          })}
        </EditorialCard>
      )}

      {/* Register mark footer */}
      <div className="flex items-center justify-between pt-2">
        <MonoLabel>InfraPilot · Tablero editorial</MonoLabel>
        <Crosshair className="h-3 w-3 text-[var(--hairline)]" />
      </div>
    </div>
  )
}
