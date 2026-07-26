-- Public bucket for portfolio images, capped at 5MB, images only.
-- Enforced both here (server-side) and in the upload handler (client-side).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio-images', 'portfolio-images', true, 5242880, array['image/*'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Objects are stored under {user_id}/{portfolio_id}/{filename}; the first
-- path segment is used to scope write access to the owning user.
drop policy if exists "portfolio_images_select_public" on storage.objects;
drop policy if exists "portfolio_images_insert_own" on storage.objects;
drop policy if exists "portfolio_images_update_own" on storage.objects;
drop policy if exists "portfolio_images_delete_own" on storage.objects;

create policy "portfolio_images_select_public"
  on storage.objects for select
  using (bucket_id = 'portfolio-images');

create policy "portfolio_images_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'portfolio-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "portfolio_images_update_own"
  on storage.objects for update
  using (
    bucket_id = 'portfolio-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'portfolio-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "portfolio_images_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'portfolio-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
