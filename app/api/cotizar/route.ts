import Groq from "groq-sdk"
import { NextRequest, NextResponse } from "next/server"
import { COTIZAR_SYSTEM_PROMPT } from "@/lib/cotizar-prompt"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { error: "GROQ_API_KEY no configurada. Agrega la clave en .env.local" },
      { status: 500 }
    )
  }

  const { description, region = "Lima, Perú", currency = "PEN" } = await req.json()

  if (!description || description.trim().length < 20) {
    return NextResponse.json({ error: "Descripción demasiado corta" }, { status: 400 })
  }

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 8000,
      temperature: 0.3,
      messages: [
        { role: "system", content: COTIZAR_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Genera el presupuesto para la siguiente obra:\n\nRegión: ${region}\nMoneda: ${currency}\n\nDescripción:\n${description}`,
        },
      ],
    })

    const text = completion.choices[0]?.message?.content ?? ""

    let budget
    try {
      budget = JSON.parse(text)
    } catch {
      const match = text.match(/\{[\s\S]*\}/)
      if (!match) throw new Error("El modelo no devolvió JSON válido. Intenta de nuevo.")
      budget = JSON.parse(match[0])
    }

    return NextResponse.json({ budget })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
