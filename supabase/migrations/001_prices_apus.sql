-- ══════════════════════════════════════════════════════════════════
-- Migration 001 — Base de Precios + APUs
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ══════════════════════════════════════════════════════════════════

-- Base de precios (materiales, mano de obra, equipos)
create table if not exists price_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  code        text,
  description text not null,
  unit        text not null,
  unit_price  numeric not null default 0,
  category    text not null default 'material', -- 'material' | 'labor' | 'equipment'
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- APUs (Análisis de Precios Unitarios)
create table if not exists apus (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  code         text,
  description  text not null,
  unit         text not null,
  total_cost   numeric default 0,
  notes        text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Componentes de cada APU
create table if not exists apu_components (
  id            uuid primary key default gen_random_uuid(),
  apu_id        uuid references apus(id) on delete cascade not null,
  price_item_id uuid references price_items(id) on delete set null,
  category      text not null, -- 'material' | 'labor' | 'equipment'
  description   text not null,
  unit          text,
  unit_price    numeric not null default 0,
  quantity      numeric not null default 0,
  total_price   numeric generated always as (unit_price * quantity) stored,
  sort_order    int default 0
);

-- Overhead configurable en presupuestos
alter table budgets add column if not exists overhead_admin   numeric default 0.18;
alter table budgets add column if not exists overhead_risk    numeric default 0.03;
alter table budgets add column if not exists overhead_profit  numeric default 0.09;

-- ── RLS ───────────────────────────────────────────────────────────

alter table price_items   enable row level security;
alter table apus          enable row level security;
alter table apu_components enable row level security;

create policy "users_own_price_items" on price_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users_own_apus" on apus
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users_own_apu_components" on apu_components
  for all using (
    exists (select 1 from apus where apus.id = apu_components.apu_id and apus.user_id = auth.uid())
  );

-- ── Triggers updated_at ──────────────────────────────────────────

create trigger price_items_updated_at
  before update on price_items
  for each row execute function update_updated_at();

create trigger apus_updated_at
  before update on apus
  for each row execute function update_updated_at();
