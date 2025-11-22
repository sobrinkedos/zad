create policy transactions_admin_select on public.transactions
  for select
  using ((auth.jwt() -> 'app_metadata' ->> 'app_role') = 'admin');