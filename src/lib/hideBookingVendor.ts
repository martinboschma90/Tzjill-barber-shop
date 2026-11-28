/** Visitors never see the agenda vendor. CMS booking tools may still name it. */
export function hideBookingVendor(value: string): string {
  if (!value || !/salonhub/i.test(value)) return value
  return value
    .replace(/online\s+via\s+Salonhub/gi, 'online')
    .replace(/via\s+Salonhub/gi, 'online')
    .replace(/in\s+Salonhub/gi, 'online')
    .replace(/vraagt\s+Salonhub\s+om/gi, 'vragen we om')
    .replace(/,\s*Salonhub voor afspraken/gi, '')
    .replace(/Salonhub voor afspraken en\s+/gi, '')
    .replace(/\s+en Salonhub/gi, '')
    .replace(/naar Instagram en Salonhub/gi, 'naar Instagram')
    .replace(/\bSalonhub\b/gi, 'de salon')
    .replace(/\s{2,}/g, ' ')
    .trim()
}
