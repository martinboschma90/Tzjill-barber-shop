import type { BookingTreatmentSetting } from '@/cms/content'
import type { LiveTreatment } from '@/lib/salonhubApi'

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

export function presentTreatments(
  live: LiveTreatment[],
  settings: BookingTreatmentSetting[],
): LiveTreatment[] {
  if (!settings.length) return live
  const byId = new Map(settings.map((item) => [item.salonhubTreatmentId, item]))
  return live
    .filter((item) => byId.get(item.id)?.active !== false)
    .map((item, index) => {
      const setting = byId.get(item.id)
      const label = setting?.label.trim()
      return {
        item: { ...item, name: label || item.name },
        sort: setting?.sortOrder ?? 1000 + index,
      }
    })
    .sort((a, b) => a.sort - b.sort || a.item.name.localeCompare(b.item.name, 'nl'))
    .map((row) => row.item)
}
