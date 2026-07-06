import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

function isMissingMigration(error: { code?: string; message?: string }) {
  return error.code === "42P01" || /does not exist|schema cache/i.test(error.message ?? "")
}

const MIGRATION_ERROR = {
  error: "MIGRATION_002_REQUIRED",
  message: "Ejecuta supabase/migrations/002_suppliers_quotes.sql en el SQL Editor de Supabase",
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const priceItemId = searchParams.get("price_item_id")

  if (!priceItemId) {
    return NextResponse.json({ error: "price_item_id es requerido" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("price_quotes")
    .select("*, suppliers(name)")
    .eq("user_id", user.id)
    .eq("price_item_id", priceItemId)
    .order("quoted_at", { ascending: false })

  if (error) {
    if (isMissingMigration(error)) return NextResponse.json(MIGRATION_ERROR, { status: 503 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ items: data })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const { price_item_id, price, supplier_id, source_name, source_url, quoted_at, notes } = body

  if (!price_item_id) {
    return NextResponse.json({ error: "price_item_id es requerido" }, { status: 400 })
  }
  if (typeof price !== "number" || Number.isNaN(price) || price < 0) {
    return NextResponse.json({ error: "price debe ser numérico y >= 0" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("price_quotes")
    .insert({
      user_id: user.id,
      price_item_id,
      price,
      supplier_id,
      source_name,
      source_url,
      quoted_at,
      notes,
    })
    .select("*")
    .single()

  if (error) {
    if (isMissingMigration(error)) return NextResponse.json(MIGRATION_ERROR, { status: 503 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ item: data }, { status: 201 })
}
