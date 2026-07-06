import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

function isMissingMigration(error: { code?: string; message?: string }) {
  return error.code === "42P01" || /does not exist|schema cache/i.test(error.message ?? "")
}

const MIGRATION_ERROR = {
  error: "MIGRATION_002_REQUIRED",
  message: "Ejecuta supabase/migrations/002_suppliers_quotes.sql en el SQL Editor de Supabase",
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const body    = await req.json()

  const { data, error } = await supabase
    .from("price_quotes")
    .update(body)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single()

  if (error) {
    if (isMissingMigration(error)) return NextResponse.json(MIGRATION_ERROR, { status: 503 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ item: data })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const { error } = await supabase
    .from("price_quotes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    if (isMissingMigration(error)) return NextResponse.json(MIGRATION_ERROR, { status: 503 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
