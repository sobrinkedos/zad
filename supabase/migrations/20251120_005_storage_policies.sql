-- Policies for evidences bucket on storage.objects
alter table storage.objects enable row level security;

create policy evidences_fiscal_insert on storage.objects
  for insert
  with check (
    bucket_id = 'evidences' and (auth.jwt() -> 'app_metadata' ->> 'app_role') = 'fiscal'
  );

create policy evidences_admin_select on storage.objects
  for select
  using (
    bucket_id = 'evidences' and (auth.jwt() -> 'app_metadata' ->> 'app_role') = 'admin'
  );

create policy evidences_fiscal_select on storage.objects
  for select
  using (
    bucket_id = 'evidences' and (auth.jwt() -> 'app_metadata' ->> 'app_role') = 'fiscal'
  );