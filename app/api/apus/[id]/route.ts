import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const { data, error } = await supabase
    .from("apus")
    .select("*, apu_components(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json({ apu: data })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id }   = await params
  const { code, description, unit, notes, components } = await req.json()

  const total_cost = (components ?? []).reduce(
    (s: number, c: { unit_price: number; quantity: number }) => s + (c.unit_price * c.quantity),
    0
  )

  const { error: apuErr } = await supabase
    .from("apus")
    .update({ code, description, unit, notes, total_cost })
    .eq("id", id)
    .eq("user_id", user.id)

  if (apuErr) return NextResponse.json({ error: apuErr.message }, { status: 500 })

  // Replace components
  await supabase.from("apu_components").delete().eq("apu_id", id)

  if (components?.length) {
    const rows = components.map((c: {
      price_item_id?: string; category: string; description: string;
      unit?: string; unit_price: number; quantity: number; sort_order?: number
    }, i: number) => ({
      apu_id:        id,
      price_item_id: c.price_item_id ?? null,
      category:      c.category,
      description:   c.description,
      unit:          c.unit ?? "",
      unit_price:    c.unit_price,
      quantity:      c.quantity,
      sort_order:    c.sort_order ?? i,
    }))
    await supabase.from("apu_components").insert(rows)
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const { error } = await supabase.from("apus").delete().eq("id", id).eq("user_id", user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
