import assert from 'node:assert/strict'
import { afterEach, beforeEach, test } from 'node:test'
import {
  listDevFormSubmissions,
  recordFormSubmission,
  resetDevFormStore,
} from './form-submissions-lib.mjs'
import { acceptPromoSignup, promoSignupResponse } from './promo-signup-lib.mjs'

const ENV_KEYS = [
  'NODE_ENV',
  'VERCEL',
  'SUPABASE_URL',
  'VITE_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'RESEND_API_KEY',
]

let savedEnv

beforeEach(() => {
  savedEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]))
  process.env.NODE_ENV = 'development'
  delete process.env.VERCEL
  delete process.env.SUPABASE_URL
  delete process.env.VITE_SUPABASE_URL
  delete process.env.SUPABASE_SERVICE_ROLE_KEY
  delete process.env.RESEND_API_KEY
  resetDevFormStore()
})

afterEach(() => {
  resetDevFormStore()
  for (const key of ENV_KEYS) {
    if (savedEnv[key] == null) delete process.env[key]
    else process.env[key] = savedEnv[key]
  }
})

test('dedupes the same email on one form and keeps the first created_at', async () => {
  const first = await recordFormSubmission({
    name: 'Noor Bakker',
    email: 'Noor@Example.nl',
    phone: '+31 6 12345678',
  })
  const createdAt = listDevFormSubmissions('promo-10y')[0].created_at
  const second = await recordFormSubmission({
    name: 'Noor de Bakker',
    email: 'noor@example.nl',
    phone: '06 98 76 54 32',
  })
  const rows = listDevFormSubmissions('promo-10y')
  assert.equal(first.ok, true)
  assert.equal(first.duplicate, false)
  assert.equal(second.duplicate, true)
  assert.equal(second.id, first.id)
  assert.equal(rows.length, 1)
  assert.equal(rows[0].email, 'noor@example.nl')
  assert.equal(rows[0].phone, '0698765432')
  assert.equal(rows[0].name, 'Noor de Bakker')
  assert.equal(rows[0].created_at, createdAt)
  assert.ok(rows[0].meta.resubmitted_at)
})

test('keeps the lead when mail fails after the row is stored', async () => {
  const original = globalThis.fetch
  globalThis.fetch = async () => ({
    ok: false,
    status: 502,
    text: async () => 'mail down',
    json: async () => ({ success: false, message: 'mail down' }),
  })
  try {
    const result = await acceptPromoSignup({
      name: 'Sem Visser',
      email: 'sem@example.nl',
      phone: '0612345678',
    })
    const http = promoSignupResponse(result)
    assert.equal(result.stored, true)
    assert.equal(result.emailed, false)
    assert.equal(http.status, 200)
    assert.equal(http.body.ok, true)
    assert.equal(http.body.stored, true)
    assert.equal(listDevFormSubmissions('promo-10y').length, 1)
  } finally {
    globalThis.fetch = original
  }
})

test('stores via the service-role RPC and still succeeds if mail fails', async () => {
  process.env.SUPABASE_URL = 'https://example.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key'
  const calls = []
  const original = globalThis.fetch
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), body: init?.body })
    if (String(url).includes('/rpc/save_form_submission')) {
      return { ok: true, status: 200, json: async () => ({ id: 'row-1', duplicate: false }) }
    }
    return {
      ok: false,
      status: 500,
      text: async () => 'resend down',
      json: async () => ({ message: 'resend down' }),
    }
  }
  try {
    const result = await acceptPromoSignup({
      name: 'Isa Mulder',
      email: 'isa@example.nl',
      phone: '06-11112222',
    })
    assert.equal(result.stored, true)
    assert.equal(result.emailed, false)
    assert.equal(promoSignupResponse(result).status, 200)
    assert.equal(listDevFormSubmissions('promo-10y').length, 0)
    const rpc = calls.find((call) => call.url.includes('save_form_submission'))
    const payload = JSON.parse(rpc.body)
    assert.equal(payload.p_form_id, 'promo-10y')
    assert.equal(payload.p_email, 'isa@example.nl')
    assert.equal(payload.p_phone, '0611112222')
    assert.equal(calls[0].url.includes('save_form_submission'), true)
  } finally {
    globalThis.fetch = original
  }
})

test('fails the request when neither the database nor mail accepts the lead', async () => {
  process.env.NODE_ENV = 'production'
  process.env.VERCEL = '1'
  const original = globalThis.fetch
  globalThis.fetch = async () => ({
    ok: false,
    status: 502,
    text: async () => 'down',
    json: async () => ({ success: false }),
  })
  try {
    const result = await acceptPromoSignup({
      name: 'Teun Bos',
      email: 'teun@example.nl',
      phone: '0610101010',
    })
    const http = promoSignupResponse(result)
    assert.equal(result.stored, false)
    assert.equal(result.emailed, false)
    assert.equal(http.status, 502)
    assert.equal(http.body.ok, undefined)
  } finally {
    globalThis.fetch = original
  }
})
