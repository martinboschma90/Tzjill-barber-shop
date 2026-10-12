import { Link } from 'react-router-dom'
import { BookButton } from '@/components/booking/BookButton'
import { SectionHead } from '@/components/layout/SectionHead'
import { useCms } from '@/cms/CmsContext'
import { cloneShopMenu } from '@/cms/content'

export function HomePrices() {
  const { content } = useCms()
  const highlights = (content.site.shopMenu ?? cloneShopMenu())
    .flatMap((category) => category.groups.flatMap((group) => group.items))
    .slice(0, 6)

  return (
    <section className="text-white">
      <div className="mx-auto max-w-[1240px] px-6 section-y lg:px-8">
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
          {highlights.map((item) => (
            <li
              key={item.name}
              className="flex items-baseline gap-4 border-b border-white/10 py-4 first:border-t first:border-white/10"
            >
              <span className="type-lead text-white/85">{item.name}</span>
              <span className="min-w-6 flex-1 border-b border-dotted border-white/20" aria-hidden />
              <span className="type-ui nums shrink-0 text-white/40">{item.price}</span>
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <BookButton surface="dark">Afspraak maken</BookButton>
        </div>
      </div>
    </section>
  )
}
