-- Tzjill Barber Shop — volledige schema voor een leeg project
-- Plak dit in Supabase → SQL Editor → Run
-- Bron: supabase/migrations/ in bestandsvolgorde


-- =============================================================================
-- 20260728120000_phase1_foundation.sql
-- =============================================================================

-- Phase 1: No Type CMS foundation
-- Tables, updated_at trigger, storage bucket, RLS
-- Does not seed or migrate local CMS data.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- artists
-- ---------------------------------------------------------------------------

create table if not exists public.artists (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  genre text,
  bio text,
  image_url text,
  image_alt text,
  image_focus text,
  image_focus_x numeric,
  image_focus_y numeric,
  image_scale numeric,
  art_direction_version integer,
  video_url text,
  socials jsonb not null default '[]'::jsonb,
  tracks jsonb not null default '[]'::jsonb,
  sections jsonb not null default '[]'::jsonb,
  presskit_url text,
  visible boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists artists_visible_name_idx
  on public.artists (visible, name);

create index if not exists artists_slug_idx
  on public.artists (slug);

drop trigger if exists artists_set_updated_at on public.artists;
create trigger artists_set_updated_at
  before update on public.artists
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- team_members
-- ---------------------------------------------------------------------------

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  image_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists team_members_set_updated_at on public.team_members;
create trigger team_members_set_updated_at
  before update on public.team_members
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- site_settings (single-row content blob matching SiteContent)
-- ---------------------------------------------------------------------------

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- media_assets
-- ---------------------------------------------------------------------------

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null check (kind in ('image', 'video')),
  mime_type text not null,
  storage_path text not null unique,
  size bigint not null check (size >= 0),
  width integer,
  height integer,
  duration numeric,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists media_assets_kind_created_idx
  on public.media_assets (kind, created_at desc);

-- ---------------------------------------------------------------------------
-- Storage bucket: media
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  104857600, -- 100 MB
  array[
    'image/webp',
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/webm',
    'video/mp4'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- Row Level Security — tables
-- ---------------------------------------------------------------------------

alter table public.artists enable row level security;
alter table public.team_members enable row level security;
alter table public.site_settings enable row level security;
alter table public.media_assets enable row level security;

-- artists: public reads only visible rows; auth manages all
drop policy if exists "Public can read visible artists" on public.artists;
create policy "Public can read visible artists"
  on public.artists
  for select
  to anon, authenticated
  using (visible = true);

drop policy if exists "Authenticated can read all artists" on public.artists;
create policy "Authenticated can read all artists"
  on public.artists
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated can insert artists" on public.artists;
create policy "Authenticated can insert artists"
  on public.artists
  for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated can update artists" on public.artists;
create policy "Authenticated can update artists"
  on public.artists
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated can delete artists" on public.artists;
create policy "Authenticated can delete artists"
  on public.artists
  for delete
  to authenticated
  using (true);

-- team_members: public read all; auth manage
drop policy if exists "Public can read team members" on public.team_members;
create policy "Public can read team members"
  on public.team_members
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Authenticated can insert team members" on public.team_members;
create policy "Authenticated can insert team members"
  on public.team_members
  for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated can update team members" on public.team_members;
create policy "Authenticated can update team members"
  on public.team_members
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated can delete team members" on public.team_members;
create policy "Authenticated can delete team members"
  on public.team_members
  for delete
  to authenticated
  using (true);

-- site_settings: public read; auth manage
drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
  on public.site_settings
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Authenticated can insert site settings" on public.site_settings;
create policy "Authenticated can insert site settings"
  on public.site_settings
  for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated can update site settings" on public.site_settings;
create policy "Authenticated can update site settings"
  on public.site_settings
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated can delete site settings" on public.site_settings;
create policy "Authenticated can delete site settings"
  on public.site_settings
  for delete
  to authenticated
  using (true);

-- media_assets: public read metadata; auth manage
drop policy if exists "Public can read media assets" on public.media_assets;
create policy "Public can read media assets"
  on public.media_assets
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Authenticated can insert media assets" on public.media_assets;
create policy "Authenticated can insert media assets"
  on public.media_assets
  for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated can update media assets" on public.media_assets;
create policy "Authenticated can update media assets"
  on public.media_assets
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated can delete media assets" on public.media_assets;
create policy "Authenticated can delete media assets"
  on public.media_assets
  for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Storage RLS — bucket: media
-- ---------------------------------------------------------------------------

drop policy if exists "Public can read media bucket" on storage.objects;
create policy "Public can read media bucket"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'media');

drop policy if exists "Authenticated can upload media" on storage.objects;
create policy "Authenticated can upload media"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'media');

