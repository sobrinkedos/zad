create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  saldo_creditos numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy profiles_owner_select on public.profiles for select using (auth.uid() = user_id);
create policy profiles_owner_update on public.profiles for update using (auth.uid() = user_id);
create policy profiles_owner_insert on public.profiles for insert with check (auth.uid() = user_id);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tipo text not null check (tipo in ('compra','uso','estorno')),
  valor numeric(10,2) not null,
  metodo_pagamento text,
  status text not null default 'concluido',
  session_id uuid references public.sessions(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.transactions enable row level security;
create policy transactions_owner_select on public.transactions for select using (auth.uid() = user_id);
create policy transactions_owner_insert on public.transactions for insert with check (auth.uid() = user_id);

-- Seed a demo profile with zero credits when user is created can be handled via app logic