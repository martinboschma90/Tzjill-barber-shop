import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

const FALLBACK = 'https://tzjill-barber-shop.vercel.app'

const SITEMAP_PATHS = [
  '/',
  '/prijzen',
  '/lookbook',
  '/products',
  '/collabs',
  '/team',
  '/over-ons',
  '/contact',
  '/booking',
  '/faq',
]

function cleanOrigin(value: string): string {
  return value.trim().replace(/\/+$/, '')
}

function isNotype(value: string): boolean {
  return /notype-mgmt\.com/i.test(value)
}

function resolveOrigin(env: Record<string, string>): string {
  const fromEnv = cleanOrigin(env.VITE_PUBLIC_SITE_URL ?? '')
  if (fromEnv && !isNotype(fromEnv)) return fromEnv
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
  const rules = noindex
    ? `User-agent: *\nDisallow: /\n`
    : `User-agent: *\nAllow: /\nDisallow: /cms\nDisallow: /cms/\nDisallow: /admin\nDisallow: /admin/\nDisallow: /api/\n`
  return `${rules}\nHost: ${origin}\nSitemap: ${origin}/sitemap.xml\n`
}

/** Bake the public origin into index.html / robots / sitemap at build time. */
export function seoOriginPlugin(env: Record<string, string>): Plugin {
  const origin = resolveOrigin(env)
  const noindex = !env.VITE_PUBLIC_SITE_URL || origin.includes('vercel.app')

  return {
    name: 'seo-origin',
    transformIndexHtml(html) {
      let next = html.replace(
        /<link rel="canonical" href="[^"]*" \/>/,
        `<link rel="canonical" href="${origin}/" />`,
      )
      if (noindex && !/name="robots"/.test(next)) {
        next = next.replace(
          '<meta name="referrer"',
          '<meta name="robots" content="noindex, nofollow" />\n    <meta name="referrer"',
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
