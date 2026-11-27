-- Anonymous SELECT for published projection rows only.
-- The full document (tzjill-cms-content-v1) stays behind /api/content.
-- Does not grant insert/update/delete.

drop policy if exists "Anon can read Tzjill CMS content" on public.cms_content;
create policy "Anon can read Tzjill CMS content"
  on public.cms_content
  for select
  to anon
  using (
    key in (
      'tzjill-public-site-v1',
      'tzjill-public-artists-v3',
      'tzjill-public-team-v1'
    )
  );
