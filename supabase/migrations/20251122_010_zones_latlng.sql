alter table public.zones add column if not exists lat numeric(9,6);
alter table public.zones add column if not exists lng numeric(9,6);
create index if not exists zones_lat_lng_idx on public.zones(lat, lng) where lat is not null and lng is not null;