import { Info } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Inline banner shown on data pages when Supabase isn't configured (or the
 * initial fetch failed) so the empty state doesn't look like a silent bug.
 * Not dismissable — it should stay visible for as long as the condition holds.
 */
export function DemoNotice({ variant = "light", className }: { variant?: "light" | "dark"; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-[2px] border px-4 py-2.5 text-sm",
        variant === "dark"
          ? "border-[var(--brass)]/40 bg-[var(--brass)]/10 text-[var(--brass)]"
          : "border-[var(--warn)]/30 bg-[var(--warn)]/10 text-[var(--warn)]",
        className
      )}
    >
      <Info className="w-4 h-4 shrink-0" />
      <span>Modo demo — sin conexión a base de datos. Los datos no se guardan.</span>
    </div>
  )
}
