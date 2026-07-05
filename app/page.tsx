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

// ── Brass knob (3D pin, top-left of the reference) ────────────
function BrassKnob({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`block rounded-full ${className}`}
      style={{
        background:
          "radial-gradient(circle at 35% 30%, #c9ab7c 0%, #a8895b 45%, #7d6440 100%)",
        boxShadow:
          "0 2px 6px rgba(27,26,23,0.35), inset 0 1px 1px rgba(255,255,255,0.5), inset 0 -1px 2px rgba(27,26,23,0.3)",
      }}
    >
      <span
        className="m-auto mt-[22%] block h-[56%] w-[56%] rounded-full"
        style={{
          border: "1px solid rgba(60,45,25,0.45)",
          boxShadow: "inset 0 1px 2px rgba(255,255,255,0.25)",
        }}
      />
    </span>
  )
}

// ── Tactile pill button (soft 3D, like the reference hardware) ─
function TactileCircle({ children, title, href }: {
  children: React.ReactNode
  title: string
  href: string
}) {
  return (
    <Link
      href={href}
      title={title}
      aria-label={title}
      className="flex h-11 w-11 items-center justify-center rounded-full transition-transform hover:scale-[1.04]"
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #f4f1ea 100%)",
        boxShadow:
          "0 1px 2px rgba(27,26,23,0.18), 0 4px 10px rgba(27,26,23,0.08), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 2px rgba(27,26,23,0.06)",
      }}
    >
      {children}
    </Link>
  )
}

// ── Brass diamond icon ─────────────────────────────────────────
function DiamondIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" stroke="var(--brass)" strokeWidth="1.4" aria-hidden>
      <rect x="5.5" y="5.5" width="9" height="9" transform="rotate(45 10 10)" />
    </svg>
  )
}

// ── Refresh / cycle icon ───────────────────────────────────────
function CycleIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" stroke="var(--muted)" strokeWidth="1.4" strokeLinecap="round" aria-hidden>
      <path d="M15.5 10a5.5 5.5 0 1 1-1.6-3.9" />
      <path d="M15.7 3.8v3h-3" />
    </svg>
  )
}

// ── Pencil terrain cross-section (right collage, inline SVG) ──
function TerrainSketch({ className = "" }: { className?: string }) {
  // hatching strokes down the main slope
  const hatch = Array.from({ length: 14 }, (_, i) => {
    const x = 150 + i * 16
    const y = 250 - i * 5.5
    return <line key={i} x1={x} y1={y} x2={x - 22} y2={y + 34} />
  })
  return (
    <svg viewBox="0 0 520 400" fill="none" className={className} aria-hidden>
      {/* ground line */}
      <line x1="16" y1="352" x2="504" y2="352" stroke="var(--ink)" strokeOpacity="0.35" strokeDasharray="5 4" />
      {/* terrain profile */}
      <path
        d="M30 352 C70 330 100 268 150 246 C205 222 235 160 300 148 C350 140 415 190 462 216 L488 352 Z"
        stroke="var(--ink)" strokeOpacity="0.6" strokeWidth="1.1"
      />
      {/* internal strata */}
      <path d="M96 300 C160 274 240 224 330 212 C380 206 430 232 470 252" stroke="var(--ink)" strokeOpacity="0.28" strokeDasharray="2 4" />
      <path d="M150 330 C230 300 320 268 452 300" stroke="var(--ink)" strokeOpacity="0.22" strokeDasharray="2 4" />
      {/* hatching */}
      <g stroke="var(--ink)" strokeOpacity="0.3" strokeWidth="0.8">{hatch}</g>
      {/* vertical dimension */}
      <line x1="52" y1="352" x2="52" y2="160" stroke="var(--ink)" strokeOpacity="0.5" strokeWidth="0.9" />
      <line x1="46" y1="160" x2="58" y2="160" stroke="var(--ink)" strokeOpacity="0.5" />
      <line x1="46" y1="352" x2="58" y2="352" stroke="var(--ink)" strokeOpacity="0.5" />
      {/* horizontal dimension over the crest */}
      <line x1="240" y1="120" x2="392" y2="120" stroke="var(--ink)" strokeOpacity="0.5" strokeWidth="0.9" />
      <line x1="240" y1="114" x2="240" y2="126" stroke="var(--ink)" strokeOpacity="0.5" />
      <line x1="392" y1="114" x2="392" y2="126" stroke="var(--ink)" strokeOpacity="0.5" />
      {/* detail circle */}
      <circle cx="318" cy="168" r="20" stroke="var(--ink)" strokeOpacity="0.4" />
      <line x1="332" y1="154" x2="376" y2="112" stroke="var(--ink)" strokeOpacity="0.35" strokeWidth="0.8" />
      {/* small crest marker */}
      <line x1="300" y1="148" x2="300" y2="132" stroke="var(--brass)" strokeOpacity="0.9" strokeWidth="1" />
      {/* mono annotations */}
      <g fill="var(--muted)" fontFamily="var(--font-mono), monospace" fontSize="9" opacity="0.85">
        <text x="34" y="150">22.302</text>
        <text x="286" y="110">L 152.40</text>
        <text x="380" y="106">¥ 6.62</text>
        <text x="120" y="368">N 4.620</text>
        <text x="420" y="368">±0.00</text>
        <text x="466" y="242">L50</text>
        <text x="150" y="238">SSAL</text>
      </g>
    </svg>
  )
}

