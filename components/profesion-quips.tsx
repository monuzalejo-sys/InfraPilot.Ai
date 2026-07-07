"use client"

// Apartado compacto de frases de referentes + humor del oficio, al pie de los
// módulos de disciplina. Notorio pero no invasivo: card editorial pequeña con
// un botón discreto para rotar al siguiente quip.

import { useState } from "react"
import { Quote, Sparkles, RotateCw } from "lucide-react"
import { MonoLabel } from "@/components/editorial"
import { quipsDe } from "@/lib/quips"

export function ProfesionQuips({
  discipline,
  className = "",
}: {
  discipline: string
  className?: string
}) {
  const quips = quipsDe(discipline)
  const [index, setIndex] = useState(() =>
    quips.length > 0 ? Math.floor(Math.random() * quips.length) : 0
  )

  if (quips.length === 0) return null

  const quip = quips[index]
  const esFrase = quip.tipo === "frase"

  function siguiente() {
    setIndex((prev) => {
      if (quips.length <= 1) return prev
      let next = Math.floor(Math.random() * quips.length)
      while (next === prev) next = Math.floor(Math.random() * quips.length)
      return next
    })
  }

  return (
    <section className={`editorial-card relative p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 text-[var(--brass)]">
          {esFrase ? <Quote className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
        </span>
        <div className="min-w-0 flex-1">
          <MonoLabel className="mb-1">Del oficio</MonoLabel>
          <p className="text-sm leading-snug text-[var(--ink)]">
            {quip.texto}
            {esFrase && quip.autor && (
              <span className="ml-1.5 font-mono text-xs text-[var(--muted)]">— {quip.autor}</span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={siguiente}
          aria-label="Ver otra frase"
          className="shrink-0 rounded-[2px] p-1 text-[var(--muted)] transition-colors hover:text-[var(--brass)]"
        >
          <RotateCw className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  )
}
