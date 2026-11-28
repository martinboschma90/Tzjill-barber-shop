import { describe, expect, it } from 'vitest'
import { hideBookingVendor } from '@/lib/hideBookingVendor'
import { siteText } from '@/cms/siteText'
import { createDefaultSiteContent } from '@/cms/content'

describe('hideBookingVendor', () => {
  it('keeps copy without the agenda vendor unchanged', () => {
    expect(hideBookingVendor('Boek online op deze site.')).toBe('Boek online op deze site.')
  })

  it('removes the agenda vendor from visitor-facing sentences', () => {
    expect(hideBookingVendor('Boek online via Salonhub.')).toBe('Boek online.')
    expect(hideBookingVendor('Kies je kapper bij het boeken in Salonhub.')).toBe(
      'Kies je kapper bij het boeken online.',
    )
  })

  it('never returns the vendor name from default site texts', () => {
    const site = createDefaultSiteContent()
    expect(siteText(site, 'AboutPage.12')).not.toMatch(/salonhub/i)
    expect(siteText(site, 'LegalPage.7')).not.toMatch(/salonhub/i)
    expect(siteText(site, 'TeamPage.3')).not.toMatch(/salonhub/i)
  })
})
