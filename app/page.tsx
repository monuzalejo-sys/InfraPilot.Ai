import Link from "next/link"
import {
  Building2, Sparkles, FileText, TrendingUp, Gavel,
  ArrowRight, CheckCircle, Zap, BarChart3, Shield,
  ChevronRight, Star, Download,
} from "lucide-react"

// ── Feature cards ─────────────────────────────────────────────
const features = [
  {
    icon: Sparkles,
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.2)",
    label: "Cotizador IA",
    description: "Describe tu obra en lenguaje natural. La IA genera un presupuesto completo con APUs, materiales, mano de obra y equipos en segundos.",
    badge: "IA",
  },
  {
    icon: FileText,
    color: "#6366f1",
    bg: "rgba(99,102,241,0.08)",
    border: "rgba(99,102,241,0.2)",
    label: "Presupuesto Detallado",
    description: "Visualiza cada partida, APU y material con desglose por sección. Gráficos de composición de costos, curva S y análisis AIU·IGV.",
    badge: null,
  },
  {
    icon: TrendingUp,
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.08)",
    border: "rgba(6,182,212,0.2)",
    label: "Predictor Financiero",
    description: "Proyecciones a 1, 3 y 5 años con escenarios Conservador, Probable y Crítico. TIR, VAN y payback calculados automáticamente.",
    badge: null,
  },
  {
    icon: Gavel,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)",
    label: "Analizador de Licitaciones",
    description: "Sube el expediente en PDF. La IA detecta requisitos, riesgos contractuales, garantías exigidas y calcula tu compatibilidad.",
    badge: "Nuevo",
  },
  {
    icon: Download,
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.2)",
    label: "Exportar a Excel",
    description: "Descarga tu presupuesto con 5 hojas estructuradas: Resumen, Actividades, APUs, Materiales y Mano de Obra. Formato listo para cliente.",
    badge: null,
  },
  {
    icon: BarChart3,
    color: "#f43f5e",
    bg: "rgba(244,63,94,0.08)",
    border: "rgba(244,63,94,0.2)",
    label: "Dashboard Ejecutivo",
    description: "KPIs del portafolio en tiempo real: proyectos activos, facturación, avance físico y financiero, y alertas de desviación de costos.",
    badge: null,
  },
]

// ── Steps ──────────────────────────────────────────────────────
const steps = [
  {
    num: "01",
    title: "Describe tu proyecto",
    desc: "Escribe en lenguaje libre: tipo de obra, ubicación, área, materiales. Sin formularios complejos.",
  },
  {
    num: "02",
    title: "La IA analiza y genera",
    desc: "Claude procesa tu descripción, selecciona APUs relevantes, asigna cantidades y calcula precios de mercado.",
  },
  {
    num: "03",
    title: "Revisa, ajusta y exporta",
    desc: "Edita overhead y utilidad en tiempo real, valida los APUs y descarga el Excel listo para entregar.",
  },
]

// ── Stats ──────────────────────────────────────────────────────
const stats = [
  { value: "50+",  label: "APUs precargados" },
  { value: "200+", label: "Materiales calibrados" },
  { value: "10×",  label: "Más rápido que manual" },
  { value: "95%",  label: "Precisión en precios" },
]

