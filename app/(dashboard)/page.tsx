"use client"

import Link from "next/link"
import {
  FolderOpen,
  Banknote,
  Gavel,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  CheckCircle,
  FileDown,
  MessageSquare,
  Clock,
  TrendingUp,
  Plus,
  ChevronRight,
  AlertTriangle,
  Bot,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  mockProjects,
  mockActivity,
  mockAiCredits,
  mockTenderCount,
  mockUser,
} from "@/lib/mock-data"
import { formatCurrency, getGreeting, timeAgo } from "@/lib/utils"
import type { ProjectType, ProjectStatus, ActivityType } from "@/types"

const today = new Date()
const dateStr = new Intl.DateTimeFormat("es-PE", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(today)

const statusConfig: Record<ProjectStatus, { label: string; className: string; dot: string }> = {
  APPROVED: { label: "Aprobado", className: "approved", dot: "bg-emerald-400" },
  IN_PROGRESS: { label: "En revisión", className: "review", dot: "bg-amber-400" },
  DRAFT: { label: "Borrador", className: "draft", dot: "bg-slate-400" },
  COMPLETED: { label: "Completado", className: "success", dot: "bg-emerald-400" },
  ARCHIVED: { label: "Archivado", className: "archived", dot: "bg-slate-400" },
}

const typeConfig: Record<ProjectType, { label: string; className: string }> = {
  EDIFICACION: { label: "Edificación", className: "edificacion" },
  VIAL: { label: "Vial", className: "vial" },
  HIDRAULICA: { label: "Hidráulica", className: "hidraulica" },
  SANEAMIENTO: { label: "Saneamiento", className: "saneamiento" },
  ELECTRICO: { label: "Eléctrico", className: "electrico" },
  TOPOGRAFIA: { label: "Topografía", className: "topografia" },
  OTRO: { label: "Otro", className: "default" },
}

const activityIcon: Record<ActivityType, React.ReactNode> = {
  budget_approved: <CheckCircle className="w-4 h-4 text-emerald-500" />,
  export_completed: <FileDown className="w-4 h-4 text-indigo-500" />,
  comment_added: <MessageSquare className="w-4 h-4 text-slate-500" />,
  apu_generated: <Sparkles className="w-4 h-4 text-violet-500" />,
  project_created: <FolderOpen className="w-4 h-4 text-indigo-500" />,
  tender_submitted: <Gavel className="w-4 h-4 text-amber-500" />,
}

export default function DashboardPage() {
  const totalBudget = mockProjects.reduce((s, p) => s + (p.totalBudget ?? 0), 0)
  const creditPct = (mockAiCredits.used / mockAiCredits.total) * 100

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {getGreeting()}, {mockUser.name.split(" ")[0]} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-0.5 capitalize">{dateStr}</p>
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
        {/* Proyectos activos */}
        <Card className="card-hover">
          <CardContent className="pt-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                <FolderOpen className="w-4.5 h-4.5 text-indigo-600" />
              </div>
              <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600">
                <ArrowUpRight className="w-3.5 h-3.5" /> +2
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight">
              {mockProjects.length}
            </div>
            <div className="text-xs text-slate-500 mt-0.5 font-medium uppercase tracking-wide">
              Proyectos activos
            </div>
          </CardContent>
        </Card>

        {/* Presupuesto total */}
        <Card className="card-hover">
          <CardContent className="pt-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Banknote className="w-4.5 h-4.5 text-emerald-600" />
              </div>
              <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600">
                <ArrowUpRight className="w-3.5 h-3.5" /> +18%
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              S/ {(totalBudget / 1000000).toFixed(1)}M
            </div>
            <div className="text-xs text-slate-500 mt-0.5 font-medium uppercase tracking-wide">
              Presupuesto total
            </div>
          </CardContent>
        </Card>

        {/* Licitaciones */}
        <Card className="card-hover">
          <CardContent className="pt-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <Gavel className="w-4.5 h-4.5 text-amber-600" />
              </div>
              <span className="flex items-center gap-0.5 text-xs font-medium text-rose-500">
                <Clock className="w-3.5 h-3.5" /> 1 vence pronto
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight">
              {mockTenderCount}
            </div>
            <div className="text-xs text-slate-500 mt-0.5 font-medium uppercase tracking-wide">
              Licitaciones activas
            </div>
          </CardContent>
        </Card>

        {/* Créditos IA */}
        <Card className="card-hover">
          <CardContent className="pt-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
                <Zap className="w-4.5 h-4.5 text-violet-600" />
              </div>
              <span className="text-xs font-medium text-slate-500">
                {mockAiCredits.used} / {mockAiCredits.total}
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
              {Math.round(100 - creditPct)}%
            </div>
            <Progress
              value={creditPct}
              className="h-1.5"
              indicatorClassName={creditPct > 80 ? "bg-amber-500" : "bg-violet-500"}
            />
            <div className="text-xs text-slate-500 mt-1.5 font-medium uppercase tracking-wide">
              Créditos IA disponibles
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mid section: Activity + Actions/Copilot */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Actividad reciente</CardTitle>
              <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                Ver todo <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-0">
              {mockActivity.map((item, i) => (
                <div key={item.id}>
                  <div className="flex items-start gap-3 py-3 hover:bg-slate-50 rounded-lg px-2 -mx-2 transition-colors cursor-pointer group">
                    <div className="mt-0.5 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-slate-200 transition-colors">
                      {activityIcon[item.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-slate-800">{item.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                        </div>
                        <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">
                          {timeAgo(item.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs text-slate-500">{item.projectName}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-500">{item.user}</span>
                        {item.badge && (
                          <>
                            <span className="text-slate-300">·</span>
                            <Badge variant={item.type === "apu_generated" ? "ai" : "default"}>
                              {item.badge}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {i < mockActivity.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="space-y-4">
          {/* Quick Actions */}
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
              <Button variant="outline" className="w-full justify-start gap-2.5 h-9 text-slate-600">
                <Plus className="w-4 h-4" />
                Nuevo presupuesto
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2.5 h-9 text-slate-600">
                <Gavel className="w-4 h-4" />
                Nueva licitación
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2.5 h-9 text-slate-600">
                <TrendingUp className="w-4 h-4" />
                Ver proyección financiera
              </Button>
            </CardContent>
          </Card>

          {/* Copilot Widget */}
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
              <div className="space-y-2.5 mb-4">
                <div className="flex items-start gap-2 p-3 bg-white rounded-lg border border-violet-100 shadow-sm">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-slate-800">Precios desactualizados</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      PTAR Lurín usa precios de cemento de hace 4 meses. ¿Actualizar?
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1 h-7 text-xs gradient-ai border-0 text-white hover:opacity-90">
                  Ver análisis
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs text-slate-500">
                  Ignorar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Projects Table */}
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
          {/* Table header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
            <span>Proyecto</span>
            <span>Tipo</span>
            <span>Estado</span>
            <span>Presupuesto</span>
            <span>Avance</span>
          </div>

          {mockProjects.map((project) => {
            const sc = statusConfig[project.status]
            const tc = typeConfig[project.type]
            return (
              <div
                key={project.id}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 items-center px-3 py-3.5 border-b border-slate-50 hover:bg-slate-50 rounded-md transition-colors cursor-pointer group"
              >
                {/* Name */}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                    {project.name}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{project.location}</p>
                </div>

                {/* Type */}
                <div>
                  <Badge variant={tc.className as Parameters<typeof Badge>[0]["variant"]}>
                    {tc.label}
                  </Badge>
                </div>

                {/* Status */}
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                  <span className="text-xs text-slate-600">{sc.label}</span>
                </div>

                {/* Budget */}
                <div className="text-sm font-medium text-slate-800 font-mono">
                  {project.totalBudget ? formatCurrency(project.totalBudget) : (
                    <span className="text-slate-400">—</span>
                  )}
                </div>

                {/* Progress */}
                <div className="flex items-center gap-2">
                  <Progress value={project.progress} className="h-1.5 flex-1" />
                  <span className="text-xs text-slate-500 w-8 text-right">
                    {project.progress}%
                  </span>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
