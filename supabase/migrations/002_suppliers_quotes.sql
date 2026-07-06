-- ══════════════════════════════════════════════════════════════════
-- Migration 002 — Proveedores + Cotizaciones multi-fuente
-- Ejecutar en: Supabase Dashboard → SQL Editor (después de 000 y 001)
-- ══════════════════════════════════════════════════════════════════

-- Proveedores del usuario
create table if not exists suppliers (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  name       text not null,
  contact    text,
  phone      text,
  email      text,
  website    text,
  notes      text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Cotizaciones por item de precio: un mismo material puede tener N
-- cotizaciones (proveedor registrado y/o fuente web con URL).
-- La moneda es la implícita del price_item (una sola por usuario hoy);
-- multi-moneda queda para una migración futura.
create table if not exists price_quotes (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  price_item_id uuid references price_items(id) on delete cascade not null,
  supplier_id   uuid references suppliers(id) on delete set null,
  source_name   text,             -- nombre libre de la fuente/web
  source_url    text,
  price         numeric not null check (price >= 0),
  quoted_at     timestamptz not null default now(),
  notes         text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists idx_suppliers_user       on suppliers(user_id);
create index if not exists idx_price_quotes_item    on price_quotes(price_item_id);
create index if not exists idx_price_quotes_supplier on price_quotes(supplier_id);

-- ── RLS ───────────────────────────────────────────────────────────

alter table suppliers    enable row level security;
alter table price_quotes enable row level security;

create policy "users_own_suppliers" on suppliers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users_own_price_quotes" on price_quotes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Triggers updated_at (función definida en 000) ─────────────────

create trigger suppliers_updated_at
  before update on suppliers
  for each row execute function update_updated_at();

create trigger price_quotes_updated_at
  before update on price_quotes
  for each row execute function update_updated_at();
