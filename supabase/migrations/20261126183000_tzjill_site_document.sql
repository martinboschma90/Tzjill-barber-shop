-- Co-public-style site CMS: draft + published, RPC-only access. Keeps full Tzjill JSON (site, team, artists).
-- Migrates existing tzjill-cms-content-v1 data. Rate-limit rows stay in cms_content.

create table if not exists tzjill.site_document (
  id text primary key check (id = 'main'),
  draft jsonb not null default '{}'::jsonb,
  published jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger site_document_set_updated_at
  before update on tzjill.site_document
  for each row
  execute function tzjill.set_updated_at();

alter table tzjill.site_document enable row level security;

revoke all on table tzjill.site_document from anon, authenticated;
grant all on table tzjill.site_document to service_role;

create or replace function tzjill.build_published(p_draft jsonb)
returns jsonb
language sql
immutable
set search_path to pg_catalog, tzjill, pg_temp
as $$
  select case
    when p_draft is null
      or jsonb_typeof(p_draft -> 'site') <> 'object'
      or jsonb_typeof(p_draft -> 'team') <> 'array'
      or jsonb_typeof(p_draft -> 'artists') <> 'array'
    then null
    else jsonb_build_object(
      'site', p_draft -> 'site',
      'team', p_draft -> 'team',
      'artists', coalesce(
        (
          select jsonb_agg(elem)
          from jsonb_array_elements(p_draft -> 'artists') as elem
          where coalesce(elem ->> 'visible', 'true') <> 'false'
            and coalesce(elem ->> 'status', 'published') = 'published'
        ),
        '[]'::jsonb
      )
    )
  end;
$$;

create or replace function tzjill.tzjill_published()
returns jsonb
language sql
stable
security definer
set search_path to pg_catalog, tzjill, pg_temp
as $$
  select published from tzjill.site_document where id = 'main';
$$;

create or replace function tzjill.tzjill_admin_document()
returns jsonb
language plpgsql
stable
security definer
set search_path to pg_catalog, tzjill, pg_temp
as $$
declare
  row tzjill.site_document%rowtype;
begin
  if auth.uid() is null or not tzjill.cms_is_editor() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select * into row from tzjill.site_document where id = 'main';
  if not found then
    return jsonb_build_object(
      'draft', null,
      'published', null,
      'updated_at', null,
      'revision', null
    );
  end if;

  return jsonb_build_object(
    'draft', row.draft,
    'published', row.published,
    'updated_at', row.updated_at,
    'revision', to_char(row.updated_at at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
  );
end;
$$;

create or replace function tzjill.tzjill_save_document(
  p_draft jsonb,
  p_publish boolean default true,
  p_expected timestamptz default null
)
returns jsonb
language plpgsql
security definer
set search_path to pg_catalog, tzjill, pg_temp
as $$
declare
  row tzjill.site_document%rowtype;
  next_published jsonb;
begin
  if auth.uid() is null or not tzjill.cms_is_editor() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  if p_draft is null
    or jsonb_typeof(p_draft) <> 'object'
    or pg_column_size(p_draft) > 4000000
  then
    raise exception 'invalid document' using errcode = '22023';
  end if;

  if jsonb_typeof(p_draft -> 'site') <> 'object'
    or jsonb_typeof(p_draft -> 'team') <> 'array'
    or jsonb_typeof(p_draft -> 'artists') <> 'array'
  then
    raise exception 'invalid document' using errcode = '22023';
  end if;

  select * into row from tzjill.site_document where id = 'main' for update;
  if found and p_expected is not null and row.updated_at <> p_expected then
    raise exception 'conflict' using errcode = '40001';
  end if;

  next_published := case
    when coalesce(p_publish, true) then tzjill.build_published(p_draft)
    else row.published
  end;

  insert into tzjill.site_document (id, draft, published)
  values ('main', p_draft, next_published)
  on conflict (id) do update
  set
    draft = excluded.draft,
    published = case
      when coalesce(p_publish, true) then excluded.published
      else tzjill.site_document.published
    end;

  return tzjill.tzjill_admin_document();
end;
$$;

revoke all on function tzjill.build_published(jsonb) from public;
grant execute on function tzjill.build_published(jsonb) to service_role;

revoke all on function tzjill.tzjill_published() from public;
grant execute on function tzjill.tzjill_published() to anon, authenticated, service_role;

revoke all on function tzjill.tzjill_admin_document() from public, anon;
grant execute on function tzjill.tzjill_admin_document() to authenticated, service_role;

revoke all on function tzjill.tzjill_save_document(jsonb, boolean, timestamptz) from public, anon;
grant execute on function tzjill.tzjill_save_document(jsonb, boolean, timestamptz) to authenticated, service_role;

insert into tzjill.site_document (id, draft, published, updated_at)
select
  'main',
  c.data,
  tzjill.build_published(c.data),
  c.updated_at
from tzjill.cms_content c
where c.key = 'tzjill-cms-content-v1'
on conflict (id) do update
set
  draft = excluded.draft,
  published = coalesce(tzjill.site_document.published, excluded.published),
  updated_at = greatest(tzjill.site_document.updated_at, excluded.updated_at);