import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'
import { productsEnabled } from './src/data/productsEnabled.ts'

const CANONICAL_ORIGIN = 'https://www.tzjill.nl'

const SITEMAP_PATHS = [
  '/',
  '/prijzen',
  '/lookbook',
  ...(productsEnabled ? ['/products'] : []),
  '/collabs',
  '/team',
  '/over-ons',
  '/contact',
  '/booking',
  '/faq',
  '/barbershop-leeuwarden',
  '/baard-scheren',
]

function cleanOrigin(value: string): string {
  return value.trim().replace(/\/+$/, '')
}

function isNotype(value: string): boolean {
  return /notype-mgmt\.com/i.test(value)
}

function isPreviewOrigin(value: string): boolean {
  return /vercel\.app/i.test(value) || /localhost|127\.0\.0\.1/i.test(value)
}

function resolveOrigin(env: Record<string, string>): string {
  const fromEnv = cleanOrigin(env.VITE_PUBLIC_SITE_URL ?? '')
  if (!fromEnv || isNotype(fromEnv) || isPreviewOrigin(fromEnv)) return CANONICAL_ORIGIN
  try {
    const url = new URL(fromEnv)
    if (url.hostname === 'tzjill.nl') url.hostname = 'www.tzjill.nl'
    return url.origin
  } catch {
    return CANONICAL_ORIGIN
  }
}

function sitemapXml(origin: string): string {
  const urls = SITEMAP_PATHS.map((pathName) => {
    const loc = pathName === '/' ? `${origin}/` : `${origin}${pathName}`
    return `  <url>\n    <loc>${loc}</loc>\n  </url>`
  }).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

function robotsTxt(origin: string, noindex: boolean): string {
  const hiddenProducts = productsEnabled ? '' : 'Disallow: /products\nDisallow: /products/\n'
  const rules = noindex
    ? `User-agent: *\nDisallow: /\n`
    : `User-agent: *\nAllow: /\nDisallow: /cms\nDisallow: /cms/\nDisallow: /admin\nDisallow: /admin/\nDisallow: /api/\n${hiddenProducts}`
  return `${rules}\nSitemap: ${origin}/sitemap.xml\n`
}

/** Bake the public origin into index.html / robots / sitemap at build time. */
export function seoOriginPlugin(env: Record<string, string>): Plugin {
  const origin = resolveOrigin(env)
  const noindex = process.env.VERCEL_ENV === 'preview'

  return {
    name: 'seo-origin',
    transformIndexHtml(html) {
      let next = html.replace(
        /<link rel="canonical" href="[^"]*" \/>/,
        `<link rel="canonical" href="${origin}/" />`,
      )
      const robots = noindex ? 'noindex, nofollow' : 'index, follow'
      if (/name="robots"/.test(next)) {
        next = next.replace(
          /<meta name="robots" content="[^"]*" \/>/,
          `<meta name="robots" content="${robots}" />`,
        )
      } else if (noindex) {
        next = next.replace(
          '<meta name="referrer"',
          `<meta name="robots" content="${robots}" />\n    <meta name="referrer"`,
        )
      }
      return next
    },
    closeBundle() {
      const outDir = path.resolve(process.cwd(), 'dist')
      if (!fs.existsSync(outDir)) return
      fs.writeFileSync(path.join(outDir, 'robots.txt'), robotsTxt(origin, noindex))
      fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemapXml(origin))
    },
  }
}