// ── Benefits ───────────────────────────────────────────────────
const benefits = [
  "Precios CAMACOL / CAPECO actualizados mensualmente",
  "Análisis de riesgos contractuales automatizado",
  "Multi-moneda: COP · PEN · USD",
  "Exportación Excel con 5 hojas estructuradas",
  "Proyecciones financieras a 5 años",
  "Compatible con SECOP II y SEACE",
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans overflow-x-hidden">

      {/* ── Background glows ─── */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(ellipse at center, #6366f1 0%, transparent 70%)" }} />
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse at center, #8b5cf6 0%, transparent 70%)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-8"
          style={{ background: "radial-gradient(ellipse at center, #06b6d4 0%, transparent 70%)" }} />
      </div>

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-semibold tracking-tight">InfraPilot AI</span>
          <span className="hidden sm:inline-flex ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 tracking-wide">
            BETA
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard"
            className="hidden sm:block text-sm text-slate-400 hover:text-white transition-colors px-4 py-2">
            Dashboard
          </Link>
          <Link href="/cotizador"
            className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
            Probar gratis
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative z-10 text-center px-6 pt-24 pb-20 md:pt-32 md:pb-28">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/5 text-violet-300 text-xs font-medium mb-8">
          <Zap className="w-3.5 h-3.5" />
          Powered by Claude AI · Anthropic
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6 max-w-4xl mx-auto">
          Presupuestos de{" "}
          <span className="inline-block"
            style={{
              background: "linear-gradient(135deg, #a78bfa 0%, #6366f1 50%, #38bdf8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
            construcción
          </span>
          {" "}en minutos, no en días.
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Describe tu obra en lenguaje natural. InfraPilot AI genera el presupuesto completo
          con APUs, materiales, mano de obra y análisis financiero — listo para exportar.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/cotizador"
            className="group flex items-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold text-base transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/20"
            style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
            <Sparkles className="w-4 h-4" />
            Probar Cotizador IA
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link href="/dashboard"
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-base border border-white/10 bg-white/5 hover:bg-white/10 transition-all hover:scale-[1.02] active:scale-[0.98]">
            Entrar al Dashboard
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-1.5 mt-8 text-slate-500 text-sm">
          {[0,1,2,3,4].map(i => (
            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          ))}
          <span className="ml-1">Usado por constructoras en Colombia y Perú</span>
        </div>
      </section>

      {/* ── App preview ─────────────────────────────────────── */}
      <section className="relative z-10 px-6 md:px-12 pb-20 max-w-6xl mx-auto">
        <div className="rounded-2xl overflow-hidden border border-white/8 shadow-2xl shadow-black/40"
          style={{ background: "linear-gradient(180deg, #18181b 0%, #0f172a 100%)" }}>
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/5">
            <div className="w-3 h-3 rounded-full bg-rose-500/70" />
            <div className="w-3 h-3 rounded-full bg-amber-400/70" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
            <div className="ml-4 flex-1 h-5 rounded-md bg-white/5 max-w-xs" />
          </div>
          {/* Mock dashboard */}
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Proyectos activos", value: "15", color: "#6366f1" },
              { label: "Facturado total",   value: "S/ 48.3M", color: "#10b981" },
              { label: "APUs generados",    value: "50",        color: "#8b5cf6" },
              { label: "Licitaciones",      value: "10",        color: "#f59e0b" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white/4 rounded-xl p-4 border border-white/5">
                <p className="text-xs text-slate-500 mb-1">{label}</p>
                <p className="text-2xl font-black" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>
          <div className="px-6 pb-6 grid grid-cols-3 gap-4">
            <div className="col-span-2 h-28 rounded-xl bg-white/3 border border-white/5 flex items-center justify-center gap-2 text-slate-600 text-xs">
              <BarChart3 className="w-4 h-4" /> Gráfico de distribución de costos
            </div>
            <div className="h-28 rounded-xl bg-white/3 border border-white/5 flex items-center justify-center gap-2 text-slate-600 text-xs">
              <TrendingUp className="w-4 h-4" /> Curva S
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────── */}
      <section className="relative z-10 border-y border-white/5 py-14">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map(({ value, label }) => (
            <div key={label}>
              <p className="text-4xl font-black text-white mb-1"
                style={{
                  background: "linear-gradient(135deg,#a78bfa,#6366f1)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                {value}
              </p>
              <p className="text-sm text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section className="relative z-10 px-6 md:px-12 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">Plataforma completa</p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">
            Todo lo que necesita una constructora
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Desde la cotización inicial hasta el análisis financiero a 5 años, en una sola herramienta.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, color, bg, border, label, description, badge }) => (
            <div key={label}
              className="group relative rounded-2xl p-6 border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
              style={{ background: "#111113", borderColor: "rgba(255,255,255,0.07)" }}>
              {badge && (
                <span className="absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: bg, color, border: `1px solid ${border}` }}>
                  {badge}
                </span>
              )}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: bg, border: `1px solid ${border}` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <h3 className="font-bold text-white mb-2">{label}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────── */}
      <section className="relative z-10 px-6 md:px-12 py-24 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">Proceso</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
              Tres pasos. Presupuesto listo.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map(({ num, title, desc }) => (
              <div key={num} className="relative">
                <div className="text-6xl font-black mb-4 leading-none select-none"
                  style={{
                    background: "linear-gradient(135deg,rgba(99,102,241,0.3),rgba(139,92,246,0.1))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}>
                  {num}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits list ───────────────────────────────────── */}
      <section className="relative z-10 px-6 md:px-12 py-24 border-t border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-3">Incluido</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-4">
              Diseñado para el mercado latinoamericano
            </h2>
            <p className="text-slate-400 leading-relaxed">
              Precios y normativas locales de Colombia y Perú. Integración con bases de datos
              CAMACOL, CAPECO e INVIAS. Multi-moneda y multi-región desde el primer día.
            </p>
          </div>
          <ul className="grid grid-cols-1 gap-3">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                </div>
                <span className="text-sm text-slate-300">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── AI Badge section ────────────────────────────────── */}
      <section className="relative z-10 px-6 md:px-12 py-16 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl border border-violet-500/20 bg-violet-500/5 mb-6">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-violet-300">Motor de inteligencia artificial</p>
              <p className="text-xs text-slate-500">Claude Sonnet 4.6 · Anthropic</p>
            </div>
          </div>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            InfraPilot AI usa los modelos más avanzados de Anthropic para analizar y generar
            presupuestos con precisión de experto. Cada APU es validado contra bases de precios reales.
          </p>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────── */}
      <section className="relative z-10 px-6 md:px-12 py-28 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-indigo-400" />
            <span className="text-indigo-400 text-sm font-semibold">Acceso gratuito durante el beta</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6 leading-tight">
            Empieza a cotizar{" "}
            <span style={{
              background: "linear-gradient(135deg,#a78bfa,#6366f1)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              en segundos.
            </span>
          </h2>
          <p className="text-slate-400 text-lg mb-10">
            Sin tarjeta de crédito. Sin instalaciones. Solo describe tu obra y obtén tu presupuesto.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/cotizador"
              className="group flex items-center gap-2 px-8 py-4 rounded-xl text-white font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-indigo-500/25"
              style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
              <Sparkles className="w-5 h-5" />
              Probar Cotizador IA gratis
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="/dashboard"
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base border border-white/10 bg-white/5 hover:bg-white/10 transition-all hover:scale-[1.02]">
              Ver Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/5 px-6 md:px-12 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
              <Building2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-semibold text-sm">InfraPilot AI</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/dashboard"   className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/cotizador"   className="hover:text-white transition-colors">Cotizador</Link>
            <Link href="/presupuestos"className="hover:text-white transition-colors">Presupuestos</Link>
            <Link href="/predictor"   className="hover:text-white transition-colors">Predictor</Link>
            <Link href="/licitaciones"className="hover:text-white transition-colors">Licitaciones</Link>
          </nav>
          <p className="text-slate-600 text-xs">
            © 2026 InfraPilot AI · Powered by Claude · Anthropic
          </p>
        </div>
      </footer>

    </div>
  )
}
