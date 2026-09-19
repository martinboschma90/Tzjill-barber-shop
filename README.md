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
| `VITE_PUBLIC_SITE_URL` | Recommended | Canonical origin. Default/fallback is `https://tzjill-barber-shop.vercel.app`. Set this to `https://www.tzjill.nl` only **after** DNS points at this app — not while WordPress is still live there. |
| `VITE_SUPABASE_URL` | For `/cms` | Empty = CMS stays closed (no local admin). |
| `VITE_SUPABASE_ANON_KEY` | For `/cms` | Same as above. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | CMS users / store writes. |
| `CRON_SECRET` | Server | `/api/site-speed` cron. |

Preview hosts (`*.vercel.app`) stay `noindex` until a real domain is set in `VITE_PUBLIC_SITE_URL`.
