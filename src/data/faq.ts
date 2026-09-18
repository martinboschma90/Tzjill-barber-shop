import type { FaqCategory } from '@/cms/content'
import {
  SHOP_FAQ_INTRO,
  SHOP_FAQ_ITEMS,
  SHOP_FAQ_TITLE,
} from '@/data/shopFaq'

function id(prefix: string, n: number) {
  return `${prefix}-${n}`
}

const CATEGORY_META = [
  { id: id('cat', 1), title: 'Afspraak', tag: 'afspraak' as const },
  { id: id('cat', 2), title: 'In de zaak', tag: 'salon' as const },
  { id: id('cat', 3), title: 'Kids', tag: 'kids' as const },
]

/** Shipped barber FAQ — same copy as the homepage. */
export function createDefaultFaqCategories(): FaqCategory[] {
  return CATEGORY_META.map((category, index) => ({
    id: category.id,
    title: category.title,
    visible: true,
    items: SHOP_FAQ_ITEMS.filter((item) => item.tag === category.tag).map(
      (item, itemIndex) => ({
        id: id('q', (index + 1) * 100 + itemIndex + 1),
        question: item.q,
        answer: item.a,
        visible: true,
      }),
    ),
  }))
}

export function cloneFaqCategories(categories: FaqCategory[]): FaqCategory[] {
  return categories.map((category) => ({
    ...category,
    items: category.items.map((item) => ({ ...item })),
  }))
}

export function isLeftoverPromoterFaq(input: {
  title?: string
  intro?: string
  categories?: FaqCategory[]
}): boolean {
  const blob = [
    input.title ?? '',
    input.intro ?? '',
    JSON.stringify(input.categories ?? []),
  ]
    .join(' ')
    .toLowerCase()
  return (
    blob.includes('promoter') ||
    blob.includes('artist booking') ||
    blob.includes('notyp') ||
    blob.includes('notype') ||
    blob.includes('festival') ||
    blob.includes('international bookings')
  )
}

export { SHOP_FAQ_INTRO, SHOP_FAQ_TITLE }
