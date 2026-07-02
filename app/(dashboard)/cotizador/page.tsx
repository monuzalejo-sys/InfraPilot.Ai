"use client"

import { useState, useEffect, useRef } from "react"
import {
  Sparkles, Check, Loader2, ChevronDown, ChevronRight,
  AlertTriangle, Download, Share2, RefreshCw, FileSpreadsheet,
  MapPin, Info, ArrowLeft, TrendingUp, X, Building2, Droplets, Road,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { exportPresupuestoExcel } from "@/lib/excel-export"
import { formatCurrency } from "@/lib/utils"
import type { GeneratedBudget, BudgetItem, ApuComponent, ProcessingStep } from "@/types"

type Phase = "idle" | "processing" | "results"

const PROCESSING_STEPS: ProcessingStep[] = [
  { id: "1", label: "Tipo de obra identificado",            detail: "",                                     status: "pending" },
  { id: "2", label: "Ubicación y normativa reconocida",     detail: "",                                     status: "pending" },
  { id: "3", label: "Especificaciones técnicas extraídas",  detail: "",                                     status: "pending" },
  { id: "4", label: "Estructurando capítulos del presupuesto", detail: "",                                  status: "pending" },
  { id: "5", label: "Calculando metrados y cantidades",     detail: "",                                     status: "pending" },
  { id: "6", label: "Asignando precios del catálogo",       detail: "",                                     status: "pending" },
  { id: "7", label: "Generando APUs detallados",            detail: "",                                     status: "pending" },
  { id: "8", label: "Verificando coherencia del presupuesto", detail: "",                                   status: "pending" },
]

const riskColors = {
  HIGH:   { bg: "bg-rose-50",   border: "border-rose-200",   text: "text-rose-700",   badge: "danger"   as const, label: "Alto" },
  MEDIUM: { bg: "bg-amber-50",  border: "border-amber-200",  text: "text-amber-700",  badge: "warning"  as const, label: "Medio" },
  LOW:    { bg: "bg-slate-50",  border: "border-slate-200",  text: "text-slate-600",  badge: "default"  as const, label: "Bajo" },
}

export default function CotizadorPage() {
  const [phase, setPhase]                       = useState<Phase>("idle")
  const [description, setDescription]           = useState("")
  const [projectType, setProjectType]           = useState<"edificacion" | "acueducto" | "vias">("edificacion")
  const [region, setRegion]                     = useState("Bogotá, Colombia")
  const [steps, setSteps]                       = useState<ProcessingStep[]>(PROCESSING_STEPS)
  const [progress, setProgress]                 = useState(0)
  const [budget, setBudget]                     = useState<GeneratedBudget | null>(null)
  const [activeSection, setActiveSection]       = useState<string>("")
  const [selectedItem, setSelectedItem]         = useState<BudgetItem | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [overheadPct, setOverheadPct]           = useState(10)
  const [profitPct, setProfitPct]               = useState(8)
  const [showExportMenu, setShowExportMenu]     = useState(false)
  const [apiError, setApiError]                 = useState<string | null>(null)
  const animTimers                              = useRef<ReturnType<typeof setTimeout>[]>([])
  const abortRef                                = useRef<AbortController | null>(null)

  const handleAnalyze = async () => {
    if (description.trim().length < 30) return

    setPhase("processing")
    setApiError(null)
    setSteps(PROCESSING_STEPS.map(s => ({ ...s, status: "pending" })))
    setProgress(0)

    // Animation: one step per ~1.1s (8 steps ≈ 8.8s)
    const stepMs = 1100
    animTimers.current = PROCESSING_STEPS.map((_, i) =>
      setTimeout(() => {
        setSteps(prev => prev.map((s, idx) => ({
          ...s,
          status: idx < i ? "completed" : idx === i ? "active" : "pending",
        })))
        setProgress(Math.round(((i + 1) / PROCESSING_STEPS.length) * 100))
      }, i * stepMs)
    )

    // Real Claude API call
    abortRef.current = new AbortController()
    try {
      const res = await fetch("/api/cotizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, region, currency: "COP", projectType }),
        signal: abortRef.current.signal,
      })

      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error ?? "Error al generar el presupuesto")

      const generated: GeneratedBudget = data.budget

      // Wait for animation to finish (at least 8.8s total)
      const elapsed = PROCESSING_STEPS.length * stepMs + 600
      await new Promise(r => setTimeout(r, Math.max(0, elapsed - Date.now() + Date.now())))

      animTimers.current.forEach(clearTimeout)
      setSteps(prev => prev.map(s => ({ ...s, status: "completed" })))
      setProgress(100)

      await new Promise(r => setTimeout(r, 400))

      // Normalize confidence to integer (0-100)
      if (generated.confidence <= 1) generated.confidence = Math.round(generated.confidence * 100)
      setBudget(generated)
      const firstSection = generated.sections[0]
      if (firstSection) {
        setActiveSection(firstSection.id)
        setExpandedSections(new Set([firstSection.id]))
        setSelectedItem(firstSection.items[0] ?? null)
      }
      setOverheadPct(Math.round((generated.overheadPct ?? 0.10) * 100))
      setProfitPct(Math.round((generated.profitPct ?? 0.08) * 100))
      setPhase("results")

      // Save to DB
      fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, budget: generated }),
      }).then(async (r) => {
        if (!r.ok) {
          const d = await r.json()
          console.error("Error guardando presupuesto:", d.error)
        }
      }).catch((e) => console.error("Error guardando presupuesto:", e))
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return
      animTimers.current.forEach(clearTimeout)
      setApiError(err instanceof Error ? err.message : "Error desconocido")
      setPhase("idle")
    }
  }

  const handleReset = () => {
    animTimers.current.forEach(clearTimeout)
    abortRef.current?.abort()
    setPhase("idle")
    setDescription("")
    setBudget(null)
    setApiError(null)
    setSteps(PROCESSING_STEPS.map(s => ({ ...s, status: "pending" })))
    setProgress(0)
  }

  useEffect(() => () => {
    animTimers.current.forEach(clearTimeout)
    abortRef.current?.abort()
  }, [])

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  if (!budget && phase === "results") return null

  const baseCost        = budget?.baseCost ?? 0
  const overheadAmount  = baseCost * (overheadPct / 100)
  const profitAmount    = baseCost * (profitPct / 100)
  const contingencyAmt  = budget?.contingencyAmount ?? baseCost * 0.05
  const subtotal        = baseCost + overheadAmount + profitAmount + contingencyAmt
  const taxAmount       = subtotal * 0.18
  const total           = subtotal + taxAmount
  const totalPartidas   = budget?.sections.reduce((s, sec) => s + sec.items.length, 0) ?? 0
  const apu             = budget?.apuSample

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-slate-200 bg-white shrink-0">
        <div className="flex items-center gap-3">
          {phase !== "idle" && (
            <button onClick={handleReset} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mr-1">
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-ai flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-slate-900">Cotizador IA</h1>
              <p className="text-xs text-slate-500">
                {phase === "idle"       && "Describe tu obra en lenguaje natural"}
                {phase === "processing" && "Analizando con Claude AI..."}
                {phase === "results"    && budget && `${budget.projectName} · ${totalPartidas} partidas · ${budget.confidence}% confianza`}
              </p>
            </div>
          </div>
        </div>

        {phase === "results" && budget && (
          <div className="flex items-center gap-2">
            <Badge variant="ai">✦ IA {budget.confidence}%</Badge>
            <div className="relative">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowExportMenu(!showExportMenu)}>
                <Download className="w-4 h-4" />
                Exportar
                <ChevronDown className="w-3 h-3" />
              </Button>
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-10 py-1">
                  {["Excel (.xlsx)", "PDF profesional", "Formato OSCE"].map((opt) => (
                    <button
                      key={opt}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      onClick={() => { setShowExportMenu(false); if (opt === "Excel (.xlsx)") exportPresupuestoExcel() }}
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button size="sm" variant="ghost" className="gap-2"><Share2 className="w-4 h-4" /></Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">

        {/* ── IDLE ── */}
        {phase === "idle" && (
          <div className="h-full flex items-start justify-center pt-12 px-6">
            <div className="w-full max-w-2xl space-y-6 animate-fade-in-up">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">Describe tu obra</h2>
                <p className="text-slate-500">
                  Escribe en lenguaje natural — la IA identificará tipo de obra, partidas, metrados y precios automáticamente.
                </p>
              </div>

              {apiError && (
                <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-lg">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <div className="flex-1">{apiError}</div>
                  <button onClick={() => setApiError(null)}><X className="w-4 h-4" /></button>
                </div>
              )}

              <Card className="shadow-md border-slate-200">
                <CardContent className="pt-5 space-y-4">
                  {/* Project type selector */}
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { value: "edificacion", label: "Edificación",          icon: Building2, desc: "Residencial, comercial, industrial" },
                      { value: "acueducto",   label: "Acueducto / Alc.",     icon: Droplets,  desc: "Redes, tuberías, saneamiento" },
                      { value: "vias",        label: "Vías",                 icon: Road,      desc: "Carreteras, pavimentos, puentes" },
                    ] as const).map(({ value, label, icon: Icon, desc }) => (
                      <button
                        key={value}
                        onClick={() => setProjectType(value)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all ${
                          projectType === value
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                            : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${projectType === value ? "text-indigo-600" : "text-slate-400"}`} />
                        <span className="text-xs font-semibold">{label}</span>
                        <span className="text-[10px] leading-tight text-slate-400">{desc}</span>
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={
                        projectType === "acueducto"
                          ? "Ejemplo: Reposición de colector sanitario DN 315mm en calle 5 entre carreras 8 y 15, Popayán. Longitud 77 ml, incluye excavación en conglomerado, suministro e instalación tubería PVC, rellenos tipo II, reposición de pavimento asfaltico y construcción de 2 cámaras de inspección..."
                          : projectType === "vias"
                          ? "Ejemplo: Construcción de vía terciaria en concreto rígido, longitud 2.5 km, ancho 6 m, municipio de Totoró, Cauca. Incluye adecuación de subrasante, subbase granular 20cm, base granular 15cm y placa de concreto 21 MPa e=18cm..."
                          : "Ejemplo: Construcción de edificio de oficinas corporativas de 8 pisos en Miraflores, Lima. Área 800 m2 por piso. Estructura aporticada f'c=280 kg/cm², fachada vidrio spider, 3 ascensores, 2 sótanos..."
                      }
                      className="min-h-[180px] text-sm leading-relaxed border-slate-200 focus-visible:ring-indigo-500"
                      maxLength={2000}
                    />
                    <span className="absolute bottom-3 right-3 text-xs text-slate-300">
                      {description.length}/2000
                    </span>
                  </div>

                  <Separator />

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> Ciudad / Región
                    </label>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option>Bogotá, Colombia</option>
                      <option>Medellín, Colombia</option>
                      <option>Cali, Colombia</option>
                      <option>Barranquilla, Colombia</option>
                      <option>Cartagena, Colombia</option>
                      <option>Bucaramanga, Colombia</option>
                      <option>Manizales, Colombia</option>
                      <option>Pereira, Colombia</option>
                      <option>Popayán, Colombia</option>
                      <option>Pasto, Colombia</option>
                      <option>Ibagué, Colombia</option>
                      <option>Villavicencio, Colombia</option>
                    </select>
                  </div>

                  <Button
                    variant="ai"
                    size="lg"
                    className="w-full gap-2.5 text-base"
                    disabled={description.trim().length < 30}
                    onClick={handleAnalyze}
                  >
                    <Sparkles className="w-5 h-5" />
                    Analizar con IA
                  </Button>
                  <p className="text-center text-xs text-slate-400">
                    {projectType === "acueducto"
                      ? `✦ Precios INVIAS · Operadores de servicios públicos · COP ${new Date().getFullYear()}`
                      : projectType === "vias"
                      ? `✦ Precios INVIAS · Infraestructura vial · COP ${new Date().getFullYear()}`
                      : `✦ Precios CAMACOL · Construcción Colombia · COP ${new Date().getFullYear()}`}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ── PROCESSING ── */}
        {phase === "processing" && (
          <div className="h-full flex items-center justify-center px-6">
            <div className="w-full max-w-lg space-y-6 animate-fade-in">
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl gradient-ai mx-auto mb-3 shadow-lg">
                  <Sparkles className="w-6 h-6 text-white animate-pulse" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">InfraPilot IA está analizando</h2>
                <p className="text-slate-500 text-sm">Generando presupuesto con Claude AI...</p>
              </div>

              <Card className="shadow-md">
                <CardContent className="pt-5 space-y-3">
                  {steps.map((step) => (
                    <div
                      key={step.id}
                      className={`flex items-start gap-3 transition-all duration-300 ${step.status === "pending" ? "opacity-30" : "opacity-100"}`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {step.status === "completed" ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                            <Check className="w-3 h-3 text-emerald-600" />
                          </div>
                        ) : step.status === "active" ? (
                          <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                            <Loader2 className="w-3 h-3 text-indigo-600 animate-spin" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-slate-200" />
                        )}
                      </div>
                      <p className={`text-sm font-medium ${step.status !== "pending" ? "text-slate-800" : "text-slate-400"}`}>
                        {step.label}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Progreso</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" indicatorClassName="bg-gradient-to-r from-violet-500 to-indigo-500" />
              </div>

              <div className="bg-violet-50 border border-violet-100 rounded-lg px-4 py-3">
                <p className="text-xs text-violet-600 leading-relaxed">
                  <span className="font-semibold">💡 </span>
                  Claude AI está generando un presupuesto completo con APUs detallados, análisis de riesgos y proyección financiera. Esto puede tomar 20-40 segundos.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── RESULTS ── */}
        {phase === "results" && budget && (
          <div className="h-full flex overflow-hidden animate-fade-in">
            {/* Left: Sections tree */}
            <div className="w-64 shrink-0 border-r border-slate-200 bg-white overflow-y-auto">
              <div className="p-3 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {totalPartidas} partidas · {budget.sections.length} secciones
                </p>
              </div>
              <div className="py-1">
                {budget.sections.map((section) => {
                  const isExpanded = expandedSections.has(section.id)
                  const isActive   = activeSection === section.id
                  return (
                    <div key={section.id}>
                      <button
                        onClick={() => { toggleSection(section.id); setActiveSection(section.id) }}
                        className={`flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-slate-50 transition-colors ${isActive ? "bg-indigo-50" : ""}`}
                      >
                        <div className="shrink-0">
                          {isExpanded
                            ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                            : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-mono text-slate-400">{section.code}</span>
                            <span className={`text-xs font-medium truncate ${isActive ? "text-indigo-700" : "text-slate-700"}`}>
                              {section.name}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{formatCurrency(section.subtotal)}</p>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="bg-slate-50 border-b border-slate-100">
                          {section.items.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => setSelectedItem(item)}
                              className={`flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-slate-100 transition-colors border-l-2 ${
                                selectedItem?.id === item.id ? "border-indigo-500 bg-indigo-50" : "border-transparent"
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] font-mono text-slate-400">{item.code}</span>
                                  {item.isAiGenerated && <span className="text-[9px] text-violet-500 font-bold">✦</span>}
                                </div>
                                <p className={`text-xs truncate ${selectedItem?.id === item.id ? "text-indigo-700 font-medium" : "text-slate-600"}`}>
                                  {item.name}
                                </p>
                                <p className="text-[11px] text-slate-400 font-mono">
                                  {item.unit} · {formatCurrency(item.unitPrice)}/{item.unit}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Center: APU detail */}
            <div className="flex-1 overflow-y-auto bg-white border-r border-slate-200">
              {selectedItem && apu ? (
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-slate-400">{selectedItem.code}</span>
                        {selectedItem.isAiGenerated && (
                          <Badge variant="ai">✦ IA · {Math.round((selectedItem.confidence ?? 0.9) * 100)}%</Badge>
                        )}
                      </div>
                      <h3 className="text-base font-semibold text-slate-900">{selectedItem.name}</h3>
                      <p className="text-sm text-slate-500 mt-0.5">
                        Unidad: <span className="font-medium text-slate-700">{selectedItem.unit}</span>
                        {" · "}Metrado: <span className="font-medium text-slate-700">{selectedItem.quantity.toLocaleString()} {selectedItem.unit}</span>
                      </p>
                    </div>
                    <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-600 transition-colors">
                      <RefreshCw className="w-3.5 h-3.5" />
                      Regenerar
                    </button>
                  </div>

                  {/* APU Table — uses apuSample for all items (real APU per item requires more API calls) */}
                  <div className="space-y-4">
                    {(["MATERIAL", "LABOR", "EQUIPMENT"] as const).map((type) => {
                      const groups = {
                        MATERIAL:  { label: "Materiales",           components: apu.materials,  cost: apu.materialsCost },
                        LABOR:     { label: "Mano de Obra",          components: apu.labor,      cost: apu.laborCost },
                        EQUIPMENT: { label: "Equipos y Herramientas",components: apu.equipment,  cost: apu.equipmentCost },
                      }
                      const g = groups[type]
                      return (
                        <div key={type}>
                          <div className="flex items-center justify-between py-2 border-b border-slate-100">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{g.label}</span>
                            <span className="text-xs font-semibold text-slate-700">Subtotal: {formatCurrency(g.cost)}</span>
                          </div>
                          <div className="mt-1">
                            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-2 px-1 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                              <span>Descripción</span>
                              <span>Und.</span>
                              <span className="text-right">Cantidad</span>
                              <span className="text-right">P. Unit.</span>
                              <span className="text-right">Total</span>
                            </div>
                            {g.components.map((comp: ApuComponent, i: number) => (
                              <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-2 px-1 py-1.5 hover:bg-slate-50 rounded transition-colors">
                                <span className="text-xs text-slate-700 truncate">{comp.description}</span>
                                <span className="text-xs text-slate-500 font-mono">{comp.unit}</span>
                                <span className="text-xs text-slate-700 font-mono text-right">{comp.quantity.toFixed(3)}</span>
                                <span className="text-xs text-slate-700 font-mono text-right">{comp.unitPrice.toFixed(2)}</span>
                                <span className="text-xs font-medium text-slate-800 font-mono text-right">{comp.totalPrice.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}

                    <div className="flex items-center justify-between py-3 border-t-2 border-slate-900 bg-slate-50 rounded-lg px-3">
                      <span className="text-sm font-bold text-slate-900">PRECIO UNITARIO TOTAL</span>
                      <span className="text-lg font-bold text-slate-900 font-mono">
                        {formatCurrency(apu.totalCost)} / {apu.unit}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5" />
                      Precios vigentes: {apu.priceDate} · Fuente: {apu.source}
                    </p>
                  </div>

                  {/* Risks */}
                  <div className="mt-8 space-y-3">
                    <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Análisis de riesgos · {budget.risks.length} factores identificados
                    </h4>
                    {budget.risks.map((risk, i) => {
                      const rc = riskColors[risk.level]
                      return (
                        <div key={i} className={`rounded-lg border p-4 ${rc.bg} ${rc.border}`}>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className={`text-sm font-semibold ${rc.text}`}>{risk.title}</p>
                            <Badge variant={rc.badge} className="shrink-0">{rc.label}</Badge>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed mb-2">{risk.description}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span>Prob: <strong>{risk.probability}</strong></span>
                            <span>Impacto: <strong>{risk.impact}</strong></span>
                          </div>
                          <div className="mt-2 pt-2 border-t border-slate-200/60">
                            <p className="text-xs text-slate-600">
                              <span className="font-semibold text-violet-700">✦ Recomendación:</span>{" "}
                              {risk.recommendation}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm text-slate-400">Selecciona una partida para ver su APU</p>
                </div>
              )}
            </div>

            {/* Right: Financial summary */}
            <div className="w-72 shrink-0 bg-white overflow-y-auto">
              <div className="p-5 space-y-5 sticky top-0">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Resumen financiero</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Costo directo</span>
                      <span className="text-sm font-semibold text-slate-900 font-mono">{formatCurrency(baseCost)}</span>
                    </div>

                    <div className="space-y-1.5">
                      {[
                        { label: "Gastos generales", value: overheadAmount, pct: overheadPct, setter: setOverheadPct },
                        { label: "Utilidad",         value: profitAmount,   pct: profitPct,   setter: setProfitPct },
                      ].map(({ label, value, pct, setter }) => (
                        <div key={label} className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm text-slate-500">{label}</span>
                            <input
                              type="number"
                              value={pct}
                              onChange={(e) => setter(Number(e.target.value))}
                              className="w-10 h-5 text-xs text-center border border-slate-200 rounded bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                              min={0} max={50}
                            />
                            <span className="text-xs text-slate-400">%</span>
                          </div>
                          <span className="text-sm text-slate-600 font-mono">{formatCurrency(value)}</span>
                        </div>
                      ))}

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Imprevistos (5%)</span>
                        <span className="text-sm text-slate-600 font-mono">{formatCurrency(contingencyAmt)}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Subtotal</span>
                      <span className="text-sm font-semibold text-slate-800 font-mono">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">IGV 18%</span>
                      <span className="text-sm text-slate-600 font-mono">{formatCurrency(taxAmount)}</span>
                    </div>

                    <div className="border-t-2 border-slate-900 pt-3 mt-1">
                      <div className="flex items-start justify-between">
                        <span className="text-sm font-bold text-slate-900">TOTAL</span>
                        <div className="text-right">
                          <div className="text-xl font-bold text-slate-900 font-mono leading-tight">
                            {formatCurrency(total)}
                          </div>
                          <div className="text-xs text-emerald-600 font-medium mt-0.5">
                            ✓ {budget.currency} · {budget.confidence}% confianza IA
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button variant="ai" className="w-full gap-2 text-sm" onClick={exportPresupuestoExcel}>
                    <Download className="w-4 h-4" />
                    Exportar a Excel
                  </Button>
                  <Button variant="outline" className="w-full gap-2 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    Ver proyección financiera
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2 text-xs text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>Proyecto</span>
                    <span className="text-slate-600 font-medium">{budget.projectName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Ubicación</span>
                    <span className="text-slate-600">{budget.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Moneda</span>
                    <span className="text-slate-600">{budget.currency}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Partidas totales</span>
                    <span className="text-slate-600">{totalPartidas}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Confianza IA</span>
                    <span className="text-emerald-600 font-semibold">{budget.confidence}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
