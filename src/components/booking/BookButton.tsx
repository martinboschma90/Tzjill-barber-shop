import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { buttonClass, type ButtonSurface, type ButtonVariant } from '@/components/ui/buttonStyles'
import { openSalonhub } from '@/lib/salonhub'

type BookButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  surface?: ButtonSurface
  arrow?: boolean
  /** Set false for actions inside the booking flow. Default opens the modal. */
  openWidget?: boolean
  children?: ReactNode
}

export function BookButton({
  variant = 'solid',
  surface = 'dark',
  arrow = true,
  openWidget = true,
  className = '',
  children = 'Afspraak maken',
  onClick,
  ...props
}: BookButtonProps) {
  return (
    <button
      type="button"
      className={buttonClass({ variant, surface, className })}
      onClick={(event) => {
        onClick?.(event)
        if (openWidget && !event.defaultPrevented) openSalonhub()
      }}
      {...props}
    >
      {children}
      {arrow ? (
        <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
          →
        </span>
      ) : null}
    </button>
  )
}
