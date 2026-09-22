import type { ReactNode } from 'react'

type BookingWellProps = {
  children: ReactNode
  className?: string
}

/**
 * Dark lounge frame for a booking step. Same border language as the rest of
 * the site. It does not embed Salonhub.
 */
export function BookingWell({ children, className = '' }: BookingWellProps) {
  return (
    <div
      className={`overflow-hidden rounded-[1.25rem] border border-white/[0.08] bg-white/[0.03] px-5 py-2 ${className}`}
    >
      {children}
    </div>
  )
}