drop policy if exists "Authenticated can update media" on storage.objects;
create policy "Authenticated can update media"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'media')
  with check (bucket_id = 'media');

drop policy if exists "Authenticated can delete media" on storage.objects;
create policy "Authenticated can delete media"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'media');


-- =============================================================================
-- 20260729103000_phase3_1_temp_anon_artist_writes.sql
-- =============================================================================

-- Phase 3.1 — temporary anon policies for CMS artist writes
-- Auth UI is not wired yet; the browser anon key must be able to manage artists.
-- REMOVE these policies in Phase 5 when /cms requires login.

-- Allow CMS to load hidden artists (visible = false) before auth lands.
drop policy if exists "Temp anon can read all artists" on public.artists;
create policy "Temp anon can read all artists"
  on public.artists
  for select
  to anon
  using (true);

drop policy if exists "Temp anon can insert artists" on public.artists;
create policy "Temp anon can insert artists"
  on public.artists
  for insert
  to anon
  with check (true);

drop policy if exists "Temp anon can update artists" on public.artists;
create policy "Temp anon can update artists"
  on public.artists
  for update
  to anon
  using (true)
  with check (true);

drop policy if exists "Temp anon can delete artists" on public.artists;
create policy "Temp anon can delete artists"
  on public.artists
  for delete
  to anon
  using (true);


-- =============================================================================
-- 20260729120000_phase3_3_remove_temp_anon_artist_writes.sql
-- =============================================================================

-- Phase 3.3 — Auth is live in the CMS UI.
-- After verifying admin login works, remove temporary anon artist write policies
-- from 20260729103000_phase3_1_temp_anon_artist_writes.sql so only authenticated
-- users can mutate artists (matches Phase 1 RLS).
--
-- Run this ONLY after at least one admin user exists in Auth → Users
-- and you have confirmed /cms/login works.

drop policy if exists "Temp anon can read all artists" on public.artists;
drop policy if exists "Temp anon can insert artists" on public.artists;
drop policy if exists "Temp anon can update artists" on public.artists;
drop policy if exists "Temp anon can delete artists" on public.artists;

-- Public read of visible artists (Phase 1) remains:
--   "Public can read visible artists"
-- Authenticated CMS CRUD (Phase 1) remains:
--   "Authenticated can read all artists"
--   "Authenticated can insert/update/delete artists"


-- =============================================================================
-- 20260729140000_phase3_4_artist_publish_status.sql
-- =============================================================================

-- Phase 3.4 — artist draft / publish workflow
-- Adds status + published_at. Keeps `visible` in sync for existing RLS.

alter table public.artists
  add column if not exists status text;

alter table public.artists
  add column if not exists published_at timestamptz;

-- Backfill from legacy visible flag
update public.artists
set
  status = case when visible then 'published' else 'draft' end,
  published_at = case
    when visible then coalesce(published_at, updated_at, created_at)
    else published_at
  end
where status is null;

alter table public.artists
  alter column status set default 'draft';

update public.artists set status = 'draft' where status is null;

alter table public.artists
  alter column status set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'artists_status_check'
  ) then
    alter table public.artists
      add constraint artists_status_check
      check (status in ('draft', 'published'));
  end if;
end $$;

