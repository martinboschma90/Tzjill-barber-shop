import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'
import { PUBLIC_ROUTES, renderSeoHtml } from './src/lib/seo.ts'
import { productsEnabled } from './src/data/productsEnabled.ts'

const FALLBACK = 'https://tzjill-barber-shop.vercel.app'

const SITEMAP_PATHS = [...PUBLIC_ROUTES, ...(productsEnabled ? ['/products'] : [])]

function cleanOrigin(value: string): string {
  return value.trim().replace(/\/+$/, '')
}

function isNotype(value: string): boolean {
  return /notype-mgmt\.com/i.test(value)
}

function resolveOrigin(env: Record<string, string>): string {
  const fromEnv = cleanOrigin(env.VITE_PUBLIC_SITE_URL ?? '')
  if (fromEnv && !isNotype(fromEnv)) {
    try { const url = new URL(fromEnv); if (url.protocol === 'https:' && !url.username && !url.password) return url.origin } catch { /* keep previews unindexed */ }
  }
  return FALLBACK
}

function sitemapXml(origin: string): string {
  const urls = SITEMAP_PATHS.map((pathName) => {
    const loc = pathName === '/' ? `${origin}/` : `${origin}${pathName}`
    return `  <url>\n    <loc>${loc}</loc>\n  </url>`
  }).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

function robotsTxt(origin: string, noindex: boolean): string {
  const hiddenProducts = productsEnabled
    ? ''
    : 'Disallow: /products\nDisallow: /producten\n'
  const rules = noindex
    ? `User-agent: *\nDisallow: /\n`
    : `User-agent: *\nAllow: /\nDisallow: /cms\nDisallow: /cms/\nDisallow: /admin\nDisallow: /admin/\nDisallow: /api/\n${hiddenProducts}`
  return `${rules}\nHost: ${origin}\nSitemap: ${origin}/sitemap.xml\n`
}

/** Bake the public origin into index.html / robots / sitemap at build time. */
export function seoOriginPlugin(env: Record<string, string>): Plugin {
  const origin = resolveOrigin(env)
  const noindex = !env.VITE_PUBLIC_SITE_URL || origin.includes('vercel.app') || env.VERCEL_ENV === 'preview'

  return {
    name: 'seo-origin',
    transformIndexHtml(html) {
      return renderSeoHtml(html, '/', origin, noindex)
    },
    closeBundle() {
      const outDir = path.resolve(process.cwd(), 'dist')
      if (!fs.existsSync(outDir)) return
      const html = fs.readFileSync(path.join(outDir, 'index.html'), 'utf8')
      for (const route of SITEMAP_PATHS.filter((route) => route !== '/')) {
        const dir = path.join(outDir, route)
        fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(path.join(dir, 'index.html'), renderSeoHtml(html, route, origin, noindex))
      }
      fs.writeFileSync(path.join(outDir, '404.html'), renderSeoHtml(html, '/404', origin, true).replace('<title>Tzjill Barber &amp; Lounge</title>', '<title>Pagina niet gevonden | Tzjill</title>'))
      fs.writeFileSync(path.join(outDir, 'robots.txt'), robotsTxt(origin, noindex))
      fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemapXml(origin))
    },
  }
}
