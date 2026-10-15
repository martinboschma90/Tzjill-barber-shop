import type { CmsContent } from '@/cms/content'
export function validateCmsContent(content: CmsContent): string | null {
  const site = content.site
  if (site.publicSiteUrl.trim()) {
    try {
      const url = new URL(site.publicSiteUrl)
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || (url.pathname !== '/' && url.pathname !== '') || url.search || url.hash) return 'Gebruik voor de publieke URL alleen het domein, bijvoorbeeld https://tzjill.nl.'
    } catch { return 'Vul een geldige publieke URL in.' }
  }
  if (site.contact.some((row) => row.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email.trim()))) return 'Vul een geldig contact-e-mailadres in.'
  const invalidHours = site.openingHours.find((row) => {
    if (/^gesloten$/i.test(row.time.trim())) return false
    const match = row.time.match(/^([01]?\d|2[0-3]):([0-5]\d)\s*[–-]\s*([01]?\d|2[0-3]):([0-5]\d)$/)
    return !match || Number(match[1]) * 60 + Number(match[2]) >= Number(match[3]) * 60 + Number(match[4])
  })
  return invalidHours ? `${invalidHours.day}: gebruik een geldige periode (09:00 – 18:00) of Gesloten.` : null
}
