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
      <p className={`type-label ${kickerColor}`}>{kicker}</p>
      <div className="relative mt-5 lg:pr-[22rem]">
        <Reveal trigger={trigger}>
          <Heading className="type-headline">{title}</Heading>
        </Reveal>
        {intro ? (
          <div className={`type-lead mt-6 max-w-xs lg:absolute lg:bottom-1 lg:right-0 lg:mt-0 lg:text-right ${introColor}`}>
            {intro}
          </div>
        ) : null}
      </div>
    </div>
  )
}
