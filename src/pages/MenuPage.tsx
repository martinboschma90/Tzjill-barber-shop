import { AppShell } from '@/components/layout/AppShell'
import { PageFrame } from '@/components/layout/PageFrame'
import { PageIntro } from '@/components/layout/PageIntro'
import { BookButton } from '@/components/booking/BookButton'
import { useCms } from '@/cms/CmsContext'
import { cloneShopMenu, type ShopMenuCategory, type ShopMenuItem } from '@/cms/content'

type PriceBlock = {
  key: string
  title: string
  items: ShopMenuItem[]
}

function blocksFor(menu: ShopMenuCategory[]) {
  const columns: PriceBlock[] = []
  const full: PriceBlock[] = []
  for (const category of menu) {
    if (category.groups.length > 1) {
      category.groups.forEach((group) => {
        columns.push({
          key: `${category.id}-${group.title}`,
          title: group.title,
          items: group.items,
        })
      })
    } else {
      full.push({
        key: category.id,
        title: category.label,
        items: category.groups[0]?.items ?? [],
      })
    }
  }
  return { columns, full }
}

function PriceRows({ items }: { items: ShopMenuItem[] }) {
  return (
    <ul className="mt-4">
      {items.map((item) => (
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
  )
}

export function MenuPage() {
  const { content } = useCms()
  const menu = content.site.shopMenu ?? cloneShopMenu()
  const { columns, full } = blocksFor(menu)

  return (
    <AppShell navVariant="wordmark">
      <PageFrame>
        <PageIntro
          introPlacement="below"
          kicker="Behandelingen"
          title={
            <>
              Vaste
              <br />
              tarieven
            </>
          }
          intro="Knippen, scheren, baard en kids. Wat hier staat, betaal je aan de stoel."
        />
        <div className="mt-16 grid items-start gap-x-20 gap-y-14 lg:grid-cols-2">
          {columns.map((block) => (
            <section key={block.key}>
              <h2 className="type-subhead">{block.title}</h2>
              <PriceRows items={block.items} />
            </section>
          ))}
        </div>

        {full.map((block) => (
          <section key={block.key} className="mt-14">
            <h2 className="type-subhead">{block.title}</h2>
            <PriceRows items={block.items} />
          </section>
        ))}
        <div className="mt-12">
          <BookButton surface="dark">Afspraak maken</BookButton>
        </div>
      </PageFrame>
    </AppShell>
  )
}
