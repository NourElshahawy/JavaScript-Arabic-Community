-- ============================================================================
-- Storage: public "post-images" bucket, one folder per author (folder name
-- = uid), mirroring the "avatars" bucket pattern from 0003_storage.sql.
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('post-images', 'post-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

create policy "post images are publicly readable"
on storage.objects for select
using (bucket_id = 'post-images');

create policy "users upload their own post images"
on storage.objects for insert to authenticated
with check (bucket_id = 'post-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users delete their own post images"
on storage.objects for delete to authenticated
using (bucket_id = 'post-images' and (storage.foldername(name))[1] = auth.uid()::text);
