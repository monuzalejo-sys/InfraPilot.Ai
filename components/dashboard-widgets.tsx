"use client"

/* Editorial dashboard widgets — warm-paper technical board.
   Pure presentation: all data is passed in by dashboard/page.tsx, which still
   owns the fetch/mock flow. No chart libraries — inline SVG only.
   Tokens: var(--paper) var(--ink) var(--muted) var(--brass)
           var(--hairline) var(--card) var(--ok) var(--warn) */

import { useState } from "react"
import Link from "next/link"
import { ChevronRight, ArrowUpRight } from "lucide-react"
import { EditorialCard, MonoLabel } from "@/components/editorial"
import { DISCIPLINES } from "@/lib/disciplines"

// ── Topographic contour map (decorative) ─────────────────────────
// Concentric level curves in hairline/muted, one brass "surveyed" tick.
function ContourMap({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 120"
      className={className}
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      {/* Level curves — nested closed contours (contour lines of a hill) */}
      <path d="M12 96 C 40 70, 60 88, 96 66 S 150 50, 192 74" stroke="var(--hairline)" strokeWidth="1" />
      <path d="M18 84 C 46 62, 66 78, 98 58 S 146 46, 186 64" stroke="var(--hairline)" strokeWidth="1" />
      <path d="M28 74 C 52 56, 72 68, 100 52 S 140 44, 176 56" stroke="var(--muted)" strokeOpacity="0.35" strokeWidth="1" />
      <path d="M42 66 C 62 52, 80 60, 102 48 S 132 44, 162 50" stroke="var(--muted)" strokeOpacity="0.5" strokeWidth="1" />
      <path d="M60 60 C 74 50, 88 54, 104 46 S 122 44, 142 46" stroke="var(--muted)" strokeOpacity="0.6" strokeWidth="1" />
      <path d="M78 55 C 88 49, 96 51, 106 46 S 116 45, 124 45" stroke="var(--muted)" strokeOpacity="0.7" strokeWidth="1" />
      {/* Register grid ticks along the bottom (dimension line) */}
      <line x1="12" y1="108" x2="188" y2="108" stroke="var(--hairline)" strokeWidth="1" strokeDasharray="2 5" />
      {/* Brass surveyed point + crosshair (the "you are here" mark) */}
      <g stroke="var(--brass)" strokeWidth="1">
        <line x1="105" y1="40" x2="105" y2="52" />
        <line x1="99" y1="46" x2="111" y2="46" />
      </g>
      <circle cx="105" cy="46" r="1.6" fill="var(--brass)" stroke="none" />
    </svg>
  )
}

export interface PriceRow {
  label: string
  value: string
  /** trend in % vs prior period; sign drives the accent */
  delta?: number
}

