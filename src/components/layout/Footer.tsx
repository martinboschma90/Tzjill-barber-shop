import { Link } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'
import { publicNav } from '@/data/nav'
import {
  INSTAGRAM_URL,
  MAPS_DIRECTIONS_URL,
  PHONE_DISPLAY,
  PHONE_TEL,
} from '@/data/site'
import { useCms } from '@/cms/CmsContext'

const hoursCompact = [
  { days: 'Ma – wo', time: '10:00 – 18:00' },
  { days: 'Do – za', time: '09:00 – 20:00' },
  { days: 'Zondag', time: 'Gesloten' },
]

const navMid = Math.ceil(publicNav.length / 2)
const navMain = publicNav.slice(0, navMid)
const navMore = publicNav.slice(navMid)

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
            <Logo tone="white" height={64} />
            <p className="type-lead mt-8 max-w-xs text-white/60">
              A man’s world. Knippen, scheren, baard — Voorstreek, Leeuwarden.
            </p>
          </div>

          <div className="mt-12">
            <h3 className="type-label text-white/60">Volg ons</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={instagram}
                target="_blank"
                rel="noreferrer"
                className="type-ui inline-flex items-center gap-2 rounded-full border border-[#efeae3] bg-[#efeae3] px-4 py-2.5 text-[#2c241c] transition-transform duration-300 hover:-translate-y-px hover:border-white hover:bg-white"
              >
                Instagram
              </a>
              <a
                href={MAPS_DIRECTIONS_URL}
                target="_blank"
                rel="noreferrer"
                className="type-ui inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2.5 text-white/80 transition-[color,background-color,border-color,transform] duration-300 hover:-translate-y-px hover:border-white hover:bg-white hover:text-[#2c241c]"
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
                {navMore.map((link) => (
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
                    href="mailto:info@tzjill.nl"
                    className="type-ui text-white/60 hover:text-white"
                  >
                    info@tzjill.nl
                  </a>
                </p>
                {phone ? (
                  <p>
                    <a
                      href={`tel:${PHONE_TEL}`}
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
                <ul className="max-w-[280px] space-y-2 pt-2">
                  {hoursCompact.map((row) => (
                    <li
                      key={row.days}
                      className="type-body flex justify-between gap-4 whitespace-nowrap"
                    >
                      <span className="text-white/60">{row.days}</span>
                      <span className="text-white/70">{row.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
