import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const ease = [0.22, 1, 0.36, 1] as const

export function MediaReveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const reduce = useReducedMotion()

  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        className="h-full w-full will-change-transform"
        initial={reduce ? false : { scale: 1.16 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 1.35, delay, ease }}
      >
        {children}
      </motion.div>
    </div>
  )
}
