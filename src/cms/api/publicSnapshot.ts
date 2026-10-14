export type PublicSnapshot = { site: unknown; team: unknown[]; artists: unknown[] }
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
