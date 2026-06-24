import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data, error } = await supabase
    .from("apus")
    .select("*, apu_components(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ apus: data })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { code, description, unit, notes, components } = await req.json()

  // Calculate total
  const total_cost = (components ?? []).reduce(
    (s: number, c: { unit_price: number; quantity: number }) => s + (c.unit_price * c.quantity),
    0
  )

  const { data: apu, error: apuErr } = await supabase
    .from("apus")
    .insert({ user_id: user.id, code, description, unit, notes, total_cost })
    .select("id")
    .single()

  if (apuErr) return NextResponse.json({ error: apuErr.message }, { status: 500 })

  if (components?.length) {
    const rows = components.map((c: {
      price_item_id?: string; category: string; description: string;
      unit?: string; unit_price: number; quantity: number; sort_order?: number
    }, i: number) => ({
      apu_id: apu.id,
      price_item_id: c.price_item_id ?? null,
      category:      c.category,
      description:   c.description,
      unit:          c.unit ?? "",
      unit_price:    c.unit_price,
      quantity:      c.quantity,
      sort_order:    c.sort_order ?? i,
    }))

    const { error: compErr } = await supabase.from("apu_components").insert(rows)
    if (compErr) return NextResponse.json({ error: compErr.message }, { status: 500 })
  }

  return NextResponse.json({ id: apu.id }, { status: 201 })
}
