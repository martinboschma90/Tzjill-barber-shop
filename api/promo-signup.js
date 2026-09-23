import { acceptPromoSignup, isValidPromoPayload, safePromoPath } from './promo-signup-lib.mjs'
import { json, rateLimit, setCors, allowedOrigin, isSiteHost } from './http-security.mjs'

function refererPath(req) {
  const referer = String(req.headers.referer || req.headers.referrer || '')
  try {
    return new URL(referer).pathname
  } catch {
    return ''
  }
}

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

  if (!rateLimit(req, { limit: 6, windowMs: 15 * 60 * 1000 })) {
    json(res, 429, { error: 'Te veel aanmeldingen. Probeer later opnieuw.' })
    return
  }

  try {
    const payload =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}

    if (!isValidPromoPayload(payload)) {
      json(res, 400, { error: 'Vul naam, e-mail en een 06-nummer in.' })
      return
    }

    const saved = await acceptPromoSignup(payload, {
      userAgent: req.headers['user-agent'],
      path: safePromoPath(payload.path) || refererPath(req),
    })
    if (!saved.ok) {
      json(res, 503, {
        error: saved.error || 'Aanmelding kon niet worden opgeslagen.',
      })
      return
    }

    json(res, 200, { ok: true })
  } catch {
    json(res, 500, { error: 'Aanmelding mislukt. Probeer het opnieuw.' })
  }
}
