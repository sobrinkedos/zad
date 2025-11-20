create policy zones_admin_select on public.zones
  for select
  using ((auth.jwt() -> 'app_metadata' ->> 'app_role') = 'admin');

create policy zones_admin_insert on public.zones
  for insert
  with check ((auth.jwt() -> 'app_metadata' ->> 'app_role') = 'admin');

create policy zones_admin_update on public.zones
  for update
  using ((auth.jwt() -> 'app_metadata' ->> 'app_role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'app_role') = 'admin');

create policy zones_admin_delete on public.zones
  for delete
  using ((auth.jwt() -> 'app_metadata' ->> 'app_role') = 'admin');