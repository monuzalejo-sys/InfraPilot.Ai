import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data, error } = await supabase
    .from("budgets")
    .select("id, project_name, location, currency, confidence, total_amount, created_at, project_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ budgets: data })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { description, budget, projectId } = await req.json()

  const { data, error } = await supabase
    .from("budgets")
    .insert({
      user_id: user.id,
      project_id: projectId ?? null,
      description,
      project_name: budget.projectName,
      location: budget.location,
      currency: budget.currency,
      confidence: budget.confidence <= 1 ? Math.round(budget.confidence * 100) : Math.round(budget.confidence),
      total_amount: budget.totalAmount,
      budget_data: budget,
    })
    .select("id")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id }, { status: 201 })
}
