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
    'type-ui group inline-flex items-center justify-center gap-2.5 rounded-full border px-6 py-3 transition-[color,background-color,border-color,transform] duration-500 ease-out hover:-translate-y-px'

  const styles =
    surface === 'dark'
      ? variant === 'ghost'
        ? 'border-white/75 bg-transparent text-white hover:border-white hover:bg-white hover:text-[#2c241c]'
        : 'border-[#efeae3] bg-[#efeae3] text-[#2c241c] hover:border-white hover:bg-white'
      : variant === 'ghost'
        ? 'border-[#2c241c]/70 bg-transparent text-[#2c241c] hover:bg-[#2c241c] hover:text-[#efeae3]'
        : 'border-[#2c241c] bg-[#2c241c] text-[#efeae3] hover:border-black hover:bg-black'

  return `${base} ${styles} ${className}`.trim()
}
