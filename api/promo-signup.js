import { acceptPromoSignup, isValidPromoPayload, promoSignupResponse } from './promo-signup-lib.mjs'
import { json, rateLimit, setCors, allowedOrigin, isSiteHost } from './http-security.mjs'

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

    const result = await acceptPromoSignup(payload)
    const http = promoSignupResponse(result)
    json(res, http.status, http.body)
  } catch {
    json(res, 500, { error: 'Aanmelding mislukt. Probeer het opnieuw.' })
  }
}
