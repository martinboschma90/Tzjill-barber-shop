import type { Artist } from '@/types/artist'

/** Seed music roster leftover from the agency template — never show on Tzjill. */
const LEFTOVER_SLUGS = new Set([
  'alber-k',
  'apollonia',
  'audiowave',
  'bavo-mortier',
  'c-man',
  'c-track',
  'cassa-cassa',
  'de-jaren-nul',
  'diskobar-sabrina',
  'dj-creator',
  'dj-licious',
  'dj-yolotanker',
  'double-d',
  'eagl',
  'flo-windey-laurens-luyten',
  'henok-d',
  'henri-pfr',
  'hide-n-seek',
  'jael-ost-magik',
  'kurkdroog',
  'laura-govaerts',
  'laurens-luyten',
  'louis-xiv',
  'magik',
  'manuals',
  'mars',
  'mc-rim',
  'meaghan',
  'mnm-party',
  'nachtdienst',
  'neal-senne',
  'nina-black',
  'nona-van-braeckel',
  'rick-james-80s-party',
  'ruby-xx',
  'tola-og',
])

export function isLeftoverMusicArtist(artist: Pick<Artist, 'slug' | 'name'>): boolean {
  const slug = (artist.slug || '').trim().toLowerCase()
  return Boolean(slug && LEFTOVER_SLUGS.has(slug))
}

export function stripLeftoverMusicArtists<T extends Pick<Artist, 'slug' | 'name'>>(
  artists: T[],
): T[] {
  return artists.filter((artist) => !isLeftoverMusicArtist(artist))
}
