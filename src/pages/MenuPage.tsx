import { AppShell } from '@/components/layout/AppShell'
import { PageFrame } from '@/components/layout/PageFrame'
import { PageIntro } from '@/components/layout/PageIntro'
import { BookButton } from '@/components/booking/BookButton'
import { useCms } from '@/cms/CmsContext'
import { cloneShopMenu } from '@/cms/content'

export function MenuPage() {
  const { content } = useCms()
  const menu = content.site.shopMenu ?? cloneShopMenu()

  return (
    <AppShell navVariant="wordmark">
      <PageFrame>
        <PageIntro
          kicker="Behandelingen"
          title={
            <>
              Vaste
              <br />
              tarieven
            </>
          }
          intro="Zelfde prijzen als in Salonhub."
        />
        <div className="mt-8">
          <BookButton surface="dark" className="shrink-0">
            Afspraak maken
          </BookButton>
        </div>

        <div className="mt-16 grid gap-16 lg:grid-cols-2 lg:gap-20">
          {menu.map((category) => (
            <section key={category.id}>
              <h2 className="type-subhead">{category.label}</h2>
              {category.groups.map((group) => (
                <div key={group.title} className="mt-10">
                  <h3 className="type-label text-white/40">{group.title}</h3>
                  <ul className="mt-4">
                    {group.items.map((item) => (
                      <li
                        key={item.name}
                        className="flex items-baseline gap-4 border-b border-white/10 py-4 first:border-t first:border-white/10"
                      >
                        <span className="type-lead text-white/85">{item.name}</span>
                        <span
                          className="min-w-6 flex-1 border-b border-dotted border-white/20"
                          aria-hidden
                        />
                        <span className="type-ui shrink-0 text-white/40">
                          {item.price}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          ))}
        </div>
      </PageFrame>
    </AppShell>
  )
}
