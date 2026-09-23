-- 10-year promo popup signups. Inserts go through the server API (service role).
-- Authenticated CMS admins and editors may read. Anonymous clients cannot.

create table if not exists public.promo_signups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 80),
  email text not null check (
    email = lower(email)
    and char_length(email) <= 200
    and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  phone text not null check (phone ~ '^06[0-9]{8}$'),
  source text not null default 'popup-10y' check (char_length(source) between 1 and 40),
  user_agent text,
  path text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint promo_signups_email_source_key unique (email, source)
);

create index if not exists promo_signups_created_at_idx
  on public.promo_signups (created_at desc);

drop trigger if exists promo_signups_set_updated_at on public.promo_signups;
create trigger promo_signups_set_updated_at
  before update on public.promo_signups
  for each row
  execute function public.set_updated_at();

alter table public.promo_signups enable row level security;

revoke all on table public.promo_signups from public, anon, authenticated;
grant select on table public.promo_signups to authenticated;
grant all on table public.promo_signups to service_role;

drop policy if exists "CMS staff can read promo signups" on public.promo_signups;
create policy "CMS staff can read promo signups"
  on public.promo_signups
  for select
  to authenticated
  using (
    public.cms_role() in ('admin', 'editor')
    or lower(coalesce(auth.jwt() ->> 'email', '')) = 'martin@viraal.media'
  );
