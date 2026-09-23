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

## Formulieren (`form_submissions`)

Promo-aanmeldingen (popup “10 jaar Tzjill”) worden opgeslagen in
`public.form_submissions`, formulier `promo-10y`. Hetzelfde e-mailadres op
hetzelfde formulier werkt een bestaande rij bij in plaats van een tweede aan
te maken.

1. Open de Supabase SQL Editor van dit project.
2. Plak en run `migrations/20260923120000_form_submissions.sql`.
3. Zet `SUPABASE_SERVICE_ROLE_KEY` in de serveromgeving (Vercel). Die sleutel
   blijft server-side; de site gebruikt hem om een aanmelding op te slaan
   vóór de Resend-mail. Mislukt de mail daarna, dan blijft de rij staan.
4. In het CMS: zijbalk **Formulieren** (of Dashboard → Formulieren).
   Admins en editors zien de reacties, nieuwste eerst. **Exporteer CSV**
   downloadt `name,email,phone,created_at`. Zoeken filtert naam, e-mail en
   telefoon. Viewers zien deze inbox niet.

## Phase 3.3 — CMS auth

1. Dashboard → Authentication → Users → **Add user** (email + password) for the admin.
2. Open `/cms/login` and sign in.
3. After login works, run
   `migrations/20260729120000_phase3_3_remove_temp_anon_artist_writes.sql`
   so only authenticated users can mutate artists.
   **Applied on the linked project (Phase 3.3 cleanup).**
