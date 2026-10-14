import type { Plugin } from 'vite'
import handler from './api/message.js'
export function messagePlugin(): Plugin {
  return { name: 'message-api', configureServer(server) { server.middlewares.use('/api/message', async (req, res) => {
    let raw = ''
    for await (const chunk of req) { raw += chunk.toString(); if (raw.length > 12000) { res.statusCode = 413; res.end(); return } }
    await handler(Object.assign(req, { body: raw }), res)
  }) } }
}