create index if not exists artists_status_visible_idx
  on public.artists (status, visible);


-- =============================================================================
-- 20260729160000_phase3_5_artist_videos.sql
-- =============================================================================

-- Phase 3.5 — artist video reels (multiple 9:16 videos)
-- Adds `videos` jsonb. Keeps `video_url` for backward compatibility.

alter table public.artists
  add column if not exists videos jsonb;

update public.artists
set videos = '[]'::jsonb
where videos is null;

alter table public.artists
  alter column videos set default '[]'::jsonb;

alter table public.artists
  alter column videos set not null;

-- Backfill single legacy video into the collection (once)
update public.artists
set videos = jsonb_build_array(
  jsonb_build_object(
    'id', gen_random_uuid()::text,
    'videoUrl', video_url,
    'posterUrl', coalesce(nullif(image_url, ''), '')
  )
)
where video_url is not null
  and btrim(video_url) <> ''
  and (
    videos = '[]'::jsonb
    or videos is null
  );


-- =============================================================================
-- 20260827120000_cms_json_store.sql
-- =============================================================================

-- CMS JSON store: localStorage-shaped content + per-artist blobs
-- Keys stay `notype-cms-content-v1` and `notype-public-artists-v3` in `cms_content.key`.

create table if not exists public.cms_content (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.cms_artists (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists cms_content_set_updated_at on public.cms_content;
create trigger cms_content_set_updated_at
  before update on public.cms_content
  for each row
  execute function public.set_updated_at();

drop trigger if exists cms_artists_set_updated_at on public.cms_artists;
create trigger cms_artists_set_updated_at
  before update on public.cms_artists
  for each row
  execute function public.set_updated_at();

alter table public.cms_content enable row level security;
alter table public.cms_artists enable row level security;

grant select on public.cms_content to anon, authenticated;
grant insert, update, delete on public.cms_content to authenticated;
grant all on public.cms_content to service_role;
grant select on public.cms_artists to anon, authenticated;
grant insert, update, delete on public.cms_artists to authenticated;
grant all on public.cms_artists to service_role;

drop policy if exists "Public can read public CMS cache" on public.cms_content;
create policy "Public can read public CMS cache"
  on public.cms_content
  for select
  to anon, authenticated
  using (
    key in (
      'notype-public-artists-v2',
      'notype-public-artists-v3'
    )
  );

drop policy if exists "Authenticated can read all CMS content" on public.cms_content;
create policy "Authenticated can read all CMS content"
  on public.cms_content
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated can insert CMS content" on public.cms_content;
create policy "Authenticated can insert CMS content"
  on public.cms_content
  for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated can update CMS content" on public.cms_content;
create policy "Authenticated can update CMS content"
  on public.cms_content
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated can delete CMS content" on public.cms_content;
create policy "Authenticated can delete CMS content"
  on public.cms_content
  for delete
  to authenticated
  using (true);

drop policy if exists "Public can read published CMS artists" on public.cms_artists;
create policy "Public can read published CMS artists"
  on public.cms_artists
  for select
  to anon, authenticated
  using (coalesce(data->>'status', 'published') = 'published');

drop policy if exists "Authenticated can read all CMS artists" on public.cms_artists;
create policy "Authenticated can read all CMS artists"
  on public.cms_artists
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated can insert CMS artists" on public.cms_artists;
create policy "Authenticated can insert CMS artists"
  on public.cms_artists
  for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated can update CMS artists" on public.cms_artists;
create policy "Authenticated can update CMS artists"
  on public.cms_artists
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated can delete CMS artists" on public.cms_artists;
create policy "Authenticated can delete CMS artists"
  on public.cms_artists
  for delete
  to authenticated
  using (true);


-- =============================================================================
-- 20260827131500_public_artists_v3.sql
-- =============================================================================

-- Public roster cache moved to slug-keyed `notype-public-artists-v3`.
-- Keep v2 readable so existing rows still work until the CMS republishes.

drop policy if exists "Public can read public CMS cache" on public.cms_content;
create policy "Public can read public CMS cache"
  on public.cms_content
  for select
  to anon, authenticated
  using (
    key in (
      'notype-public-artists-v2',
      'notype-public-artists-v3'
    )
  );


-- =============================================================================
-- 20260901184500_booking_requests.sql
-- =============================================================================

-- Compact booking-form stats for the CMS dashboard (artist + country counts).

create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  submitted_at timestamptz not null default timezone('utc', now()),
  country text not null default '',
  artists jsonb not null default '[]'::jsonb
);

create index if not exists booking_requests_submitted_at_idx
  on public.booking_requests (submitted_at desc);

alter table public.booking_requests enable row level security;

grant insert on public.booking_requests to anon, authenticated;
grant select on public.booking_requests to authenticated;
grant all on public.booking_requests to service_role;

drop policy if exists "Anyone can submit booking stats" on public.booking_requests;
create policy "Anyone can submit booking stats"
  on public.booking_requests
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "CMS can read booking stats" on public.booking_requests;
create policy "CMS can read booking stats"
  on public.booking_requests
  for select
  to authenticated
  using (true);


-- =============================================================================
-- 20260902120000_user_roles.sql
-- =============================================================================

-- CMS roles: admin, editor, viewer. First authenticated user becomes admin.

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null default '',
  display_name text not null default '',
  role text not null check (role in ('admin', 'editor', 'viewer')),
  status text not null default 'invited' check (status in ('active', 'invited')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists user_roles_set_updated_at on public.user_roles;
create trigger user_roles_set_updated_at
  before update on public.user_roles
  for each row
  execute function public.set_updated_at();

alter table public.user_roles enable row level security;

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

create or replace function public.cms_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select role
      from public.user_roles
      where user_id = auth.uid()
      limit 1
    ),
    'viewer'
  );
