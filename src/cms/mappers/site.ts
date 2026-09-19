import {
  cloneCollabs,
  cloneLookbook,
  cloneProducts,
  cloneShopMenu,
  cloneTreatments,
  createDefaultSiteContent,
  type ContactItem,
  type FaqCategory,
  type FaqItem,
  type HomeTreatment,
  type LegalInfo,
  type LegalLink,
  type LookbookImage,
  type ShopCollab,
  type ShopMenuCategory,
  type ShopMenuGroup,
  type ShopMenuItem,
  type ShopProduct,
  type SiteContent,
} from '@/cms/content'
import { cloneFaqCategories, isLeftoverPromoterFaq } from '@/data/faq'
import { isNotypeHost } from '@/lib/publicSiteUrl'
import { normalizeRosterGlowPreset } from '@/cms/rosterGlow'
import type { Json } from '@/lib/database.types'

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function asAboutHeroVideoUrl(value: unknown, fallback: string): string {
  const next = asString(value, fallback).trim()
  if (
    !next ||
    next.includes('mUBXO4PbLLw') ||
    next.includes('oi6JtAJocdw') ||
    next.includes('xXt3erMFs8w')
  ) {
    return fallback
  }
  return next
}

/** Replace legacy brand labels with NOTYPE MGMT defaults. */
function migrateBrandLabel(value: string, fallback: string): string {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, ' ')
  if (
    !normalized ||
    normalized === 'no type' ||
    normalized === 'no type mgmt' ||
    normalized === 'no type management' ||
    normalized === 'notyp' ||
    normalized === 'notyp mgmt' ||
    normalized === 'notyp management'
  ) {
    return fallback
  }
  return value.trim()
}

function migrateContactEmail(email: string, fallback: string): string {
  const normalized = email.trim().toLowerCase()
  if (!normalized || normalized === 'martin@viraal.media') {
    return fallback
  }
  return email.trim()
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function asPublicSiteUrl(value: unknown, fallback: string): string {
  const raw = asString(value, fallback).trim()
  if (!raw) return fallback
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
  try {
    const parsed = new URL(withProtocol)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return fallback
    parsed.hash = ''
    parsed.search = ''
    const origin = `${parsed.protocol}//${parsed.host}`
    if (isNotypeHost(origin)) return fallback
    const path = parsed.pathname.replace(/\/+$/, '')
    return `${origin}${path === '/' ? '' : path}`
  } catch {
    return fallback
  }
}

function asRosterColumns(value: unknown, fallback: 3 | 4): 3 | 4 {
  if (value === 3 || value === '3') return 3
  if (value === 4 || value === '4') return 4
  return fallback
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

function asContact(
  value: unknown,
  fallback: ContactItem[],
): ContactItem[] {
  if (!Array.isArray(value)) return fallback.map((c) => ({ ...c }))
  const mapped = value
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const label = asString(row.label)
      const email = asString(row.email)
      if (!label && !email) return null
      const fallbackEmail =
        fallback.find((c) => c.label.toLowerCase() === label.toLowerCase())
          ?.email ?? fallback[0]?.email ?? ''
      return {
        label: label || 'Bookings',
        email: migrateContactEmail(email, fallbackEmail),
      }
    })
    .filter((item): item is ContactItem => Boolean(item))
  return mapped.length ? mapped : fallback.map((c) => ({ ...c }))
}

function asLegalLinks(
  value: unknown,
  fallback: LegalLink[],
): LegalLink[] {
  if (!Array.isArray(value)) return fallback.map((l) => ({ ...l }))
  const mapped = value
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const label = asString(row.label)
      const href = asString(row.href)
      if (!label && !href) return null
      return { label, href }
    })
    .filter((item): item is LegalLink => Boolean(item))
  if (!mapped.length) return fallback.map((l) => ({ ...l }))

  // Ensure Cookies is present when Privacy/Terms already exist.
  const hasCookies = mapped.some((l) => /cookies?/i.test(l.label))
  const cookiesFallback = fallback.find((l) => /cookies?/i.test(l.label))
  if (!hasCookies && cookiesFallback) {
    return [...mapped, { ...cookiesFallback }]
  }
  return mapped
}

