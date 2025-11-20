create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  placa text not null unique,
  marca text,
  modelo text,
  cor text,
  ano int,
  created_at timestamptz not null default now()
);

alter table public.vehicles enable row level security;

create policy vehicles_owner_select on public.vehicles for select using (auth.uid() = user_id);
create policy vehicles_owner_insert on public.vehicles for insert with check (auth.uid() = user_id);
create policy vehicles_owner_update on public.vehicles for update using (auth.uid() = user_id);
create policy vehicles_owner_delete on public.vehicles for delete using (auth.uid() = user_id);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  zone_id uuid not null references public.zones(id) on delete restrict,
  inicio timestamptz not null default now(),
  fim timestamptz not null,
  status text not null check (status in ('ativa','expirada','finalizada')),
  tarifa_aplicada numeric(10,2) not null,
  creditos_utilizados numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists sessions_active_idx on public.sessions(status, fim);

alter table public.sessions enable row level security;

create policy sessions_owner_select on public.sessions for select using (auth.uid() = user_id);
create policy sessions_owner_insert on public.sessions for insert with check (auth.uid() = user_id);
create policy sessions_owner_update on public.sessions for update using (auth.uid() = user_id);
create policy sessions_owner_delete on public.sessions for delete using (auth.uid() = user_id);

create policy sessions_fiscal_select on public.sessions for select using (
  (auth.jwt() ->> 'app_role') = 'fiscal'
);