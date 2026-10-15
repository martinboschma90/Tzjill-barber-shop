import { json } from './http-security.mjs'
export function publicSnapshot(blob) {
  if (!blob || !blob.site || typeof blob.site !== 'object' || !Array.isArray(blob.team) || !Array.isArray(blob.artists)) return null
  return { site: blob.site, team: blob.team, artists: blob.artists.filter((artist) => artist && artist.visible !== false && (artist.status || 'published') === 'published') }
}
export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' })
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return json(res, 503, { error: 'Publieke inhoud is nog niet geconfigureerd.' })
  try {
    const response = await fetch(`${url}/rest/v1/cms_content?key=eq.tzjill-cms-content-v1&select=data&limit=1`, { headers: { apikey: key, Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(5000) })
    if (!response.ok) return json(res, 502, { error: 'Inhoud ophalen lukt nu niet.' })
    const [row] = await response.json()
    const content = publicSnapshot(row?.data)
    if (!content) return json(res, 404, { error: 'Geen gepubliceerde inhoud.' })
    return json(res, 200, content)
  } catch { return json(res, 502, { error: 'Inhoud ophalen lukt nu niet.' }) }
}
