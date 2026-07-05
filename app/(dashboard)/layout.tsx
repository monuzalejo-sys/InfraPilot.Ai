import { Sidebar } from "@/components/sidebar"
import { Crosshair } from "@/components/editorial"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--paper)]">
      <Sidebar />
      {/* Content area framed like a technical sheet (plano de obra):
          hairline border + crosshair register marks at each corner. */}
      <main className="relative flex-1 overflow-y-auto pt-14 lg:pt-0">
        <div className="relative min-h-full p-4 sm:p-6 lg:p-8">
          <div className="relative min-h-full border border-[var(--hairline)] bg-[var(--paper)]">
            <Crosshair className="pointer-events-none absolute -left-[1px] -top-[1px] h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-[var(--hairline)]" />
            <Crosshair className="pointer-events-none absolute -right-[1px] -top-[1px] h-4 w-4 translate-x-1/2 -translate-y-1/2 text-[var(--hairline)]" />
            <Crosshair className="pointer-events-none absolute -bottom-[1px] -left-[1px] h-4 w-4 -translate-x-1/2 translate-y-1/2 text-[var(--hairline)]" />
            <Crosshair className="pointer-events-none absolute -bottom-[1px] -right-[1px] h-4 w-4 translate-x-1/2 translate-y-1/2 text-[var(--hairline)]" />
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
