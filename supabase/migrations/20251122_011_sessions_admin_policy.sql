drop policy if exists sessions_admin_select on public.sessions;
create policy sessions_admin_select on public.sessions
  for select
  using (((auth.jwt() -> 'app_metadata' ->> 'app_role') in ('admin','superadmin')));