import type { Artist } from '@/types/artist'

/** Tzjill is barber-only. Music-roster leftovers live in leftoverArtists.ts. */
const roster: Artist[] = []

export const artists: Artist[] = roster

export const allArtists: Artist[] = roster

export function getRosterImageUrl(slug: string): string | undefined {
  const hit = roster.find((a) => a.slug === slug)
  const url = hit?.imageUrl?.trim()
  return url && /^https?:\/\//i.test(url) ? url : undefined
}
