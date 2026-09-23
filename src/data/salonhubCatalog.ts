import type { BookingTreatmentSetting, HomeTreatment, ShopMenuCategory } from '@/cms/content'
import { shopMenu as seedMenu } from '@/data/menu'
import type { LiveEmployee, LiveTreatment } from '@/lib/salonhubApi'

/** Visitor-facing treatment. `minutes` stays the Salonhub length used to book. */
export type BookableTreatment = LiveTreatment & {
  image: string
  displayMinutes: number
}

/**
 * Last catalog read from Salonhub on 22 Sep 2026.
 * Used only when Treatments/get is unreachable. Live prices replace this.
 */
export const FALLBACK_TREATMENTS: LiveTreatment[] = [
  { id: '66', name: 'Haircut', groupId: 'male', group: 'Heren', section: 'Haircut', minutes: 30, priceLabel: '€ 30,00', priceCents: 3000 },
  { id: '112', name: 'Haircut + Wassen', groupId: 'male', group: 'Heren', section: 'Haircut', minutes: 35, priceLabel: '€ 33,00', priceCents: 3300 },
  { id: '103', name: 'Haircut + baard trimmen', groupId: 'male', group: 'Heren', section: 'Haircut', minutes: 40, priceLabel: '€ 40,00', priceCents: 4000 },
  { id: '67', name: '1 stand scheren', groupId: 'male', group: 'Heren', section: 'Scheren', minutes: 20, priceLabel: '€ 19,00', priceCents: 1900 },
  { id: '113', name: '1 stand scheren + Baard trimmen', groupId: 'male', group: 'Heren', section: 'Scheren', minutes: 30, priceLabel: '€ 32,00', priceCents: 3200 },
  { id: '97', name: 'Contouren', groupId: 'male', group: 'Heren', section: 'Scheren', minutes: 10, priceLabel: '€ 15,00', priceCents: 1500 },
  { id: '101', name: 'Baard (alleen lijnen)', groupId: 'male', group: 'Heren', section: 'Scheren', minutes: 10, priceLabel: '€ 8,50', priceCents: 850 },
  { id: '72', name: 'Baard trimmen', groupId: 'male', group: 'Heren', section: 'Scheren', minutes: 20, priceLabel: '€ 20,00', priceCents: 2000 },
  { id: '69', name: 'Kinderen t/m 11 jaar', groupId: 'child', group: 'Kinderen', section: 'Haircut', minutes: 30, priceLabel: '€ 22,00', priceCents: 2200 },
]

function normName(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

type MenuHit = {
  name: string
  price: string
  minutes?: number
  categoryId: string
  categoryLabel: string
  section: string
  order: number
}

function indexMenu(menu: ShopMenuCategory[]) {
  const map = new Map<string, MenuHit>()
  let order = 0
  for (const category of menu) {
    for (const group of category.groups) {
      for (const item of group.items) {
        const key = normName(item.name)
        if (!key || map.has(key)) {
          order += 1
          continue
        }
        map.set(key, {
          name: item.name,
          price: item.price,
          minutes: item.minutes,
          categoryId: category.id,
          categoryLabel: category.label,
          section: group.title,
          order: order++,
        })
      }
    }
  }
  return map
}

function seedMinutes(name: string) {
  return indexMenu(seedMenu).get(normName(name))?.minutes
}

function treatmentImage(
  treatments: HomeTreatment[],
  item: { groupId: string; group: string; section: string; name: string },
) {
  const blob = `${item.groupId} ${item.group} ${item.section} ${item.name}`.toLowerCase()
  const find = (pattern: RegExp) =>
    treatments.find((row) => pattern.test(row.title) && row.image.trim())?.image.trim() || ''
  if (/kinder|kids|\bchild\b/.test(blob)) return find(/kid|kinder/i) || find(/hair|knip/i)
  if (/baard|scheren|contour|shave|beard/.test(blob)) return find(/baard|beard/i)
  return find(/hair|knip/i)
}

/**
 * Salonhub ids stay the availability key. Name, price, category and thumbnail
 * come from the CMS price list and homepage treatments when they match.
 * Duration on screen prefers the CMS price-list minutes, then the seeded
 * catalog, then Salonhub. The booked length remains Salonhub's `minutes`.
 */
export function presentTreatments(
  live: LiveTreatment[],
  settings: BookingTreatmentSetting[],
  cms?: { menu?: ShopMenuCategory[]; treatments?: HomeTreatment[] },
): BookableTreatment[] {
  const byId = new Map(settings.map((item) => [item.salonhubTreatmentId, item]))
  const menu = indexMenu(cms?.menu ?? [])
  const thumbs = cms?.treatments ?? []
  return live
    .filter((item) => byId.get(item.id)?.active !== false)
    .map((item, index) => {
      const setting = byId.get(item.id)
      const hit = menu.get(normName(item.name))
      const label = setting?.label.trim()
      const name = label || hit?.name || item.name
      const shown = {
        groupId: hit?.categoryId || item.groupId,
        group: hit?.categoryLabel || item.group,
        section: hit?.section || item.section,
        name,
      }
      const fromList = hit?.minutes && hit.minutes > 0 ? hit.minutes : undefined
      return {
        item: {
          ...item,
          ...shown,
          priceLabel: hit?.price.trim() || item.priceLabel,
          image: treatmentImage(thumbs, shown),
          displayMinutes: fromList ?? seedMinutes(item.name) ?? item.minutes,
        },
        sort: settings.length ? (setting?.sortOrder ?? 1000 + index) : (hit?.order ?? 1000 + index),
      }
    })
    .sort((a, b) => a.sort - b.sort || a.item.name.localeCompare(b.item.name, 'nl'))
    .map((row) => row.item)
}

/** Preselect “Geen voorkeur” when the salon offers it. Skip the step only when there is nothing to choose. */
export function pickDefaultEmployee(employees: LiveEmployee[]) {
  if (employees.length === 1) return { employee: employees[0], skipStep: true }
  return {
    employee: employees.find((item) => item.any) ?? null,
    skipStep: false,
  }
}
