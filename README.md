# Tzjill Barber Shop

Marketing site + Flow Mates CMS for Tzjill Barber & Lounge (Leeuwarden).

```bash
npm install
cp .env.example .env.local
npm run dev
```

- Site: http://localhost:5174/
- CMS: http://localhost:5174/cms — **locked** until Supabase env is set

## Vercel env

| Variable | Required | Notes |
|---|---|---|
| `VITE_PUBLIC_SITE_URL` | Recommended | Canonical origin. Defaults to `https://www.tzjill.nl`. A `vercel.app` value is ignored so preview hosts never become the canonical. |
| `VITE_SUPABASE_URL` | For `/cms` | Empty = CMS stays closed (no local admin). |
| `VITE_SUPABASE_ANON_KEY` | For `/cms` | Same as above. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | CMS users / store writes. |
| `CRON_SECRET` | Server | `/api/site-speed` cron. |
| `SALONHUB_API_KEY` | Optional, server | Override for appointment create/verify. Never prefix with `VITE_`. Reads work without it. A successful create books a real chair — do not call it from tests. See `docs/SALONHUB-API.md`. |

Preview hosts (`*.vercel.app`, localhost) stay `noindex`. Production canonicals, `robots.txt` and `sitemap.xml` use `https://www.tzjill.nl`. Apex `tzjill.nl` should 301 to www in the Vercel domain settings.
