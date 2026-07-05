import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-[var(--hairline)] bg-[var(--card)] text-[var(--muted)]",
        draft: "border-[var(--hairline)] bg-[var(--card)] text-[var(--muted)]",
        review: "border-[var(--warn)]/30 bg-[var(--warn)]/10 text-[var(--warn)]",
        approved: "border-[var(--ok)]/30 bg-[var(--ok)]/10 text-[var(--ok)]",
        exported: "border-[var(--brass)]/30 bg-[var(--brass)]/10 text-[var(--brass)]",
        archived: "border-[var(--hairline)] bg-[var(--card)] text-[var(--muted)]/60",
        ai: "border-[var(--brass)]/30 bg-[var(--brass)]/10 text-[var(--brass)]",
        danger: "border-[var(--warn)]/40 bg-[var(--warn)]/10 text-[var(--warn)]",
        warning: "border-[var(--warn)]/30 bg-[var(--warn)]/10 text-[var(--warn)]",
        success: "border-[var(--ok)]/30 bg-[var(--ok)]/10 text-[var(--ok)]",
        vial: "border-[var(--warn)]/30 bg-[var(--warn)]/10 text-[var(--warn)]",
        edificacion: "border-[var(--brass)]/30 bg-[var(--brass)]/10 text-[var(--brass)]",
        hidraulica: "border-[var(--ok)]/30 bg-[var(--ok)]/10 text-[var(--ok)]",
        electrico: "border-[var(--warn)]/30 bg-[var(--warn)]/10 text-[var(--warn)]",
        saneamiento: "border-[var(--ok)]/30 bg-[var(--ok)]/10 text-[var(--ok)]",
        topografia: "border-[var(--brass)]/40 bg-[var(--brass)]/10 text-[var(--brass)]",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
