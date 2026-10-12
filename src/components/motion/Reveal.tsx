import { useEffect, useRef, useState, type ReactNode } from 'react'

const MAX_SLOT = 5

type RevealProps = {
  children: ReactNode
  className?: string
  /** Stagger in seconds. Slots are 80ms, capped at 6 items (0–5). */
  delay?: number
  variant?: 'up' | 'clip'
  /** `load` is the above-the-fold intro (max 900ms). `view` waits for scroll. */
  trigger?: 'view' | 'load'
}

function slotFor(delay: number) {
  return Math.max(0, Math.min(MAX_SLOT, Math.round(delay / 0.08)))
}

/**
 * Scroll reveal via IntersectionObserver. Content stays visible when JS never
 * adds `html.js`, so a page without the motion script is not blank.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  trigger = 'view',
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)
  const slot = slotFor(delay)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    if (trigger === 'load') {
      const frame = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setShown(true))
      })
      return () => window.cancelAnimationFrame(frame)
    }

    if (!('IntersectionObserver' in window)) {
      setShown(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.15) return
        setShown(true)
        observer.disconnect()
      },
      { threshold: [0, 0.15] },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [trigger])

  return (
    <div
      ref={ref}
      className={`motion-reveal ${trigger === 'load' ? 'motion-load' : ''} ${shown ? 'is-in' : ''} ${className ?? ''}`}
      style={{ ['--motion-i' as string]: String(slot) }}
    >
      {children}
    </div>
  )
}
