import { SALONHUB_BOOKING_URL } from '@/data/site'

type BookingWellProps = {
  className?: string
}

/**
 * Hosts Salonhub in a cream well. On narrow phones the widget is laid out
 * at ~640px and scaled to the viewport so No-show / Volgende stay on screen
 * without horizontal page overflow.
 */
export function BookingWell({ className = '' }: BookingWellProps) {
  return (
    <div
      className={`relative min-w-0 overflow-hidden bg-[#efeae3] ${className}`}
    >
      <div className="h-full w-full origin-top-left max-sm:h-[164%] max-sm:w-[164%] max-sm:scale-[0.61]">
        <iframe
          title="Salonhub — online afspraak Tzjill"
          src={SALONHUB_BOOKING_URL}
          className="block h-full w-full border-0 bg-[#efeae3]"
        />
      </div>
    </div>
  )
}
