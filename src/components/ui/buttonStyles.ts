export type ButtonVariant = 'solid' | 'ghost'
export type ButtonSurface = 'dark' | 'light'

/** Two button variants: solid (primary) and ghost (secondary). */
export function buttonClass({
  variant = 'solid',
  surface = 'dark',
  className = '',
}: {
  variant?: ButtonVariant
  surface?: ButtonSurface
  className?: string
}) {
  const base =
    'type-ui group inline-flex min-h-11 items-center justify-center gap-2.5 rounded-full border px-6 py-3 transition-[color,background-color,border-color] duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)]'

  const styles =
    surface === 'dark'
      ? variant === 'ghost'
        ? 'border-white/75 bg-transparent text-white hover:border-white hover:bg-white hover:text-pill-on-dark-fg focus-visible:text-white active:text-white'
        : 'border-pill-on-dark-bg bg-pill-on-dark-bg text-pill-on-dark-fg hover:border-white hover:bg-white hover:text-pill-on-dark-fg focus-visible:text-pill-on-dark-fg active:text-pill-on-dark-fg'
      : variant === 'ghost'
        ? 'border-pill-on-light-bg/70 bg-transparent text-pill-on-light-bg hover:bg-pill-on-light-bg hover:text-pill-on-light-fg'
        : 'border-pill-on-light-bg bg-pill-on-light-bg text-pill-on-light-fg hover:border-ink-deep hover:bg-ink-deep hover:text-pill-on-light-fg'

  return `${base} ${styles} ${className}`.trim()
}
