"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Building2, ArrowRight, CheckCircle2 } from "lucide-react"
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

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [company, setCompany] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    if (!success) return
    const interval = setInterval(() => setCountdown(c => c - 1), 1000)
    return () => clearInterval(interval)
  }, [success])

  useEffect(() => {
    if (countdown <= 0) router.push("/login")
  }, [countdown, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isSupabaseConfigured) return
    setLoading(true)
    setError(null)

    const supabase = createClient()
    if (!supabase) { setLoading(false); return }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, company },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--paper)] px-6">
        <div className="max-w-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-[2px] bg-[var(--ok)]/10 border border-[var(--ok)]/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-[var(--ok)]" />
          </div>
          <MonoLabel className="justify-center flex">Cuenta creada</MonoLabel>
          <h2 className="text-2xl font-bold text-[var(--ink)]">¡Cuenta creada!</h2>
          <p className="text-[var(--muted)] text-sm">
            Tu cuenta ha sido creada exitosamente.<br />
            Redirigiendo al login en <strong className="text-[var(--ink)]">{countdown}</strong>...
          </p>
          <Link href="/login">
            <Button className="w-full mt-2 rounded-[2px] bg-[var(--brass)] hover:bg-[var(--brass)]/90 text-white">
              Iniciar sesión ahora
            </Button>
          </Link>
        </div>
      </div>
    )
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
            <MonoLabel className="text-white/40">Comienza gratis</MonoLabel>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Tu primer presupuesto
              <br />
              <span className="text-[var(--brass)]">en minutos, no días.</span>
            </h1>
            <p className="text-white/50 text-lg leading-relaxed max-w-sm">
              Únete a los ingenieros y constructoras que ya presupuestan con IA en LATAM.
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

          <div className="space-y-1 text-center">
            <MonoLabel className="justify-center flex">Registro</MonoLabel>
            <h2 className="text-2xl font-bold text-[var(--ink)]">Crear cuenta gratis</h2>
            <p className="text-[var(--muted)] text-sm">Sin tarjeta de crédito</p>
          </div>

          {!isSupabaseConfigured && (
            <DemoNotice className="text-xs" />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--ink)]">Nombre completo</label>
              <Input
                type="text"
                placeholder="Ing. Carlos Quispe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 rounded-[2px] border-[var(--hairline)]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--ink)]">Empresa constructora</label>
              <Input
                type="text"
                placeholder="Constructora ABC S.A.C."
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="h-10 rounded-[2px] border-[var(--hairline)]"
              />
            </div>

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
              <label className="text-sm font-medium text-[var(--ink)]">Contraseña</label>
              <Input
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 rounded-[2px] border-[var(--hairline)]"
                required
                minLength={8}
              />
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
                  Creando cuenta...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Crear cuenta
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-[var(--muted)]">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-[var(--brass)] font-medium hover:opacity-70">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
