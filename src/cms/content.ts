import { createDefaultFaqCategories } from '@/data/faq'
import { FALLBACK_PUBLIC_SITE_URL } from '@/lib/publicSiteUrl'
import { stripLeftoverMusicArtists } from '@/cms/leftoverArtists'
import { withArtDirection } from '@/cms/imageFocus'
import { normalizeSiteContent } from '@/cms/mappers/site'
import { storageGet, storageSet } from '@/lib/safeStorage'
import { CMS_CONTENT_TS_KEY, CMS_STORAGE_KEY } from '@/cms/storageKeys'
export { CMS_STORAGE_KEY }
import {
  DEFAULT_ROSTER_GLOW_CUSTOM,
  DEFAULT_ROSTER_GLOW_PRESET,
  DEFAULT_ROSTER_GLOW_SECONDARY,
  type RosterGlowPreset,
} from '@/cms/rosterGlow'
import { feed, HERO_POSTER } from '@/data/feed'
import { shopMenu } from '@/data/menu'
import { lookbookImages as defaultLookbook } from '@/data/lookbook'
import { products as defaultProducts } from '@/data/products'
import { collabs as defaultCollabs } from '@/data/collabs'
import { productsEnabled, site as defaultSite } from '@/data/site'
import { DEFAULT_WHATSAPP_NUMBER } from '@/data/whatsapp'
import type { Artist, TeamMember } from '@/types/artist'

export type { RosterGlowPreset }

export type ShopMenuItem = {
  name: string
  price: string
}

/** Admin-only display tweak for a live Salonhub treatment. Prices stay on Salonhub. */
export type BookingTreatmentSetting = {
  salonhubTreatmentId: string
  /** Empty keeps the live Salonhub name. */
  label: string
  sortOrder: number
  active: boolean
}

export type ShopMenuGroup = {
  title: string
  items: ShopMenuItem[]
}

export type ShopMenuCategory = {
  id: string
  label: string
  groups: ShopMenuGroup[]
}

export type LookbookImage = {
  src: string
  alt: string
  tags: string[]
}

export type ShopProduct = {
  name: string
  text: string
  image: string
}

export type ShopCollab = {
  name: string
  year: string
  text: string
  image: string
  /** Optional clip (mp4/webm or media://). Empty = poster only — never share another slide's film. */
  video?: string
}

export const SHOP_FALLBACK_VIDEO = '/brand/hero.mp4'

/** This collab's own clip only. No shared fallback — that made every slide look identical. */
export function collabVideoUrl(item: Pick<ShopCollab, 'video'>): string {
  return item.video?.trim() || ''
}

export type HomeTreatment = {
  title: string
  text: string
  image: string
}

export const DEFAULT_TREATMENTS: HomeTreatment[] = [
  {
    title: 'Haircut',
    text: 'Strak, classic of fade — altijd in verhouding met je gezicht.',
    image: feed.dsc00016,
  },
  {
    title: 'Baard',
    text: 'Trimmen, lijnen of hot towel straight razor.',
    image: feed.dsc00053,
  },
  {
    title: 'Kids',
    text: 'Kinderen t/m 11. Dezelfde precisie, rustiger tempo.',
    image: feed.dsc00035,
  },
]

export function cloneTreatments(
  source: readonly HomeTreatment[] = DEFAULT_TREATMENTS,
): HomeTreatment[] {
  return source.map((item) => ({ ...item }))
}

export function cloneShopMenu(
  source: ShopMenuCategory[] = shopMenu,
): ShopMenuCategory[] {
  return source.map((category) => ({
    id: category.id,
    label: category.label,
    groups: category.groups.map((group) => ({
      title: group.title,
      items: group.items.map((item) => ({ ...item })),
    })),
  }))
}

export function cloneLookbook(
  source: readonly {
    src: string
    alt: string
    tags: readonly string[]
  }[] = defaultLookbook,
): LookbookImage[] {
  return source.map((item) => ({
    src: item.src,
    alt: item.alt,
    tags: [...item.tags],
  }))
}

export function cloneProducts(
  source: readonly ShopProduct[] = defaultProducts,
): ShopProduct[] {
  return source.map((item) => ({ ...item }))
}

