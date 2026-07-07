import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboard, Sparkles, FileText, Gavel, TrendingUp,
  Bot, Database, Calculator, ScanText, Mountain, Truck, Cpu,
} from "lucide-react"

export interface DisciplineModule {
  href: string
  label: string
  icon: LucideIcon
  isAi?: boolean
  disabled?: boolean
}

export interface Discipline {
  id: string            // "core" | "construccion" | "topografia" | ...
  label: string         // label de sección en el sidebar
  description?: string  // línea editorial para el hub de ingenierías
  modules: DisciplineModule[]
  categories?: readonly string[]  // categorías de items válidas para la disciplina
  units?: readonly string[]       // unidades habituales (m, m2, m3, kg, und, glb...)
}

export const DISCIPLINES: Discipline[] = [
  {
    id: "core",
    label: "Workspace",
    description: "Presupuestos, APUs y cotización con IA.",
    modules: [
      { href: "/dashboard",    label: "Dashboard",           icon: LayoutDashboard },
      { href: "/cotizador",    label: "Cotizador IA",        icon: Sparkles,   isAi: true },
      { href: "/presupuestos", label: "Presupuestos",        icon: FileText },
      { href: "/precios",      label: "Base de Precios",     icon: Database },
      { href: "/apus",         label: "APUs",                icon: Calculator },
      { href: "/proveedores",  label: "Proveedores",         icon: Truck },
    ],
    categories: ["material", "labor", "equipment"],
    units: ["und", "m", "m2", "m3", "kg", "bolsa", "glb", "hh", "hm"],
  },
  {
    id: "topografia",
    label: "Campo",
    description: "Cálculo de campo: cubicación y nivelación.",
    modules: [
      { href: "/lector",       label: "Lector de datos",     icon: ScanText },
      { href: "/topografia",   label: "Topografía",          icon: Mountain },
    ],
    units: ["m", "m2", "m3", "punto", "est"],
  },
  {
    id: "informatica",
    label: "Informática",
    description: "Estimación de proyectos y costos cloud.",
    modules: [
      { href: "/informatica", label: "Ing. Informática", icon: Cpu },
    ],
    categories: ["desarrollo", "infraestructura", "licencias", "servicios"],
    units: ["hh", "sprint", "mes", "und", "usuario"],
  },
  {
    id: "licitaciones",
    label: "Licitaciones",
    description: "Análisis IA de bases y expedientes.",
    modules: [
      { href: "/licitaciones", label: "Licitaciones",        icon: Gavel,      isAi: true },
    ],
  },
  {
    id: "analisis",
    label: "Análisis",
    description: "Proyección financiera de la obra.",
    modules: [
      { href: "/predictor",    label: "Predictor Financiero", icon: TrendingUp },
      { href: "/copiloto",     label: "Copiloto IA",          icon: Bot,        isAi: true, disabled: true },
    ],
  },
]

export function getNavSections(): { label: string; items: DisciplineModule[] }[] {
  return DISCIPLINES.map((discipline) => ({
    label: discipline.label,
    items: discipline.modules,
  }))
}
