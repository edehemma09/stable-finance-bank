-- Stable Finance Bank — storage buckets and policies
-- Run AFTER db/schema.sql (it depends on the public.has_role function).

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', false), ('kyc', 'kyc', false), ('deposits', 'deposits', false)
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


-- Private profile photos: users can manage only files in their own folder.
drop policy if exists "Users can view own avatars" on storage.objects;
create policy "Users can view own avatars" on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Users can upload own avatars" on storage.objects;
create policy "Users can upload own avatars" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
    and lower(storage.extension(name)) in ('png', 'jpg', 'jpeg')
    and metadata->>'mimetype' in ('image/png', 'image/jpeg')
  );
drop policy if exists "Users can update own avatars" on storage.objects;
create policy "Users can update own avatars" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
    and lower(storage.extension(name)) in ('png', 'jpg', 'jpeg')
    and metadata->>'mimetype' in ('image/png', 'image/jpeg')
  );
drop policy if exists "Users can delete own avatars" on storage.objects;
create policy "Users can delete own avatars" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
