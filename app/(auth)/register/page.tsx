"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Building2, ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"
import { DemoNotice } from "@/components/demo-notice"

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
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="max-w-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">¡Cuenta creada!</h2>
          <p className="text-slate-500 text-sm">
            Tu cuenta ha sido creada exitosamente.<br />
            Redirigiendo al login en <strong>{countdown}</strong>...
          </p>
          <Link href="/login">
            <Button className="w-full mt-2">Iniciar sesión ahora</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex items-center gap-2 justify-center">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg gradient-ai">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900">InfraPilot AI</span>
        </div>

        <div className="space-y-1 text-center">
          <h2 className="text-2xl font-bold text-slate-900">Crear cuenta gratis</h2>
          <p className="text-slate-500 text-sm">Sin tarjeta de crédito</p>
        </div>

        {!isSupabaseConfigured && (
          <DemoNotice className="text-xs" />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Nombre completo</label>
            <Input
              type="text"
              placeholder="Ing. Carlos Quispe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Empresa constructora</label>
            <Input
              type="text"
              placeholder="Constructora ABC S.A.C."
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Correo electrónico</label>
            <Input
              type="email"
              placeholder="tu@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Contraseña</label>
            <Input
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10"
              required
              minLength={8}
            />
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full h-10 text-sm" disabled={loading || !isSupabaseConfigured}>
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

        <p className="text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-indigo-600 font-medium hover:text-indigo-700">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
