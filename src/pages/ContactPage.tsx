import { AppShell } from '@/components/layout/AppShell'
import { PageFrame } from '@/components/layout/PageFrame'
import { MediaReveal } from '@/components/motion/MediaReveal'
import { ContactForm } from '@/components/contact/ContactForm'
import { LocationMap } from '@/components/contact/LocationMap'
import { BookButton } from '@/components/booking/BookButton'
import { PillButton } from '@/components/ui/PillButton'
import { useCms } from '@/cms/CmsContext'
import { feed, feedWideClass } from '@/data/feed'
import {
  INSTAGRAM_URL,
  PHONE_DISPLAY,
  PHONE_TEL,
} from '@/data/site'

const hoursCompact = [
  { days: 'Ma – wo', time: '10:00 – 18:00' },
  { days: 'Do – za', time: '09:00 – 20:00' },
  { days: 'Zondag', time: 'Gesloten' },
]

export function ContactPage() {
  const { content } = useCms()
  const { site } = content
  const phone = site.phoneNumber?.trim() || PHONE_DISPLAY
  const officeLines = site.legal.addressLines.filter((line) => line.trim())
  const email = site.contact[0]?.email ?? 'info@tzjill.nl'

  return (
    <AppShell navVariant="wordmark">
      <PageFrame>
        <header className="mx-auto max-w-3xl text-center">
          <p className="type-label inline-flex items-center justify-center gap-2 rounded-full bg-[#efeae3] px-3.5 py-1.5 text-[#2c241c]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2c241c]" aria-hidden />
            Contact
          </p>
          <h1 className="type-headline mt-6">
            Kom langs.
            <br />
            Voorstreek 18.
          </h1>
          <p className="type-lead mx-auto mt-5 max-w-lg text-white/55">
            Afspraak, vragen of collab. Boek via Salonhub of stuur een bericht.
          </p>
        </header>

        <MediaReveal className="mt-10 overflow-hidden rounded-[1.75rem] bg-black sm:mt-12 sm:rounded-[2rem]">
          <img
            src={feed.dsc09971}
            alt="Tzjill Barber & Lounge, Voorstreek 18 Leeuwarden"
            className={`aspect-[16/9] w-full sm:aspect-[2.4/1] ${feedWideClass}`}
          />
        </MediaReveal>

        <div className="mt-14 grid items-start gap-14 lg:grid-cols-2 lg:gap-20">
          <section>
            <h2 className="type-subhead">Adres & openingstijden</h2>

            <div className="type-body mt-6 space-y-0.5 text-white/80">
              {officeLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <div className="type-body mt-3 space-y-0.5">
              {phone ? (
                <p>
                  <a href={`tel:${PHONE_TEL}`} className="hover:opacity-70">
                    {phone}
                  </a>
                </p>
              ) : null}
              <p>
                <a href={`mailto:${email}`} className="hover:opacity-70">
                  {email}
                </a>
              </p>
            </div>

            <ul className="mt-6">
              {hoursCompact.map((row) => (
                <li
                  key={row.days}
                  className="flex items-baseline gap-3 border-b border-white/10 py-2 first:border-t first:border-white/10"
                >
                  <span className="type-body text-[0.9rem] text-white/55">
                    {row.days}
                  </span>
                  <span
                    className="min-w-4 flex-1 border-b border-dotted border-white/20"
                    aria-hidden
                  />
                  <span className="type-ui shrink-0 text-[0.65rem] text-white/70">
                    {row.time}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <LocationMap />
            </div>

            <div className="mt-5 flex flex-wrap gap-2.5">
              <BookButton surface="dark">Afspraak maken</BookButton>
              <PillButton
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noreferrer"
                variant="ghost"
                surface="dark"
                arrow={false}
              >
                Instagram
              </PillButton>
            </div>
          </section>

          <section>
            <h2 className="type-subhead">Bericht</h2>
            <p className="type-body mt-3 max-w-sm text-white/50">
              Vraag of collab — knipafspraak via Salonhub.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </section>
        </div>
      </PageFrame>
    </AppShell>
  )
}
