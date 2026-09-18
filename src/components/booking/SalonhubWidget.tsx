import { useEffect, useId } from 'react'
import { SALONHUB_BOOKING_URL } from '@/data/site'
import { SALONHUB_OPEN_EVENT } from '@/lib/salonhub'

type SalonhubWidgetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SalonhubWidget({ open, onOpenChange }: SalonhubWidgetProps) {
  const titleId = useId()

  useEffect(() => {
    const onOpen = () => onOpenChange(true)
    const onHash = () => {
      if (
        window.location.hash === '#afspraak' ||
        window.location.hash === '#salonhub-create'
      ) {
        onOpenChange(true)
      }
    }
    window.addEventListener(SALONHUB_OPEN_EVENT, onOpen)
    window.addEventListener('hashchange', onHash)
    onHash()
    return () => {
      window.removeEventListener(SALONHUB_OPEN_EVENT, onOpen)
      window.removeEventListener('hashchange', onHash)
    }
  }, [onOpenChange])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-3">
      <button
        type="button"
        aria-label="Sluiten"
        className="absolute inset-0 bg-[var(--body-bg)]/85 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-[1] flex h-[min(88svh,720px)] w-full max-w-[640px] flex-col overflow-hidden border border-white/10 bg-[#1c1b19] sm:rounded-2xl"
      >
        <div className="flex h-12 shrink-0 items-center justify-between gap-3 px-3 sm:px-4">
          <p id={titleId} className="type-ui text-white">
            Afspraak maken
          </p>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="type-ui flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 text-white/70 transition-colors hover:border-white hover:bg-white hover:text-[#2c241c]"
            aria-label="Widget sluiten"
          >
            ×
          </button>
        </div>
        <div className="min-h-0 flex-1 bg-[#1c1b19]">
          <iframe
            title="Salonhub — online afspraak Tzjill"
            src={SALONHUB_BOOKING_URL}
            className="h-full w-full border-0 bg-[#1c1b19]"
          />
        </div>
      </div>
    </div>
  )
}
