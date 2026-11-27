import { SiteText } from '@/cms/SiteText'
import { ResolvedImg } from '@/components/ui/ResolvedMedia'
import { AppShell } from '@/components/layout/AppShell'
import { PageFrame } from '@/components/layout/PageFrame'
import { MediaReveal } from '@/components/motion/MediaReveal'
import { ContactForm } from '@/components/contact/ContactForm'
import { LocationMap } from '@/components/contact/LocationMap'
import { BookButton } from '@/components/booking/BookButton'
import { PillButton } from '@/components/ui/PillButton'
import { phoneHref } from '@/lib/contactLinks'
import { useCms } from '@/cms/CmsContext'
import { feedWideClass } from '@/data/feed'
import { useResolvedMediaUrl } from '@/cms/media/useResolvedMediaUrl'


export function ContactPage() {
  const { content } = useCms()
  const { site } = content
  const phone = site.phoneNumber?.trim() ?? ''
  const officeLines = site.legal.addressLines.filter((line) => line.trim())
  const email = site.contact[0]?.email?.trim() ?? ''
  const heroField = site.contactHeroImageUrl?.trim() ?? ''
  const heroSrc = useResolvedMediaUrl(heroField || null)

  return (
    <AppShell navVariant="wordmark">
      <PageFrame>
        <header className="mx-auto max-w-3xl text-center">
          <p className="type-label inline-flex items-center justify-center gap-2 rounded-full bg-pill-on-dark-bg px-3.5 py-1.5 text-pill-on-dark-fg">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2c241c]" aria-hidden /><SiteText textKey="ContactPage.1" /></p>
          <h1 className="type-headline mt-6 text-white">
            <SiteText textKey="ContactPage.2" />
            <br />
            <SiteText textKey="ContactPage.3" />
          </h1>
          {site.contactIntro.trim() ? (
            <p className="type-lead mx-auto mt-5 max-w-lg text-white/55">
              {site.contactIntro.trim()}
            </p>
          ) : null}
        </header>

        {heroSrc ? (
          <MediaReveal className="mt-10 overflow-hidden radius-media bg-black sm:mt-12">
            <ResolvedImg
              src={heroSrc}
              alt="Tzjill Barber & Lounge, Voorstreek 18 Leeuwarden"
              className={`aspect-[16/9] w-full sm:aspect-[2.4/1] ${feedWideClass}`}
            />
          </MediaReveal>
        ) : null}

        <div className="mt-14 grid items-start gap-14 lg:grid-cols-2 lg:gap-20">
          <section>
            <h2 className="type-subhead text-white"><SiteText textKey="ContactPage.4" /></h2>

            <div className="type-body mt-6 space-y-0.5 text-white/80">
              {officeLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <div className="type-body mt-3 space-y-0.5">
              {phone ? (
                <p>
                  <a href={phoneHref(phone)} className="hover:opacity-70">
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
              {site.openingHours.map((row) => (
                <li
                  key={row.day}
                  className="flex items-baseline gap-3 border-b border-white/10 py-2 first:border-t first:border-white/10"
                >
                  <span className="type-body text-[0.9rem] text-white/55">
                    {row.day}
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

            <div className="mt-8 flex flex-wrap gap-3">
              <BookButton surface="dark"><SiteText textKey="ContactPage.5" /></BookButton>
              <PillButton
                href={site.instagram}
                target="_blank"
                rel="noreferrer"
                variant="ghost"
                surface="dark"
                arrow={false}
              ><SiteText textKey="ContactPage.6" /></PillButton>
            </div>
          </section>

          <section>
            <h2 className="type-subhead text-white"><SiteText textKey="ContactPage.7" /></h2>
            <p className="type-body mt-3 max-w-sm text-white/50"><SiteText textKey="ContactPage.8" /></p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </section>
        </div>
      </PageFrame>
    </AppShell>
  )
}
