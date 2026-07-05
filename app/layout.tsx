import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "InfraPilot AI — Presupuestos con IA",
  description: "Describe tu obra. Obtén tu presupuesto en minutos.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${jetbrainsMono.variable} h-full`}>
      <body className="h-full antialiased bg-[var(--paper)] text-[var(--ink)]">
        {children}
      </body>
    </html>
  )
}
