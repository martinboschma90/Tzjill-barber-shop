import type { Plugin } from 'vite'
import type { IncomingMessage } from 'node:http'
import { listDevFormSubmissions, usesDevFormStore } from './api/form-submissions-lib.mjs'
import {
  acceptPromoSignup,
  isValidPromoPayload,
  promoSignupResponse,
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
      server.middlewares.use('/api/form-submissions', (req, res) => {
        if (req.method !== 'GET' || !usesDevFormStore()) {
          res.statusCode = req.method === 'GET' ? 404 : 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Not found' }))
          return
        }
        const url = new URL(req.url || '/', 'http://127.0.0.1')
        const formId = url.searchParams.get('form_id') || ''
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ submissions: listDevFormSubmissions(formId) }))
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

          const result = await acceptPromoSignup(payload)
          const http = promoSignupResponse(result)
          res.statusCode = http.status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(http.body))
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
