import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ArtistPageSections } from '@/components/artists/ArtistPageSections'
import { usePublicArtist, usePublicArtists } from '@/cms/usePublicArtists'

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let node = document.head.querySelector(selector)
  if (!node) {
    node = document.createElement('meta')
    document.head.appendChild(node)
  }
  for (const [key, value] of Object.entries(attrs)) {
    node.setAttribute(key, value)
  }
}

export function ArtistPage() {
  const { slug = '' } = useParams()
  const { artist: publicArtist, checkingRemote } = usePublicArtist(slug)
  const { artists } = usePublicArtists()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  useEffect(() => {
    const name = publicArtist?.name?.trim()
    const label = name || slug.replace(/-/g, ' ')
    const title = name
      ? `${name} | Kapper bij Tzjill in Leeuwarden`
      : checkingRemote
        ? `${label} | Kapper bij Tzjill in Leeuwarden`
        : `${label} | Kapper niet gevonden bij Tzjill`
    const description = name
      ? `${name} knipt bij Tzjill Barber & Lounge aan de Voorstreek 18 in Leeuwarden. Bekijk het profiel en maak een afspraak.`
      : checkingRemote
        ? `${label} is kapper bij Tzjill Barber & Lounge aan de Voorstreek 18 in Leeuwarden.`
        : `${label} staat niet op de site van Tzjill in Leeuwarden. Bekijk het team en maak een afspraak.`
    document.title = title
    upsertMeta('meta[name="description"]', { name: 'description', content: description })
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title })
    upsertMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: description,
    })
  }, [checkingRemote, publicArtist, slug])

  if (!publicArtist && checkingRemote) {
    return (
      <AppShell navVariant="wordmark">
        <div
          className="px-4 pb-8 pt-20 sm:px-6 sm:pt-24 lg:px-8"
          aria-busy="true"
          aria-label="Loading artist"
        >
          <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-10">
            <div className="h-12 max-w-sm rounded-lg bg-ink/10 lg:col-span-7 lg:col-start-6" />
            <div
              className="w-full rounded-[1.5rem] bg-ink/10 lg:col-span-5 lg:col-start-1 lg:row-span-2 lg:row-start-1"
              style={{ aspectRatio: '3 / 4' }}
            />
            <div className="space-y-3 lg:col-span-7 lg:col-start-6">
              <div className="h-10 w-40 rounded-full bg-ink/10" />
              <div className="h-24 max-w-xl rounded-xl bg-ink/10" />
            </div>
          </div>
        </div>
      </AppShell>
    )
  }

  if (!publicArtist) {
    return (
      <AppShell navVariant="wordmark">
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
          <h1 className="type-display text-[clamp(2.5rem,7vw,4.5rem)] text-ink">
            Artist not found
          </h1>
          <Link
            to="/"
            className="type-ui mt-6 rounded-full bg-ink px-5 py-2.5 text-xs text-ink-inverse"
          >
            Back to roster
          </Link>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell navVariant="wordmark">
      <ArtistPageSections artist={publicArtist} artists={artists} />
    </AppShell>
  )
}
