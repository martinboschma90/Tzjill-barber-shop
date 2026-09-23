import type { Plugin } from 'vite'
import type { IncomingMessage } from 'node:http'
import { handleSalonhub } from './api/salonhub-adapter.mjs'

async function readJsonBody(req: IncomingMessage) {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw) return {}
  return JSON.parse(raw) as Record<string, unknown>
}

/** Dev middleware mirroring `/api/salonhub` on Vercel. */
export function salonhubPlugin(): Plugin {
  return {
    name: 'salonhub-api',
    configureServer(server) {
      server.middlewares.use('/api/salonhub', async (req, res) => {
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
          const body = await readJsonBody(req)
          const result = await handleSalonhub(body)
          res.statusCode = result.status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(result.payload))
        } catch {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'De agenda reageert niet.' }))
        }
      })
    },
  }
}
