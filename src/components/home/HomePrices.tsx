import { SiteText } from '@/cms/SiteText'
import { Link } from 'react-router-dom'
import { BookButton } from '@/components/booking/BookButton'
import { SectionHead } from '@/components/layout/SectionHead'
import { useCms } from '@/cms/CmsContext'
import { cloneShopMenu } from '@/cms/content'

export function HomePrices() {
  const { content } = useCms()
  const menu =
    content.site.shopMenu !== undefined ? content.site.shopMenu : cloneShopMenu()
  const highlights = menu
    .flatMap((category) => category.groups.flatMap((group) => group.items))
    .slice(0, 6)

  return (
    <section data-cms-section="texts-HomePrices" className="text-white">
      <div className="content-wrap section-y">
        <SectionHead
          kicker={<SiteText textKey="HomePrices.kicker" />}
          title={
            <><SiteText textKey="HomePrices.1" /><br /><SiteText textKey="HomePrices.2" /></>
          }
          intro={
            <Link
              to="/prijzen"
              className="wf-link type-ui text-white/65 hover:text-white"
            ><SiteText textKey="HomePrices.3" /></Link>
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
              <span className="type-ui nums shrink-0 text-white/65">{item.price}</span>
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <BookButton surface="dark"><SiteText textKey="HomePrices.4" /></BookButton>
        </div>
      </div>
    </section>
  )
}