$$;

create or replace function public.cms_is_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.cms_role() in ('admin', 'editor');
$$;

create or replace function public.cms_ensure_role()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  current_role text;
  total int;
  user_email text;
begin
  if auth.uid() is null then
    return 'viewer';
  end if;

  user_email := coalesce(auth.jwt() ->> 'email', '');

  select role into current_role
  from public.user_roles
  where user_id = auth.uid();

  if current_role is not null then
    update public.user_roles
    set
      status = 'active',
      email = case when email = '' then user_email else email end
    where user_id = auth.uid();
    return current_role;
  end if;

  select count(*) into total from public.user_roles;
  if total = 0 then
    insert into public.user_roles (user_id, email, display_name, role, status)
    values (
      auth.uid(),
      user_email,
      coalesce(auth.jwt() ->> 'email', 'Admin'),
      'admin',
      'active'
    );
    return 'admin';
  end if;

  insert into public.user_roles (user_id, email, display_name, role, status)
  values (
    auth.uid(),
    user_email,
    coalesce(user_email, 'Gebruiker'),
    'viewer',
    'active'
  )
  on conflict (user_id) do nothing;

  return 'viewer';
end;
$$;

grant execute on function public.cms_role() to authenticated, anon;
grant execute on function public.cms_is_editor() to authenticated, anon;
grant execute on function public.cms_ensure_role() to authenticated;

drop policy if exists "Users can read own role" on public.user_roles;
create policy "Users can read own role"
  on public.user_roles
  for select
  to authenticated
  using (user_id = auth.uid() or public.cms_role() = 'admin');

-- Tighten CMS writes: viewers can read, only admin/editor can mutate.
drop policy if exists "Authenticated can insert CMS content" on public.cms_content;
create policy "Editors can insert CMS content"
  on public.cms_content
  for insert
  to authenticated
  with check (public.cms_is_editor());

drop policy if exists "Authenticated can update CMS content" on public.cms_content;
create policy "Editors can update CMS content"
  on public.cms_content
  for update
  to authenticated
  using (public.cms_is_editor())
  with check (public.cms_is_editor());

