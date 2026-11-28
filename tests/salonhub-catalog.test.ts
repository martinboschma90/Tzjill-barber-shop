import { describe, expect, it } from 'vitest'
import { presentTreatments, type BookableTreatment } from '@/data/salonhubCatalog'
import type { LiveTreatment } from '@/lib/salonhubApi'

const haircut: LiveTreatment = {
  id: '66',
  name: 'Haircut',
  groupId: 'male',
  group: 'Heren',
  section: 'Haircut',
  minutes: 30,
  priceLabel: '€ 30,00',
  priceCents: 3000,
}

describe('presentTreatments', () => {
  it('keeps the Salonhub name for booking when the CMS only changes the label', () => {
    const shown: BookableTreatment[] = presentTreatments([haircut], [
      { salonhubTreatmentId: '66', label: 'Knippen', active: true, sortOrder: 0 },
    ])
    expect(shown[0]?.name).toBe('Knippen')
    expect(shown[0]?.bookingName).toBe('Haircut')
    expect(shown[0]?.minutes).toBe(30)
  })

  it('hides treatments the CMS marked inactive', () => {
    expect(
      presentTreatments([haircut], [
        { salonhubTreatmentId: '66', label: '', active: false, sortOrder: 0 },
      ]),
    ).toEqual([])
  })
})
