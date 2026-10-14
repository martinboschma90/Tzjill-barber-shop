import type { Plugin } from 'vite'
import contentHandler from './api/content.js'
import imageHandler from './api/image.js'
export function publicApiPlugin(): Plugin {
  return { name: 'public-api', configureServer(server) {
    server.middlewares.use('/api/content', (req, res) => { void contentHandler(req, res) })
    server.middlewares.use('/api/image', (req, res) => {
      const query = Object.fromEntries(new URL(req.url || '/', 'http://localhost').searchParams)
      void imageHandler(Object.assign(req, { query }), res)
    })
  } }
}
