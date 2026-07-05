"use client"

import { useState } from "react"
import Link from "next/link"
import { Building2, Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"
import { DemoNotice } from "@/components/demo-notice"
import { Crosshair, Pin, MonoLabel } from "@/components/editorial"

const features = [
  "Presupuestos completos en menos de 5 minutos",
  "APUs con precios CAPECO actualizados",
  "Análisis de riesgos automático por IA",
  "Exportación Excel y PDF profesional",
]

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isSupabaseConfigured) return
    setLoading(true)
    setError(null)

    const supabase = createClient()
    if (!supabase) { setLoading(false); return }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Correo o contraseña incorrectos"
          : error.message
      )
      setLoading(false)
      return
    }

    if (!data.session) {
      setError("No se pudo crear la sesión. Intenta de nuevo.")
      setLoading(false)
      return
    }

    window.location.replace("/dashboard")
  }

  return (
    <div className="min-h-screen flex bg-[var(--paper)]">
      {/* Left panel — blueprint / plano técnico */}
      <div className="hidden lg:flex lg:w-1/2 bg-[var(--rail)] flex-col justify-between p-12 relative overflow-hidden">
        <Crosshair className="pointer-events-none absolute left-6 top-6 h-4 w-4 text-white/20" />
        <Crosshair className="pointer-events-none absolute right-6 top-6 h-4 w-4 text-white/20" />
        <Crosshair className="pointer-events-none absolute left-6 bottom-6 h-4 w-4 text-white/20" />
        <Crosshair className="pointer-events-none absolute right-6 bottom-6 h-4 w-4 text-white/20" />
        <div className="pointer-events-none absolute inset-12 border border-white/10" />

        <div className="relative flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-[2px] bg-[var(--brass)]">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">InfraPilot AI</span>
        </div>

        <div className="relative space-y-8">
          <div className="space-y-3">
            <MonoLabel className="text-white/40">Plataforma de presupuestación IA</MonoLabel>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Describe tu obra.
              <br />
              <span className="text-[var(--brass)]">Obtén tu presupuesto.</span>
            </h1>
            <p className="text-white/50 text-lg leading-relaxed max-w-sm">
              La plataforma de presupuestación con IA para ingenieros civiles y empresas constructoras en LATAM.
            </p>
          </div>

          <ul className="space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-[var(--brass)] shrink-0" />
                <span className="text-white/70 text-sm">{f}</span>
              </li>
            ))}
          </ul>

          <div className="relative border border-white/10 p-5">
            <Pin className="absolute -top-1.5 -left-1.5" />
            <p className="text-white/70 text-sm italic leading-relaxed">
              &ldquo;Lo que antes me tomaba 3 días, ahora lo tengo en 4 minutos. Y con precios reales del mercado.&rdquo;
            </p>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-7 h-7 rounded-full bg-[var(--brass)] flex items-center justify-center text-white text-xs font-bold">
                C
              </div>
              <div>
                <p className="text-white text-xs font-medium">Carlos Quispe</p>
                <p className="text-white/40 text-xs">Jefe de Presupuestos · Lima, Perú</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative text-white/30 text-xs mono-label !tracking-normal !normal-case">
          © 2026 InfraPilot AI · Todos los derechos reservados
        </div>
      </div>

      {/* Right panel — clean editorial form */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[var(--paper)] px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="flex lg:hidden items-center gap-2 justify-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-[2px] bg-[var(--brass)]">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-[var(--ink)]">InfraPilot AI</span>
          </div>

          <div className="space-y-1">
            <MonoLabel>Acceso</MonoLabel>
            <h2 className="text-2xl font-bold text-[var(--ink)]">Iniciar sesión</h2>
            <p className="text-[var(--muted)] text-sm">Ingresa a tu espacio de trabajo</p>
          </div>

          {!isSupabaseConfigured && (
            <DemoNotice className="text-xs" />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--ink)]">Correo electrónico</label>
              <Input
                type="email"
                placeholder="tu@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 rounded-[2px] border-[var(--hairline)]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[var(--ink)]">Contraseña</label>
                <button type="button" className="text-xs text-[var(--brass)] hover:opacity-70 font-medium">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 pr-10 rounded-[2px] border-[var(--hairline)]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-[var(--muted)] hover:text-[var(--ink)]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="border border-[var(--warn)]/30 bg-[var(--warn)]/10 text-[var(--warn)] text-sm px-3 py-2 rounded-[2px]">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-10 text-sm rounded-[2px] bg-[var(--brass)] hover:bg-[var(--brass)]/90 text-white"
              disabled={loading || !isSupabaseConfigured}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Ingresando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Iniciar sesión
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-[var(--muted)]">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="text-[var(--brass)] font-medium hover:opacity-70">
              Crear cuenta gratis
            </Link>
          </p>

          <p className="text-center text-xs text-[var(--muted)]">
            Al continuar, aceptas nuestros{" "}
            <span className="underline cursor-pointer">Términos de servicio</span> y{" "}
            <span className="underline cursor-pointer">Política de privacidad</span>.
          </p>
        </div>
      </div>
    </div>
  )
}
