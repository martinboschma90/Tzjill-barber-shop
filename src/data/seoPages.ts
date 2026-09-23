import { shopMenu } from '@/data/menu'
import type { ShopMenuCategory } from '@/cms/content'

/**
 * Shipped Dutch copy for the local landing and baard pages.
 * Prices resolve from the CMS menu when a matching item exists.
 */

export type SeoFaqItem = {
  q: string
  a: string
}

export type SeoService = {
  menuName: string
  title: string
  text: string
  fallbackPrice: string
}

export const HOME_SEO = {
  title: 'Tzjill Leeuwarden | Barbershop & herenkapper aan de Voorstreek',
  description:
    'Tzjill is een barbershop en herenkapper aan de Voorstreek 18 in Leeuwarden. Knippen, baard, scheren en kids t/m 11. Maak een afspraak.',
} as const

export const HOME_HERO = {
  title: 'Tzjill',
  subtitle: 'Barbershop en herenkapper in Leeuwarden',
  lead:
    'Tzjill is een barbershop en herenkapper aan de Voorstreek 18 in Leeuwarden. Knippen, baard, scheren en kids t/m 11 — maatwerk, traditioneel barbierwerk met de technieken van nu.',
  hours: 'Ma–wo 10:00–18:00 · Do–za 09:00–20:00 · Zondag dicht',
} as const

export const LOCAL_PAGE = {
  path: '/barbershop-leeuwarden',
  kicker: 'Leeuwarden · binnenstad',
  title: 'Barbershop in Leeuwarden — Tzjill',
  intro:
    'Tzjill Barber & Lounge zit aan de Voorstreek 18, in de binnenstad van Leeuwarden. Je komt voor een knipbeurt, een baard of een scheerbeurt — fade of klassiek, altijd op maat.',
  seoTitle: 'Barbershop in Leeuwarden | Tzjill aan de Voorstreek',
  seoDescription:
    'Barbershop en herenkapper in de binnenstad van Leeuwarden. Tzjill, Voorstreek 18. Knippen vanaf €30, baard, scheren en kids. Maak een afspraak.',
  image: '/lookbook/05.png',
  imageAlt: 'Stoel bij Tzjill Barber & Lounge aan de Voorstreek in Leeuwarden',
  whyTitle: 'Maatwerk, traditioneel en modern',
  why: [
    'Elke coupe wordt opgebouwd rond je gezicht, niet rond een trend van de week.',
    'Klassiek barbierwerk — scheren met hot towel en straight razor — naast fades en een strakke finish.',
    'De tagline is A man’s world. De zaak is een lounge: rustig, precies, en gemaakt om even te blijven zitten.',
  ],
} as const

export const LOCAL_SERVICES: SeoService[] = [
  {
    menuName: 'Haircut',
    title: 'Knippen',
    text: 'Fade, classic of iets daartussen. Altijd in verhouding met je gezicht.',
    fallbackPrice: '€30',
  },
  {
    menuName: 'Haircut + baard trimmen',
    title: 'Knippen + baard',
    text: 'Coupe en baard in één afspraak.',
    fallbackPrice: '€40',
  },
  {
    menuName: '1 stand scheren',
    title: 'Scheren',
    text: 'Hot towel en straight razor, één zone.',
    fallbackPrice: '€19',
  },
  {
    menuName: 'Kinderen t/m 11 jaar',
    title: 'Kids t/m 11',
    text: 'Zelfde precisie, rustiger tempo.',
    fallbackPrice: '€22',
  },
]

export const LOCAL_FAQ: SeoFaqItem[] = [
  {
    q: 'Knippen jullie fade en klassiek?',
    a: 'Ja. Bij Tzjill kies je een fade, een klassieke coupe of iets daartussen. Elke knipbeurt is maatwerk, in verhouding met je gezicht.',
  },
  {
    q: 'Hoe maak ik een afspraak, en wat bij een no-show?',
    a: 'Boek via Afspraak maken of bel 058 844 7025. Kom je niet opdagen of zeg je binnen 2 uur af, dan rekenen we €20. Die stoel stond voor jou vrij — met een berichtje vooraf geven we hem door.',
  },
  {
    q: 'Waar in Leeuwarden zit Tzjill?',
    a: 'Aan de Voorstreek 18, 8911 JP, in de binnenstad. Maandag tot woensdag 10:00–18:00, donderdag tot zaterdag 09:00–20:00. Zondag dicht.',
  },
]

