import { useModalFocus } from '@/lib/useModalFocus'
import { useEffect, useId, useRef } from 'react'
import { BookingFlow } from '@/components/booking/BookingFlow'
import { SALONHUB_OPEN_EVENT } from '@/lib/salonhub'
import { Logo } from '@/components/ui/Logo'

type SalonhubWidgetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SalonhubWidget({ open, onOpenChange }: SalonhubWidgetProps) {
  const titleId = useId()
  const modal = useModalFocus(open)
  const scrollLockY = useRef(0)

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
    scrollLockY.current = window.scrollY
    const prevOverflow = document.body.style.overflow
    const prevPosition = document.body.style.position
    const prevTop = document.body.style.top
    const prevWidth = document.body.style.width
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollLockY.current}px`
    document.body.style.width = '100%'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      document.body.style.position = prevPosition
      document.body.style.top = prevTop
      document.body.style.width = prevWidth
      window.scrollTo(0, scrollLockY.current)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[80] flex min-h-[100dvh] flex-col overflow-hidden overscroll-none bg-surface-body sm:items-center sm:justify-center sm:bg-[#1c1b19]/92 sm:p-3 sm:backdrop-blur-sm"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Sluiten"
        className="absolute inset-0 hidden bg-transparent sm:block"
        onClick={() => onOpenChange(false)}
      />
      <div
        ref={modal}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-[1] flex min-h-[100dvh] max-h-[100dvh] w-full min-w-0 max-w-full flex-col overflow-hidden bg-surface-body pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] sm:min-h-0 sm:h-[min(92dvh,880px)] sm:max-h-[min(92dvh,880px)] sm:max-w-[720px] sm:radius-media sm:border sm:border-white/10"
      >
        <div className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-white/[0.08] px-4 sm:px-5">
          <Logo tone="white" height={22} className="opacity-90" />
          <h2 id={titleId} className="sr-only">
            Afspraak maken
          </h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="type-ui flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 text-lg leading-none text-white/75 transition-colors hover:border-white hover:bg-white hover:text-[#2c241c]"
            aria-label="Widget sluiten"
          >
            ×
          </button>
        </div>
        <BookingFlow compact />
      </div>
    </div>
  )
}