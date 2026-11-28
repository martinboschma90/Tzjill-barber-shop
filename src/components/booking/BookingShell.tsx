import type { ReactNode } from 'react'
import { Logo } from '@/components/ui/Logo'

type BookingShellProps = {
  children: ReactNode
  onClose?: () => void
}

/** Tzjill chrome around the appointment flow. Visitors never see the agenda vendor. */
export function BookingShell({ children, onClose }: BookingShellProps) {
  return (
    <div className="relative z-[1] flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#1c1b19]">
      <div className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-white/[0.08] px-4 sm:px-5">
        <Logo tone="white" height={22} className="opacity-90" />
        <p className="sr-only">Afspraak maken</p>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="type-ui flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 text-lg leading-none text-white/75 transition-colors hover:border-white hover:bg-white hover:text-[#2c241c]"
            aria-label="Widget sluiten"
          >
            ×
          </button>
        ) : (
          <span className="type-label text-white/55">Tzjill · Leeuwarden</span>
        )}
      </div>
      {children}
    </div>
  )
}