drop policy if exists "Authenticated can delete CMS content" on public.cms_content;
create policy "Editors can delete CMS content"
  on public.cms_content
  for delete
  to authenticated
  using (public.cms_is_editor());

drop policy if exists "Authenticated can insert CMS artists" on public.cms_artists;
create policy "Editors can insert CMS artists"
  on public.cms_artists
  for insert
  to authenticated
  with check (public.cms_is_editor());

drop policy if exists "Authenticated can update CMS artists" on public.cms_artists;
create policy "Editors can update CMS artists"
  on public.cms_artists
  for update
  to authenticated
  using (public.cms_is_editor())
  with check (public.cms_is_editor());

drop policy if exists "Authenticated can delete CMS artists" on public.cms_artists;
create policy "Editors can delete CMS artists"
  on public.cms_artists
  for delete
  to authenticated
  using (public.cms_is_editor());

drop policy if exists "Authenticated can insert artists" on public.artists;
create policy "Editors can insert artists"
  on public.artists
  for insert
  to authenticated
  with check (public.cms_is_editor());

drop policy if exists "Authenticated can update artists" on public.artists;
create policy "Editors can update artists"
  on public.artists
  for update
  to authenticated
  using (public.cms_is_editor())
  with check (public.cms_is_editor());

drop policy if exists "Authenticated can delete artists" on public.artists;
create policy "Editors can delete artists"
  on public.artists
  for delete
  to authenticated
  using (public.cms_is_editor());

drop policy if exists "Authenticated can insert team members" on public.team_members;
create policy "Editors can insert team members"
  on public.team_members
  for insert
  to authenticated
  with check (public.cms_is_editor());

drop policy if exists "Authenticated can update team members" on public.team_members;
create policy "Editors can update team members"
  on public.team_members
  for update
  to authenticated
  using (public.cms_is_editor())
  with check (public.cms_is_editor());

drop policy if exists "Authenticated can delete team members" on public.team_members;
create policy "Editors can delete team members"
  on public.team_members
  for delete
  to authenticated
  using (public.cms_is_editor());

drop policy if exists "Authenticated can insert site settings" on public.site_settings;
create policy "Editors can insert site settings"
  on public.site_settings
  for insert
  to authenticated
  with check (public.cms_is_editor());

drop policy if exists "Authenticated can update site settings" on public.site_settings;
create policy "Editors can update site settings"
  on public.site_settings
  for update
  to authenticated
  using (public.cms_is_editor())
  with check (public.cms_is_editor());

drop policy if exists "Authenticated can delete site settings" on public.site_settings;
create policy "Editors can delete site settings"
  on public.site_settings
  for delete
  to authenticated
  using (public.cms_is_editor());

drop policy if exists "Authenticated can insert media assets" on public.media_assets;
create policy "Editors can insert media assets"
  on public.media_assets
  for insert
  to authenticated
  with check (public.cms_is_editor());

drop policy if exists "Authenticated can update media assets" on public.media_assets;
create policy "Editors can update media assets"
  on public.media_assets
  for update
  to authenticated
  using (public.cms_is_editor())
  with check (public.cms_is_editor());

drop policy if exists "Authenticated can delete media assets" on public.media_assets;
create policy "Editors can delete media assets"
  on public.media_assets
  for delete
  to authenticated
  using (public.cms_is_editor());

drop policy if exists "Authenticated can upload media" on storage.objects;
create policy "Editors can upload media"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'media' and public.cms_is_editor());

drop policy if exists "Authenticated can update media" on storage.objects;
create policy "Editors can update media"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'media' and public.cms_is_editor())
  with check (bucket_id = 'media' and public.cms_is_editor());

drop policy if exists "Authenticated can delete media" on storage.objects;
create policy "Editors can delete media"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'media' and public.cms_is_editor());


-- =============================================================================
-- 20260902140000_owner_admin.sql
-- =============================================================================

-- Owner mailbox is always CMS admin.

