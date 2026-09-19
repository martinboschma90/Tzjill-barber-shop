import type { Plugin } from 'vite'
import type { IncomingMessage } from 'node:http'
import {
  isValidPromoPayload,
  sendPromoSignupEmail,
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

/** Dev middleware mirroring `/api/promo-signup` on Vercel. */
export function promoSignupPlugin(): Plugin {
  return {
    name: 'promo-signup-api',
    configureServer(server) {
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

          const sent = await sendPromoSignupEmail(payload)
          if (!sent.ok) {
            res.statusCode = 502
            res.setHeader('Content-Type', 'application/json')
            res.end(
              JSON.stringify({
                error: sent.error || 'Aanmelding kon niet worden verstuurd.',
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
