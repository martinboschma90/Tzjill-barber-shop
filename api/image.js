import sharp from 'sharp'
const WIDTHS = new Set([96, 400, 640, 720, 1100, 1440])
export default async function handler(req, res) {
  if (req.method !== 'GET') { res.statusCode = 405; res.end(); return }
  let url
  try { url = new URL(String(req.query?.src || '')) } catch { res.statusCode = 400; res.end(); return }
  const project = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  let allowedHost = ''
  try { allowedHost = new URL(project).hostname } catch { /* fail closed */ }
  const width = Number(req.query?.width)
  if (!allowedHost || url.hostname !== allowedHost || url.protocol !== 'https:' || url.username || url.password || !url.pathname.startsWith('/storage/v1/object/public/media/') || !WIDTHS.has(width)) { res.statusCode = 400; res.end(); return }
  try {
    const original = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(10_000) })
    if (!original.ok || !/^image\/(webp|png|jpeg|avif|gif)/i.test(original.headers.get('content-type') || '') || Number(original.headers.get('content-length') || 0) > 12000000) throw new Error('invalid image')
    const reader = original.body.getReader()
    const chunks = []
    let bytes = 0
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      bytes += value.length
      if (bytes > 12000000) { await reader.cancel(); throw new Error('image too large') }
      chunks.push(Buffer.from(value))
    }
    const image = await sharp(Buffer.concat(chunks), { limitInputPixels: 40000000 }).rotate().resize(width, null, { withoutEnlargement: true }).webp({ quality: 80 }).toBuffer()
    res.setHeader('Content-Type', 'image/webp')
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400')
    res.end(image)
  } catch { res.statusCode = 502; res.setHeader('Cache-Control', 'no-store'); res.end() }
}
