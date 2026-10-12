import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { buttonClass, type ButtonSurface, type ButtonVariant } from '@/components/ui/buttonStyles'

type PillButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: ButtonVariant
  /** `dark` = op video/espresso; `light` = op linnen. */
  surface?: ButtonSurface
  arrow?: boolean
  children?: ReactNode
}

export function PillButton({
  variant = 'solid',
  surface = 'light',
  arrow = true,
  className = '',
  children,
  ...props
}: PillButtonProps) {
  return (
    <a className={buttonClass({ variant, surface, className })} {...props}>
      {children}
      {arrow ? (
        <span aria-hidden className="motion-arrow">
          →
        </span>
      ) : null}
    </a>
  )
}
