import type { ReactNode } from 'react'
import { Reveal } from '@/components/motion/Reveal'

type PageIntroProps = {
  kicker: string
  title: ReactNode
  intro?: string
}

export function PageIntro({ kicker, title, intro }: PageIntroProps) {
  return (
    <header className="grid items-end gap-8 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <Reveal variant="clip" trigger="load">
          <p className="type-label text-white/40">{kicker}</p>
        </Reveal>
        <Reveal variant="clip" trigger="load" delay={0.08} className="mt-4">
          <h1 className="type-headline text-white">{title}</h1>
        </Reveal>
      </div>
      {intro ? (
        <Reveal trigger="load" delay={0.16} className="lg:col-span-4">
          <p className="type-lead max-w-xs text-white/55 lg:ml-auto lg:text-right">
            {intro}
          </p>
        </Reveal>
      ) : null}
    </header>
  )
}
