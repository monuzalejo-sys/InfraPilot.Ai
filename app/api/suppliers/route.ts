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

  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("user_id", user.id)
    .order("name")

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
  const { name, contact, phone, email, website, notes } = body

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "name es requerido" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("suppliers")
    .insert({ user_id: user.id, name, contact, phone, email, website, notes })
    .select("*")
    .single()

  if (error) {
    if (isMissingMigration(error)) return NextResponse.json(MIGRATION_ERROR, { status: 503 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ item: data }, { status: 201 })
}
