import type { CmsContent } from '@/cms/content'
import { getArtistStatus } from '@/cms/artistVisibility'

export type PublicSnapshot = { site: unknown; team: unknown[]; artists: unknown[] }

/** Same projection as tzjill.build_published / api/content publicSnapshot. */
export function projectPublishedFromDraft(content: CmsContent): PublicSnapshot {
  return {
    site: content.site,
    team: content.team,
    artists: content.artists.filter(
      (artist) => artist.visible !== false && getArtistStatus(artist) === 'published',
    ),
  }
}
let inflight: Promise<PublicSnapshot | null> | null = null
/** Share one request across public site, team and roster hydration. Never return CMS drafts. */
export function fetchPublicSnapshot(): Promise<PublicSnapshot | null> {
  if (inflight) return inflight
  inflight = fetch('/api/content', { cache: 'no-store', signal: AbortSignal.timeout(8000) }).then(async (response) => {
    if (!response.ok) return null
    const data = await response.json()
    return data && typeof data.site === 'object' && Array.isArray(data.team) && Array.isArray(data.artists) ? data as PublicSnapshot : null
  }).catch(() => null).finally(() => { inflight = null })
  return inflight
}
