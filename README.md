# Tzjill Barber Shop

Marketing site + Flow Mates CMS for Tzjill Barber & Lounge (Leeuwarden).

```bash
npm install
cp .env.example .env.local
npm run dev
```

- Site: http://localhost:5174/
- CMS: http://localhost:5174/cms — lokale modus op localhost zonder backend; gehost CMS blijft gesloten tot Supabase is ingesteld.

## Vercel env

| Variable | Required | Notes |
|---|---|---|
| `VITE_PUBLIC_SITE_URL` | Recommended | Canonical origin. Default/fallback is `https://tzjill-barber-shop.vercel.app`. Set this to `https://tzjill.nl` only **after** DNS points at this app — not while WordPress is still live there. |
| `VITE_SUPABASE_URL` | For `/cms` | Empty = CMS stays closed (no local admin). |
| `VITE_SUPABASE_ANON_KEY` | For `/cms` | Same as above. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | CMS users, publieke contentprojectie en gedeelde rate limiter. |
| `CRON_SECRET` | Server | `/api/site-speed` cron. |
| `SALONHUB_API_KEY` | Optional, server | Override for appointment create/verify. Never prefix with `VITE_`. Reads work without it. A successful create books a real chair — do not call it from tests. See `docs/SALONHUB-API.md`. |

Preview hosts (`*.vercel.app`) stay `noindex` until a real domain is set in `VITE_PUBLIC_SITE_URL`.

## Go-live fixes (nog niet gepubliceerd)

- `npm run typecheck`, `npm test`, `npm run lint`, `npm run build` controleren de release. Tests gebruiken gesimuleerde responses; ze boeken geen echte stoel en sturen geen mail.
- CMS-opening leest alleen. Het volledige document wordt atomisch opgeslagen met de exacte serverrevision; conflicts bewaren een downloadbare lokale conceptkopie. Publieke content komt via `/api/content`, zonder ongepubliceerde profielen.
- De publieke site gebruikt de JSON-snapshot als bron; oude `site_settings`/team/artist-tabellen zijn alleen leesfallbacks. Houd bij release oude CMS-tabs gesloten/ververst.
- Contact/nieuwsbrief gebruiken `/api/message` en hebben `RESEND_API_KEY` plus een geverifieerde `BOOKING_FROM_EMAIL` nodig. Deze namen ontbreken momenteel in Tzjills Production-config. Ontbrekende mailconfig wordt als fout getoond; er wordt geen valse bevestiging gegeven. Salonhubs afspraakmail staat hier los van.
- `/api/content`, `/api/image` en de gedeelde limiter gebruiken server-only `SUPABASE_SERVICE_ROLE_KEY` en de Tzjill Supabase-URL. Deze serverkey is aanwezig in Production; preview moet afzonderlijk worden geconfigureerd.
- `docs/production-hardening.sql` is voorbereid, **niet uitgevoerd**. Controleer de bestaande policies en maak een backup voordat dit apart wordt toegepast. Het sluit directe anonieme statistiekwrites en toegang tot de volledige CMS-blob. Geen bestaande migraties zijn aangepast.
- Controleer de privacytekst, werkelijk gebruikte maildienst, bewaartermijnen en de getoonde openingstijden met de eigenaar. De huidige uren blijven behouden; Salonhub bood in de audit ook slots na 20:00.
- Na DNS/SSL: `VITE_PUBLIC_SITE_URL=https://tzjill.nl`, CMS → Zichtbaar in Google aan; `www` redirect in Vercel Domains naar de gekozen canonical. Controleer sitemap, elke routecanonical, 404 en privacy/cookies. Voeg de `/cms/reset-password` URL toe aan Supabase Auth Redirect URLs.
- Bestaande WordPress-URLs vragen een gecontroleerde redirectlijst; de generieke `/about` en `/menu` redirects zijn voorbereid. Vermijd een bulkredirect die onbekende pagina’s naar Home stuurt.
- Definitieve afspraakbevestiging en mail-/verificatiecode blijven een gecontroleerde live rooktest bij jouw release. De audit ging live tot het bevestigingsformulier; de volledige UI-flow is alleen met mocks getest.
