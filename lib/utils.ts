import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export function taxLabel(currency?: string): string {
  switch (currency) {
    case "COP": return "IVA"
    case "PEN": return "IGV"
    case "MXN": return "IVA"
    default: return "Impuesto"
  }
}

export function defaultTaxRate(currency?: string): number {
  switch (currency) {
    case "COP": return 0.19
    case "PEN": return 0.18
    case "MXN": return 0.16
    default: return 0.18
  }
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-PE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Buen día"
  if (hour < 19) return "Buenas tardes"
  return "Buenas noches"
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  if (seconds < 60) return "hace un momento"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `hace ${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `hace ${days}d`
}
