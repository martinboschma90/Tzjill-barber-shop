import { handleSalonhub } from './salonhub-adapter.mjs'
import { json, rateLimit, setCors, allowedOrigin, isSiteHost } from './http-security.mjs'

const READS = new Set(['treatments', 'employees', 'dates', 'times'])

export default async function handler(req, res) {
  const origin = req.headers.origin
  setCors(res, origin)

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  if (req.method !== 'POST') {
    json(res, 405, { error: 'Method not allowed' })
    return
  }

  if (!allowedOrigin(origin) && !isSiteHost(req.headers.host)) {
    json(res, 403, { error: 'Forbidden' })
    return
  }

  let body
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
  } catch {
    json(res, 400, { error: 'Onbekende actie.' })
    return
  }
  const action = String(body.action || '')
  const read = READS.has(action)
  if (
    !rateLimit(req, {
      limit: read ? 80 : 6,
      windowMs: 15 * 60 * 1000,
      bucket: read ? 'salonhub-read' : 'salonhub-book',
    })
  ) {
    json(res, 429, { error: 'Te veel pogingen. Probeer het zo opnieuw.' })
    return
  }

  try {
    const result = await handleSalonhub(body)
    json(res, result.status, result.payload)
  } catch {
    json(res, 500, { error: 'De agenda reageert niet.' })
  }
}