create or replace function public.cms_ensure_role()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  current_role text;
  total int;
  user_email text;
  owner_email constant text := 'martin@viraal.media';
begin
  if auth.uid() is null then
    return 'viewer';
  end if;

  user_email := lower(coalesce(auth.jwt() ->> 'email', ''));

  select role into current_role
  from public.user_roles
  where user_id = auth.uid();

  if user_email = owner_email then
    if current_role is not null then
      update public.user_roles
      set
        role = 'admin',
        status = 'active',
        email = coalesce(nullif(email, ''), user_email)
      where user_id = auth.uid();
    else
      insert into public.user_roles (user_id, email, display_name, role, status)
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
    update public.user_roles
    set
      status = 'active',
      email = case when email = '' then user_email else email end
    where user_id = auth.uid();
    return current_role;
  end if;

  select count(*) into total from public.user_roles;
  if total = 0 then
    insert into public.user_roles (user_id, email, display_name, role, status)
    values (
      auth.uid(),
      user_email,
      coalesce(auth.jwt() ->> 'email', 'Admin'),
      'admin',
      'active'
    );
    return 'admin';
  end if;

  insert into public.user_roles (user_id, email, display_name, role, status)
  values (
    auth.uid(),
    user_email,
    coalesce(user_email, 'Gebruiker'),
    'viewer',
    'active'
  )
  on conflict (user_id) do nothing;

  return 'viewer';
end;
$$;

insert into public.user_roles (user_id, email, display_name, role, status)
select
  id,
  lower(coalesce(email, '')),
  coalesce(email, 'Admin'),
  'admin',
  'active'
from auth.users
where lower(coalesce(email, '')) = 'martin@viraal.media'
on conflict (user_id) do update
  set role = 'admin',
      status = 'active',
      email = excluded.email;


-- =============================================================================
-- 20260902150000_booking_city.sql
-- =============================================================================

alter table if exists public.booking_requests
  add column if not exists city text not null default '';


-- =============================================================================
-- 20260902190000_site_rum.sql
-- =============================================================================

-- Real-user metrics for the CMS dashboard (vitals, errors, presence, 404s).

create table if not exists public.site_rum (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  kind text not null,
  name text not null default '',
  value double precision,
  path text not null default '',
  message text not null default '',
  session_id text not null default '',
  city text not null default '',
  country text not null default ''
);

create index if not exists site_rum_created_at_idx
  on public.site_rum (created_at desc);

create index if not exists site_rum_kind_created_idx
  on public.site_rum (kind, created_at desc);

create table if not exists public.site_health_cache (
  cache_key text primary key,
  payload jsonb not null default '{}'::jsonb,
  fetched_at timestamptz not null default timezone('utc', now())
);

alter table public.site_rum enable row level security;
alter table public.site_health_cache enable row level security;

grant insert on public.site_rum to anon, authenticated;
grant select on public.site_rum to authenticated;
grant all on public.site_rum to service_role;
grant all on public.site_health_cache to service_role;
grant select on public.site_health_cache to authenticated;

drop policy if exists "Anyone can submit site rum" on public.site_rum;
create policy "Anyone can submit site rum"
  on public.site_rum
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "CMS can read site rum" on public.site_rum;
create policy "CMS can read site rum"
  on public.site_rum
  for select
  to authenticated
  using (true);

drop policy if exists "CMS can read health cache" on public.site_health_cache;
create policy "CMS can read health cache"
  on public.site_health_cache
  for select
  to authenticated
  using (true);


-- =============================================================================
-- 20260902200000_site_speed_tests.sql
-- =============================================================================

-- Two-weekly PageSpeed history for the CMS dashboard.

create table if not exists public.site_speed_tests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  origin text not null,
  score integer,
  lcp double precision,
  inp double precision,
  cls double precision,
  ttfb double precision,
  source text not null default 'pagespeed',
  optimized_at timestamptz,
  optimize_summary text not null default ''
);

