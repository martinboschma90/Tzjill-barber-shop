import { randomUUID } from 'node:crypto'

function normalizeNlMobile(value) {
  const digits = String(value || '').replace(/\D/g, '')
  if (digits.startsWith('316') && digits.length === 11) {
    return `0${digits.slice(2)}`
  }
  return digits
}

export const PROMO_FORM_ID = 'promo-10y'

const devRows = []

function supabaseEnv() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  return {
    url: String(url).trim(),
    serviceKey: String(serviceKey).trim(),
  }
}

export function devFormStoreAllowed() {
  return !process.env.VERCEL && process.env.NODE_ENV !== 'production'
}

export function usesDevFormStore() {
  const { url, serviceKey } = supabaseEnv()
  return devFormStoreAllowed() && !(url && serviceKey)
}

export function resetDevFormStore() {
  devRows.length = 0
}

export function listDevFormSubmissions(formId) {
  const wanted = String(formId || '').trim()
  return devRows
    .filter((row) => !wanted || row.form_id === wanted)
    .slice()
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
}

function devUpsert(lead) {
  const existing = devRows.find(
    (row) => row.form_id === lead.form_id && row.email === lead.email,
  )
  if (existing) {
    existing.name = lead.name
    existing.phone = lead.phone
    existing.meta = {
      ...(existing.meta || {}),
      ...(lead.meta || {}),
      resubmitted_at: new Date().toISOString(),
    }
    return { ok: true, id: existing.id, duplicate: true, storage: 'dev' }
  }
  const created = {
    id: randomUUID(),
    form_id: lead.form_id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    created_at: new Date().toISOString(),
    meta: lead.meta || {},
  }
  devRows.push(created)
  return { ok: true, id: created.id, duplicate: false, storage: 'dev' }
}

export function normalizeFormLead(payload, formId = PROMO_FORM_ID) {
  return {
    form_id: formId,
    name: String(payload?.name || '').trim(),
    email: String(payload?.email || '').trim().toLowerCase(),
    phone: normalizeNlMobile(payload?.phone),
    meta: { source: 'promo-popup' },
  }
}

async function saveViaSupabase(lead, url, serviceKey) {
  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
  }
  const rpc = await fetch(`${url}/rest/v1/rpc/save_form_submission`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      p_form_id: lead.form_id,
      p_name: lead.name,
      p_email: lead.email,
      p_phone: lead.phone,
      p_meta: lead.meta,
    }),
  }).catch(() => null)

  if (rpc?.ok) {
    const data = await rpc.json().catch(() => null)
    return {
      ok: true,
      id: data?.id ? String(data.id) : null,
      duplicate: Boolean(data?.duplicate),
      storage: 'supabase',
    }
  }

  if (rpc && rpc.status !== 404) {
    console.warn('[form-submissions] save failed', rpc.status)
    return { ok: false, error: 'Kon de aanmelding niet opslaan.' }
  }

  const upsert = await fetch(
    `${url}/rest/v1/form_submissions?on_conflict=form_id,email`,
    {
      method: 'POST',
      headers: {
        ...headers,
        Prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify({
        form_id: lead.form_id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        meta: lead.meta,
      }),
    },
  ).catch(() => null)

  if (!upsert?.ok) {
    console.warn('[form-submissions] upsert failed', upsert?.status || 'network')
    return { ok: false, error: 'Kon de aanmelding niet opslaan.' }
  }

  const rows = await upsert.json().catch(() => null)
  const row = Array.isArray(rows) ? rows[0] : rows
  return {
    ok: true,
    id: row?.id ? String(row.id) : null,
    duplicate: false,
    storage: 'supabase',
  }
}

/** Insert or refresh one lead. Same email + form updates the existing row. */
export async function recordFormSubmission(payload, formId = PROMO_FORM_ID) {
  const lead = normalizeFormLead(payload, formId)
  const { url, serviceKey } = supabaseEnv()
  if (url && serviceKey) {
    return saveViaSupabase(lead, url, serviceKey)
  }
  if (usesDevFormStore()) {
    return devUpsert(lead)
  }
  return { ok: false, error: 'Opslag is niet geconfigureerd.' }
}