// ── Glass code panel (floating editor screenshot) ──────────────
const codeLines: { n: string; parts: { t: string; c: string }[] }[] = [
  { n: "01", parts: [{ t: "import", c: "var(--brass)" }, { t: " { apu } ", c: "var(--ink)" }, { t: "from", c: "var(--brass)" }, { t: ' "./precision"', c: "var(--muted)" }] },
  { n: "02", parts: [{ t: "", c: "" }] },
  { n: "03", parts: [{ t: "const", c: "var(--brass)" }, { t: " obra = ", c: "var(--ink)" }, { t: "definir", c: "var(--ink)" }, { t: "({", c: "var(--muted)" }] },
  { n: "04", parts: [{ t: "  terreno: ", c: "var(--muted)" }, { t: '"ladera 4.620 m²"', c: "var(--ink)" }, { t: ",", c: "var(--muted)" }] },
  { n: "05", parts: [{ t: "  cota: ", c: "var(--muted)" }, { t: "22.302", c: "var(--brass)" }, { t: ",", c: "var(--muted)" }] },
  { n: "06", parts: [{ t: "  ciclo: ", c: "var(--muted)" }, { t: '"presupuesto"', c: "var(--ink)" }, { t: ",", c: "var(--muted)" }] },
  { n: "07", parts: [{ t: "})", c: "var(--muted)" }] },
  { n: "08", parts: [{ t: "", c: "" }] },
  { n: "09", parts: [{ t: "await", c: "var(--brass)" }, { t: " obra.", c: "var(--ink)" }, { t: "cotizar", c: "var(--ink)" }, { t: "()", c: "var(--muted)" }] },
  { n: "10", parts: [{ t: "// partidas · APUs · flujo", c: "var(--muted)" }] },
  { n: "11", parts: [{ t: "export", c: "var(--brass)" }, { t: " precision", c: "var(--ink)" }] },
]

