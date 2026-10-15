import { openingHours } from '@/data/site'

export type OpeningStatus = {
  open: boolean
  label: string
}

function amsterdamNow(now: Date) {
  const parts = new Intl.DateTimeFormat('nl-NL', {
    timeZone: 'Europe/Amsterdam',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now)
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? ''
  const weekday = value('weekday').toLowerCase()
  const minutes = Number(value('hour')) * 60 + Number(value('minute'))
  return { weekday, minutes }
}

/** Client clock in Europe/Amsterdam, from the existing weekly hours. */
export function openingStatus(now = new Date(), hours: readonly { day: string; time: string }[] = openingHours): OpeningStatus {
  const { weekday, minutes } = amsterdamNow(now)
  const row = hours.find((item) => item.day.toLowerCase() === weekday)
  const match = row?.time.match(/(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/)
  if (!row || !match || Number.isNaN(minutes)) {
    return { open: false, label: 'Nu gesloten' }
  }
  const start = Number(match[1]) * 60 + Number(match[2])
  const end = Number(match[3]) * 60 + Number(match[4])
  const until = `${match[3].padStart(2, '0')}:${match[4]}`
  if (minutes >= start && minutes < end) {
    return { open: true, label: `Nu open · tot ${until}` }
  }
  return { open: false, label: 'Nu gesloten' }
}
