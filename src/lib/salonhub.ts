export const SALONHUB_OPEN_EVENT = 'tzjill:salonhub-open'

export function openSalonhub() {
  window.dispatchEvent(new Event(SALONHUB_OPEN_EVENT))
}
