import type { ReactNode } from 'react'
import { Reveal } from '@/components/motion/Reveal'

/** Image reveal. Same tokens as Reveal: opacity + translate, once, stagger cap 6. */
export function MediaReveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  return (
    <Reveal delay={delay} className={className}>
      {children}
    </Reveal>
  )
}
