import { Link } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { PageFrame } from '@/components/layout/PageFrame'
import { BookButton } from '@/components/booking/BookButton'
import { SeoFaq } from '@/components/seo/SeoFaq'
import { useCms } from '@/cms/CmsContext'
import {
  BEARD_FAQ,
  BEARD_PAGE,
  BEARD_SERVICES,
  menuPrice,
} from '@/data/seoPages'
import { PHONE_DISPLAY, PHONE_TEL } from '@/data/site'

export function BeardPage() {
  const { content } = useCms()
  const phone = content.site.phoneNumber?.trim() || PHONE_DISPLAY

  return (
    <AppShell navVariant="wordmark">
      <PageFrame>
        <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14">
          <header>
            <p className="type-label text-white/45">{BEARD_PAGE.kicker}</p>
            <h1 className="type-headline mt-4 text-white">{BEARD_PAGE.title}</h1>
            <p className="type-lead mt-6 max-w-xl text-white/70">{BEARD_PAGE.intro}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <BookButton>Afspraak maken</BookButton>
              <a
                href={`tel:${PHONE_TEL}`}
                className="type-ui inline-flex items-center justify-center rounded-full border border-white/70 px-6 py-3 text-white transition-[color,background-color,border-color,transform] duration-300 hover:-translate-y-px hover:bg-white hover:text-[#1c1b19]"
              >
                {phone}
              </a>
            </div>
          </header>
          <figure className="overflow-hidden rounded-[1.75rem] bg-black sm:rounded-[2rem]">
            <img
              src={BEARD_PAGE.image}
              alt={BEARD_PAGE.imageAlt}
              className="aspect-[4/5] w-full object-cover sm:aspect-[5/4] lg:aspect-[4/5]"
            />
          </figure>
        </div>

        <section className="mt-16 max-w-3xl">
          <h2 className="type-subhead">Voor wie</h2>
          <p className="type-lead mt-4 text-white/70">{BEARD_PAGE.audience}</p>
          <p className="type-lead mt-4 text-white/55">
            Tzjill zit aan de Voorstreek 18 in Leeuwarden. Liever de hele coupe?
            Kijk bij de{' '}
            <Link
              to="/barbershop-leeuwarden"
              className="underline decoration-white/30 underline-offset-4 hover:text-white"
            >
              barbershop in Leeuwarden
            </Link>
            .
          </p>
        </section>

        <section className="mt-16">
          <h2 className="type-subhead">Behandelingen</h2>
          <ul className="mt-8 max-w-3xl">
            {BEARD_SERVICES.map((service) => (
              <li
                key={service.menuName}
                className="border-b border-white/10 py-6 first:border-t first:border-white/10"
              >
                <div className="flex items-baseline gap-4">
                  <h3 className="type-lead text-white/90">{service.title}</h3>
                  <span
                    className="min-w-6 flex-1 border-b border-dotted border-white/20"
                    aria-hidden
                  />
                  <span className="type-ui shrink-0 text-white/45">
                    {menuPrice(
                      content.site.shopMenu,
                      service.menuName,
                      service.fallbackPrice,
                    )}
                  </span>
                </div>
                <p className="type-lead mt-2 max-w-lg text-white/50">{service.text}</p>
              </li>
            ))}
          </ul>
          <p className="type-ui mt-6 text-white/45">
            <Link to="/prijzen" className="wf-link hover:text-white">
              Alle tarieven →
            </Link>
          </p>
        </section>

        <section className="mt-16 rounded-[1.75rem] bg-[#efeae3] px-7 py-8 text-[#1c1b19] sm:rounded-[2rem] sm:px-10 sm:py-10">
          <h2 className="type-subhead">In de lounge</h2>
          <p className="type-lead mt-4 max-w-xl text-[#1c1b19]/70">{BEARD_PAGE.products}</p>
          <Link
            to="/products"
            className="type-ui mt-6 inline-flex items-center gap-2 rounded-full border border-[#1c1b19] px-6 py-3 transition-[color,background-color,transform] duration-300 hover:-translate-y-px hover:bg-[#1c1b19] hover:text-[#efeae3]"
          >
            Producten
            <span aria-hidden>→</span>
          </Link>
        </section>

        <div className="mt-8">
          <BookButton surface="dark">Afspraak maken</BookButton>
        </div>

        <div className="mt-20">
          <SeoFaq
            kicker="Baard"
            title="Contouren, trimmen, hot towel"
            intro="Drie vragen die aan de balie het vaakst terugkomen."
            items={BEARD_FAQ}
          />
        </div>
      </PageFrame>
    </AppShell>
  )
}