function migrateOfficeLines(lines: string[], fallback: string[]): string[] {
  const cleaned = lines.map((line) => line.trim()).filter(Boolean)
  if (!cleaned.length) return [...fallback]

  // Upgrade legacy / incomplete office lines to the current address.
  const legacy =
    cleaned.length === 1 &&
    /^groningen,\s*netherlands$/i.test(cleaned[0])
  const hasOldStreet = cleaned.some((line) => /helsinki\s+street/i.test(line))
  if (legacy || hasOldStreet) return [...fallback]

  return cleaned
}

function asLegal(value: unknown, fallback: LegalInfo): LegalInfo {
  if (!value || typeof value !== 'object') {
    return { ...fallback, addressLines: [...fallback.addressLines] }
  }
  const row = value as Record<string, unknown>
  return {
    company: migrateBrandLabel(
      asString(row.company, fallback.company),
      fallback.company,
    ),
    vat: asString(row.vat, fallback.vat),
    addressLines: migrateOfficeLines(
      asStringArray(row.addressLines),
      fallback.addressLines,
    ),
  }
}

function asFaqItems(value: unknown): FaqItem[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const question = asString(row.question)
      const answer = asString(row.answer)
      if (!question && !answer) return null
      return {
        id: asString(row.id, `faq-item-${index + 1}`),
        question,
        answer,
        visible: asBoolean(row.visible, true),
      }
    })
    .filter((item): item is FaqItem => Boolean(item))
}

function asFaqCategories(
  value: unknown,
  fallback: FaqCategory[],
): FaqCategory[] {
  if (!Array.isArray(value) || value.length === 0) {
    return cloneFaqCategories(fallback)
  }
  return value
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      return {
        id: asString(row.id, `faq-cat-${index + 1}`),
        title: asString(row.title, `Category ${index + 1}`),
        visible: asBoolean(row.visible, true),
        items: asFaqItems(row.items),
      }
    })
    .filter((item): item is FaqCategory => Boolean(item))
}

function asMenuItems(value: unknown): ShopMenuItem[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const name = asString(row.name)
      const price = asString(row.price)
      if (!name && !price) return null
      return { name, price }
    })
    .filter((item): item is ShopMenuItem => Boolean(item))
}

function asShopMenu(
  value: unknown,
  fallback: ShopMenuCategory[],
): ShopMenuCategory[] {
  if (!Array.isArray(value) || value.length === 0) return cloneShopMenu(fallback)
  const mapped = value
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const groupsRaw = Array.isArray(row.groups) ? row.groups : []
      const groups = groupsRaw
        .map((group) => {
          if (!group || typeof group !== 'object') return null
          const g = group as Record<string, unknown>
          const title = asString(g.title)
          const items = asMenuItems(g.items)
          if (!title && !items.length) return null
          return { title: title || 'Groep', items }
        })
        .filter((group): group is ShopMenuGroup => Boolean(group))
      return {
        id: asString(row.id, `cat-${index + 1}`),
        label: asString(row.label, `Categorie ${index + 1}`),
        groups,
      }
    })
    .filter((item): item is ShopMenuCategory => Boolean(item))
  return mapped.length ? mapped : cloneShopMenu(fallback)
}

function asLookbook(
  value: unknown,
  fallback: LookbookImage[],
): LookbookImage[] {
  if (!Array.isArray(value) || value.length === 0) return cloneLookbook(fallback)
  const mapped = value
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const src = asString(row.src)
      if (!src) return null
      const tags = Array.isArray(row.tags)
        ? row.tags.filter((tag): tag is string => typeof tag === 'string')
        : []
      return { src, alt: asString(row.alt), tags }
    })
    .filter((item): item is LookbookImage => Boolean(item))
  return mapped.length ? mapped : cloneLookbook(fallback)
}

function asProducts(
  value: unknown,
  fallback: ShopProduct[],
): ShopProduct[] {
  if (!Array.isArray(value) || value.length === 0) return cloneProducts(fallback)
  const mapped = value
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const name = asString(row.name)
      if (!name) return null
      return {
        name,
        text: asString(row.text),
        image: asString(row.image),
      }
    })
    .filter((item): item is ShopProduct => Boolean(item))
  return mapped.length ? mapped : cloneProducts(fallback)
}

