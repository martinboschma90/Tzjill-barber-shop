import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useCms } from '@/cms/CmsContext'
import { SHOP_FAQ_ITEMS } from '@/data/shopFaq'
import {
  BEARD_FAQ,
  BEARD_SERVICES,
  LOCAL_FAQ,
  LOCAL_SERVICES,
  PAGE_SEO,
  menuPrice,
} from '@/data/seoPages'
import { HERO_POSTER } from '@/data/feed'
import {
  INSTAGRAM_URL,
  LOCATION_ADDRESS,
  PHONE_TEL,
} from '@/data/site'
import {
  resolvePublicSiteUrl,
  shouldNoIndexPublicSite,
} from '@/lib/publicSiteUrl'

const JSON_LD_ID = 'tzjill-jsonld'

/** Aliases share the destination title, description and canonical. */
const SEO_PATH_ALIAS: Record<string, string> = {
  '/about': '/over-ons',
  '/menu': '/prijzen',
  '/products': '/',
  '/producten': '/',
  '/herenkapper-leeuwarden': '/barbershop-leeuwarden',
  '/baard': '/baard-scheren',
}

function faqNode(items: readonly { q: string; a: string }[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }
}

function offerNodes(
  origin: string,
  services: readonly { menuName: string; title: string; fallbackPrice: string }[],
  menu: Parameters<typeof menuPrice>[0],
) {
  return services.map((service) => {
    const price = menuPrice(menu, service.menuName, service.fallbackPrice)
    const amount = price.replace(/[^\d,]/g, '').replace(',', '.')
    return {
      '@type': 'Offer',
      name: service.title,
      price: amount,
      priceCurrency: 'EUR',
      url: origin,
    }
  })
}

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
    const origin = resolvePublicSiteUrl(site.publicSiteUrl)
    const seoPath = SEO_PATH_ALIAS[pathname] ?? pathname
    const isArtist = /^\/artists\/[^/]+$/.test(pathname)
    const canonicalPath = isArtist ? pathname : seoPath
    const canonical = `${origin}${canonicalPath === '/' ? '/' : canonicalPath}`
    const page = PAGE_SEO[seoPath] ?? PAGE_SEO['/']
    const description = page.description
    const titleBase = site.fullName?.trim() || site.name || 'Tzjill Barber & Lounge'
    const title = page.title

    if (!isArtist) {
      document.title = title
      upsertMeta('meta[name="description"]', {
        name: 'description',
        content: description,
      })
      upsertMeta('meta[property="og:title"]', {
        property: 'og:title',
        content: title,
      })
      upsertMeta('meta[property="og:description"]', {
        property: 'og:description',
        content: description,
      })
    }

    upsertLink('canonical', canonical)
    upsertMeta('meta[name="robots"]', {
      name: 'robots',
      content: shouldNoIndexPublicSite(origin, site.searchIndexing, site.publicSiteUrl)
        ? 'noindex, nofollow'
        : 'index, follow',
    })
    upsertMeta('meta[property="og:url"]', {
      property: 'og:url',
      content: canonical,
    })

    const business = {
      '@type': 'BarberShop',
      '@id': `${origin}/#barbershop`,
      name: titleBase,
      url: origin,
      image: `${origin}${HERO_POSTER}`,
      telephone: PHONE_TEL,
      priceRange: '€8–€40',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Voorstreek 18',
        postalCode: '8911 JP',
        addressLocality: 'Leeuwarden',
        addressCountry: 'NL',
      },
      hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(LOCATION_ADDRESS)}`,
      sameAs: [site.instagram?.trim() || INSTAGRAM_URL],
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday'],
          opens: '10:00',
          closes: '18:00',
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Thursday', 'Friday', 'Saturday'],
          opens: '09:00',
          closes: '20:00',
        },
      ],
      makesOffer: offerNodes(
        canonical,
        pathname === '/baard-scheren' ? BEARD_SERVICES : LOCAL_SERVICES,
        site.shopMenu,
      ),
    }

    const faq =
      pathname === '/baard-scheren'
        ? faqNode(BEARD_FAQ)
        : pathname === '/barbershop-leeuwarden'
          ? faqNode(LOCAL_FAQ)
          : pathname === '/'
            ? faqNode(SHOP_FAQ_ITEMS)
            : null

    const graph = {
      '@context': 'https://schema.org',
      '@graph': [business, ...(faq ? [faq] : [])],
    }

    let script = document.getElementById(JSON_LD_ID) as HTMLScriptElement | null
    if (!script) {
      script = document.createElement('script')
      script.id = JSON_LD_ID
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(graph).replace(/</g, '\\u003c')
  }, [
    pathname,
    site.fullName,
    site.instagram,
    site.name,
    site.publicSiteUrl,
    site.searchIndexing,
    site.shopMenu,
  ])

  return null
}
