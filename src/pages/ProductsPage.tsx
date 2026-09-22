import { AppShell } from '@/components/layout/AppShell'
import { PageFrame } from '@/components/layout/PageFrame'
import { PageIntro } from '@/components/layout/PageIntro'
import { useCms } from '@/cms/CmsContext'
import { cloneProducts } from '@/cms/content'
import { feedFrameClass } from '@/data/feed'

export function ProductsPage() {
  const { content } = useCms()
  const products = content.site.products ?? cloneProducts()

  return (
    <AppShell navVariant="wordmark">
      <PageFrame>
        <PageIntro
          kicker="Shop"
          title="Producten"
          intro="Haar- en baardverzorging. Koop je in de zaak."
        />
        <ul className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
          {products.map((item) => (
            <li key={item.name}>
              <figure className="overflow-hidden rounded-[1.75rem] bg-black sm:rounded-[2rem]">
                <img
                  src={item.image}
                  alt=""
                  className={`wf-media-zoom aspect-[3/4] w-full ${feedFrameClass}`}
                  loading="lazy"
                />
              </figure>
              <h2 className="type-subhead mt-5 text-white">{item.name}</h2>
              <p className="type-lead mt-2 text-white/50">{item.text}</p>
            </li>
          ))}
        </ul>
      </PageFrame>
    </AppShell>
  )
}
