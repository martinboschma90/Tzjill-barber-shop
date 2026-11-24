import { SiteText } from '@/cms/SiteText'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { PageFrame } from '@/components/layout/PageFrame'
import { TeamSection } from '@/components/about/TeamSection'
import { Testimonials } from '@/components/home/Testimonials'
import { PillButton } from '@/components/ui/PillButton'
import { BookButton } from '@/components/booking/BookButton'
import { useCms } from '@/cms/CmsContext'
import { siteText, type TextDefaultKey } from '@/cms/siteText'
import { Parallax } from '@/components/motion/Parallax'
import { Reveal } from '@/components/motion/Reveal'
import { ResolvedImg } from '@/components/ui/ResolvedMedia'
import { useReducedMotion } from 'framer-motion'
import { useResolvedMediaUrl } from '@/cms/media/useResolvedMediaUrl'
import { feedFrameClass, HERO_POSTER } from '@/data/feed'
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '@/data/site'
import type { SiteContent } from '@/cms/content'

const STAT_INDICES = [1, 2, 3, 4] as const
const MISSION_INDICES = [1, 2, 3, 4] as const

function aboutStats(site: SiteContent) {
  return STAT_INDICES.map((index) => ({
    n: siteText(site, `AboutStats.${index}.n` as TextDefaultKey),
    label: siteText(site, `AboutStats.${index}.label` as TextDefaultKey),
  })).filter((item) => item.n.trim() || item.label.trim())
}

function aboutMission(site: SiteContent) {
  return MISSION_INDICES.map((index) => ({
    title: siteText(site, `AboutMission.${index}.title` as TextDefaultKey),
    text: siteText(site, `AboutMission.${index}.text` as TextDefaultKey),
  })).filter((item) => item.title.trim() || item.text.trim())
}

function SectionKicker({ children }: { children: import('react').ReactNode }) {
  return (
    <p className="type-label inline-flex items-center justify-center gap-2 rounded-full bg-[#efeae3] px-3.5 py-1.5 text-[#2c241c]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#2c241c]" aria-hidden />
      {children}
    </p>
  )
}

function AboutHeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { content } = useCms()
  const reduced = useReducedMotion()
  const videoField = content.site.aboutHeroVideoUrl?.trim() ?? ''
  const posterField = content.site.aboutImages[0]?.trim() ?? ''
  const video = useResolvedMediaUrl(videoField || null)
  const poster = useResolvedMediaUrl(
    posterField || null,
    posterField ? undefined : HERO_POSTER,
  )

  useEffect(() => {
    const el = videoRef.current
    if (!el || reduced) return
    el.muted = true
    void el.play().catch(() => {})
  }, [reduced, video])

  if (!videoField && !posterField && !poster) return null

  return (
    <div className="relative mt-12 overflow-hidden radius-media bg-black sm:mt-14">
      {reduced || !videoField || !/\.(mp4|webm|mov)(?:[?#]|$)/i.test(video) ? (
        poster ? (
          <ResolvedImg
            src={poster}
            alt=""
            size="full"
            className="aspect-[16/10] w-full object-cover sm:aspect-[2/1]"
          />
        ) : null
      ) : (
        <video
          ref={videoRef}
          className="aspect-[16/10] w-full object-cover sm:aspect-[2/1]"
          src={video}
          poster={poster || undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          controls={false}
          disablePictureInPicture
        />
      )}
    </div>
  )
}

export function AboutPage() {
  const { content } = useCms()
  const { site } = content
  const [open, setOpen] = useState(0)
  const team = site.teamVisible === false ? [] : content.team.filter((member) => member.name.trim())
  const stats = useMemo(() => aboutStats(site), [site])
  const missionItems = useMemo(() => aboutMission(site), [site])
  const intro = site.about[0]?.trim() ?? ''
  const body = site.about
    .slice(1)
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n')
  const sideImage = site.aboutImages[1]?.trim() ?? ''

  return (
    <AppShell navVariant="wordmark">
      <PageFrame>
        <div className="mx-auto max-w-3xl text-center">
          <SectionKicker>
            <SiteText textKey="AboutPage.1" />
          </SectionKicker>
          {site.aboutTitle.trim() ? (
            <h1 className="type-headline mt-6">{site.aboutTitle}</h1>
          ) : null}
          {intro ? (
            <p className="type-lead mx-auto mt-5 max-w-lg text-white/55">{intro}</p>
          ) : null}
        </div>

        <AboutHeroVideo />

        {stats.length ? (
          <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {stats.map((item, index) => (
              <li key={`${item.label}-${index}`}>
                <Reveal delay={index * 0.06}>
                  <div className="rounded-3xl bg-cream-soft px-5 py-6 text-ink sm:px-6 sm:py-8">
                    {item.n.trim() ? (
                      <p className="type-headline leading-none">{item.n}</p>
                    ) : null}
                    {item.label.trim() ? (
                      <p className="type-label mt-3 text-[#2c241c]/50">{item.label}</p>
                    ) : null}
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mx-auto mt-20 max-w-3xl text-center sm:mt-24">
          <SectionKicker>
            <SiteText textKey="AboutPage.2" />
          </SectionKicker>
          <h2 className="type-headline mt-6">
            <SiteText textKey="AboutPage.3" />
          </h2>
          {body ? (
            <p className="type-lead mx-auto mt-5 max-w-lg whitespace-pre-line text-white/55">
              {body}
            </p>
          ) : null}
        </div>

        {missionItems.length || sideImage ? (
          <div className="mt-14 grid items-start gap-10 lg:grid-cols-12 lg:gap-16">
            {missionItems.length ? (
              <div className="lg:col-span-6">
                <p className="type-subhead max-w-md text-white">
                  <SiteText textKey="AboutPage.4" />
                </p>
                <ul className="mt-8 space-y-3">
                  {missionItems.map((item, index) => {
                    const isOpen = open === index
                    return (
                      <li
                        key={`${item.title}-${index}`}
                        className={`group overflow-hidden rounded-[1.25rem] border transition-colors duration-300 sm:rounded-[1.5rem] ${
                          isOpen
                            ? 'border-[#efeae3] bg-[#efeae3]'
                            : 'border-white/12 bg-white/[0.03] hover:border-[#efeae3] hover:bg-[#efeae3]'
                        }`}
                      >
                        {item.title.trim() ? (
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
                        ) : null}
                        {item.text.trim() ? (
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
                        ) : null}
                      </li>
                    )
                  })}
                </ul>
              </div>
            ) : null}

            {sideImage ? (
              <div
                className={`group overflow-hidden radius-media bg-black ${
                  missionItems.length ? 'lg:col-span-6' : 'lg:col-span-12'
                }`}
              >
                <Parallax distance={18} className="h-full">
                  <ResolvedImg
                    src={sideImage}
                    alt=""
                    className={`wf-media-zoom aspect-[4/5] h-[112%] w-full object-cover lg:aspect-auto lg:h-[112%] lg:min-h-[36rem] ${feedFrameClass}`}
                  />
                </Parallax>
              </div>
            ) : null}
          </div>
        ) : null}

        {site.teamVisible !== false ? (
          <>
            <div className="mx-auto mt-20 max-w-3xl text-center sm:mt-24">
              <SectionKicker>
                <SiteText textKey="AboutPage.5" />
              </SectionKicker>
              <h2 className="type-headline mt-6">
                <SiteText textKey="AboutPage.6" />
                <br />
                <SiteText textKey="AboutPage.7" />
              </h2>
              <p className="type-lead mx-auto mt-5 max-w-lg text-white/55">
                {team.length ? (
                  <SiteText textKey="AboutPage.teamIntroWithTeam" />
                ) : (
                  <SiteText textKey="AboutPage.teamIntroEmpty" />
                )}
              </p>
            </div>
            {team.length ? (
              <>
                <div className="mt-14">
                  <TeamSection members={team} />
                </div>
                <div className="mt-10 text-center">
                  <Link to="/team" className="type-ui text-white/50 hover:text-white">
                    <SiteText textKey="AboutPage.8" />
                  </Link>
                </div>
              </>
            ) : (
              <div className="mt-10 text-center">
                <BookButton surface="dark">
                  <SiteText textKey="AboutPage.9" />
                </BookButton>
              </div>
            )}
          </>
        ) : null}
      </PageFrame>

      <Testimonials />

      <PageFrame>
        <div className="panel-cta">
          <SectionKicker>
            <SiteText textKey="AboutPage.10" />
          </SectionKicker>
          <h2 className="type-headline mt-6">
            <SiteText textKey="AboutPage.11" />
          </h2>
          <p className="type-lead mx-auto mt-5 max-w-md text-white/55">
            <SiteText textKey="AboutPage.12" />
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <BookButton surface="dark">
              <SiteText textKey="AboutPage.13" />
            </BookButton>
            <PillButton
              href={INSTAGRAM_URL}
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