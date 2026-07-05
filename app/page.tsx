import Link from "next/link"

// ── Value points ──────────────────────────────────────────────
const valuePoints = [
  {
    num: "01",
    label: "Cotizador IA",
    title: "Describe la obra. Recibe el presupuesto.",
    desc: "Escribe tu proyecto en lenguaje natural y obtén partidas, APUs, materiales y mano de obra listos para revisar.",
  },
  {
    num: "02",
    label: "Presupuesto detallado",
    title: "Cada partida, clara y editable.",
    desc: "Desglose por sección, composición de costos y ajustes en tiempo real. Todo bajo control, sin hojas de cálculo dispersas.",
  },
  {
    num: "03",
    label: "Análisis financiero",
    title: "Proyecta antes de comprometerte.",
    desc: "Escenarios, rentabilidad y flujo del proyecto para decidir con criterio y sustentar cada cifra.",
  },
]

// ── Small crosshair accent (blueprint feel) ───────────────────
function Crosshair({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden
    >
      <line x1="12" y1="2" x2="12" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
    </svg>
  )
}

// ── Brass pin (pinned-card feel from the art direction) ───────
function Pin({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`absolute h-2.5 w-2.5 rounded-full bg-[var(--brass)] shadow-[0_1px_2px_rgba(27,26,23,0.35)] ${className}`}
    />
  )
}

