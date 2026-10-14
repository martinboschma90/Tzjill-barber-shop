import { createHmac } from 'node:crypto'

const ALLOWED_ORIGIN_PATTERN = /^https:\/\/((www\.)?tzjill\.nl|tzjill-barber-shop[\w.-]*\.vercel\.app)$/i
const LOCAL_ORIGIN_PATTERN = /^http:\/\/(localhost|127\.0\.0\.1):(5173|5174|4173)$/i
const hits = new Map()
export function allowedOrigin(origin) {
  const value = String(origin || '').trim()
  return ALLOWED_ORIGIN_PATTERN.test(value) || LOCAL_ORIGIN_PATTERN.test(value) ? value : ''
}
export function isSiteHost(host) {
  const value = String(host || '').split(':')[0].toLowerCase()
  return value === 'tzjill.nl' || value === 'www.tzjill.nl' || /^tzjill-barber-shop[\w.-]*\.vercel\.app$/.test(value) || value === 'localhost' || value === '127.0.0.1'
}
export function isAllowedRequest(req) {
  // A Host header does not authorize a cross-origin browser request.
  if (req.headers.origin) return Boolean(allowedOrigin(req.headers.origin))
  return req.headers['sec-fetch-site'] !== 'cross-site' && isSiteHost(req.headers.host)
}
export function setCors(res, origin) {
  const allowed = allowedOrigin(origin)
  if (allowed) { res.setHeader('Access-Control-Allow-Origin', allowed); res.setHeader('Vary', 'Origin') }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}
export function clientIp(req) {
  return String(req.headers['x-forwarded-for'] || '').split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown'
}

/** Shared counter in a private CMS key; no new table or migration. Public policies cannot read/write these keys. */
export async function rateLimit(req, { limit = 8, windowMs = 15 * 60 * 1000, bucket = 'default' } = {}) {
  const now = Date.now()
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    if (process.env.VERCEL_ENV === 'production') return false
    const key = `${bucket}:${clientIp(req)}`
    const previous = hits.get(key)
    const count = previous && previous.expires > now ? previous.count + 1 : 1
    hits.set(key, { count, expires: previous && previous.expires > now ? previous.expires : now + windowMs })
    for (const [name, row] of hits) if (row.expires <= now) hits.delete(name)
    return count <= limit
  }
  const ipHash = createHmac('sha256', serviceKey).update(clientIp(req)).digest('hex').slice(0, 32)
  const key = `tzjill-rate-limit:${bucket}:${Math.floor(now / windowMs)}:${ipHash}`
  const root = `${url}/rest/v1/cms_content`
  const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json', Prefer: 'return=representation' }
  try {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const read = await fetch(`${root}?key=eq.${encodeURIComponent(key)}&select=data,updated_at`, { headers, signal: AbortSignal.timeout(5000) })
      if (!read.ok) return false
      const [row] = await read.json()
      if (row && Number(row.data?.count) >= limit) return false
      const query = row ? `?key=eq.${encodeURIComponent(key)}&updated_at=eq.${encodeURIComponent(row.updated_at)}` : ''
      const body = row ? { data: { count: Number(row.data?.count || 0) + 1 } } : { key, data: { count: 1 } }
      const response = await fetch(root + query, { method: row ? 'PATCH' : 'POST', headers, body: JSON.stringify(body), signal: AbortSignal.timeout(5000) })
      if (response.status === 409) continue
      if (!response.ok) return false
      const written = await response.json()
      if (!Array.isArray(written) || written.length === 0) continue
      // Expired counters contain no contact data and are maintained independently of the site document.
      if (attempt === 0 && Math.random() < 0.02) {
        void fetch(`${root}?key=like.tzjill-rate-limit:*&updated_at=lt.${encodeURIComponent(new Date(now - 86400000).toISOString())}`, { method: 'DELETE', headers, signal: AbortSignal.timeout(5000) }).catch(() => undefined)
      }
      return true
    }
  } catch { return false }
  return false
}
export function json(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(payload))
}
