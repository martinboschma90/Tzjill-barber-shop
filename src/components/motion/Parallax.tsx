import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'

const DESKTOP = '(min-width: 1024px)'

/** Image parallax. Max 40px, off under 1024px and when reduced motion is on. */
export function Parallax({
  children,
  className = '',
  distance = 20,
}: {
  children: ReactNode
  className?: string
  distance?: number
}) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const [desktop, setDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(DESKTOP).matches,
  )
  const capped = Math.max(-40, Math.min(40, distance))
  const active = desktop && !reduce

  useEffect(() => {
    const media = window.matchMedia(DESKTOP)
    const sync = () => setDesktop(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], active ? [capped, -capped] : [0, 0])

  if (!active) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    )
  }

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  )
}