function asCollabs(
  value: unknown,
  fallback: ShopCollab[],
): ShopCollab[] {
  if (!Array.isArray(value) || value.length === 0) return cloneCollabs(fallback)
  const mapped = value
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const name =
        asString(row.name) || asString(row.title) || asString(row.heading)
      const text = asString(row.text) || asString(row.description)
      const image =
        asString(row.image) || asString(row.poster) || asString(row.photo)
      const video = asString(row.video) || asString(row.videoUrl)
      if (!name && !text && !image && !video) return null
      return {
        name: name || `Collab ${index + 1}`,
        year: asString(row.year),
        text,
        image,
        ...(video ? { video } : {}),
      }
    })
    .filter((item): item is ShopCollab => Boolean(item))
    .filter((item) => !isLeftoverEventsPlaceholder(item))
  return mapped.length ? mapped : cloneCollabs(fallback)
}

/** Drop the old third seed row so the public carousel stays at the two shop collabs. */
function isLeftoverEventsPlaceholder(item: ShopCollab): boolean {
  return (
    item.name.trim().toLowerCase() === 'events' &&
    item.text.includes('Avonden in de zaak, shoots en lokale collabs')
  )
}

function asTreatments(
  value: unknown,
  fallback: HomeTreatment[],
): HomeTreatment[] {
  if (!Array.isArray(value) || value.length === 0) return cloneTreatments(fallback)
  const mapped = value
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const title = asString(row.title)
      if (!title) return null
      return {
        title,
        text: asString(row.text),
        image: asString(row.image),
      }
    })
    .filter((item): item is HomeTreatment => Boolean(item))
  return mapped.length ? mapped : cloneTreatments(fallback)
}

