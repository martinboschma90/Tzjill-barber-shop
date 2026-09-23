import type { ReactNode } from 'react'

type BookingWellProps = {
  children: ReactNode
  className?: string
  /** Inset list: each row keeps its own surface inside the rounded frame. */
  list?: boolean
}

/**
 * Dark lounge frame for a booking step. Same border language as the rest of
 * the site. It does not embed Salonhub.
 */
export function BookingWell({ children, className = '', list = false }: BookingWellProps) {
  return (
    <div
      className={`overflow-hidden rounded-[1.25rem] border border-white/[0.08] bg-white/[0.03] ${
        list ? 'p-2' : 'px-5 py-2'
      } ${className}`}
    >
      {children}
    </div>
  )
}
