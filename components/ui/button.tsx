"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[2px] text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brass)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--brass)] text-[var(--paper)] hover:opacity-90 active:scale-[0.98]",
        ai: "bg-[var(--brass)] text-[var(--paper)] hover:opacity-90 active:scale-[0.98]",
        destructive: "bg-[var(--warn)] text-[var(--paper)] hover:opacity-90 active:scale-[0.98]",
        outline:
          "border border-[var(--hairline)] bg-[var(--card)] text-[var(--ink)] hover:bg-[var(--paper)] hover:border-[var(--muted)]/40 active:scale-[0.98]",
        secondary: "bg-[var(--hairline)]/60 text-[var(--ink)] hover:bg-[var(--hairline)] active:scale-[0.98]",
        ghost: "text-[var(--muted)] hover:bg-[var(--hairline)]/50 hover:text-[var(--ink)] active:scale-[0.98]",
        link: "text-[var(--brass)] underline-offset-4 hover:underline",
        success: "bg-[var(--ok)] text-[var(--paper)] hover:opacity-90 active:scale-[0.98]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-7 rounded-[2px] px-3 text-xs",
        lg: "h-11 rounded-[2px] px-6 text-base",
        xl: "h-12 rounded-[2px] px-8 text-base font-semibold",
        icon: "h-9 w-9",
        "icon-sm": "h-7 w-7",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