create index if not exists site_speed_tests_created_at_idx
  on public.site_speed_tests (created_at desc);

alter table public.site_speed_tests enable row level security;

grant select, insert, update on public.site_speed_tests to authenticated;
grant all on public.site_speed_tests to service_role;

drop policy if exists "CMS can read speed tests" on public.site_speed_tests;
create policy "CMS can read speed tests"
  on public.site_speed_tests
  for select
  to authenticated
  using (true);

drop policy if exists "CMS can insert speed tests" on public.site_speed_tests;
create policy "CMS can insert speed tests"
  on public.site_speed_tests
  for insert
  to authenticated
  with check (true);

drop policy if exists "CMS can update speed tests" on public.site_speed_tests;
create policy "CMS can update speed tests"
  on public.site_speed_tests
  for update
  to authenticated
  using (true);


-- =============================================================================
-- 20260923120000_form_submissions.sql
-- =============================================================================

-- Form submissions inbox. First form: the 10-year promo popup (`promo-10y`).
-- More forms can reuse this table via form_id. Inserts go through the
-- service role (server). CMS admins and editors can read.

create table if not exists public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  form_id text not null check (form_id ~ '^[a-z0-9-]{1,64}$'),
  name text not null check (char_length(btrim(name)) between 2 and 80),
  email text not null check (
    email = lower(email)
    and char_length(email) between 3 and 200
  ),
  phone text not null default '' check (char_length(phone) <= 32),
  created_at timestamptz not null default timezone('utc', now()),
  meta jsonb not null default '{}'::jsonb,
  constraint form_submissions_form_email_key unique (form_id, email)
);

create index if not exists form_submissions_form_created_idx
  on public.form_submissions (form_id, created_at desc);

alter table public.form_submissions enable row level security;

grant select on public.form_submissions to authenticated;
grant all on public.form_submissions to service_role;

drop policy if exists "CMS admins can read form submissions" on public.form_submissions;
create policy "CMS admins can read form submissions"
  on public.form_submissions
  for select
  to authenticated
  using (public.cms_is_editor());

-- Upsert by form + email. Executable only by the service role.
create or replace function public.save_form_submission(
  p_form_id text,
  p_name text,
  p_email text,
  p_phone text,
  p_meta jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_id uuid;
  row_id uuid;
  clean_form text := lower(btrim(coalesce(p_form_id, '')));
  clean_name text := btrim(coalesce(p_name, ''));
  clean_email text := lower(btrim(coalesce(p_email, '')));
  clean_phone text := btrim(coalesce(p_phone, ''));
begin
  if clean_form !~ '^[a-z0-9-]{1,64}$' then
    raise exception 'invalid form_id';
  end if;
  if char_length(clean_name) < 2 or char_length(clean_name) > 80 then
    raise exception 'invalid name';
  end if;
  if clean_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
     or char_length(clean_email) > 200 then
    raise exception 'invalid email';
  end if;
  if char_length(clean_phone) > 32 then
    raise exception 'invalid phone';
  end if;

  select id into existing_id
  from public.form_submissions
  where form_id = clean_form and email = clean_email;

  insert into public.form_submissions (form_id, name, email, phone, meta)
  values (
    clean_form,
    clean_name,
    clean_email,
    clean_phone,
    coalesce(p_meta, '{}'::jsonb)
  )
  on conflict (form_id, email) do update
    set
      name = excluded.name,
      phone = excluded.phone,
      meta = public.form_submissions.meta
        || excluded.meta
        || jsonb_build_object('resubmitted_at', timezone('utc', now()))
  returning id into row_id;

  return jsonb_build_object(
    'id', row_id,
    'duplicate', existing_id is not null
  );
end;
$$;

revoke all on function public.save_form_submission(text, text, text, text, jsonb) from public;
revoke all on function public.save_form_submission(text, text, text, text, jsonb) from anon, authenticated;
grant execute on function public.save_form_submission(text, text, text, text, jsonb) to service_role;

