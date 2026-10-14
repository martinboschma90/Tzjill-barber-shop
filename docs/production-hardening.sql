-- Review and apply separately at release. No application data is deleted.
-- Requires SUPABASE_SERVICE_ROLE_KEY on server handlers before rollout.
begin;
drop policy if exists "Anyone can submit booking stats" on public.booking_requests;
drop policy if exists "Anyone can submit site rum" on public.site_rum;
revoke insert on public.booking_requests from anon;
revoke insert on public.site_rum from anon;
-- Only the filtered /api/content projection may publish the full document.
alter policy "Anon can read Tzjill CMS content" on public.cms_content
using (key in ('tzjill-public-site-v1', 'tzjill-public-artists-v3', 'tzjill-public-team-v1'));
-- These trigger/helper functions do not need to be public RPC endpoints.
revoke execute on function public.cms_ensure_role() from public, anon;
grant execute on function public.cms_ensure_role() to authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
alter function public.set_updated_at() set search_path = public;
commit;
