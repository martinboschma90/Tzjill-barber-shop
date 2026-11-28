import { useModalFocus } from '@/lib/useModalFocus'
import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { BookingFlow } from '@/components/booking/BookingFlow'
import { BookingShell } from '@/components/booking/BookingShell'
import { SALONHUB_OPEN_EVENT } from '@/lib/salonhub'

type SalonhubWidgetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SalonhubWidget({ open, onOpenChange }: SalonhubWidgetProps) {
  const titleId = useId()
  const modal = useModalFocus(open, () => onOpenChange(false))
  const scrollLockY = useRef(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (open) setMounted(true)
  }, [open])

  useEffect(() => {
    const onOpen = () => onOpenChange(true)
    const onHash = () => {
      if (window.location.hash === '#afspraak' || window.location.hash === '#salonhub-create') {
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
    return () => {
      document.body.style.overflow = prevOverflow
      document.body.style.position = prevPosition
      document.body.style.top = prevTop
      document.body.style.width = prevWidth
      window.scrollTo(0, scrollLockY.current)
    }
  }, [open])

  if (!mounted || typeof document === 'undefined') return null

  return createPortal(
    <div
      hidden={!open}
      inert={!open}
      aria-hidden={!open}
      className={
        open
          ? 'fixed inset-0 z-[100] flex min-h-[100dvh] flex-col overflow-hidden overscroll-none bg-[#1c1b19] sm:items-center sm:justify-center sm:bg-[#1c1b19]/96 sm:p-3 sm:backdrop-blur-sm'
          : 'hidden'
      }
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
        aria-modal={open}
        aria-labelledby={titleId}
        className="relative z-[1] flex min-h-[100dvh] max-h-[100dvh] w-full min-w-0 max-w-full flex-col overflow-hidden bg-[#1c1b19] pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] sm:min-h-0 sm:h-[min(92dvh,880px)] sm:max-h-[min(92dvh,880px)] sm:max-w-[720px] sm:radius-media sm:border sm:border-white/10"
      >
        <h2 id={titleId} className="sr-only">
          Afspraak maken
        </h2>
        <BookingShell onClose={() => onOpenChange(false)}>
          <BookingFlow compact />
        </BookingShell>
      </div>
    </div>,
    document.body,
  )
}