export const BEARD_PAGE = {
  path: '/baard-scheren',
  kicker: 'Baard & scheren · Leeuwarden',
  title: 'Baard en scheren bij Tzjill in Leeuwarden',
  intro:
    'Voor mannen die hun baard willen laten bijhouden, de lijnen strak willen of zich willen laten scheren. Bij Tzjill aan de Voorstreek 18, in Leeuwarden.',
  seoTitle: 'Baard trimmen en scheren in Leeuwarden | Tzjill',
  seoDescription:
    'Baard trimmen (€20), contouren (€15), lijnen (€8,50) en scheer (€19) bij Tzjill in Leeuwarden. Maak een afspraak.',
  image: '/lookbook/03.jpg',
  imageAlt: 'Baardfinish bij Tzjill Barber & Lounge in Leeuwarden',
  audience:
    'Je hoeft niet te kiezen tussen een volle baard en een gladde huid. Trimmen, contouren, alleen de lijnen, of een scheerbeurt met hot towel — het staat los van elkaar op het menu, en het kan in één afspraak.',
  products:
    'Baardolie, pomade en aftershave balm liggen in de lounge. Het assortiment wisselt. Vraag ernaar aan de balie, of bekijk de producten.',
} as const

export const BEARD_SERVICES: SeoService[] = [
  {
    menuName: 'Baard trimmen',
    title: 'Baard trimmen',
    text: 'De baard korter en in model, op de lengte die je wilt houden.',
    fallbackPrice: '€20',
  },
  {
    menuName: 'Contouren',
    title: 'Contouren',
    text: 'De rand langs wang, hals en snor scherp, zonder de baard in te korten.',
    fallbackPrice: '€15',
  },
  {
    menuName: 'Baard (alleen lijnen)',
    title: 'Baard lijnen',
    text: 'Alleen de lijn. Snel strak, zonder trim.',
    fallbackPrice: '€8,50',
  },
  {
    menuName: '1 stand scheren',
    title: '1-stand scheer',
    text: 'Warme doek en straight razor. Eén zone, strak geschoren.',
    fallbackPrice: '€19',
  },
  {
    menuName: '1 stand scheren + baard trimmen',
    title: 'Scheer + baard',
    text: 'Scheren en de baard in model, in één afspraak.',
    fallbackPrice: '€32',
  },
]

export const BEARD_FAQ: SeoFaqItem[] = [
  {
    q: 'Wat is het verschil tussen contouren, trimmen en lijnen?',
    a: 'Contouren zetten de rand van de baard scherp, zonder de lengte weg te halen. Trimmen kort de baard in model in. Alleen lijnen is de strakke lijn langs wang en hals, zonder de rest te knippen.',
  },
  {
    q: 'Hoe vaak laat je een baard bijwerken?',
    a: 'De meeste mannen komen elke twee tot vier weken voor lijnen of contouren. Een trim plan je wanneer de baard langer is dan je hem wilt houden.',
  },
  {
    q: 'Wat is een hot towel?',
    a: 'Een warme doek op het gezicht, vóór de straight razor. Daarna scheren we met de hand. Het is een klassieke barbierscheerbeurt.',
  },
]

export function menuPrice(
  menu: ShopMenuCategory[] | undefined,
  menuName: string,
  fallback: string,
): string {
  const source = menu?.length ? menu : shopMenu
  for (const category of source) {
    for (const group of category.groups) {
      const hit = group.items.find((item) => item.name === menuName)
      if (hit?.price) return hit.price
    }
  }
  return fallback
}

export const PAGE_SEO: Record<string, { title: string; description: string }> = {
  '/': {
    title: HOME_SEO.title,
    description: HOME_SEO.description,
  },
  [LOCAL_PAGE.path]: {
    title: LOCAL_PAGE.seoTitle,
    description: LOCAL_PAGE.seoDescription,
  },
  [BEARD_PAGE.path]: {
    title: BEARD_PAGE.seoTitle,
    description: BEARD_PAGE.seoDescription,
  },
}
