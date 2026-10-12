-- Let anonymous visitors read the Tzjill roster cache.
-- Keep the previous Notype keys readable so an unpublished row still loads.

drop policy if exists "Public can read public CMS cache" on public.cms_content;
create policy "Public can read public CMS cache"
  on public.cms_content
  for select
  to anon, authenticated
  using (
    key in (
      'tzjill-public-artists-v2',
      'tzjill-public-artists-v3',
      'notype-public-artists-v2',
      'notype-public-artists-v3'
    )
  );