/** Merge partial/jsonb site content with shipped defaults. */
export function normalizeSiteContent(raw: unknown): SiteContent {
  const defaults = createDefaultSiteContent()
  if (!raw || typeof raw !== 'object') {
    return {
      ...defaults,
      contact: defaults.contact.map((c) => ({ ...c })),
      legal: {
        ...defaults.legal,
        addressLines: [...defaults.legal.addressLines],
      },
      about: [...defaults.about],
      aboutImages: [...defaults.aboutImages],
      aboutHeroVideoUrl: defaults.aboutHeroVideoUrl,
      legalLinks: defaults.legalLinks.map((l) => ({ ...l })),
      faqCategories: cloneFaqCategories(defaults.faqCategories),
      shopMenu: cloneShopMenu(defaults.shopMenu),
      lookbookImages: cloneLookbook(defaults.lookbookImages),
      products: cloneProducts(defaults.products),
      collabs: cloneCollabs(defaults.collabs),
      treatments: cloneTreatments(defaults.treatments),
    }
  }

  const row = raw as Record<string, unknown>
  const contact = asContact(row.contact, defaults.contact)
  const legalLinks = asLegalLinks(row.legalLinks, defaults.legalLinks)
  const about = asStringArray(row.about)
  const aboutImages = asStringArray(row.aboutImages)
  const copyrightRaw = asString(row.copyrightText, defaults.copyrightText)
  const copyrightLooksLegacy =
    /no\s*type(\s+mgmt|\s+management)?/i.test(copyrightRaw)
  const faqTitle = asString(row.faqTitle, defaults.faqTitle)
  const faqIntro = asString(row.faqIntro, defaults.faqIntro)
  const faqCategories = asFaqCategories(
    row.faqCategories,
    defaults.faqCategories,
  )
  const leftoverFaq = isLeftoverPromoterFaq({
    title: faqTitle,
    intro: faqIntro,
    categories: faqCategories,
  })

  return {
    name: migrateBrandLabel(asString(row.name, defaults.name), defaults.name),
    fullName: migrateBrandLabel(
      asString(row.fullName, defaults.fullName),
      defaults.fullName,
    ),
    tagline: asString(row.tagline, defaults.tagline),
    homeHeroVisible: asBoolean(row.homeHeroVisible, defaults.homeHeroVisible),
    homeHeroImageUrl: asString(row.homeHeroImageUrl, defaults.homeHeroImageUrl),
    homeHeroVideoUrl: asString(row.homeHeroVideoUrl, defaults.homeHeroVideoUrl),
    instagram: asString(row.instagram, defaults.instagram).trim() || defaults.instagram,
    year: asNumber(row.year, defaults.year),
    contactIntro: asString(row.contactIntro, defaults.contactIntro),
    contact,
    legal: asLegal(row.legal, defaults.legal),
    about: about.length ? about : [...defaults.about],
    aboutTitle: asString(row.aboutTitle, defaults.aboutTitle),
    aboutImages: aboutImages.length ? aboutImages : [...defaults.aboutImages],
    aboutHeroVideoUrl: asAboutHeroVideoUrl(
      row.aboutHeroVideoUrl,
      defaults.aboutHeroVideoUrl,
    ),
    photoCredits: asString(row.photoCredits, defaults.photoCredits),
    legalLinks,
    logoUrl: asString(row.logoUrl, defaults.logoUrl),
    copyrightText: copyrightLooksLegacy ? '' : copyrightRaw,
    teamVisible: asBoolean(row.teamVisible, defaults.teamVisible),
    rosterDesktopColumns: asRosterColumns(
      row.rosterDesktopColumns,
      defaults.rosterDesktopColumns,
    ),
    rosterGlowPreset: normalizeRosterGlowPreset(
      row.rosterGlowPreset,
      defaults.rosterGlowPreset,
    ),
    rosterGlowSecondary: normalizeRosterGlowPreset(
      row.rosterGlowSecondary,
      defaults.rosterGlowSecondary,
    ),
    rosterGlowCustom: asString(row.rosterGlowCustom, defaults.rosterGlowCustom),
    rosterGlowCustomSecondary: asString(
      row.rosterGlowCustomSecondary,
      defaults.rosterGlowCustomSecondary,
    ),
    bookingTitle: asString(row.bookingTitle, defaults.bookingTitle),
    bookingIntro: asString(row.bookingIntro, defaults.bookingIntro),
    bookingVisible: asBoolean(row.bookingVisible, defaults.bookingVisible),
    phoneNumber: asString(row.phoneNumber, defaults.phoneNumber).trim()
      ? asString(row.phoneNumber, defaults.phoneNumber)
      : defaults.phoneNumber,
    whatsappNumber: asString(row.whatsappNumber, defaults.whatsappNumber).trim()
      ? asString(row.whatsappNumber, defaults.whatsappNumber)
      : defaults.whatsappNumber,
    faqTitle: leftoverFaq ? defaults.faqTitle : faqTitle,
    faqIntro: leftoverFaq ? defaults.faqIntro : faqIntro,
    faqVisible: asBoolean(row.faqVisible, defaults.faqVisible),
    faqCategories: leftoverFaq
      ? cloneFaqCategories(defaults.faqCategories)
      : faqCategories,
    publicSiteUrl: asPublicSiteUrl(
      row.publicSiteUrl,
      defaults.publicSiteUrl,
    ),
    metaDescription: asString(row.metaDescription, defaults.metaDescription),
    searchIndexing: asBoolean(row.searchIndexing, defaults.searchIndexing),
    shopMenu: asShopMenu(row.shopMenu, defaults.shopMenu),
    lookbookImages: asLookbook(row.lookbookImages, defaults.lookbookImages),
    products: asProducts(row.products, defaults.products),
    collabs: asCollabs(row.collabs, defaults.collabs),
    welcomeKicker: asString(row.welcomeKicker, defaults.welcomeKicker),
    welcomeTitle: asString(row.welcomeTitle, defaults.welcomeTitle),
    welcomeText: asString(row.welcomeText, defaults.welcomeText),
    welcomeImageUrl: asString(row.welcomeImageUrl, defaults.welcomeImageUrl),
    treatmentsKicker: asString(row.treatmentsKicker, defaults.treatmentsKicker),
    treatmentsTitle: asString(row.treatmentsTitle, defaults.treatmentsTitle),
    treatmentsIntro: asString(row.treatmentsIntro, defaults.treatmentsIntro),
    treatments: asTreatments(row.treatments, defaults.treatments),
  }
}

export function siteContentToJson(site: SiteContent): Json {
  return site as unknown as Json
}
