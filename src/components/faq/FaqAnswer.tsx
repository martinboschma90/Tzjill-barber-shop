import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

const PHRASES: { phrase: string; to: string }[] = [
  { phrase: 'prijzenpagina', to: '/prijzen' },
  { phrase: 'baard- en scheerpagina', to: '/baard-scheren' },
  { phrase: 'barbershop in Leeuwarden', to: '/barbershop-leeuwarden' },
]

/** Turns known phrases in FAQ answers into internal links. */
export function FaqAnswer({ text }: { text: string }) {
  const nodes: ReactNode[] = []
  let rest = text
  let key = 0

  while (rest.length) {
    let earliest = -1
    let match: (typeof PHRASES)[number] | null = null
    for (const phrase of PHRASES) {
      const index = rest.indexOf(phrase.phrase)
      if (index !== -1 && (earliest === -1 || index < earliest)) {
        earliest = index
        match = phrase
      }
    }
    if (!match || earliest === -1) {
      nodes.push(rest)
      break
    }
    if (earliest > 0) nodes.push(rest.slice(0, earliest))
    nodes.push(
      <Link
        key={`${match.to}-${key}`}
        to={match.to}
        className="underline decoration-current/40 underline-offset-[3px] hover:decoration-current"
      >
        {match.phrase}
      </Link>,
    )
    key += 1
    rest = rest.slice(earliest + match.phrase.length)
  }

  return <>{nodes}</>
}
