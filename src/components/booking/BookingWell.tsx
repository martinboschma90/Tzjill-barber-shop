import { SALONHUB_BOOKING_URL } from '@/data/site'

type BookingWellProps = {
  className?: string
  treatmentId?: string
}

function agendaSrc(treatmentId?: string) {
  if (!treatmentId || !/^\d+$/.test(treatmentId)) return SALONHUB_BOOKING_URL
  const url = new URL(SALONHUB_BOOKING_URL)
  url.searchParams.set('treatment', treatmentId)
  return url.toString()
}

/**
 * Hosts Salonhub in a cream well. On narrow phones the widget is laid out
 * at ~640px and scaled to the viewport so No-show / Volgende stay on screen
 * without horizontal page overflow. The widget itself is not restyled.
 */
export function BookingWell({ className = '', treatmentId }: BookingWellProps) {
  const src = agendaSrc(treatmentId)
  return (
    <div className={`relative min-w-0 overflow-hidden bg-[#f6f3ee] ${className}`}>
      <div className="h-full w-full origin-top-left max-sm:h-[164%] max-sm:w-[164%] max-sm:scale-[0.61]">
        <iframe
          key={src}
          title="Salonhub — online afspraak Tzjill"
          src={src}
          className="block h-full w-full border-0 bg-[#f6f3ee]"
        />
      </div>
    </div>
  )
}
