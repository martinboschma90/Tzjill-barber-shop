import { sendBookingEmail } from './booking-request-lib.mjs'
import { json, verifyCmsUser } from './cms-session.mjs'

const PROMO_SOURCE = 'popup-10y'
const OWNER_EMAIL = 'martin@viraal.media'
const STORAGE_ERROR = 'Aanmelding kon niet worden opgeslagen. Probeer het opnieuw.'
const LIST_LIMIT = 2000

/** Dev-only rows when Vite has no Supabase service role. Never used on Vercel. */
const memorySignups = []

export function clearPromoSignupMemory() {
  memorySignups.length = 0
}

export function isValidPromoEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())
}

export function isNlMobile(value) {
  const digits = String(value || '').replace(/\D/g, '')
  if (/^06\d{8}$/.test(digits)) return true
  if (/^316\d{8}$/.test(digits)) return true
  return false
}

export function normalizeNlMobile(value) {
  const digits = String(value || '').replace(/\D/g, '')
  if (digits.startsWith('316') && digits.length === 11) {
    return `0${digits.slice(2)}`
  }
  return digits
}

export function isValidPromoPayload(payload) {
  if (!payload || typeof payload !== 'object') return false
  const name = String(payload.name || '').trim()
  const email = String(payload.email || '').trim()
  const phone = String(payload.phone || '').trim()
  if (name.length < 2 || name.length > 80) return false
  if (!isValidPromoEmail(email) || email.length > 200) return false
  if (!isNlMobile(phone)) return false
  return true
}

export function formatPromoEmail({ name, email, phone }) {
  const mobile = normalizeNlMobile(phone)
  return {
    subject: `10 jaar Tzjill — aanmelding: ${name}`,
    text: [
      'NIEUWE AANMELDING — 10 jaar Tzjill (2016–2026)',
      '',
      `Naam: ${name}`,
      `E-mail: ${email}`,
      `06: ${mobile}`,
      '',
      'Bron: site popup “Meld je aan voor te gekke prijzen”.',
    ].join('\n'),
    replyTo: email,
  }
}

export async function sendPromoSignupEmail(payload) {
  const name = String(payload.name || '').trim()
  const email = String(payload.email || '').trim()
  const phone = String(payload.phone || '').trim()
  const { subject, text, replyTo } = formatPromoEmail({ name, email, phone })
  const to =
    process.env.PROMO_TO_EMAIL ||
    process.env.BOOKING_TO_EMAIL ||
    'info@tzjill.nl'
  return sendBookingEmail({ subject, text, replyTo, to })
}

function supabaseEnv() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  return { url: url.replace(/\/$/, ''), serviceKey }
}

function memoryStoreActive() {
  if (process.env.PROMO_SIGNUP_MEMORY !== '1') return false
  if (process.env.VERCEL) return false
  const { url, serviceKey } = supabaseEnv()
  return !(url && serviceKey)
}

function clip(value, max) {
  const text = String(value || '').replace(/[\r\n]+/g, ' ').trim()
  if (!text) return null
  return text.slice(0, max)
}

export function safePromoPath(value) {
  const raw = String(value || '').trim().split(/[?#]/)[0]
  if (!raw.startsWith('/') || raw.startsWith('//')) return null
  if (raw.includes('\\') || raw.includes('..')) return null
  return raw.slice(0, 200)
}

export function buildPromoRow(payload, meta = {}) {
  return {
    name: String(payload.name || '').trim(),
    email: String(payload.email || '').trim().toLowerCase(),
    phone: normalizeNlMobile(payload.phone),
    source: PROMO_SOURCE,
    user_agent: clip(meta.userAgent, 500),
    path: safePromoPath(meta.path),
  }
}

function serviceHeaders(serviceKey, extra = {}) {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
    ...extra,
  }
}

async function findStoredSignup(row, fetchImpl) {
  const { url, serviceKey } = supabaseEnv()
  const query = new URLSearchParams({
    select: 'id,created_at',
    email: `eq.${row.email}`,
    source: `eq.${row.source}`,
    limit: '1',
  })
  const response = await fetchImpl(`${url}/rest/v1/promo_signups?${query}`, {
    headers: serviceHeaders(serviceKey),
  })
  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    console.warn('[promo-signup] lookup', response.status, detail)
    return { ok: false }
  }
  const rows = await response.json().catch(() => [])
  const existing = Array.isArray(rows) ? rows[0] : null
  return { ok: true, existing: existing || null }
}