// ── Hero board: pinned technical cards (inline SVG only) ──────
function HeroBoard() {
  return (
    <div
      aria-hidden
      className="pointer-events-none relative hidden h-[420px] w-[360px] select-none lg:block"
    >
      {/* Card A — spec sheet (mono lines) */}
      <div className="absolute left-0 top-2 w-[220px] -rotate-2 border border-[var(--hairline)] bg-white/70 p-4 shadow-[0_10px_30px_rgba(27,26,23,0.06)] backdrop-blur-[1px]">
        <Pin className="-top-1 left-3" />
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--muted)]">
          Partida 02.01 — Cimentación
        </p>
        <div className="mt-3 space-y-1.5">
          {["concreto f'c=210", "acero fy=4200", "encofrado m2", "excavación m3", "— subtotal"].map(
            (l) => (
              <p key={l} className="font-mono text-[10px] leading-relaxed text-[var(--muted)]">
                {l}
              </p>
            )
          )}
        </div>
      </div>

      {/* Card B — technical drawing */}
      <div className="absolute right-0 top-24 w-[190px] rotate-1 border border-[var(--hairline)] bg-white p-3 shadow-[0_10px_30px_rgba(27,26,23,0.07)]">
        <Pin className="-top-1 right-3" />
        <svg viewBox="0 0 160 120" fill="none" stroke="var(--ink)" strokeWidth="1">
          <path d="M20 100 L70 55 L70 20" />
          <path d="M140 100 L90 55 L90 20" />
          <path d="M70 20 L90 20" />
          <path d="M20 108 L70 63 L90 63 L140 108" strokeOpacity="0.35" />
          <line x1="10" y1="112" x2="150" y2="112" strokeDasharray="3 3" strokeOpacity="0.4" />
          <line x1="80" y1="8" x2="80" y2="116" strokeDasharray="2 4" strokeOpacity="0.3" />
          <circle cx="80" cy="55" r="14" strokeOpacity="0.5" />
        </svg>
        <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--muted)]">
          Detalle Y-02 · esc 1:20
        </p>
      </div>

      {/* Card C — brass control */}
      <div className="absolute bottom-4 left-10 w-[200px] -rotate-1 border border-[var(--hairline)] bg-white p-4 shadow-[0_10px_30px_rgba(27,26,23,0.07)]">
        <Pin className="-top-1 left-1/2 -translate-x-1/2" />
        <div className="rounded-full bg-[var(--brass)] px-4 py-2 text-center text-xs font-semibold text-[var(--paper)]">
          Cotizador
        </div>
        <div className="mt-3 h-1.5 w-full rounded-full bg-[var(--paper)]">
          <div className="relative h-1.5 w-2/3 rounded-full bg-[var(--hairline)]">
            <span className="absolute -right-1.5 -top-[3px] h-3 w-3 rounded-full border border-[var(--hairline)] bg-white shadow-sm" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="landing min-h-screen overflow-x-hidden bg-[var(--paper)] text-[var(--ink)] antialiased">
      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-5 sm:px-8">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          INFRA<span className="text-[var(--muted)]">|</span>PILOT
        </Link>
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/dashboard"
            className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
          >
            Dashboard
          </Link>
          <Link
            href="/cotizador"
            className="rounded-full border border-[var(--brass)] px-3.5 py-1.5 font-mono text-xs uppercase tracking-wide text-[var(--brass)] transition-colors hover:bg-[var(--brass)] hover:text-[var(--paper)] sm:px-4"
          >
            Probar gratis
          </Link>
        </div>
      </nav>

      <div className="h-px w-full bg-[var(--hairline)]" />

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative mx-auto max-w-6xl px-5 pt-20 pb-24 sm:px-8 sm:pt-28 sm:pb-32">
        {/* Blueprint crosshair accents */}
        <Crosshair className="pointer-events-none absolute right-5 top-10 h-4 w-4 text-[var(--hairline)] sm:right-8" />
        <Crosshair className="pointer-events-none absolute left-5 bottom-10 hidden h-4 w-4 text-[var(--hairline)] sm:left-8 sm:block" />

        <div className="mb-8 flex items-baseline justify-between gap-4">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Presupuestos de construcción
          </p>
          <p className="hidden font-mono text-xs tracking-[0.2em] text-[var(--muted)] sm:block">
            ≡ 01/04
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-[1fr_auto] lg:items-center lg:gap-10">
          <div>
            <h1 className="max-w-4xl text-[clamp(2.75rem,11vw,7rem)] font-bold uppercase leading-[0.92] tracking-tight text-[var(--ink)]">
              Precisión
              <br />
              y tiempo.
            </h1>

            <p className="mt-8 max-w-md font-mono text-sm leading-relaxed text-[var(--muted)] sm:text-base">
              Construimos orden.
            </p>

            <div className="mt-10">
              <Link
                href="/cotizador"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--brass)] px-6 py-3.5 text-sm font-semibold text-[var(--paper)] transition-opacity hover:opacity-90"
              >
                Probar el cotizador
                <span aria-hidden className="font-mono">
                  →
                </span>
              </Link>
            </div>
          </div>

          <HeroBoard />
        </div>
      </section>

      <div className="h-px w-full bg-[var(--hairline)]" />

      {/* ── Value points ────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <p className="mb-14 font-mono text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          Lo esencial, sin ruido
        </p>

        <div className="flex flex-col">
          {valuePoints.map(({ num, label, title, desc }, i) => (
            <div
              key={num}
              className={`grid grid-cols-1 gap-4 py-10 sm:grid-cols-[auto_1fr] sm:gap-12 ${
                i > 0 ? "border-t border-[var(--hairline)]" : ""
              }`}
            >
              <div className="flex items-baseline gap-3 sm:flex-col sm:gap-2">
                <span className="font-mono text-sm text-[var(--brass)]">{num}</span>
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                  {label}
                </span>
              </div>
              <div className="max-w-xl">
                <h2 className="text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-3xl">
                  {title}
                </h2>
                <p className="mt-3 leading-relaxed text-[var(--muted)]">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px w-full bg-[var(--hairline)]" />

      {/* ── Closing CTA ─────────────────────────────────────── */}
      <section className="relative mx-auto max-w-6xl px-5 py-24 text-center sm:px-8 sm:py-36">
        <Crosshair className="pointer-events-none absolute left-1/2 top-10 h-4 w-4 -translate-x-1/2 text-[var(--hairline)]" />
        <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          Empieza hoy
        </p>
        <h2 className="mx-auto max-w-2xl text-[clamp(2rem,7vw,4rem)] font-bold uppercase leading-[0.95] tracking-tight text-[var(--ink)]">
          Tu próximo presupuesto, en minutos.
        </h2>
        <div className="mt-10">
          <Link
            href="/cotizador"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--brass)] px-7 py-4 text-sm font-semibold text-[var(--paper)] transition-opacity hover:opacity-90"
          >
            Probar el cotizador
            <span aria-hidden className="font-mono">
              →
            </span>
          </Link>
        </div>
      </section>

      <div className="h-px w-full bg-[var(--hairline)]" />

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="mb-10 text-center">
          <p className="text-lg font-semibold tracking-tight text-[var(--ink)]">InfraPilot</p>
          <p className="mt-1 font-mono text-xs text-[var(--muted)]">Construimos orden.</p>
        </div>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
            Sistema de presupuestos de construcción © 2026 INFRA|PILOT
          </p>
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
            <Link href="/cotizador" className="transition-colors hover:text-[var(--ink)]">
              Cotizador
            </Link>
            <Link href="/dashboard" className="transition-colors hover:text-[var(--ink)]">
              Dashboard
            </Link>
            <Link href="/login" className="transition-colors hover:text-[var(--ink)]">
              Ingresar
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
