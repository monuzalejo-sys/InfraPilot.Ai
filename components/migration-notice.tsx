import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Inline banner shown on data pages when a required SQL migration hasn't
 * been run yet, so a 503 from the API doesn't look like a silent bug.
 * Not dismissable — it should stay visible for as long as the condition holds.
 */
export function MigrationNotice({
  migration = "002_suppliers_quotes.sql",
  className,
}: {
  migration?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-[2px] border border-[var(--warn)]/30 bg-[var(--warn)]/10 px-4 py-2.5 text-sm text-[var(--warn)]",
        className
      )}
    >
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <span>
        Falta ejecutar la migración <span className="font-mono">{migration}</span> — Supabase Dashboard → SQL Editor
      </span>
    </div>
  )
}
