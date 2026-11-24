-- Applied on the Flow Mates - Websites project, schema tzjill, 24 Nov 2026.
-- Idempotent. Does not delete rows and does not disable RLS.
-- Service role keeps its grants and bypasses RLS for /api/content, mail stats and the limiter.

drop policy if exists "Authenticated can read CMS content" on tzjill.cms_content;
drop policy if exists "Authenticated can read all CMS content" on tzjill.cms_content;
drop policy if exists "Editors can read CMS content" on tzjill.cms_content;
drop policy if exists "Viewers can read published CMS keys" on tzjill.cms_content;

create policy "Editors can read CMS content"
  on tzjill.cms_content
  for select
  to authenticated
  using (tzjill.cms_is_editor() and key not like 'tzjill-rate-limit:%');

create policy "Viewers can read published CMS keys"
  on tzjill.cms_content
  for select
  to authenticated
  using (
    key in (
      'tzjill-public-site-v1',
      'tzjill-public-artists-v2',
      'tzjill-public-artists-v3',
      'tzjill-public-team-v1'
    )
  );

drop policy if exists "Editors can insert CMS content" on tzjill.cms_content;
create policy "Editors can insert CMS content"
  on tzjill.cms_content
  for insert
  to authenticated
  with check (tzjill.cms_is_editor() and key not like 'tzjill-rate-limit:%');

drop policy if exists "Editors can update CMS content" on tzjill.cms_content;
create policy "Editors can update CMS content"
  on tzjill.cms_content
  for update
  to authenticated
  using (tzjill.cms_is_editor() and key not like 'tzjill-rate-limit:%')
  with check (tzjill.cms_is_editor() and key not like 'tzjill-rate-limit:%');

drop policy if exists "Editors can delete CMS content" on tzjill.cms_content;
create policy "Editors can delete CMS content"
  on tzjill.cms_content
  for delete
  to authenticated
  using (tzjill.cms_is_editor() and key not like 'tzjill-rate-limit:%');

drop policy if exists "Authenticated can read all CMS artists" on tzjill.cms_artists;
drop policy if exists "Editors can read all CMS artists" on tzjill.cms_artists;
create policy "Editors can read all CMS artists"
  on tzjill.cms_artists
  for select
  to authenticated
  using (tzjill.cms_is_editor());

drop policy if exists "Authenticated can read all artists" on tzjill.artists;
drop policy if exists "Editors can read all artists" on tzjill.artists;
create policy "Editors can read all artists"
  on tzjill.artists
  for select
  to authenticated
  using (tzjill.cms_is_editor());

drop policy if exists "CMS can read speed tests" on tzjill.site_speed_tests;
drop policy if exists "Editors can read speed tests" on tzjill.site_speed_tests;
create policy "Editors can read speed tests"
  on tzjill.site_speed_tests
  for select
  to authenticated
  using (tzjill.cms_is_editor());

drop policy if exists "Anyone can submit booking stats" on tzjill.booking_requests;
drop policy if exists "Anyone can submit site rum" on tzjill.site_rum;

revoke insert, update, delete, truncate on tzjill.cms_content from anon;
revoke insert, update, delete, truncate on tzjill.cms_artists from anon;
revoke insert, update, delete, truncate on tzjill.artists from anon;
revoke insert, update, delete, truncate on tzjill.team_members from anon;
revoke insert, update, delete, truncate on tzjill.site_settings from anon;
revoke insert, update, delete, truncate on tzjill.media_assets from anon;
revoke insert, update, delete, truncate on tzjill.site_speed_tests from anon;
revoke all on tzjill.booking_requests from anon;
revoke insert, update, delete, truncate on tzjill.booking_requests from authenticated;
revoke all on tzjill.site_rum from anon;
revoke insert, update, delete, truncate on tzjill.site_rum from authenticated;
revoke all on tzjill.site_health_cache from anon;
revoke insert, update, delete, truncate on tzjill.site_health_cache from authenticated;
revoke all on tzjill.user_roles from anon;
revoke insert, update, delete, truncate on tzjill.user_roles from authenticated;
revoke all on tzjill.api_rate_limits from anon, authenticated;

create or replace function tzjill.cms_ensure_role()
returns text
language plpgsql
security definer
set search_path to pg_catalog, tzjill, pg_temp
as $$
declare
  current_role text;
  user_email text;
  owner_email constant text := 'martin@viraal.media';
begin
  if auth.uid() is null then
    return 'viewer';
  end if;

  user_email := lower(coalesce(auth.jwt() ->> 'email', ''));

  select role into current_role
  from tzjill.user_roles
  where user_id = auth.uid();

  if user_email = owner_email then
    if current_role is not null then
      update tzjill.user_roles
      set
        role = 'admin',
        status = 'active',
        email = coalesce(nullif(email, ''), user_email)
      where user_id = auth.uid();
    else
      insert into tzjill.user_roles (user_id, email, display_name, role, status)
      values (
        auth.uid(),
        user_email,
        coalesce(auth.jwt() ->> 'email', 'Admin'),
        'admin',
        'active'
      )
      on conflict (user_id) do update
        set role = 'admin', status = 'active';
    end if;
    return 'admin';
  end if;

  if current_role is not null then
    update tzjill.user_roles
    set
      status = 'active',
      email = case when email = '' then user_email else email end
    where user_id = auth.uid();
    return current_role;
  end if;

  insert into tzjill.user_roles (user_id, email, display_name, role, status)
  values (
    auth.uid(),
    user_email,
    coalesce(nullif(user_email, ''), 'Gebruiker'),
    'viewer',
    'active'
  )
  on conflict (user_id) do nothing;

  return 'viewer';
end;
$$;

revoke all on function tzjill.cms_ensure_role() from public, anon;
grant execute on function tzjill.cms_ensure_role() to authenticated, service_role;
