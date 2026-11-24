import { SiteText } from '@/cms/SiteText'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'
import { MAPS_DIRECTIONS_URL } from '@/data/site'
import { OpenStatus } from '@/components/layout/OpenStatus'
import { buttonClass } from '@/components/ui/buttonStyles'
import { ResolvedImg } from '@/components/ui/ResolvedMedia'
import { phoneHref, safeLink } from '@/lib/contactLinks'
import { useCms } from '@/cms/CmsContext'
import { footerNavMain, footerNavStudio } from '@/lib/siteNav'

export function Footer() {
  const { content } = useCms()
  const { site } = content
  const brandName = site.fullName.trim() || site.name.trim()
  const copyright = site.copyrightText.trim()
    ? site.copyrightText.trim()
    : brandName
      ? `© ${site.year} ${brandName}`
      : ''
  const phone = site.phoneNumber?.trim() ?? ''
  const officeLines = site.legal.addressLines.filter((line) => line.trim())
  const instagram = site.instagram.trim()
  const primaryEmail = site.contact[0]?.email?.trim() ?? ''
  const navMain = footerNavMain(site)
  const navStudio = footerNavStudio(site)

  return (
    <footer className="mt-4 pb-32 md:pb-10">
      <div className="content-wrap grid grid-cols-1 gap-4 lg:grid-cols-[5fr_7fr] lg:gap-6">
        <div className="radius-media flex flex-col justify-between border border-white/10 bg-surface-elevated p-7 text-white lg:p-10">
          <div>
            {site.logoUrl ? (
              <ResolvedImg
                src={site.logoUrl}
                alt={brandName || 'Tzjill'}
                size="team"
                className="h-16 w-auto max-w-full object-contain"
              />
            ) : (
              <Logo tone="white" height={64} />
            )}
            {site.tagline.trim() ? (
              <p className="type-lead mt-8 max-w-xs text-white/60">{site.tagline}</p>
            ) : null}
          </div>

          <div className="mt-12">
            <h3 className="type-label text-white/60">
              <SiteText textKey="Footer.1" />
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {instagram ? (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonClass({
                    variant: 'solid',
                    surface: 'dark',
                    className: 'px-4 py-2.5',
                  })}
                >
                  <SiteText textKey="Footer.2" />
                </a>
              ) : null}
              <a
                href={MAPS_DIRECTIONS_URL}
                target="_blank"
                rel="noreferrer"
                className={buttonClass({
                  variant: 'ghost',
                  surface: 'dark',
                  className: 'px-4 py-2.5',
                })}
              >
                <SiteText textKey="Footer.3" />
              </a>
            </div>
            {copyright ? (
              <p className="type-label mt-10 text-white/60">{copyright}</p>
            ) : null}
          </div>
        </div>

        <div className="radius-media bg-black p-7 text-white lg:p-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,280px)]">
            {navMain.length ? (
              <div>
                <h3 className="type-label text-white/60">
                  <SiteText textKey="Footer.4" />
                </h3>
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
            ) : null}

            {navStudio.length ? (
              <div>
                <h3 className="type-label text-white/60">
                  <SiteText textKey="Footer.5" />
                </h3>
                <nav className="mt-4 flex flex-col gap-2.5">
                  {navStudio.map((link) => (
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
            ) : null}

            <div>
              <h3 className="type-label text-white/60">
                <SiteText textKey="Footer.6" />
              </h3>
              <div className="mt-4 space-y-4">
                {primaryEmail ? (
                  <p>
                    <a
                      href={`mailto:${primaryEmail}`}
                      className="type-ui text-white/60 hover:text-white"
                    >
                      {primaryEmail}
                    </a>
                  </p>
                ) : null}
                {phone ? (
                  <p>
                    <a href={phoneHref(phone)} className="type-ui text-white/60 hover:text-white">
                      {phone}
                    </a>
                  </p>
                ) : null}
                {officeLines.length ? (
                  <div className="type-ui space-y-1 text-white/60">
                    {officeLines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                ) : null}
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
          {site.legalLinks.length ? (
            <nav
              aria-label="Privacy en cookies"
              className="mt-8 flex flex-wrap gap-5 border-t border-white/15 pt-5"
            >
              {site.legalLinks.map((link) => {
                const href =
                  link.href === '#privacy'
                    ? '/privacy'
                    : link.href === '#cookies'
                      ? '/cookies'
                      : link.href === '#terms'
                        ? null
                        : safeLink(link.href)
                return href ? (
                  <a
                    key={href}
                    href={href}
                    className="type-ui text-white/70 underline underline-offset-4"
                  >
                    {link.label}
                  </a>
                ) : null
              })}
            </nav>
          ) : null}
          {site.legal.vat.trim() ? (
            <p className="type-ui mt-4 text-white/70">{site.legal.vat}</p>
          ) : null}
          {site.photoCredits.trim() ? (
            <p className="type-ui mt-2 text-white/70">{site.photoCredits}</p>
          ) : null}
        </div>
      </div>
    </footer>
  )
}