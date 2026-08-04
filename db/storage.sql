-- Stable Finance Bank — storage buckets and policies
-- Run AFTER db/schema.sql (it depends on the public.has_role function).

insert into storage.buckets (id, name, public)
values ('kyc', 'kyc', false), ('deposits', 'deposits', false)
on conflict (id) do nothing;

-- Users upload into a folder named after their own user id: <uid>/<file>
drop policy if exists "own docs insert" on storage.objects;
create policy "own docs insert" on storage.objects for insert to authenticated
  with check (
    bucket_id = any (array['kyc', 'deposits'])
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owners read their own documents; admins read everything in both buckets.
drop policy if exists "own docs read" on storage.objects;
create policy "own docs read" on storage.objects for select to authenticated
  using (
    bucket_id = any (array['kyc', 'deposits'])
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.has_role(auth.uid(), 'admin'::public.app_role)
    )
  );
