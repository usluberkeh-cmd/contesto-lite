begin;

drop policy if exists "Users can upload own files" on storage.objects;
drop policy if exists "Users can view own files" on storage.objects;
drop policy if exists "Users can delete own files" on storage.objects;

drop policy if exists "Users can upload own fine documents" on storage.objects;
drop policy if exists "Users can view own fine documents" on storage.objects;
drop policy if exists "Users can delete own fine documents" on storage.objects;

do $$
declare
  has_owner_id boolean;
  has_owner boolean;
begin
  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'storage'
      and table_name = 'objects'
      and column_name = 'owner_id'
  ) into has_owner_id;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'storage'
      and table_name = 'objects'
      and column_name = 'owner'
  ) into has_owner;

  if has_owner_id then
    execute $sql$
      create policy "Users can upload own fine documents"
      on storage.objects
      for insert
      to authenticated
      with check (
        bucket_id = 'fine-documents'
        and owner_id = (select auth.uid())
      );
    $sql$;

    execute $sql$
      create policy "Users can view own fine documents"
      on storage.objects
      for select
      to authenticated
      using (
        bucket_id = 'fine-documents'
        and owner_id = (select auth.uid())
      );
    $sql$;

    execute $sql$
      create policy "Users can delete own fine documents"
      on storage.objects
      for delete
      to authenticated
      using (
        bucket_id = 'fine-documents'
        and owner_id = (select auth.uid())
      );
    $sql$;
  elsif has_owner then
    execute $sql$
      create policy "Users can upload own fine documents"
      on storage.objects
      for insert
      to authenticated
      with check (
        bucket_id = 'fine-documents'
        and owner = (select auth.uid()::text)
      );
    $sql$;

    execute $sql$
      create policy "Users can view own fine documents"
      on storage.objects
      for select
      to authenticated
      using (
        bucket_id = 'fine-documents'
        and owner = (select auth.uid()::text)
      );
    $sql$;

    execute $sql$
      create policy "Users can delete own fine documents"
      on storage.objects
      for delete
      to authenticated
      using (
        bucket_id = 'fine-documents'
        and owner = (select auth.uid()::text)
      );
    $sql$;
  else
    raise exception
      'storage.objects does not expose owner_id or owner, cannot apply owner-based fine-documents policies';
  end if;
end;
$$;

commit;
