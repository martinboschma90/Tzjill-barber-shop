import type { ReactNode } from 'react'
import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'

export function Parallax({
  children,
  className = '',
  distance = 48,
}: {
  children: ReactNode
  className?: string
  distance?: number
}) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance])

  if (reduce) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    )
  }

  return (
    <motion.div ref={ref} style={{ y }} className={`will-change-transform ${className}`}>
      {children}
    </motion.div>
  )
}