async function insertStoredSignup(row, fetchImpl) {
  const { url, serviceKey } = supabaseEnv()
  const response = await fetchImpl(`${url}/rest/v1/promo_signups`, {
    method: 'POST',
    headers: serviceHeaders(serviceKey, { Prefer: 'return=minimal' }),
    body: JSON.stringify(row),
  })
  if (response.ok) return { ok: true, conflict: false }
  const detail = await response.text().catch(() => '')
  if (response.status === 409 || detail.includes('23505')) {
    return { ok: true, conflict: true }
  }
  console.warn('[promo-signup] insert', response.status, detail)
  return { ok: false }
}

async function updateStoredSignup(id, row, fetchImpl) {
  const { url, serviceKey } = supabaseEnv()
  const response = await fetchImpl(
    `${url}/rest/v1/promo_signups?id=eq.${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      headers: serviceHeaders(serviceKey, { Prefer: 'return=minimal' }),
      body: JSON.stringify({
        name: row.name,
        phone: row.phone,
        user_agent: row.user_agent,
        path: row.path,
      }),
    },
  )
  if (response.ok) return { ok: true }
  const detail = await response.text().catch(() => '')
  console.warn('[promo-signup] update', response.status, detail)
  return { ok: false }
}

function saveMemorySignup(row) {
  const index = memorySignups.findIndex(
    (item) => item.email === row.email && item.source === row.source,
  )
  if (index >= 0) {
    const current = memorySignups[index]
    memorySignups[index] = {
      ...current,
      name: row.name,
      phone: row.phone,
      user_agent: row.user_agent,
      path: row.path,
      updated_at: new Date().toISOString(),
    }
    return { ok: true, duplicate: true }
  }
  memorySignups.push({
    id: crypto.randomUUID(),
    ...row,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
  return { ok: true, duplicate: false }
}

/**
 * Persist a validated signup.
 * Duplicate email+source updates the row and reports duplicate (no second email).
 * A stored row is success even when the notification mail later fails.
 */
export async function savePromoSignup(payload, meta = {}, deps = {}) {
  if (!isValidPromoPayload(payload)) {
    return { ok: false, error: 'Vul naam, e-mail en een 06-nummer in.' }
  }
  const row = buildPromoRow(payload, meta)
  if (!/^06\d{8}$/.test(row.phone)) {
    return { ok: false, error: 'Vul naam, e-mail en een 06-nummer in.' }
  }

  if (memoryStoreActive()) return saveMemorySignup(row)

  const { url, serviceKey } = supabaseEnv()
  if (!url || !serviceKey) {
    return { ok: false, error: STORAGE_ERROR }
  }

  const fetchImpl = deps.fetch || globalThis.fetch
  const found = await findStoredSignup(row, fetchImpl).catch((error) => {
    console.warn('[promo-signup] lookup failed', error)
    return { ok: false }
  })
  if (!found.ok) return { ok: false, error: STORAGE_ERROR }

  if (found.existing?.id) {
    const updated = await updateStoredSignup(found.existing.id, row, fetchImpl).catch(
      (error) => {
        console.warn('[promo-signup] update failed', error)
        return { ok: false }
      },
    )
    if (!updated.ok) return { ok: false, error: STORAGE_ERROR }
    return { ok: true, duplicate: true }
  }

  const inserted = await insertStoredSignup(row, fetchImpl).catch((error) => {
    console.warn('[promo-signup] insert failed', error)
    return { ok: false }
  })
  if (!inserted.ok) return { ok: false, error: STORAGE_ERROR }
  if (!inserted.conflict) return { ok: true, duplicate: false }

  const again = await findStoredSignup(row, fetchImpl).catch(() => ({ ok: false }))
  if (!again.ok || !again.existing?.id) return { ok: false, error: STORAGE_ERROR }
  const updated = await updateStoredSignup(again.existing.id, row, fetchImpl).catch(() => ({
    ok: false,
  }))
  if (!updated.ok) return { ok: false, error: STORAGE_ERROR }
  return { ok: true, duplicate: true }
}

export async function acceptPromoSignup(payload, meta = {}, deps = {}) {
  const saved = await savePromoSignup(payload, meta, deps)
  if (!saved.ok) return saved
  if (saved.duplicate) return { ok: true, duplicate: true, emailed: false }

  const send = deps.sendEmail || sendPromoSignupEmail
  try {
    const sent = await send(payload)
    return { ok: true, duplicate: false, emailed: Boolean(sent?.ok) }
  } catch (error) {
    console.warn('[promo-signup] email failed after save', error)
    return { ok: true, duplicate: false, emailed: false }
  }
}

function isOwnerEmail(email) {
  return String(email || '').trim().toLowerCase() === OWNER_EMAIL
}

async function canReadPromoSignups(user) {
  if (isOwnerEmail(user.email)) return true
  const { url, serviceKey } = supabaseEnv()
  if (!url || !serviceKey) return false
  const response = await fetch(
    `${url}/rest/v1/user_roles?user_id=eq.${encodeURIComponent(user.id)}&select=role`,
    { headers: serviceHeaders(serviceKey) },
  )
  if (!response.ok) return false
  const rows = await response.json().catch(() => [])
  const role = Array.isArray(rows) ? rows[0]?.role : null
  return role === 'admin' || role === 'editor'
}

function mapSignup(row) {
  return {
    id: String(row.id || ''),
    name: String(row.name || ''),
    email: String(row.email || ''),
    phone: String(row.phone || ''),
    source: String(row.source || PROMO_SOURCE),
    path: row.path ? String(row.path) : null,
    created_at: String(row.created_at || ''),
  }
}

export async function listPromoSignups(deps = {}) {
  if (memoryStoreActive()) {
    const signups = [...memorySignups]
      .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
      .slice(0, LIST_LIMIT)
      .map(mapSignup)
    return {
      ok: true,
      signups,
      total: memorySignups.length,
      truncated: memorySignups.length > signups.length,
    }
  }

  const { url, serviceKey } = supabaseEnv()
  if (!url || !serviceKey) {
    return { ok: false, error: 'SUPABASE_SERVICE_ROLE_KEY ontbreekt op de server.' }
  }

  const fetchImpl = deps.fetch || globalThis.fetch
  const query = new URLSearchParams({
    select: 'id,name,email,phone,source,path,created_at',
    order: 'created_at.desc',
    limit: String(LIST_LIMIT),
  })
  const response = await fetchImpl(`${url}/rest/v1/promo_signups?${query}`, {
    headers: serviceHeaders(serviceKey, {
      Prefer: 'count=exact',
      Range: `0-${LIST_LIMIT - 1}`,
    }),
  })
  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    console.warn('[promo-signup] list', response.status, detail)
    return { ok: false, error: 'Aanmeldingen laden mislukt.' }
  }
  const rows = await response.json().catch(() => [])
  const signups = (Array.isArray(rows) ? rows : []).map(mapSignup)
  const range = response.headers?.get?.('content-range') || ''
  const totalMatch = /\/(\d+)\s*$/.exec(String(range))
  const total = totalMatch ? Number(totalMatch[1]) : signups.length
  return {
    ok: true,
    signups,
    total,
    truncated: total > signups.length,
  }
}

export async function handlePromoSignupList(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }
  if (req.method !== 'GET') {
    json(res, 405, { error: 'Method not allowed' })
    return
  }

  if (!memoryStoreActive()) {
    const user = await verifyCmsUser(req)
    if (!user) {
      json(res, 401, { error: 'Niet ingelogd of sessie verlopen.' })
      return
    }
    const { serviceKey } = supabaseEnv()
    if (!serviceKey) {
      json(res, 503, { error: 'SUPABASE_SERVICE_ROLE_KEY ontbreekt op de server.' })
      return
    }
    const allowed = await canReadPromoSignups(user)
    if (!allowed) {
      json(res, 403, { error: 'Alleen admins en editors kunnen aanmeldingen bekijken.' })
      return
    }
  }

  const listed = await listPromoSignups()
  if (!listed.ok) {
    json(res, 502, { error: listed.error || 'Aanmeldingen laden mislukt.' })
    return
  }
  json(res, 200, {
    signups: listed.signups,
    total: listed.total,
    truncated: listed.truncated,
  })
}
