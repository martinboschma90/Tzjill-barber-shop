import { Link } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'
import { publicNav } from '@/data/nav'
import {
  INSTAGRAM_URL,
  MAPS_DIRECTIONS_URL,
  PHONE_DISPLAY,
} from '@/data/site'
import { OpenStatus } from '@/components/layout/OpenStatus'
import { buttonClass } from '@/components/ui/buttonStyles'
import { ResolvedImg } from '@/components/ui/ResolvedMedia'
import { phoneHref, safeLink } from '@/lib/contactLinks'
import { useCms } from '@/cms/CmsContext'


const navMain = publicNav.slice(0, 4)
const navMore = publicNav.slice(4)

export function Footer() {
  const { content } = useCms()
  const { site } = content
  const brandName = site.fullName.trim() || site.name.trim() || 'Tzjill'
  const copyright = site.copyrightText.trim() || `© ${site.year} ${brandName}`
  const phone = site.phoneNumber?.trim() || PHONE_DISPLAY
  const officeLines = site.legal.addressLines.filter((line) => line.trim())
  const instagram = site.instagram.trim() || INSTAGRAM_URL

  return (
    <footer className="mt-4 pb-32 md:pb-10">
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-4 px-6 lg:grid-cols-[5fr_7fr] lg:gap-6 lg:px-8">
        <div className="flex flex-col justify-between rounded-[1.75rem] border border-white/10 bg-[#252421] p-7 text-white lg:p-10">
          <div>
            {site.logoUrl ? <ResolvedImg src={site.logoUrl} alt={brandName} size="team" className="h-16 w-auto max-w-full object-contain" /> : <Logo tone="white" height={64} />}
            <p className="type-lead mt-8 max-w-xs text-white/60">
              {site.tagline}
            </p>
          </div>

          <div className="mt-12">
            <h3 className="type-label text-white/60">Volg ons</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={instagram}
                target="_blank"
                rel="noreferrer"
                className={buttonClass({ variant: 'solid', surface: 'dark', className: 'px-4 py-2.5' })}
              >
                Instagram
              </a>
              <a
                href={MAPS_DIRECTIONS_URL}
                target="_blank"
                rel="noreferrer"
                className={buttonClass({ variant: 'ghost', surface: 'dark', className: 'px-4 py-2.5' })}
              >
                Route
              </a>
            </div>
            <p className="type-label mt-10 text-white/60">{copyright}</p>
          </div>
        </div>

        <div className="rounded-[1.75rem] bg-black p-7 text-white lg:p-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,280px)]">
            <div>
              <h3 className="type-label text-white/60">Pagina’s</h3>
              <nav className="mt-4 flex flex-col gap-2.5">
                {navMain.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="type-ui text-white/60 hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <h3 className="type-label text-white/60">Studio</h3>
              <nav className="mt-4 flex flex-col gap-2.5">
                {navMore.filter((link) => link.to !== '/team' || site.teamVisible !== false).map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="type-ui text-white/60 hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <h3 className="type-label text-white/60">Get in touch</h3>
              <div className="mt-4 space-y-4">
                <p>
                  <a
                    href={`mailto:${site.contact[0]?.email || 'info@tzjill.nl'}`}
                    className="type-ui text-white/60 hover:text-white"
                  >
                    {site.contact[0]?.email || 'info@tzjill.nl'}
                  </a>
                </p>
                {phone ? (
                  <p>
                    <a
                      href={phoneHref(phone)}
                      className="type-ui text-white/60 hover:text-white"
                    >
                      {phone}
                    </a>
                  </p>
                ) : null}
                <div className="type-ui space-y-1 text-white/60">
                  {officeLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
                <OpenStatus className="pt-2 text-white/70" />
                <ul className="max-w-[280px] space-y-2 pt-3">
                  {site.openingHours.map((row) => (
                    <li
                      key={row.day}
                      className="type-body nums flex justify-between gap-3"
                    >
                      <span className="text-white/60">{row.day}</span>
                      <span className="text-white/70">{row.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <nav aria-label="Privacy en cookies" className="mt-8 flex flex-wrap gap-5 border-t border-white/15 pt-5">
            {site.legalLinks.map((link) => {
              const href = link.href === '#privacy' ? '/privacy' : link.href === '#cookies' ? '/cookies' : link.href === '#terms' ? null : safeLink(link.href)
              return href ? <a key={href} href={href} className="type-ui text-white/70 underline underline-offset-4">{link.label}</a> : null
            })}
          </nav>
          {site.legal.vat ? <p className="type-ui mt-4 text-white/70">{site.legal.vat}</p> : null}
          {site.photoCredits ? <p className="type-ui mt-2 text-white/70">{site.photoCredits}</p> : null}
        </div>
      </div>
    </footer>
  )
}
