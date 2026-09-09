import { useTheme } from '@/theme/ThemeProvider'

export function ThemeToggle({ invert = false }: { invert?: boolean }) {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div
      className={`pointer-events-auto inline-flex items-center rounded-full border p-0.5 ${
        invert ? 'border-white/30 bg-white/10' : 'border-ink/25 bg-ink/5'
      }`}
      role="group"
      aria-label="Theme"
    >
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={`type-ui relative rounded-full px-2 py-1 text-[0.6rem] sm:px-3 sm:py-1.5 sm:text-[0.65rem] ${
          !isDark
            ? invert
              ? 'bg-white text-[#2c241c]'
              : 'bg-accent text-[#f5f5f5]'
            : invert
              ? 'text-white/60'
              : 'text-ink/55'
        }`}
        aria-pressed={!isDark}
      >
        Light
      </button>
      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={`type-ui relative rounded-full px-2 py-1 text-[0.6rem] sm:px-3 sm:py-1.5 sm:text-[0.65rem] ${
          isDark
            ? invert
              ? 'bg-white text-[#2c241c]'
              : 'bg-accent text-[#f5f5f5]'
            : invert
              ? 'text-white/60'
              : 'text-ink/55'
        }`}
        aria-pressed={isDark}
      >
        Dark
      </button>
    </div>
  )
}
