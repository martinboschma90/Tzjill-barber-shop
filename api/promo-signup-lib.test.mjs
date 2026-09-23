import assert from 'node:assert/strict'
import test from 'node:test'
import {
  acceptPromoSignup,
  buildPromoRow,
  clearPromoSignupMemory,
  handlePromoSignupList,
  isValidPromoPayload,
  savePromoSignup,
} from './promo-signup-lib.mjs'

const sample = {
  name: '  Noa Bakker ',
  email: 'Noa@Example.nl',
  phone: '+31 6 12345678',
}

function snapshotEnv() {
  return {
    PROMO_SIGNUP_MEMORY: process.env.PROMO_SIGNUP_MEMORY,
    VERCEL: process.env.VERCEL,
    SUPABASE_URL: process.env.SUPABASE_URL,
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
  }
}

function restoreEnv(saved) {
  for (const [key, value] of Object.entries(saved)) {
    if (value == null) delete process.env[key]
    else process.env[key] = value
  }
}

function mockRes() {
  return {
    statusCode: 0,
    body: '',
    setHeader() {},
    end(payload) {
      this.body = payload
    },
  }
}

test('normalizes the popup payload', () => {
  assert.equal(isValidPromoPayload(sample), true)
  assert.equal(isValidPromoPayload({ ...sample, phone: '0201234567' }), false)
  const row = buildPromoRow(sample, { userAgent: 'TestAgent', path: '/prijzen?x=1' })
  assert.deepEqual(
    {
      name: row.name,
      email: row.email,
      phone: row.phone,
      source: row.source,
      path: row.path,
    },
    {
      name: 'Noa Bakker',
      email: 'noa@example.nl',
      phone: '0612345678',
      source: 'popup-10y',
      path: '/prijzen',
    },
  )
  assert.equal(buildPromoRow(sample, { path: 'https://evil.example' }).path, null)
})

test('memory store keeps one row per email and skips a second email', async () => {
  const saved = snapshotEnv()
  clearPromoSignupMemory()
  process.env.PROMO_SIGNUP_MEMORY = '1'
  delete process.env.VERCEL
  delete process.env.SUPABASE_URL
  delete process.env.VITE_SUPABASE_URL
  delete process.env.SUPABASE_SERVICE_ROLE_KEY

  let sends = 0
  const first = await acceptPromoSignup(sample, { path: '/' }, {
    sendEmail: async () => {
      sends += 1
      return { ok: false }
    },
  })
  assert.deepEqual(first, { ok: true, duplicate: false, emailed: false })

  const second = await acceptPromoSignup(
    { ...sample, name: 'Noa B.', phone: '0611111111' },
    { path: '/contact' },
    {
      sendEmail: async () => {
        sends += 1
        return { ok: true }
      },
    },
  )
  assert.deepEqual(second, { ok: true, duplicate: true, emailed: false })
  assert.equal(sends, 1)

  const res = mockRes()
  await handlePromoSignupList({ method: 'GET', headers: {} }, res)
  const body = JSON.parse(res.body)
  assert.equal(res.statusCode, 200)
  assert.equal(body.total, 1)
  assert.equal(body.signups[0].name, 'Noa B.')
  assert.equal(body.signups[0].phone, '0611111111')
  assert.equal(body.signups[0].email, 'noa@example.nl')

  clearPromoSignupMemory()
  restoreEnv(saved)
})

test('a failed database write does not report success', async () => {
  const saved = snapshotEnv()
  process.env.PROMO_SIGNUP_MEMORY = '1'
  process.env.VERCEL = '1'
  delete process.env.SUPABASE_URL
  delete process.env.VITE_SUPABASE_URL
  delete process.env.SUPABASE_SERVICE_ROLE_KEY

  const result = await savePromoSignup(sample)
  assert.equal(result.ok, false)

  restoreEnv(saved)
})

test('supabase insert stores the normalized row and still succeeds if mail fails', async () => {
  const saved = snapshotEnv()
  delete process.env.PROMO_SIGNUP_MEMORY
  delete process.env.VERCEL
  process.env.SUPABASE_URL = 'https://example.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test'

  const calls = []
  const fetchImpl = async (url, init = {}) => {
    calls.push({ url: String(url), method: init.method || 'GET', body: init.body || '' })
    if (!init.method || init.method === 'GET') {
      return {
        ok: true,
        status: 200,
        json: async () => [],
        text: async () => '[]',
        headers: { get: () => null },
      }
    }
    return {
      ok: true,
      status: 201,
      json: async () => [],
      text: async () => '',
      headers: { get: () => null },
    }
  }

  const result = await acceptPromoSignup(
    sample,
    { userAgent: 'ua', path: '/' },
    {
      fetch: fetchImpl,
      sendEmail: async () => {
        throw new Error('resend down')
      },
    },
  )
  assert.deepEqual(result, { ok: true, duplicate: false, emailed: false })
  const insert = calls.find((call) => call.method === 'POST')
  assert.ok(insert)
  assert.equal(
    insert.body,
    JSON.stringify({
      name: 'Noa Bakker',
      email: 'noa@example.nl',
      phone: '0612345678',
      source: 'popup-10y',
      user_agent: 'ua',
      path: '/',
    }),
  )
  assert.match(insert.url, /^https:\/\/example\.supabase\.co\/rest\/v1\/promo_signups$/)

  restoreEnv(saved)
})

test('an existing email is updated and does not insert again', async () => {
  const saved = snapshotEnv()
  delete process.env.PROMO_SIGNUP_MEMORY
  delete process.env.VERCEL
  process.env.SUPABASE_URL = 'https://example.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test'

  const calls = []
  const fetchImpl = async (url, init = {}) => {
    calls.push(init.method || 'GET')
    if (!init.method || init.method === 'GET') {
      return {
        ok: true,
        status: 200,
        json: async () => [{ id: 'row-1', created_at: '2026-09-01T00:00:00.000Z' }],
        text: async () => '',
        headers: { get: () => null },
      }
    }
    return {
      ok: true,
      status: 204,
      json: async () => [],
      text: async () => '',
      headers: { get: () => null },
    }
  }

  const result = await savePromoSignup(sample, { path: '/' }, { fetch: fetchImpl })
  assert.deepEqual(result, { ok: true, duplicate: true })
  assert.deepEqual(calls, ['GET', 'PATCH'])

  restoreEnv(saved)
})

test('the CMS list stays closed without a session', async () => {
  const saved = snapshotEnv()
  delete process.env.PROMO_SIGNUP_MEMORY
  delete process.env.VERCEL
  process.env.SUPABASE_URL = 'https://example.supabase.co'
  process.env.SUPABASE_ANON_KEY = 'anon-test'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test'

  const res = mockRes()
  await handlePromoSignupList({ method: 'GET', headers: {} }, res)
  assert.equal(res.statusCode, 401)

  restoreEnv(saved)
})
