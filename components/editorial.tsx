/* Shared editorial primitives — warm-paper design system.
   Tokens: var(--paper) var(--ink) var(--muted) var(--brass)
           var(--hairline) var(--rail) var(--card) var(--ok) var(--warn)
   Utilities: .mono-label .editorial-card (globals.css) */

// ── Blueprint crosshair corner mark ───────────────────────────
export function Crosshair({ className = "" }: { className?: string }) {
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

// ── Brass pin dot ─────────────────────────────────────────────
export function Pin({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`absolute h-2.5 w-2.5 rounded-full bg-[var(--brass)] shadow-[0_1px_2px_rgba(27,26,23,0.35)] ${className}`}
    />
  )
}

// ── Mono micro-label ──────────────────────────────────────────
export function MonoLabel({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return <p className={`mono-label ${className}`}>{children}</p>
}

// ── Framed editorial card (tablero técnico) ───────────────────
export function EditorialCard({
  title,
  action,
  children,
  className = "",
}: {
  title?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`editorial-card relative p-5 ${className}`}>
      <Crosshair className="pointer-events-none absolute right-2 top-2 h-3 w-3 text-[var(--hairline)]" />
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <MonoLabel>{title}</MonoLabel>}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}
