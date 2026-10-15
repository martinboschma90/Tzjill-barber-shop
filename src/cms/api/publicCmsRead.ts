import { fetchPublicSnapshot } from '@/cms/api/publicSnapshot'
import {
  parsePublicArtistsPayload,
} from '@/cms/api/publicArtistsFormat'
import { PUBLIC_ARTISTS_STORAGE_KEY } from '@/cms/storageKeys'
import { withArtDirection } from '@/cms/imageFocus'
import { coerceArtist } from '@/cms/mappers/artist'
import { restGet } from '@/lib/publicRest'
import { visibleArtists } from '@/cms/artistVisibility'
import type { Artist } from '@/types/artist'

export type CmsContentRow = {
  key: string
  data: unknown
  updated_at: string
}

export type CmsArtistRow = {
  id: string
  slug: string
  data: unknown
  updated_at: string
}

function parseArtist(data: unknown, fallbackSlug: string): Artist | null {
  if (!data || typeof data !== 'object') return null
  const artist = data as Artist
  if (!artist.name) return null
  return coerceArtist(
    withArtDirection({
      ...artist,
      slug: artist.slug || fallbackSlug,
    }),
  )
}

async function fetchPublicCmsArtistsByKey(
  key: string,
): Promise<Artist[] | null> {
  const data = await restGet<CmsContentRow[]>(
    `cms_content?key=eq.${encodeURIComponent(key)}&select=data,updated_at&limit=1`,
  )
  return parsePublicArtistsPayload(data?.[0]?.data)
}

/** Public roster snapshot — same key pushCmsSnapshot writes. REST only. */
export async function fetchPublicCmsArtistsRow(): Promise<Artist[] | null> {
  const snapshot = await fetchSnapshotArtists()
  return snapshot ?? fetchPublicCmsArtistsByKey(PUBLIC_ARTISTS_STORAGE_KEY)
}

/** Single published artist blob — REST only, no supabase-js. */
export async function fetchPublicCmsArtistBySlug(
  slug: string,
): Promise<Artist | null> {
  const data = await restGet<CmsArtistRow[]>(
    `cms_artists?slug=eq.${encodeURIComponent(slug)}&select=slug,data&limit=1`,
  )
  const row = data?.[0]
  if (!row) return null
  return parseArtist(row.data, row.slug)
}

/** A present empty array is authoritative: deleted or unpublished people must not reappear. */
export async function fetchSnapshotArtists(): Promise<Artist[] | null> {
  const blob = await fetchPublicSnapshot()
  if (!blob || typeof blob !== 'object' || !('artists' in blob) || !Array.isArray(blob.artists)) return null
  const artists = blob.artists.map((artist) => parseArtist(artist, (artist as Artist)?.slug || '')).filter((artist): artist is Artist => Boolean(artist))
  return visibleArtists(artists)
}
