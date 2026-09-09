import { Link } from 'react-router-dom'
import { SectionHead } from '@/components/layout/SectionHead'
import { Reveal } from '@/components/motion/Reveal'

const highlights = [
  { name: 'Haircut', price: '€30' },
  { name: 'Haircut + wassen', price: '€33' },
  { name: 'Haircut + baard trimmen', price: '€40' },
  { name: 'Baard trimmen', price: '€20' },
  { name: '1 stand scheren', price: '€19' },
  { name: 'Kinderen t/m 11 jaar', price: '€22' },
]

export function HomePrices() {
  return (
    <section className="text-white">
      <div className="mx-auto max-w-[1240px] px-8 section-y sm:px-12">
        <SectionHead
          kicker="Menu"
          title={
            <>
              Vaste
              <br />
              tarieven
            </>
          }
          intro={
            <Link
              to="/prijzen"
              className="wf-link type-ui text-white/45 hover:text-white"
            >
              Volledig menu →
            </Link>
          }
        />

        <ul className="mt-14 max-w-3xl">
          {highlights.map((item, index) => (
            <li key={item.name}>
              <Reveal delay={0.04 * index}>
                <div className="flex items-baseline gap-4 border-b border-white/10 py-4 first:border-t first:border-white/10">
                  <span className="type-lead text-white/85">{item.name}</span>
                  <span
                    className="min-w-6 flex-1 border-b border-dotted border-white/20"
                    aria-hidden
                  />
                  <span className="type-ui shrink-0 text-white/40">{item.price}</span>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
