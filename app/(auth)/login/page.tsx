"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Building2, Eye, EyeOff, ArrowRight, Sparkles, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const features = [
  "Presupuestos completos en menos de 5 minutos",
  "APUs con precios CAPECO actualizados",
  "Análisis de riesgos automático por IA",
  "Exportación Excel y PDF profesional",
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 900))
    router.push("/")
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-900/20 blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl gradient-ai shadow-lg">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">InfraPilot AI</span>
        </div>

        {/* Main content */}
        <div className="relative space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-violet-300 text-xs font-medium">Powered by Claude AI</span>
            </div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Describe tu obra.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                Obtén tu presupuesto.
              </span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
              La plataforma de presupuestación con IA para ingenieros civiles y empresas constructoras en LATAM.
            </p>
          </div>

          <ul className="space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-300 text-sm">{f}</span>
              </li>
            ))}
          </ul>

          {/* Fake quote */}
          <div className="border border-slate-700 rounded-xl p-5 bg-slate-800/50 backdrop-blur-sm">
            <p className="text-slate-300 text-sm italic leading-relaxed">
              "Lo que antes me tomaba 3 días, ahora lo tengo en 4 minutos. Y con precios reales del mercado."
            </p>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                C
              </div>
              <div>
                <p className="text-white text-xs font-medium">Carlos Quispe</p>
                <p className="text-slate-500 text-xs">Jefe de Presupuestos · Lima, Perú</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative text-slate-600 text-xs">
          © 2026 InfraPilot AI · Todos los derechos reservados
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 justify-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg gradient-ai">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">InfraPilot AI</span>
          </div>

          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900">Iniciar sesión</h2>
            <p className="text-slate-500 text-sm">Ingresa a tu espacio de trabajo</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Contraseña</label>
                <button
                  type="button"
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-10 text-sm"
              disabled={loading}
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

            {/* Demo shortcut */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-slate-400">o continúa con</span>
              </div>
            </div>

            <Link href="/">
              <Button
                type="button"
                variant="outline"
                className="w-full h-10 text-sm gap-2"
              >
                <Sparkles className="w-4 h-4 text-violet-500" />
                Entrar al demo sin registro
              </Button>
            </Link>
          </form>

          <p className="text-center text-sm text-slate-500">
            ¿No tienes cuenta?{" "}
            <button className="text-indigo-600 font-medium hover:text-indigo-700">
              Crear cuenta gratis
            </button>
          </p>

          <p className="text-center text-xs text-slate-400">
            Al continuar, aceptas nuestros{" "}
            <span className="underline cursor-pointer">Términos de servicio</span> y{" "}
            <span className="underline cursor-pointer">Política de privacidad</span>.
          </p>
        </div>
      </div>
    </div>
  )
}
