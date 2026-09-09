import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useCms } from '@/cms/CmsContext'

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let node = document.head.querySelector(selector)
  if (!node) {
    node = document.createElement('meta')
    document.head.appendChild(node)
  }
  for (const [key, value] of Object.entries(attrs)) {
    node.setAttribute(key, value)
  }
}

function upsertLink(rel: string, href: string) {
  let node = document.head.querySelector(`link[rel="${rel}"]`)
  if (!node) {
    node = document.createElement('link')
    node.setAttribute('rel', rel)
    document.head.appendChild(node)
  }
  node.setAttribute('href', href)
}

/** Applies CMS website settings to the public document head. */
export function PublicSeo() {
  const { pathname } = useLocation()
  const { content } = useCms()
  const { site } = content

  useEffect(() => {
    const origin = (site.publicSiteUrl || 'https://www.tzjill.nl').replace(
      /\/+$/,
      '',
    )
    const canonical = `${origin}${pathname === '/' ? '/' : pathname}`
    const description =
      site.metaDescription?.trim() ||
      'Tzjill Barber & Lounge in Leeuwarden. Trendy haircuts and hot towel straight razor shaves. Tag #tzjill.'
    const titleBase = site.fullName?.trim() || site.name || 'Tzjill Barber Shop'
    if (pathname === '/') document.title = titleBase

    upsertLink('canonical', canonical)
    upsertMeta('meta[name="description"]', {
      name: 'description',
      content: description,
    })
    upsertMeta('meta[name="robots"]', {
      name: 'robots',
      content: site.searchIndexing === false ? 'noindex, nofollow' : 'index, follow',
    })
    upsertMeta('meta[property="og:url"]', {
      property: 'og:url',
      content: canonical,
    })
    upsertMeta('meta[property="og:title"]', {
      property: 'og:title',
      content: titleBase,
    })
    upsertMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: description,
    })
  }, [
    pathname,
    site.fullName,
    site.metaDescription,
    site.name,
    site.publicSiteUrl,
    site.searchIndexing,
  ])

  return null
}
