"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  FolderOpen, Banknote, Gavel, Zap, ArrowUpRight, Sparkles,
  CheckCircle, FileDown, Clock, TrendingUp, Plus, ChevronRight,
  AlertTriangle, Bot,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency, getGreeting, timeAgo } from "@/lib/utils"

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
  APPROVED:    { label: "Aprobado",   dot: "bg-emerald-400" },
  IN_PROGRESS: { label: "En revisión",dot: "bg-amber-400" },
  DRAFT:       { label: "Borrador",   dot: "bg-slate-400" },
  COMPLETED:   { label: "Completado", dot: "bg-emerald-400" },
  ARCHIVED:    { label: "Archivado",  dot: "bg-slate-400" },
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

export default function DashboardPage() {
  const [user, setUser] = useState<{ email?: string; full_name?: string } | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [recentBudgets, setRecentBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (authUser) {
      setUser({
        email: authUser.email,
        full_name: authUser.user_metadata?.full_name,
      })
    }

    const [projectsRes, budgetsRes] = await Promise.all([
      fetch("/api/projects"),
      fetch("/api/budgets"),
    ])

    if (projectsRes.ok) {
      const { projects } = await projectsRes.json()
      setProjects(projects ?? [])
    }
    if (budgetsRes.ok) {
      const { budgets } = await budgetsRes.json()
      setRecentBudgets(budgets ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const today = new Intl.DateTimeFormat("es-PE", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  }).format(new Date())

  const totalBudget = projects.reduce((s, p) => s + (p.total_budget ?? 0), 0)
  const firstName = user?.full_name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "Usuario"

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {getGreeting()}, {firstName} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-0.5 capitalize">{today}</p>
        </div>
        <Link href="/cotizador">
          <Button variant="ai" size="default" className="gap-2 shadow-md">
            <Sparkles className="w-4 h-4" />
            Nuevo presupuesto
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="card-hover">
          <CardContent className="pt-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                <FolderOpen className="w-4.5 h-4.5 text-indigo-600" />
              </div>
              {projects.length > 0 && (
                <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600">
                  <ArrowUpRight className="w-3.5 h-3.5" /> activos
                </span>
              )}
            </div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight">
              {loading ? "—" : projects.length}
            </div>
            <div className="text-xs text-slate-500 mt-0.5 font-medium uppercase tracking-wide">
              Proyectos activos
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="pt-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Banknote className="w-4.5 h-4.5 text-emerald-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {loading ? "—" : totalBudget > 0 ? `S/ ${(totalBudget / 1000000).toFixed(1)}M` : "S/ 0"}
            </div>
            <div className="text-xs text-slate-500 mt-0.5 font-medium uppercase tracking-wide">
              Presupuesto total
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="pt-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
                <Sparkles className="w-4.5 h-4.5 text-violet-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight">
              {loading ? "—" : recentBudgets.length}
            </div>
            <div className="text-xs text-slate-500 mt-0.5 font-medium uppercase tracking-wide">
              Presupuestos IA
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="pt-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <Gavel className="w-4.5 h-4.5 text-amber-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight">0</div>
            <div className="text-xs text-slate-500 mt-0.5 font-medium uppercase tracking-wide">
              Licitaciones activas
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent budgets */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Presupuestos recientes</CardTitle>
              <Link href="/presupuestos" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                Ver todos <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <div className="py-8 text-center text-sm text-slate-400">Cargando...</div>
            ) : recentBudgets.length === 0 ? (
              <div className="py-10 text-center space-y-3">
                <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm text-slate-500">Aún no hay presupuestos generados.</p>
                <Link href="/cotizador">
                  <Button variant="ai" size="sm" className="gap-2 mt-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Generar primer presupuesto
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-0">
                {recentBudgets.slice(0, 6).map((b, i) => (
                  <div key={b.id}>
                    <div className="flex items-start gap-3 py-3 hover:bg-slate-50 rounded-lg px-2 -mx-2 transition-colors cursor-pointer group">
                      <div className="mt-0.5 w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-violet-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium text-slate-800">{b.project_name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{b.location}</p>
                          </div>
                          <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">
                            {timeAgo(new Date(b.created_at))}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          {b.total_amount && (
                            <span className="text-xs font-mono text-slate-600">
                              {formatCurrency(b.total_amount)}
                            </span>
                          )}
                          {b.confidence && (
                            <>
                              <span className="text-slate-300">·</span>
                              <Badge variant="ai">✦ IA {b.confidence}%</Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {i < Math.min(recentBudgets.length, 6) - 1 && <Separator />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Acciones rápidas</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <Link href="/cotizador">
                <Button variant="ai" className="w-full justify-start gap-2.5 h-9">
                  <Sparkles className="w-4 h-4" />
                  Cotizar obra con IA
                </Button>
              </Link>
              <Link href="/predictor">
                <Button variant="outline" className="w-full justify-start gap-2.5 h-9 text-slate-600">
                  <TrendingUp className="w-4 h-4" />
                  Predictor financiero
                </Button>
              </Link>
              <Link href="/licitaciones">
                <Button variant="outline" className="w-full justify-start gap-2.5 h-9 text-slate-600">
                  <Gavel className="w-4 h-4" />
                  Ver licitaciones
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50">
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg gradient-ai flex items-center justify-center animate-pulse-ring">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-violet-700">Copiloto IA</p>
                  <p className="text-[10px] text-violet-400">claude-sonnet-4-6</p>
                </div>
              </div>
              <p className="text-xs text-violet-600 leading-relaxed mb-4">
                Genera tu primer presupuesto con IA. Describe tu obra en lenguaje natural y obtén un presupuesto completo con APUs en minutos.
              </p>
              <Link href="/cotizador">
                <Button size="sm" className="w-full h-7 text-xs gradient-ai border-0 text-white hover:opacity-90">
                  Empezar ahora
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Projects Table */}
      {projects.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Proyectos activos</CardTitle>
              <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                Ver todos <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
              <span>Proyecto</span>
              <span>Tipo</span>
              <span>Estado</span>
              <span>Presupuesto</span>
              <span>Avance</span>
            </div>
            {projects.map((project) => {
              const sc = statusConfig[project.status] ?? { label: project.status, dot: "bg-slate-400" }
              return (
                <div
                  key={project.id}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 items-center px-3 py-3.5 border-b border-slate-50 hover:bg-slate-50 rounded-md transition-colors cursor-pointer group"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                      {project.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{project.location}</p>
                  </div>
                  <div className="text-xs text-slate-600">
                    {typeLabel[project.type] ?? project.type}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                    <span className="text-xs text-slate-600">{sc.label}</span>
                  </div>
                  <div className="text-sm font-medium text-slate-800 font-mono">
                    {project.total_budget ? formatCurrency(project.total_budget) : <span className="text-slate-400">—</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={project.progress} className="h-1.5 flex-1" />
                    <span className="text-xs text-slate-500 w-8 text-right">{project.progress}%</span>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
