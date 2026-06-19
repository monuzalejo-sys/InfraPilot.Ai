export type ProjectStatus = "DRAFT" | "IN_PROGRESS" | "APPROVED" | "COMPLETED" | "ARCHIVED"
export type ProjectType =
  | "VIAL"
  | "EDIFICACION"
  | "HIDRAULICA"
  | "SANEAMIENTO"
  | "ELECTRICO"
  | "TOPOGRAFIA"
  | "OTRO"
export type BudgetStatus = "DRAFT" | "REVIEW" | "APPROVED" | "EXPORTED"
export type ActivityType =
  | "budget_approved"
  | "export_completed"
  | "comment_added"
  | "apu_generated"
  | "project_created"
  | "tender_submitted"

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
}

export interface Organization {
  id: string
  name: string
  plan: "free" | "starter" | "professional" | "enterprise"
  country: string
  currency: string
}

export interface Project {
  id: string
  code: string
  name: string
  type: ProjectType
  status: ProjectStatus
  location: string
  totalBudget?: number
  currency: string
  progress: number
  partidas: number
  createdAt: Date
  updatedAt: Date
}

export interface ActivityItem {
  id: string
  type: ActivityType
  title: string
  description: string
  projectName: string
  user: string
  timestamp: Date
  badge?: string
}

export interface StatCard {
  label: string
  value: string
  change?: string
  changePositive?: boolean
  icon: string
  suffix?: string
}

export interface BudgetSection {
  id: string
  code: string
  name: string
  subtotal: number
  items: BudgetItem[]
}

export interface BudgetItem {
  id: string
  code: string
  name: string
  unit: string
  quantity: number
  unitPrice: number
  totalPrice: number
  isAiGenerated: boolean
  confidence?: number
}

export interface ApuComponent {
  type: "MATERIAL" | "LABOR" | "EQUIPMENT"
  description: string
  unit: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface ApuAnalysis {
  itemCode: string
  itemName: string
  unit: string
  outputQuantity: number
  priceDate: string
  region: string
  source: string
  materials: ApuComponent[]
  labor: ApuComponent[]
  equipment: ApuComponent[]
  materialsCost: number
  laborCost: number
  equipmentCost: number
  totalCost: number
}

export interface GeneratedBudget {
  projectName: string
  location: string
  currency: string
  confidence: number
  sections: BudgetSection[]
  baseCost: number
  overheadPct: number
  profitPct: number
  contingencyPct: number
  taxRate: number
  overheadAmount: number
  profitAmount: number
  contingencyAmount: number
  taxAmount: number
  totalAmount: number
  apuSample: ApuAnalysis
  risks: Risk[]
}

export interface Risk {
  level: "HIGH" | "MEDIUM" | "LOW"
  title: string
  description: string
  probability: string
  impact: string
  recommendation: string
}

export interface ProcessingStep {
  id: string
  label: string
  detail?: string
  status: "pending" | "active" | "completed"
}
