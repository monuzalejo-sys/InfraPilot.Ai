# Supabase setup — InfraPilot

## Migrations — run IN ORDER

| Order | File | Creates |
|---|---|---|
| 1 | `migrations/000_initial_schema.sql` | `projects`, `budgets`, `activity` + RLS policies + triggers (`update_updated_at`, `log_budget_activity`) |
| 2 | `migrations/001_prices_apus.sql` | `price_items`, `apus`, `apu_components`; ALTERs `budgets` (overhead_* columns) |

`001` depends on `000` (it alters `budgets` and reuses `update_updated_at()`),
so it FAILS on a fresh database if run alone. Run both via the Supabase
Dashboard SQL editor (paste each file, in order) or `supabase db push` if you
use the CLI.

Together these two files cover every table the app queries — no other schema
is needed.

## Auth model

Login/register use **Supabase Auth only** — no custom profile table.
`full_name` and `company` are stored in Auth `user_metadata`. Every data table
has RLS scoped to `auth.uid() = user_id`, so an authenticated user only sees
their own rows. Enable the Email provider in Supabase → Authentication →
Providers (on by default).

## Environment variables

Copy `.env.example` → `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (required):
  Supabase Dashboard → Project Settings → API. Without them the app runs in
  degraded/mock mode: `proxy.ts` skips auth entirely and API routes fail.
- `GROQ_API_KEY` (optional): powers `/api/cotizar` and
  `/api/licitaciones/analyze`. Missing key → those two routes return a guarded
  500; everything else works.

**Vercel:** set the SAME three variables in Project → Settings → Environment
Variables (Production and Preview). No code changes are needed.

## Known wart

`@anthropic-ai/sdk` is in `package.json` but never imported — all AI calls go
through Groq (despite "Powered by Claude" marketing copy on the landing page).
Pending product decision: remove the dependency or actually wire Anthropic in.
