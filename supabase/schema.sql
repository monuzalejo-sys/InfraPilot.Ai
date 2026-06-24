-- ══════════════════════════════════════════════════════════════════
-- InfraPilot AI — Supabase Schema
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ══════════════════════════════════════════════════════════════════

-- Proyectos
create table if not exists projects (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  code          text,
  name          text not null,
  type          text not null default 'OTRO',
  status        text not null default 'DRAFT',
  location      text,
  total_budget  numeric,
  currency      text default 'PEN',
  progress      int default 0,
  partidas      int default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Presupuestos generados por IA
create table if not exists budgets (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  project_id    uuid references projects(id) on delete set null,
  description   text not null,
  project_name  text not null,
  location      text,
  currency      text default 'PEN',
  confidence    int,
  total_amount  numeric,
  budget_data   jsonb not null,
  created_at    timestamptz default now()
);

-- Actividad de usuario
create table if not exists activity (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  type          text not null,
  title         text not null,
  description   text,
  project_name  text,
  metadata      jsonb,
  created_at    timestamptz default now()
);

-- ── Row Level Security ─────────────────────────────────────────────

alter table projects enable row level security;
alter table budgets enable row level security;
alter table activity enable row level security;

create policy "users_own_projects" on projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users_own_budgets" on budgets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users_own_activity" on activity
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Función para actualizar updated_at automáticamente ─────────────

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_updated_at
  before update on projects
  for each row execute function update_updated_at();

-- ── Función para registrar actividad tras guardar un presupuesto ───

create or replace function log_budget_activity()
returns trigger as $$
begin
  insert into activity (user_id, type, title, description, project_name, metadata)
  values (
    new.user_id,
    'apu_generated',
    'Presupuesto generado por IA',
    new.confidence || '% de confianza · ' || new.currency,
    new.project_name,
    jsonb_build_object('budget_id', new.id, 'total_amount', new.total_amount)
  );
  return new;
end;
$$ language plpgsql;

create trigger budget_created_activity
  after insert on budgets
  for each row execute function log_budget_activity();