function GlassCodePanel({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-xl border border-white/70 bg-white/60 p-4 backdrop-blur-md ${className}`}
      style={{ boxShadow: "0 18px 50px rgba(27,26,23,0.12), inset 0 1px 0 rgba(255,255,255,0.8)" }}
    >
      <div className="mb-3 flex items-center justify-between border-b border-[var(--hairline)] pb-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--muted)]">cotizador.ts</span>
        <span className="flex gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--hairline)]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--hairline)]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--brass)]/60" />
        </span>
      </div>
      <div className="space-y-[3px]">
        {codeLines.map((l) => (
          <p key={l.n} className="flex gap-3 font-mono text-[9.5px] leading-[1.5]">
            <span className="w-4 shrink-0 text-right text-[var(--hairline)]">{l.n}</span>
            <span className="whitespace-pre">
              {l.parts.map((p, i) => (
                <span key={i} style={{ color: p.c || undefined }}>{p.t}</span>
              ))}
            </span>
          </p>
        ))}
      </div>
    </div>
  )
}

// ── Dimension line (blueprint measurement mark) ────────────────
function DimLine({ className = "", w = 90, label }: { className?: string; w?: number; label?: string }) {
  return (
    <span aria-hidden className={`block ${className}`} style={{ width: w }}>
      <svg viewBox={`0 0 ${w} 14`} width={w} height="14" fill="none" stroke="var(--ink)" strokeOpacity="0.4" strokeWidth="0.9">
        <line x1="0" y1="7" x2={w} y2="7" />
        <line x1="0.5" y1="1" x2="0.5" y2="13" />
        <line x1={w - 0.5} y1="1" x2={w - 0.5} y2="13" />
      </svg>
      {label && (
        <span className="mt-0.5 block font-mono text-[8px] tracking-wide text-[var(--muted)]">{label}</span>
      )}
    </span>
  )
}

// ── Sparkle mark (bottom-right of reference) ───────────────────
function Sparkle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2 L13.8 10.2 L22 12 L13.8 13.8 L12 22 L10.2 13.8 L2 12 L10.2 10.2 Z" />
    </svg>
  )
}

export default function LandingPage() {
  return (
    <div className="landing min-h-screen overflow-x-hidden bg-[var(--paper)] text-[var(--ink)] antialiased">
      {/* ══ HERO — recreación 1:1 de la referencia ═══════════════ */}
      <section className="relative flex min-h-[100svh] flex-col overflow-hidden">
        {/* soft light from the right (reference lighting) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(255deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.25) 34%, rgba(255,255,255,0) 60%), radial-gradient(900px 500px at 82% 8%, rgba(255,255,255,0.55), rgba(255,255,255,0) 70%)",
          }}
        />

        {/* brass knob — top left */}
        <BrassKnob className="absolute left-6 top-6 h-9 w-9 sm:left-10 sm:top-9 sm:h-10 sm:w-10" />

        {/* discreet access — top right */}
        <div className="absolute right-6 top-7 flex items-center gap-5 sm:right-10 sm:top-9">
          <Link
            href="/login"
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
          >
            Ingresar
          </Link>
          <Crosshair className="h-4 w-4 text-[var(--muted)]/70" />
        </div>

        {/* vertical rail — left edge */}
        <p
          className="pointer-events-none absolute left-3 top-1/2 hidden origin-center -translate-y-1/2 -rotate-90 font-mono text-[10px] uppercase tracking-[0.35em] text-[var(--muted)]/80 md:block"
          aria-hidden
        >
          Infra&nbsp;&nbsp;Pilot&nbsp;&nbsp;·&nbsp;&nbsp;System&nbsp;v2.4
        </p>

        {/* main grid */}
        <div className="relative mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-center px-6 pb-28 pt-24 sm:px-12 md:px-16 lg:grid lg:grid-cols-[minmax(0,55%)_minmax(0,45%)] lg:items-center lg:gap-4 lg:pb-20 lg:pt-16">
          {/* left column — type */}
          <div className="relative z-10">
            <h1 className="text-[clamp(3rem,7.2vw,6.9rem)] font-bold uppercase leading-[0.98] tracking-tight text-[var(--ink)]">
              <span className="block lg:whitespace-nowrap">Precisión en</span>
              <span className="block lg:whitespace-nowrap">cada ciclo</span>
            </h1>

            <div className="mt-10 space-y-1 sm:mt-14">
              <p className="inline-block border-b border-[var(--ink)]/45 pb-1 font-mono text-lg text-[var(--ink)]/80 sm:text-xl">
                Hacemos tus ideas
              </p>
              <br />
              <p className="inline-block border-b border-[var(--ink)]/20 pb-1 font-mono text-lg text-[var(--ink)]/80 sm:text-xl">
                más rápido y mejor.
              </p>
            </div>

            {/* ruler with mono labels */}
            <div className="mt-10 max-w-md sm:mt-12">
              <div className="flex justify-between pb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--muted)]">
                <span>Cotizador</span>
                <span>APUs</span>
                <span>Presupuestos</span>
              </div>
              <svg viewBox="0 0 400 12" className="w-full" fill="none" stroke="var(--muted)" strokeOpacity="0.6" strokeWidth="1" aria-hidden>
                <line x1="0" y1="1" x2="400" y2="1" />
                {Array.from({ length: 21 }, (_, i) => {
                  const x = i * 20
                  const h = i % 5 === 0 ? 10 : 5
                  return <line key={i} x1={x} y1="1" x2={x} y2={1 + h} />
                })}
              </svg>
            </div>

            {/* tactile control pill — bottom-left hardware buttons */}
            <div
              className="mt-12 inline-flex items-center gap-2 rounded-full p-2 sm:mt-16"
              style={{
                background: "linear-gradient(180deg,#fdfcf9 0%,#f1ede4 100%)",
                boxShadow:
                  "0 2px 4px rgba(27,26,23,0.12), 0 10px 26px rgba(27,26,23,0.10), inset 0 1px 0 rgba(255,255,255,0.85)",
              }}
            >
              <TactileCircle href="/cotizador" title="Probar el cotizador">
                <DiamondIcon className="h-5 w-5" />
              </TactileCircle>
              <TactileCircle href="/dashboard" title="Ir al dashboard">
                <CycleIcon className="h-5 w-5" />
              </TactileCircle>
            </div>
          </div>

          {/* right column — technical collage */}
          <div className="pointer-events-none relative mt-14 hidden h-[520px] select-none lg:mt-0 lg:block">
            <TerrainSketch className="absolute bottom-0 left-0 w-[92%] opacity-90" />
            {/* back glass panel */}
            <div
              className="absolute right-2 top-2 h-56 w-72 rounded-xl border border-white/60 bg-white/30 backdrop-blur-[2px]"
              style={{ boxShadow: "0 12px 36px rgba(27,26,23,0.08)" }}
            />
            {/* code glass panel */}
            <GlassCodePanel className="absolute right-10 top-12 w-[290px]" />
            {/* scattered dimension marks */}
            <DimLine className="absolute left-6 top-8" w={110} label="22.302" />
            <DimLine className="absolute right-6 bottom-24" w={72} label="L50" />
            <DimLine className="absolute left-1/3 top-1/3" w={56} />
            <span className="absolute left-10 top-24 font-mono text-[8px] tracking-wide text-[var(--muted)]" aria-hidden>
              30.5N
            </span>
            <span className="absolute right-24 bottom-8 font-mono text-[8px] tracking-wide text-[var(--muted)]" aria-hidden>
              PSJ · 09
            </span>
          </div>

          {/* mobile: compact collage */}
          <div className="pointer-events-none relative mt-12 h-56 select-none lg:hidden">
            <TerrainSketch className="absolute inset-x-0 bottom-0 w-full opacity-80" />
          </div>
        </div>

        {/* vertical scroll pill — right edge */}
        <div
          className="absolute right-4 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-1 rounded-full p-1.5 md:flex"
          style={{
            background: "linear-gradient(180deg,#fdfcf9 0%,#f1ede4 100%)",
            boxShadow:
              "0 2px 4px rgba(27,26,23,0.12), 0 8px 22px rgba(27,26,23,0.10), inset 0 1px 0 rgba(255,255,255,0.85)",
          }}
        >
          <a
            href="#top"
            aria-label="Subir"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
          >
            <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M3 10l5-5 5 5" /></svg>
          </a>
          <a
            href="#esencial"
            aria-label="Ver lo esencial"
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{
              background: "linear-gradient(180deg,#ffffff 0%,#f4f1ea 100%)",
              boxShadow: "0 1px 2px rgba(27,26,23,0.15), inset 0 1px 0 rgba(255,255,255,0.9)",
            }}
          >
            <DiamondIcon className="h-4 w-4" />
          </a>
          <a
            href="#esencial"
            aria-label="Bajar"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
          >
            <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M3 6l5 5 5-5" /></svg>
          </a>
        </div>

        {/* corner marks */}
        <span className="absolute bottom-8 left-6 hidden h-5 w-px bg-[var(--muted)]/50 sm:block" aria-hidden />
        <Sparkle className="absolute bottom-7 right-7 h-3.5 w-3.5 text-[var(--muted)]/70" />
      </section>

      <div className="h-px w-full bg-[var(--hairline)]" />

      {/* ── Value points ────────────────────────────────────── */}
      <section id="esencial" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
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
