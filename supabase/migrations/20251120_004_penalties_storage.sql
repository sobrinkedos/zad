create table if not exists public.penalties (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  zone_id uuid not null references public.zones(id) on delete restrict,
  fiscal_id uuid not null references auth.users(id) on delete restrict,
  valor numeric(10,2) not null default 50.00,
  motivo text not null default 'Estacionamento irregular',
  evidencias_url text[] default array[]::text[],
  gps text,
  created_at timestamptz not null default now(),
  status text not null default 'ativa' check (status in ('ativa','cancelada','paga'))
);

alter table public.penalties enable row level security;

create policy penalties_owner_select on public.penalties for select using (
  exists (
    select 1 from public.vehicles v where v.id = vehicle_id and v.user_id = auth.uid()
  )
);

create policy penalties_fiscal_insert on public.penalties for insert with check (
  (auth.jwt() -> 'app_metadata' ->> 'app_role') = 'fiscal'
);

create policy penalties_admin_select on public.penalties for select using (
  (auth.jwt() -> 'app_metadata' ->> 'app_role') = 'admin'
);

-- Storage bucket for evidences (optional policies can be added later)
insert into storage.buckets (id, name, public)
values ('evidences', 'evidences', false)
on conflict (id) do nothing;