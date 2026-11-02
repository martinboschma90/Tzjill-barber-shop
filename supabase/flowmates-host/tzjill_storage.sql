insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values ('tzjill-media','tzjill-media', true, 104857600, array['image/webp','image/jpeg','image/png','image/gif','video/webm','video/mp4']) on conflict (id) do nothing;
create policy "tzjill: public read media" on storage.objects for select to anon, authenticated using (bucket_id = 'tzjill-media');
create policy "tzjill: editors upload media" on storage.objects for insert to authenticated with check (bucket_id = 'tzjill-media' and tzjill.cms_is_editor());
create policy "tzjill: editors update media" on storage.objects for update to authenticated using (bucket_id = 'tzjill-media' and tzjill.cms_is_editor()) with check (bucket_id = 'tzjill-media' and tzjill.cms_is_editor());
create policy "tzjill: editors delete media" on storage.objects for delete to authenticated using (bucket_id = 'tzjill-media' and tzjill.cms_is_editor());