export function cloneCollabs(
  source: readonly ShopCollab[] = defaultCollabs,
): ShopCollab[] {
  return source.map((item) => ({ ...item }))
}

export type ContactItem = {
  label: string
  email: string
}

export type LegalInfo = {
  company: string
  vat: string
  addressLines: string[]
}

export type LegalLink = {
  label: string
  href: string
}

export type FaqItem = {
  id: string
  question: string
  answer: string
  visible: boolean
}

export type FaqCategory = {
  id: string
  title: string
  visible: boolean
  items: FaqItem[]
}

export type SiteContent = {
  name: string
  fullName: string
  tagline: string
  /** When false, the homepage hero is hidden while the roster remains visible. */
  homeHeroVisible: boolean
  /** Full-bleed homepage banner (image URL or media://). Empty uses the feed poster. */
  homeHeroImageUrl: string
  /** Homepage hero video (mp4/webm or media://). Empty uses `/brand/hero.mp4`. */
  homeHeroVideoUrl: string
  instagram: string
  year: number
  contactIntro: string
  contact: ContactItem[]
  legal: LegalInfo
  /** Accessible / CMS title for the About page (logo remains the visual mark). */
  aboutTitle: string
  about: string[]
  /** Optional About media URLs (CMS); public layout unchanged when empty. */
  aboutImages: string[]
  /** Header video on About (YouTube or mp4/webm). */
  aboutHeroVideoUrl: string
  photoCredits: string
  legalLinks: LegalLink[]
  /** Optional custom footer logo URL; empty keeps the brand Logo component. */
  logoUrl: string
  /** Optional copyright override; empty uses `©{year} {fullName||name}`. */
  copyrightText: string
  /** When false, Team section is omitted from the About page. */
  teamVisible: boolean
  /** Desktop (lg+) artist cards per row on the homepage roster. */
  rosterDesktopColumns: 3 | 4
  /** Primary hover glow color on roster artist cards. */
  rosterGlowPreset: RosterGlowPreset
  /** Secondary hover glow color — blends with primary. */
  rosterGlowSecondary: RosterGlowPreset
  /** Hex used when primary glow is `custom`. */
  rosterGlowCustom: string
  /** Hex used when secondary glow is `custom`. */
  rosterGlowCustomSecondary: string
  /** Booking request page (`/booking`) headline. */
  bookingTitle: string
  /** Booking request page intro copy. */
  bookingIntro: string
  /** When false, `/booking` redirects home and the nav link is hidden. */
  bookingVisible: boolean
  /**
   * Optional hide/reorder/label for the live Salonhub catalog.
   * Empty means the widget shows every treatment Salonhub returns.
   */
  bookingTreatments: BookingTreatmentSetting[]
  /** Public phone number (footer + contact). */
  phoneNumber: string
  /** WhatsApp number for artist CTAs and footer (display or E.164). */
  whatsappNumber: string
  /** FAQ page (`/faq`) headline. */
  faqTitle: string
  /** Optional intro under the FAQ title. */
  faqIntro: string
  /** When false, `/faq` redirects home and FAQ nav links are omitted. */
  faqVisible: boolean
  /** Ordered FAQ categories (tabs) with questions. */
  faqCategories: FaqCategory[]
  /** Canonical public site origin, e.g. https://tzjill-barber-shop.vercel.app */
  publicSiteUrl: string
  /** Search / social meta description. */
  metaDescription: string
  /** When false, public pages send noindex. */
  searchIndexing: boolean
  /** Prijzen page + homepage highlights. */
  shopMenu: ShopMenuCategory[]
  lookbookImages: LookbookImage[]
  /** Shop items. Kept while `productsEnabled` is false. */
  products: ShopProduct[]
  /**
   * When false, Producten is hidden in the CMS and on the public site.
   * Driven by `productsEnabled` in `src/data/site.ts` — stored JSON cannot turn it back on.
   */
  productsEnabled: boolean
  collabs: ShopCollab[]
  welcomeKicker: string
  welcomeTitle: string
  welcomeText: string
  welcomeImageUrl: string
  treatmentsKicker: string
  treatmentsTitle: string
  treatmentsIntro: string
  treatments: HomeTreatment[]
}

export type CmsContent = {
  site: SiteContent
  team: TeamMember[]
  artists: Artist[]
}

