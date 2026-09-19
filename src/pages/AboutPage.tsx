import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { PageFrame } from '@/components/layout/PageFrame'
import { TeamSection } from '@/components/about/TeamSection'
import { Testimonials } from '@/components/home/Testimonials'
import { PillButton } from '@/components/ui/PillButton'
import { BookButton } from '@/components/booking/BookButton'
import { useCms } from '@/cms/CmsContext'
import { INSTAGRAM_HANDLE, shopInstagramUrl } from '@/data/site'

const stats = [
  { n: '3', label: 'Specialismen' },
  { n: '6', label: 'Dagen open' },
  { n: '11', label: 'Kids t/m' },
  { n: '18', label: 'Voorstreek' },
]

const missionItems = [
  {
    title: 'Elke coupe is maatwerk',
    text: 'Strak, classic of fade — altijd in verhouding met je gezicht.',
  },
  {
    title: 'Traditioneel, met de technieken van nu',
    text: 'Knippen, scheren, baard. Hot towel straight razor als het erom gaat.',
  },
  {
    title: 'Een look die bij je past',
    text: 'Persoonlijkheid, stijl en gezichtsvorm. Niet een trend van de week.',
  },
  {
    title: 'Haar, baard en gezicht',
    text: 'Verzorging in de lounge. Producten koop je in de zaak.',
  },
]

function SectionKicker({ children }: { children: string }) {
  return (
    <p className="type-label inline-flex items-center justify-center gap-2 rounded-full bg-[#efeae3] px-3.5 py-1.5 text-[#2c241c]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#2c241c]" aria-hidden />
      {children}
    </p>
  )
}

function AboutHeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    el.muted = true
    void el.play().catch(() => {})
  }, [])

  return (
    <div className="relative mt-12 overflow-hidden rounded-[1.75rem] bg-black sm:mt-14 sm:rounded-[2rem]">
      <video
        ref={videoRef}
        className="aspect-[16/10] w-full object-cover sm:aspect-[2/1]"
        src="/brand/hero.mp4"
        poster="/brand/hero.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        controls={false}
        disablePictureInPicture
      />
    </div>
  )
}

export function AboutPage() {
  const { content } = useCms()
  const { site } = content
  const [open, setOpen] = useState(0)
  const team = content.team.filter((member) => member.name.trim())

  return (
    <AppShell navVariant="wordmark">
      <PageFrame>
        <div className="mx-auto max-w-3xl text-center">
          <SectionKicker>Over ons</SectionKicker>
          <h1 className="type-headline mt-6">
            A man’s world.
            <br />
            In de stoel.
          </h1>
          <p className="type-lead mx-auto mt-5 max-w-lg text-white/55">
            {site.about[0] ||
              'Trendy haircuts en hot towel straight razor shaves. Voorstreek, Leeuwarden.'}
          </p>
        </div>

        <AboutHeroVideo />

        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {stats.map((item) => (
            <li
              key={item.label}
              className="rounded-[1.5rem] bg-[#efeae3] px-5 py-6 text-[#2c241c] sm:rounded-[1.75rem] sm:px-6 sm:py-8"
            >
              <p className="type-headline leading-none">{item.n}</p>
              <p className="type-label mt-3 text-[#2c241c]/50">{item.label}</p>
            </li>
          ))}
        </ul>

        <div className="mx-auto mt-20 max-w-3xl text-center sm:mt-24">
          <SectionKicker>Missie</SectionKicker>
          <h2 className="type-headline mt-6">Onze missie</h2>
          <p className="type-lead mx-auto mt-5 max-w-lg text-white/55">
            Elke coupe maatwerk — knippen, scheren, baard. Traditioneel barbierwerk,
            met de technieken van nu.
          </p>
        </div>

        <div className="mt-14 grid items-start gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <p className="type-subhead max-w-md text-white">
              Wij geven je de look die past bij persoonlijkheid, stijl en
              gezichtsvorm.
            </p>
            <ul className="mt-8 space-y-3">
              {missionItems.map((item, index) => {
                const isOpen = open === index
                return (
                  <li
                    key={item.title}
                    className={`group overflow-hidden rounded-[1.25rem] border transition-colors duration-300 sm:rounded-[1.5rem] ${
                      isOpen
                        ? 'border-[#efeae3] bg-[#efeae3]'
                        : 'border-white/12 bg-white/[0.03] hover:border-[#efeae3] hover:bg-[#efeae3]'
                    }`}
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpen(index)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
                    >
                      <span
                        className={`type-lead ${
                          isOpen
                            ? 'text-[#2c241c]'
                            : 'text-white group-hover:text-[#2c241c]'
                        }`}
                      >
                        {item.title}
                      </span>
                      <span
                        aria-hidden
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${
                          isOpen
                            ? 'bg-[#2c241c] text-[#efeae3]'
                            : 'border border-white/25 text-white/70'
                        }`}
                      >
                        {isOpen ? '×' : '↓'}
                      </span>
                    </button>
                    <div
                      className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                        isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p
                          className={`type-lead px-5 pb-5 sm:px-6 ${
                            isOpen ? 'text-[#2c241c]/60' : 'text-white/50'
                          }`}
                        >
                          {item.text}
                        </p>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="overflow-hidden rounded-[1.75rem] bg-black sm:rounded-[2rem] lg:col-span-6">
            <img
              src="/lookbook/05.png"
              alt=""
              className="aspect-[4/5] w-full object-cover lg:aspect-auto lg:h-full lg:min-h-[36rem]"
            />
          </div>
        </div>

        <div className="mx-auto mt-20 max-w-3xl text-center sm:mt-24">
          <SectionKicker>Team</SectionKicker>
          <h2 className="type-headline mt-6">
            Meet
            <br />
            the team
          </h2>
          <p className="type-lead mx-auto mt-5 max-w-lg text-white/55">
            {team.length
              ? 'De kappers achter de coupe.'
              : 'Kies je kapper bij het boeken in Salonhub.'}
          </p>
        </div>
        {team.length ? (
          <>
            <div className="mt-14">
              <TeamSection members={team} />
            </div>
            <div className="mt-10 text-center">
              <Link to="/team" className="type-ui text-white/50 hover:text-white">
                Alle kappers →
              </Link>
            </div>
          </>
        ) : (
          <div className="mt-10 text-center">
            <Link to="/booking" className="type-ui text-white/50 hover:text-white">
              Afspraak maken →
            </Link>
          </div>
        )}
      </PageFrame>

      <Testimonials />

      <PageFrame>
        <div className="rounded-[1.75rem] bg-black px-8 py-14 text-center sm:rounded-[2rem] sm:px-12 sm:py-16">
          <SectionKicker>Studio</SectionKicker>
          <h2 className="type-headline mt-6">Klaar voor de stoel?</h2>
          <p className="type-lead mx-auto mt-5 max-w-md text-white/55">
            Boek via Salonhub. Voorstreek 18, Leeuwarden.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <BookButton surface="dark">Afspraak maken</BookButton>
            <PillButton
              href={shopInstagramUrl(content.site.instagram)}
              target="_blank"
              rel="noreferrer"
              variant="ghost"
              surface="dark"
              arrow={false}
            >
              {INSTAGRAM_HANDLE}
            </PillButton>
          </div>
        </div>
      </PageFrame>
    </AppShell>
  )
}
