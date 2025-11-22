create table if not exists public.municipalities (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cnpj text,
  endereco text,
  status text not null default 'ativo' check (status in ('ativo','inativo')),
  created_at timestamptz not null default now()
);

alter table public.municipalities enable row level security;

create table if not exists public.accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('superadmin','admin','fiscal','motorista','financeiro','empresa')),
  nome text,
  cpf text,
  email text,
  municipality_id uuid references public.municipalities(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.accounts enable row level security;

-- Owners can read/update their own account
create policy accounts_owner_select on public.accounts for select using (auth.uid() = user_id);
create policy accounts_owner_update on public.accounts for update using (auth.uid() = user_id);

-- Superadmin full access
create policy accounts_superadmin_select on public.accounts for select using ((auth.jwt() -> 'app_metadata' ->> 'app_role') = 'superadmin');
create policy accounts_superadmin_insert on public.accounts for insert with check ((auth.jwt() -> 'app_metadata' ->> 'app_role') = 'superadmin');
create policy accounts_superadmin_update on public.accounts for update using ((auth.jwt() -> 'app_metadata' ->> 'app_role') = 'superadmin') with check ((auth.jwt() -> 'app_metadata' ->> 'app_role') = 'superadmin');
create policy accounts_superadmin_delete on public.accounts for delete using ((auth.jwt() -> 'app_metadata' ->> 'app_role') = 'superadmin');

-- Admin can manage accounts within own municipality
create policy accounts_admin_select on public.accounts for select using (
  exists (select 1 from public.accounts me where me.user_id = auth.uid() and me.role = 'admin' and me.municipality_id = public.accounts.municipality_id)
);
create policy accounts_admin_insert on public.accounts for insert with check (
  exists (select 1 from public.accounts me where me.user_id = auth.uid() and me.role = 'admin' and me.municipality_id = public.accounts.municipality_id)
);
create policy accounts_admin_update on public.accounts for update using (
  exists (select 1 from public.accounts me where me.user_id = auth.uid() and me.role = 'admin' and me.municipality_id = public.accounts.municipality_id)
) with check (
  exists (select 1 from public.accounts me where me.user_id = auth.uid() and me.role = 'admin' and me.municipality_id = public.accounts.municipality_id)
);

-- RLS for municipalities
create policy municipalities_superadmin_select on public.municipalities for select using ((auth.jwt() -> 'app_metadata' ->> 'app_role') = 'superadmin');
create policy municipalities_superadmin_crud on public.municipalities for all using ((auth.jwt() -> 'app_metadata' ->> 'app_role') = 'superadmin') with check ((auth.jwt() -> 'app_metadata' ->> 'app_role') = 'superadmin');