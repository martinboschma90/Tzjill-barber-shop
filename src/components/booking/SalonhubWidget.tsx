import { useEffect, useId } from 'react'
import { BookingFlow } from '@/components/booking/BookingFlow'
import { SALONHUB_OPEN_EVENT } from '@/lib/salonhub'
import { Logo } from '@/components/ui/Logo'

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
    <div className="fixed inset-0 z-[80] flex items-stretch justify-center overflow-x-hidden sm:items-center sm:p-3">
      <button
        type="button"
        aria-label="Sluiten"
        className="absolute inset-0 bg-[#1c1b19]/90 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-[1] flex h-[100svh] w-full min-w-0 max-w-full flex-col overflow-hidden bg-[#1c1b19] sm:h-[min(92svh,880px)] sm:max-w-[720px] sm:rounded-[1.75rem] sm:border sm:border-white/10"
      >
        <div className="flex h-14 shrink-0 items-center justify-between gap-3 px-4 sm:h-16 sm:px-5">
          <div className="min-w-0">
            <Logo invert height={22} className="opacity-90" />
            <p id={titleId} className="type-label mt-1 truncate text-white/45">
              Afspraak maken
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="type-ui flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 text-white/70 transition-colors hover:border-white hover:bg-white hover:text-[#2c241c]"
            aria-label="Widget sluiten"
          >
            ×
          </button>
        </div>
        <BookingFlow compact onBack={() => onOpenChange(false)} />
      </div>
    </div>
  )
}
