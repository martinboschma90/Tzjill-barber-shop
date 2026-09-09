import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const ease = [0.22, 1, 0.36, 1] as const

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  variant?: 'up' | 'clip'
  trigger?: 'view' | 'load'
}

export function Reveal({
  children,
  className,
  delay = 0,
  variant = 'up',
  trigger = 'view',
}: RevealProps) {
  const reduce = useReducedMotion()
  const onLoad = trigger === 'load'
  const motionIn = reduce ? false : variant === 'clip' ? { y: '108%' } : { opacity: 0, y: 36 }
  const motionOut = variant === 'clip' ? { y: 0 } : { opacity: 1, y: 0 }

  if (variant === 'clip') {
    const clipVariants = {
      hidden: { y: '108%' },
      show: { y: 0 },
    }

    return (
      <motion.div
        className={`overflow-hidden ${className ?? ''}`}
        initial={reduce ? 'show' : 'hidden'}
        animate={onLoad && !reduce ? 'show' : undefined}
        whileInView={onLoad || reduce ? undefined : 'show'}
        viewport={onLoad ? undefined : { once: true, amount: 0.15, margin: '0px 0px 40px 0px' }}
      >
        <motion.div
          variants={clipVariants}
          transition={{ duration: 0.95, delay, ease }}
        >
          {children}
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className={className}
      initial={motionIn}
      animate={onLoad ? motionOut : undefined}
      whileInView={onLoad ? undefined : motionOut}
      viewport={onLoad ? undefined : { once: true, amount: 0.18, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.9, delay, ease }}
    >
      {children}
    </motion.div>
  )
}
