import { Link } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { PageFrame } from '@/components/layout/PageFrame'
import { BookButton } from '@/components/booking/BookButton'
import { SeoFaq } from '@/components/seo/SeoFaq'
import { useCms } from '@/cms/CmsContext'
import {
  LOCAL_FAQ,
  LOCAL_PAGE,
  LOCAL_SERVICES,
  menuPrice,
} from '@/data/seoPages'
import {
  MAPS_DIRECTIONS_URL,
  PHONE_DISPLAY,
  PHONE_TEL,
  openingHours,
} from '@/data/site'

export function LocalLandingPage() {
  const { content } = useCms()
  const phone = content.site.phoneNumber?.trim() || PHONE_DISPLAY
  const address = content.site.legal.addressLines.filter((line) => line.trim())

  return (
    <AppShell navVariant="wordmark">
      <PageFrame>
        <header className="max-w-3xl">
          <p className="type-label text-white/45">{LOCAL_PAGE.kicker}</p>
          <h1 className="type-headline mt-4 text-white">{LOCAL_PAGE.title}</h1>
          <p className="type-lead mt-6 max-w-xl text-white/70">{LOCAL_PAGE.intro}</p>
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

        <figure className="mt-12 overflow-hidden rounded-[1.75rem] bg-black sm:rounded-[2rem]">
          <img
            src={LOCAL_PAGE.image}
            alt={LOCAL_PAGE.imageAlt}
            className="aspect-[16/9] w-full object-cover sm:aspect-[2.2/1]"
          />
        </figure>

        <div className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
          <section>
            <h2 className="type-subhead">Voorstreek, binnenstad</h2>
            <div className="type-body mt-5 space-y-0.5 text-white/80">
              {(address.length ? address : ['Voorstreek 18', '8911 JP Leeuwarden']).map(
                (line) => (
                  <p key={line}>{line}</p>
                ),
              )}
            </div>
            <p className="type-lead mt-4 max-w-md text-white/55">
              De zaak zit in de binnenstad van Leeuwarden. Knippen, baard, scheren
              en kids t/m 11 — dezelfde stoel, dezelfde precisie.
            </p>
            <a
              href={MAPS_DIRECTIONS_URL}
              target="_blank"
              rel="noreferrer"
              className="type-ui mt-6 inline-flex text-white/70 underline decoration-white/30 underline-offset-4 hover:text-white"
            >
              Route naar Voorstreek 18
            </a>
          </section>

          <section className="rounded-[1.75rem] bg-[#efeae3] px-7 py-7 text-[#1c1b19] sm:rounded-[2rem] sm:px-8 sm:py-8">
            <h2 className="type-label text-[#1c1b19]/50">Openingstijden</h2>
            <ul className="mt-4">
              {openingHours.map((row) => (
                <li
                  key={row.day}
                  className="flex items-baseline justify-between gap-4 border-b border-[#1c1b19]/10 py-2.5"
                >
                  <span className="type-body">{row.day}</span>
                  <span className="type-ui text-[#1c1b19]/55">{row.time}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-20">
          <h2 className="type-subhead">Behandelingen en prijzen</h2>
          <p className="type-lead mt-4 max-w-xl text-white/55">
            Vaste tarieven, dezelfde als op de{' '}
            <Link
              to="/prijzen"
              className="underline decoration-white/30 underline-offset-4 hover:text-white"
            >
              prijzenpagina
            </Link>
            . Baard en scheren staan uitgewerkt op de{' '}
            <Link
              to="/baard-scheren"
              className="underline decoration-white/30 underline-offset-4 hover:text-white"
            >
              baard- en scheerpagina
            </Link>
            .
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {LOCAL_SERVICES.map((service) => (
              <li
                key={service.menuName}
                className="rounded-[1.5rem] border border-white/10 px-6 py-6"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="type-subhead text-[1.35rem]">{service.title}</h3>
                  <p className="type-ui text-white/45">
                    {menuPrice(content.site.shopMenu, service.menuName, service.fallbackPrice)}
                  </p>
                </div>
                <p className="type-lead mt-3 text-white/55">{service.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-20 max-w-3xl">
          <h2 className="type-subhead">{LOCAL_PAGE.whyTitle}</h2>
          <ul className="mt-6 space-y-4">
            {LOCAL_PAGE.why.map((line) => (
              <li key={line} className="type-lead text-white/70">
                {line}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <BookButton>Afspraak maken</BookButton>
          </div>
        </section>

        <div className="mt-20">
          <SeoFaq
            kicker="Lokaal"
            title="Vragen over de zaak"
            intro="Fade of klassiek, boeken, en waar je moet zijn."
            items={LOCAL_FAQ}
          />
        </div>
      </PageFrame>
    </AppShell>
  )
}
