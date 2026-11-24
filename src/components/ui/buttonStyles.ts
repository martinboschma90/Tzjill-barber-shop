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
        ? 'border-white/75 bg-transparent text-white hover:border-white hover:bg-white hover:text-ink'
        : 'border-cream-soft bg-cream-soft text-ink hover:border-white hover:bg-white'
      : variant === 'ghost'
        ? 'border-ink/70 bg-transparent text-ink hover:bg-ink hover:text-cream-soft'
        : 'border-ink bg-ink text-cream-soft hover:border-ink-deep hover:bg-ink-deep'

  return `${base} ${styles} ${className}`.trim()
}
