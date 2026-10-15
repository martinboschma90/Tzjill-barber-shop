import { afterEach, expect, it, vi } from 'vitest'
import handler from '../api/image.js'
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs() })
it('rejects external image hosts before making any request (SSRF protection)', async () => {
  vi.stubEnv('SUPABASE_URL', 'https://salon.supabase.co')
  const fetch = vi.fn(); vi.stubGlobal('fetch', fetch)
  const res = { statusCode: 200, end: vi.fn(), setHeader: vi.fn() }
  await handler({ method: 'GET', query: { src: 'http://169.254.169.254/latest/meta-data', width: '720' } }, res)
  expect(res.statusCode).toBe(400); expect(fetch).not.toHaveBeenCalled()
})
it('resizes an allowed public image and serves WebP', async () => {
  vi.stubEnv('SUPABASE_URL', 'https://salon.supabase.co')
  const sharp = (await import('sharp')).default
  const source = await sharp({ create: { width: 1000, height: 1500, channels: 3, background: '#000' } }).png().toBuffer()
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(source, { headers: { 'Content-Type': 'image/png' } })))
  let result: Buffer | undefined
  const res = { statusCode: 200, end: vi.fn((data) => { result = data }), setHeader: vi.fn() }
  await handler({ method: 'GET', query: { src: 'https://salon.supabase.co/storage/v1/object/public/media/test.png', width: '400' } }, res)
  expect(res.statusCode).toBe(200); expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/webp')
  expect((await sharp(result).metadata()).width).toBe(400)
})
