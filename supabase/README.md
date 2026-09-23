# Supabase

Migrations live in `migrations/`.

## CMS JSON store (`cms_content` / `cms_artists`)

Run `migrations/20260827120000_cms_json_store.sql` in the SQL Editor so CMS
localStorage (`notype-cms-content-v1`, `notype-public-artists-v3`) can sync
across devices. Authenticated CMS writes; public can read the published roster
cache and published artist blobs.

## Phase 2.2 — seed artists (one-time)

Upserts the local CMS seed (`src/data/artists.ts` + `artistDetails.ts` + art direction) into `public.artists` by **slug**. Never deletes.

1. Add service role key to `.env.local` (Dashboard → Settings → API → `service_role`):

```
SUPABASE_SERVICE_ROLE_KEY=eyJ…
```

2. Preview:

```bash
npm run seed:artists:dry
```

3. Upsert:

```bash
npm run seed:artists
```

Expected: 12 rows upserted; public site (Phase 2.1) reads them when present.

## Phase 3.1 — temporary anon artist writes

Run `migrations/20260729103000_phase3_1_temp_anon_artist_writes.sql` in the SQL Editor
so the CMS can insert/update/delete artists with the anon key **before** auth lands.

## Promo signups (`promo_signups`)

Run `migrations/20260923120000_promo_signups.sql` in the SQL Editor (or
`supabase db push`) before the popup is expected to store leads. The 10-year
popup writes through `/api/promo-signup` with the existing
`SUPABASE_SERVICE_ROLE_KEY`. Admins and editors read the list in the CMS at
**Aanmeldingen** (`/cms/aanmeldingen`) and can export CSV. Anonymous clients
cannot read the table.

A saved row is success even if the Resend mail fails afterwards. The same
email for this promo updates the existing row and does not send a second mail.
If the database write fails, the API returns an error and does not claim the
signup succeeded.

Local `npm run dev` without a service role key keeps signups in the dev-server
memory so the page can be tried. That store is off on Vercel.

## Phase 3.3 — CMS auth

1. Dashboard → Authentication → Users → **Add user** (email + password) for the admin.
2. Open `/cms/login` and sign in.
3. After login works, run
   `migrations/20260729120000_phase3_3_remove_temp_anon_artist_writes.sql`
   so only authenticated users can mutate artists.
   **Applied on the linked project (Phase 3.3 cleanup).**
