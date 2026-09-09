import type { AnchorHTMLAttributes, ReactNode } from 'react'

type PillButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: 'solid' | 'ghost'
  /** `dark` = op video/espresso; `light` = op linnen. */
  surface?: 'dark' | 'light'
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
  const base =
    'type-ui group inline-flex items-center justify-center gap-2.5 rounded-full border px-6 py-3 transition-[color,background-color,border-color,transform] duration-300 hover:-translate-y-px'

  const styles =
    surface === 'dark'
      ? variant === 'ghost'
        ? 'border-white/75 bg-white/5 text-white backdrop-blur-[2px] hover:border-white hover:bg-white hover:text-[#2c241c]'
        : 'border-[#efeae3] bg-[#efeae3] text-[#2c241c] hover:border-white hover:bg-white'
      : variant === 'ghost'
        ? 'border-[#2c241c]/70 bg-transparent text-[#2c241c] hover:bg-[#2c241c] hover:text-[#efeae3]'
        : 'border-[#2c241c] bg-[#2c241c] text-[#efeae3] hover:bg-black hover:border-black'

  return (
    <a className={`${base} ${styles} ${className}`} {...props}>
      {children}
      {arrow ? (
        <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
          →
        </span>
      ) : null}
    </a>
  )
}
