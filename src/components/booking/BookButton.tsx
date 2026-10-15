import { useCms } from '@/cms/CmsContext'
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
  const { content } = useCms()
  if (openWidget && content.site.bookingVisible === false) return null
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
        <span aria-hidden className="motion-arrow">
          →
        </span>
      ) : null}
    </button>
  )
}