/** Site/team defaults without the seed roster — safe on the public bundle. */
export function createDefaultSiteContent(): SiteContent {
  return {
    name: defaultSite.name,
    fullName: defaultSite.fullName,
    tagline: defaultSite.tagline,
    homeHeroVisible: true,
    homeHeroImageUrl: HERO_POSTER,
    homeHeroVideoUrl: '/brand/hero.mp4',
    instagram: defaultSite.instagram,
    year: defaultSite.year,
    contactIntro:
      'Afspraak, vragen of collab. Voorstreek 18.',
    contact: defaultSite.contact.map((item) => ({ ...item })),
    legal: {
      company: defaultSite.legal.company,
      vat: defaultSite.legal.vat,
      addressLines: [...defaultSite.legal.addressLines],
    },
    aboutTitle: 'Over ons',
    about: [...defaultSite.about],
    aboutImages: [],
    aboutHeroVideoUrl: '',
    photoCredits: defaultSite.photoCredits,
    legalLinks: defaultSite.legalLinks.map((link) => ({ ...link })),
    logoUrl: '',
    copyrightText: '',
    teamVisible: true,
    rosterDesktopColumns: 4,
    rosterGlowPreset: DEFAULT_ROSTER_GLOW_PRESET,
    rosterGlowSecondary: DEFAULT_ROSTER_GLOW_SECONDARY,
    rosterGlowCustom: DEFAULT_ROSTER_GLOW_CUSTOM,
    rosterGlowCustomSecondary: '#a8487a',
    bookingTitle: 'Booking Request',
    bookingIntro: "Send us your booking request and we'll get back to you.",
    bookingVisible: true,
    bookingTreatments: [],
    phoneNumber: '058 844 7025',
    whatsappNumber: DEFAULT_WHATSAPP_NUMBER,
    faqTitle: 'Vragen',
    faqIntro: 'Boeken, te laat, kids — de rest regel je aan de balie.',
    faqVisible: true,
    faqCategories: createDefaultFaqCategories(),
    publicSiteUrl: FALLBACK_PUBLIC_SITE_URL,
    metaDescription:
      'Tzjill Barber & Lounge in Leeuwarden. Trendy haircuts and hot towel straight razor shaves.',
    searchIndexing: false,
    shopMenu: cloneShopMenu(),
    lookbookImages: cloneLookbook(),
    products: cloneProducts(),
    productsEnabled,
    collabs: cloneCollabs(),
    welcomeKicker: 'Studio',
    welcomeTitle: 'Elke coupe\nis maatwerk.',
    welcomeText: 'Knippen, scheren, baard. Voorstreek, Leeuwarden. A man’s world.',
    welcomeImageUrl: feed.dsc00030,
    treatmentsKicker: 'Behandelingen',
    treatmentsTitle: 'Alles wat je\nin de stoel nodig hebt',
    treatmentsIntro:
      'Knippen, baard, kids — dezelfde precisie, altijd in verhouding met je gezicht.',
    treatments: cloneTreatments(),
  }
}

export function loadStoredContent(): CmsContent | null {
  const raw = storageGet(CMS_STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as CmsContent
    if (!parsed?.site || !Array.isArray(parsed.artists) || !Array.isArray(parsed.team)) {
      return null
    }
    return {
      ...parsed,
      site: normalizeSiteContent(parsed.site),
      artists: stripLeftoverMusicArtists(parsed.artists).map((artist) =>
        withArtDirection(artist),
      ),
    }
  } catch {
    return null
  }
}

export function loadStoredContentUpdatedAt(): number {
  const raw = storageGet(CMS_CONTENT_TS_KEY)
  const n = raw ? Number(raw) : 0
  return Number.isFinite(n) ? n : 0
}

export function persistContent(
  content: CmsContent,
  options?: { persistArtists?: boolean; updatedAt?: number },
) {
  const persistArtists = options?.persistArtists !== false
  const payload: CmsContent = persistArtists
    ? content
    : {
        site: content.site,
        team: content.team,
        artists: [],
      }
  storageSet(CMS_STORAGE_KEY, JSON.stringify(payload))
  storageSet(CMS_CONTENT_TS_KEY, String(options?.updatedAt ?? Date.now()))
}
