import type { ReactNode } from 'react'
import { Reveal } from '@/components/motion/Reveal'

type SectionHeadProps = {
  kicker: string
  title: ReactNode
  intro?: ReactNode
  as?: 'h1' | 'h2'
  invert?: boolean
  trigger?: 'view' | 'load'
}

export function SectionHead({
  kicker,
  title,
  intro,
  as = 'h2',
  invert = false,
  trigger = 'view',
}: SectionHeadProps) {
  const Heading = as
  const kickerColor = invert ? 'text-[#2c241c]/40' : 'text-white/40'
  const introColor = invert ? 'text-[#2c241c]/55' : 'text-white/55'

  return (
    <div>
      <Reveal variant="clip" trigger={trigger}>
        <p className={`type-label ${kickerColor}`}>{kicker}</p>
      </Reveal>
      <div className="relative mt-5 lg:pr-[22rem]">
        <Reveal variant="clip" trigger={trigger} delay={0.08}>
          <Heading className="type-headline">{title}</Heading>
        </Reveal>
        {intro ? (
          <Reveal
            trigger={trigger}
            delay={0.14}
            className="mt-6 max-w-xs lg:absolute lg:bottom-1 lg:right-0 lg:mt-0 lg:text-right"
          >
            <div className={`type-lead ${introColor}`}>{intro}</div>
          </Reveal>
        ) : null}
      </div>
    </div>
  )
}
