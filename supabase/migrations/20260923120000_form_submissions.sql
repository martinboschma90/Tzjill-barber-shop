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
