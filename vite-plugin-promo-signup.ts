import type { Plugin } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import {
  acceptPromoSignup,
  handlePromoSignupList,
  isValidPromoPayload,
  safePromoPath,
} from './api/promo-signup-lib.mjs'

async function readJsonBody(req: IncomingMessage) {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw) return {}
  return JSON.parse(raw) as Record<string, unknown>
}

function refererPath(req: IncomingMessage) {
  const referer = String(req.headers.referer || req.headers.referrer || '')
  try {
    return new URL(referer).pathname
  } catch {
    return ''
  }
}

/** Dev middleware mirroring `/api/promo-signup` and `/api/promo-signups`. */
export function promoSignupPlugin(): Plugin {
  return {
    name: 'promo-signup-api',
    configureServer(server) {
      const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      if (!url || !serviceKey) {
        process.env.PROMO_SIGNUP_MEMORY = '1'
      }

      server.middlewares.use('/api/promo-signups', async (req, res) => {
        await handlePromoSignupList(
          req,
          res as ServerResponse & { statusCode: number },
        )
      })

      server.middlewares.use('/api/promo-signup', async (req, res) => {
        if (req.method === 'OPTIONS') {
          res.statusCode = 204
          res.end()
          return
        }

        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        try {
          const payload = await readJsonBody(req)
          if (!isValidPromoPayload(payload)) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(
              JSON.stringify({ error: 'Vul naam, e-mail en een 06-nummer in.' }),
            )
            return
          }

          const saved = await acceptPromoSignup(payload, {
            userAgent: req.headers['user-agent'],
            path: safePromoPath(payload.path) || refererPath(req),
          })
          if (!saved.ok) {
            res.statusCode = 503
            res.setHeader('Content-Type', 'application/json')
            res.end(
              JSON.stringify({
                error: saved.error || 'Aanmelding kon niet worden opgeslagen.',
              }),
            )
            return
          }

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ ok: true }))
        } catch (error) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              error:
                error instanceof Error
                  ? error.message
                  : 'Aanmelding mislukt.',
            }),
          )
        }
      })
    },
  }
}