// (a) RadarPrecios — topographic contour backdrop + price readings ──
export function RadarPrecios({
  rows,
  updatedLabel,
}: {
  rows: PriceRow[]
  updatedLabel?: string
}) {
  return (
    <EditorialCard title="Radar de precios" action={updatedLabel ? <MonoLabel>{updatedLabel}</MonoLabel> : undefined}>
      <div className="relative">
        {/* Decorative contour map */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 overflow-hidden opacity-90">
          <ContourMap className="h-full w-full" />
        </div>

        <div className="relative pt-24">
          {rows.length === 0 ? (
            <p className="py-4 text-sm text-[var(--muted)]">Sin lecturas de precios.</p>
          ) : (
            <dl className="divide-y divide-[var(--hairline)]">
              {rows.map((r) => {
                const up = (r.delta ?? 0) > 0
                const down = (r.delta ?? 0) < 0
                return (
                  <div key={r.label} className="flex items-baseline justify-between gap-4 py-2.5">
                    <dt className="font-mono text-xs uppercase tracking-wide text-[var(--muted)]">
                      {r.label}
                    </dt>
                    <dd className="flex items-baseline gap-2">
                      <span className="text-lg font-semibold tabular-nums tracking-tight text-[var(--ink)]">
                        {r.value}
                      </span>
                      {r.delta !== undefined && (
                        <span
                          className="font-mono text-[11px] tabular-nums"
                          style={{ color: up ? "var(--warn)" : down ? "var(--ok)" : "var(--muted)" }}
                        >
                          {up ? "▲" : down ? "▼" : "•"} {Math.abs(r.delta).toFixed(1)}%
                        </span>
                      )}
                    </dd>
                  </div>
                )
              })}
            </dl>
          )}
        </div>
      </div>
    </EditorialCard>
  )
}

export interface TimelinePoint {
  label: string
  value: number
}

// (b) TimelineLicitaciones — inline bars + trend line (no chart lib) ─
export function TimelineLicitaciones({
  points,
  caption,
}: {
  points: TimelinePoint[]
  caption?: string
}) {
  const W = 280
  const H = 96
  const pad = 6
  const max = Math.max(1, ...points.map((p) => p.value))
  const n = Math.max(1, points.length)
  const step = (W - pad * 2) / n
  const barW = Math.max(4, step * 0.5)

  const x = (i: number) => pad + step * i + step / 2
  const y = (v: number) => H - pad - (v / max) * (H - pad * 2)

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`)
    .join(" ")

  return (
    <EditorialCard title="Timeline · Licitaciones" action={caption ? <MonoLabel>{caption}</MonoLabel> : undefined}>
      {points.length === 0 ? (
        <p className="py-4 text-sm text-[var(--muted)]">Sin actividad de licitaciones.</p>
      ) : (
        <>
          <svg viewBox={`0 0 ${W} ${H}`} className="h-24 w-full" role="img" aria-label="Actividad de licitaciones por periodo">
            {/* Baseline */}
            <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="var(--hairline)" strokeWidth="1" />
            {/* Bars */}
            {points.map((p, i) => (
              <rect
                key={p.label}
                x={x(i) - barW / 2}
                y={y(p.value)}
                width={barW}
                height={Math.max(0, H - pad - y(p.value))}
                fill="var(--hairline)"
              />
            ))}
            {/* Trend line + nodes in brass */}
            <path d={linePath} fill="none" stroke="var(--brass)" strokeWidth="1.5" />
            {points.map((p, i) => (
              <circle key={p.label} cx={x(i)} cy={y(p.value)} r="2" fill="var(--brass)" />
            ))}
          </svg>
          <div className="mt-2 flex justify-between">
            {points.map((p) => (
              <span key={p.label} className="font-mono text-[10px] uppercase tracking-wide text-[var(--muted)]">
                {p.label}
              </span>
            ))}
          </div>
        </>
      )}
    </EditorialCard>
  )
}

// (c) ChipRiesgoIA — copiloto alert chip w/ pulsing brass ring ──────
export function ChipRiesgoIA({
  message,
  model = "claude-sonnet-4-6",
}: {
  message: string
  model?: string
}) {
  return (
    <div className="editorial-card relative flex items-start gap-3 p-4">
      <span className="relative mt-1 flex h-2.5 w-2.5 shrink-0">
        <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--brass)] animate-pulse-ring" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--brass)]" />
      </span>
      <div className="min-w-0">
        <p className="mono-label text-[var(--brass)]">Copiloto IA · Riesgo detectado</p>
        <p className="mt-1.5 text-sm leading-relaxed text-[var(--ink)]">{message}</p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-wide text-[var(--muted)]">{model}</p>
      </div>
    </div>
  )
}

// (d) HubIngenierias — plataforma multi-ingeniería ─────────────────
// Una card por disciplina del registry; click → accordion (una a la
// vez) que despliega sus modules con acceso directo. Numeración mono
// editorial 01/02/03, único color de acción brass.
export function HubIngenierias() {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {DISCIPLINES.map((discipline, di) => {
        const open = openId === discipline.id
        const Icon = discipline.modules[0]?.icon
        const count = discipline.modules.length
        return (
          <section
            key={discipline.id}
            className={`editorial-card relative flex flex-col p-5 transition-colors ${
              open ? "sm:col-span-2 xl:col-span-3" : ""
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenId(open ? null : discipline.id)}
              aria-expanded={open}
              className="group flex w-full items-start gap-4 text-left"
            >
              {Icon && (
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-[var(--hairline)] transition-colors group-hover:border-[var(--brass)]">
                  <Icon className="h-5 w-5 text-[var(--brass)]" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] tabular-nums text-[var(--muted)]">
                    {String(di + 1).padStart(2, "0")}
                  </span>
                  <h3 className="truncate text-base font-semibold tracking-tight text-[var(--ink)] transition-colors group-hover:text-[var(--brass)]">
                    {discipline.label}
                  </h3>
                </div>
                {discipline.description && (
                  <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
                    {discipline.description}
                  </p>
                )}
                <p className="mt-2 font-mono text-[10px] uppercase tracking-wide text-[var(--muted)]">
                  {count} {count === 1 ? "herramienta" : "herramientas"}
                </p>
              </div>
              <ChevronRight
                className={`mt-0.5 h-4 w-4 shrink-0 text-[var(--muted)] transition-transform ${
                  open ? "rotate-90 text-[var(--brass)]" : ""
                }`}
              />
            </button>

            {open && (
              <ul className="animate-fade-in-up mt-4 divide-y divide-[var(--hairline)] border-t border-[var(--hairline)]">
                {discipline.modules.map((m, mi) => {
                  const ModuleIcon = m.icon
                  const row = (
                    <>
                      <span className="font-mono text-[10px] tabular-nums text-[var(--muted)]">
                        {String(mi + 1).padStart(2, "0")}
                      </span>
                      <ModuleIcon className="h-4 w-4 shrink-0 text-[var(--muted)] group-hover/mod:text-[var(--brass)]" />
                      <span className="min-w-0 flex-1 truncate text-sm text-[var(--ink)]">
                        {m.label}
                      </span>
                      {m.disabled ? (
                        <span className="font-mono text-[10px] uppercase tracking-wide text-[var(--muted)]">
                          Próximamente
                        </span>
                      ) : (
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--muted)] group-hover/mod:text-[var(--brass)]" />
                      )}
                    </>
                  )
                  return (
                    <li key={m.href}>
                      {m.disabled ? (
                        <div className="group/mod flex items-center gap-3 py-3 opacity-50">
                          {row}
                        </div>
                      ) : (
                        <Link
                          href={m.href}
                          className="group/mod flex items-center gap-3 py-3 transition-colors"
                        >
                          {row}
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        )
      })}
    </div>
  )
}
