create table if not exists public.zones (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  localizacao text,
  valor_hora numeric(10,2) not null check (valor_hora >= 0),
  horario_inicio time not null,
  horario_fim time not null,
  dias_funcionamento text[] not null,
  tolerancia_minutos integer not null default 5,
  status text not null default 'ativa' check (status in ('ativa','inativa')),
  vagas integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists zones_status_idx on public.zones(status);

alter table public.zones enable row level security;

create policy select_active_zones on public.zones for select using (status = 'ativa');

insert into public.zones (nome, localizacao, valor_hora, horario_inicio, horario_fim, dias_funcionamento, tolerancia_minutos, status, vagas)
values
  ('Centro Comercial','Rua Principal, 100-200',5.00,'08:00','18:00',array['seg','ter','qua','qui','sex'],5,'ativa',50),
  ('Zona Bancária','Avenida Central, 500-600',6.50,'07:00','19:00',array['seg','ter','qua','qui','sex'],3,'ativa',35),
  ('Área Hospitalar','Rua das Flores, 300-400',4.00,'06:00','22:00',array['seg','ter','qua','qui','sex','sab','dom'],10,'ativa',25),
  ('Setor Cultural','Praça da Liberdade, 1-50',3.50,'09:00','17:00',array['seg','ter','qua','qui','sex','sab','dom'],15,'ativa',40);