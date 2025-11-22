create or replace function public.is_admin_same_municipality(target_municipality_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.accounts me
    where me.user_id = auth.uid()
      and me.role = 'admin'
      and me.municipality_id = target_municipality_id
  );
$$;

grant execute on function public.is_admin_same_municipality(uuid) to authenticated, anon;

drop policy if exists accounts_admin_select on public.accounts;
drop policy if exists accounts_admin_insert on public.accounts;
drop policy if exists accounts_admin_update on public.accounts;

create policy accounts_admin_select on public.accounts
  for select
  using (public.is_admin_same_municipality(public.accounts.municipality_id));

create policy accounts_admin_insert on public.accounts
  for insert
  with check (public.is_admin_same_municipality(public.accounts.municipality_id));

create policy accounts_admin_update on public.accounts
  for update
  using (public.is_admin_same_municipality(public.accounts.municipality_id))
  with check (public.is_admin_same_municipality(public.accounts.municipality_id));