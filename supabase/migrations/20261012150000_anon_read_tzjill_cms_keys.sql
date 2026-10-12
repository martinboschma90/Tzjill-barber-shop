-- Anonymous SELECT for the Tzjill CMS rows the app writes and reads.
-- Names match src/cms/storageKeys.ts:
--   tzjill-cms-content-v1
--   tzjill-public-site-v1
--   tzjill-public-artists-v3
--   tzjill-public-team-v1
-- Does not replace the existing notype public-cache policy, does not grant
-- insert/update/delete, and does not open any other key.
-- Apply only after a backup and Martin's approval. Do not run from CI.

drop policy if exists "Anon can read Tzjill CMS content" on public.cms_content;
create policy "Anon can read Tzjill CMS content"
  on public.cms_content
  for select
  to anon
  using (
    key in (
      'tzjill-cms-content-v1',
      'tzjill-public-site-v1',
      'tzjill-public-artists-v3',
      'tzjill-public-team-v1'
    )
  );
