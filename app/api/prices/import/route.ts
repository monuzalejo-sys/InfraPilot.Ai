import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import * as XLSX from "xlsx"

type Category = "material" | "labor" | "equipment"

function detectCategory(description: string): Category {
  const d = description.toLowerCase()
  if (d.includes("cuadrilla") || d.includes("maestro") || d.includes("ayudante") ||
      d.includes("oficial") || d.includes("topograf") || d.includes("obrero") ||
      d.includes("mano de obra") || d.includes("operario")) return "labor"
  if (d.includes("mezcladora") || d.includes("motobomba") || d.includes("compresor") ||
      d.includes("volqueta") || d.includes("vibrador") || d.includes("excavadora") ||
      d.includes("retroexcavadora") || d.includes("equipo") || d.includes("herramienta") ||
      d.includes("cortadora") || d.includes("rana vibr")) return "equipment"
  return "material"
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const formData = await req.formData()
  const file     = formData.get("file") as File | null
  if (!file) return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 })

  const arrayBuffer = await file.arrayBuffer()
  const buffer      = Buffer.from(arrayBuffer)
  const workbook    = XLSX.read(buffer, { type: "buffer" })

  const rows: { description: string; unit: string; unit_price: number; category: Category }[] = []

  // Parse sheets that contain price lists
  const priceSheets = ["Unitario", "precios", "precios ferreteria"]
  for (const sheetName of priceSheets) {
    if (!workbook.SheetNames.includes(sheetName)) continue
    const sheet = workbook.Sheets[sheetName]
    const data  = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, { header: 1 })

    for (const row of data) {
      if (!Array.isArray(row)) continue

      // Look for rows with: description (string), unit (string), price (number)
      // Different sheets have different column layouts
      let description: string | null = null
      let unit: string | null        = null
      let price: number | null       = null

      for (let i = 0; i < row.length; i++) {
        const cell = row[i]
        if (typeof cell === "string" && cell.trim().length > 3) {
          const upper = cell.trim().toUpperCase()
          // Skip header rows
          if (["DESCRIPCION", "DESCRIPCIÓN", "PRECIOS", "PRECIOS VARIOS", "ITEMS COMUNES",
               "AÑO", "NIT", "NUIR", "LISTADO"].some(h => upper.startsWith(h))) break

          if (!description) {
            description = cell.trim()
          } else if (!unit && cell.trim().length <= 5) {
            unit = cell.trim().toUpperCase()
          }
        } else if (typeof cell === "number" && cell > 0 && !price) {
          price = cell
        }
      }

      if (description && unit && price && price > 0) {
        const category = detectCategory(description)
        rows.push({ description, unit, unit_price: Math.round(price), category })
      }
    }
  }

  if (rows.length === 0) {
    return NextResponse.json({ error: "No se encontraron precios válidos en el archivo" }, { status: 400 })
  }

  // Upsert — skip duplicates by description+unit for this user
  const { data, error } = await supabase
    .from("price_items")
    .insert(rows.map(r => ({ ...r, user_id: user.id })))
    .select("id")

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ imported: data?.length ?? 0, total: rows.length })
}
