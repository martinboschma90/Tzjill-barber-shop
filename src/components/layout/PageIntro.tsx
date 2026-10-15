import type { ReactNode } from 'react'
import { Reveal } from '@/components/motion/Reveal'

type PageIntroProps = {
  kicker: string
  title: ReactNode
  intro?: string
  /** `below` places the intro under the title. `side` keeps it on the right from lg. */
  introPlacement?: 'side' | 'below'
}

export function PageIntro({
  kicker,
  title,
  intro,
  introPlacement = 'side',
}: PageIntroProps) {
  if (introPlacement === 'below') {
    return (
      <header>
        <p className="type-label text-white/65">{kicker}</p>
        <Reveal trigger="load" className="mt-4">
          <h1 className="type-headline text-white">{title}</h1>
        </Reveal>
        {intro ? <p className="type-lead mt-5 max-w-xl text-white/55">{intro}</p> : null}
      </header>
    )
  }

  return (
    <header className="grid items-end gap-8 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <p className="type-label text-white/65">{kicker}</p>
        <Reveal trigger="load" className="mt-4">
          <h1 className="type-headline text-white">{title}</h1>
        </Reveal>
      </div>
      {intro ? (
        <p className="type-lead max-w-xs text-white/55 lg:col-span-4 lg:ml-auto lg:text-right">
          {intro}
        </p>
      ) : null}
    </header>
  )
}
