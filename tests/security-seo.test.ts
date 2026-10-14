import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderSeoHtml, salonSchema } from '@/lib/seo'
import { isAllowedRequest, rateLimit } from '../api/http-security.mjs'
import { validateMessage } from '../api/message.js'
import { openingStatus } from '@/lib/openingStatus'

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })
describe('release metadata', () => {
  const html = '<html><head><title>Old</title><meta name="robots" content="noindex, nofollow" /><meta name="description" content="Old" /><link rel="canonical" href="https://old.test/" /></head></html>'
  it('replaces noindex and root canonical when a real domain is released', () => {
    const result = renderSeoHtml(html, '/prijzen', 'https://tzjill.nl', false)
    expect(result).toContain('content="index, follow"'); expect(result).not.toContain('noindex'); expect(result).toContain('href="https://tzjill.nl/prijzen"'); expect(result).toContain('Prijzen | Tzjill'); expect(result).toContain('og:image'); expect(result).toContain('HairSalon')
  })
  it('keeps preview HTML unindexed', () => { expect(renderSeoHtml(html, '/', 'https://preview.vercel.app', true)).toContain('noindex, nofollow') })
  it('uses CMS opening hours without inventing Sunday availability', () => {
    expect(salonSchema('https://tzjill.nl', 'Shop', '123', ['Street'], [{ day: 'Zondag', time: 'Gesloten' }]).openingHoursSpecification).toEqual([])
    expect(openingStatus(new Date('2026-10-15T18:30:00Z'), [{ day: 'Donderdag', time: '09:00 – 20:00' }]).open).toBe(false)
  })
})
describe('public endpoints', () => {
  it('rejects foreign Origin even when Host is the valid salon domain', () => {
    expect(isAllowedRequest({ headers: { host: 'tzjill.nl', origin: 'https://attacker.test' } })).toBe(false)
    expect(isAllowedRequest({ headers: { host: 'tzjill.nl', origin: 'https://tzjill.nl' } })).toBe(true)
    expect(isAllowedRequest({ headers: { host: 'unrelated.vercel.app' } })).toBe(false)
  })
  it('rejects missing newsletter consent and malformed contact payloads', () => {
    expect(validateMessage({ kind: 'newsletter', email: 'valid@example.com' })).toBeTruthy()
    expect(validateMessage({ kind: 'newsletter', email: 'valid@example.com', consent: true })).toBeNull()
    expect(validateMessage({ kind: 'contact', name: '', email: 'valid@example.com', message: 'x' })).toBeTruthy()
  })
  it('fails closed in production when the shared limiter is unavailable', async () => {
    vi.stubEnv('VERCEL_ENV', 'production'); vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '')
    expect(await rateLimit({ headers: { host: 'tzjill.nl' } })).toBe(false)
  })
})

import { publicSnapshot } from '../api/content.js'
it('public content projection excludes draft and hidden profiles, including an intentionally empty team', () => {
  expect(publicSnapshot({ site: {}, team: [], artists: [{ name: 'Draft', status: 'draft' }, { name: 'Hidden', status: 'published', visible: false }, { name: 'Live', status: 'published', visible: true }] })).toEqual({ site: {}, team: [], artists: [{ name: 'Live', status: 'published', visible: true }] })
})
it('shares the request budget between parallel server instances using compare-and-swap', async () => {
  vi.stubEnv('SUPABASE_URL', 'https://test.supabase.co'); vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'unit-test-only'); vi.spyOn(Math, 'random').mockReturnValue(1)
  const rows = new Map<string, { data: { count: number }; updated_at: string }>()
  let revision = 0
  vi.stubGlobal('fetch', vi.fn(async (input: string, init: RequestInit = {}) => {
    const url = new URL(input)
    const queryKey = url.searchParams.get('key')?.replace(/^eq\./, '')
    const row = queryKey ? rows.get(queryKey) : undefined
    if (!init.method) return new Response(JSON.stringify(row ? [row] : []), { status: 200 })
    const body = JSON.parse(String(init.body))
    if (init.method === 'POST') {
      if (rows.has(body.key)) return new Response('[]', { status: 409 })
      rows.set(body.key, { data: body.data, updated_at: String(++revision) })
      return new Response(JSON.stringify([rows.get(body.key)]), { status: 201 })
    }
    const expected = url.searchParams.get('updated_at')?.replace(/^eq\./, '')
    if (row?.updated_at !== expected) return new Response('[]', { status: 200 })
    const written = { data: body.data, updated_at: String(++revision) }
    rows.set(queryKey!, written)
    return new Response(JSON.stringify([written]), { status: 200 })
  }))
  const outcomes = await Promise.all(Array.from({ length: 12 }, () => rateLimit({ headers: { host: 'tzjill.nl', 'x-forwarded-for': '192.0.2.1' } }, { limit: 3, bucket: 'shared-test' })))
  expect(outcomes.filter(Boolean)).toHaveLength(3)
  expect([...rows.values()][0].data.count).toBe(3)
})

import { validateCmsContent } from '@/cms/validateContent'
import { createDefaultContent } from '@/cms/defaultCmsContent'
it('rejects invalid CMS contact and opening times without blocking valid follow-up edits', () => {
  const content = createDefaultContent()
  content.site.contact[0].email = 'invalid'; expect(validateCmsContent(content)).toContain('e-mailadres')
  content.site.contact[0].email = 'salon@example.com'; content.site.openingHours[0].time = '25:00 – 26:00'; expect(validateCmsContent(content)).toContain('Maandag')
  content.site.openingHours[0].time = '09:00 – 18:00'; expect(validateCmsContent(content)).toBeNull()
})
