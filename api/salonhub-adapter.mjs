/**
 * Server-side client for Salonhub's public online-appointment API.
 * The browser never calls public.salonhub.nl and never sees a bearer token.
 *
 * Reads (treatments, employees, dates, times) are anonymous.
 * Create / verify / session-start require the bearer the booking SPA ships
 * in its own bundle. SALONHUB_API_KEY overrides that when it is accepted;
 * otherwise we resolve the public widget bearer at runtime.
 */

const API_BASE = 'https://public.salonhub.nl/v3/api'
const WIDGET_ORIGIN = 'https://afspraak.salonhub.nl'
const CLIENT = 'tzjill'
const SALON = 'tzjill'

const GROUP_LABELS = {
  male: 'Heren',
  child: 'Kinderen',
}

let cachedKey = { value: '', at: 0 }
const KEY_TTL_MS = 60 * 60 * 1000

function digits(value) {
  const id = String(value ?? '').trim()
  return /^[0-9]+$/.test(id) ? id : ''
}

function uuid(value) {
  const id = String(value ?? '').trim()
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    ? id
    : ''
}

function clip(value, max) {
  return String(value ?? '')
    .replace(/[\u0000-\u001f]/g, '')
    .trim()
    .slice(0, max)
}

export function toE164Nl(value) {
  const raw = clip(value, 30)
  if (!raw) return ''
  let compact = raw.replace(/[^\d+]/g, '')
  if (compact.startsWith('00')) compact = `+${compact.slice(2)}`
  if (compact.startsWith('+')) {
    const national = compact.slice(1).replace(/\D/g, '')
    return national.length >= 10 ? `+${national}` : ''
  }
  const national = compact.replace(/\D/g, '')
  if (national.startsWith('0')) return national.length >= 10 ? `+31${national.slice(1)}` : ''
  if (national.startsWith('31') && national.length >= 11) return `+${national}`
  return ''
}

function priceLabel(price) {
  const name = String(price?.name || '').replace(/\u00a0/g, ' ').trim()
  return name
}

function flattenTreatments(payload) {
  const groups = payload?.treatments
  if (!groups || typeof groups !== 'object') return []
  const items = []
  for (const [groupId, rows] of Object.entries(groups)) {
    if (!Array.isArray(rows)) continue
    let section = ''
    for (const row of rows) {
      if (!row) continue
      if (row.type === 'section') {
        section = String(row.name || '').trim()
        continue
      }
      if (row.type !== 'treatment' || row.id == null) continue
      items.push({
        id: String(row.id),
        name: String(row.name || '').trim(),
        groupId,
        group: GROUP_LABELS[groupId] || groupId,
        section: section || 'Behandeling',
        minutes: Number(row.length) || 0,
        priceLabel: priceLabel(row.price),
        priceCents: Number(row.price?.value) || 0,
      })
    }
  }
  return items.filter((item) => item.name)
}

async function readJson(res) {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

async function postForm(path, fields) {
  const body = new FormData()
  body.append('client', CLIENT)
  body.append('salon', SALON)
  for (const [key, value] of Object.entries(fields)) {
    if (value == null || value === '') continue
    body.append(key, String(value))
  }
  const res = await fetch(`${API_BASE}/${path}`, {
    method: 'POST',
    headers: { 'Accept-Language': 'nl' },
    body,
  })
  return { status: res.status, data: await readJson(res) }
}

function extractBundleKey(source) {
  const keyed = source.match(
    /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})",kv=/i,
  )
  return keyed?.[1] || ''
}

async function publicWidgetKey() {
  if (cachedKey.value && Date.now() - cachedKey.at < KEY_TTL_MS) return cachedKey.value
  const htmlRes = await fetch(`${WIDGET_ORIGIN}/${CLIENT}/${SALON}`, {
    headers: { Accept: 'text/html' },
  })
  if (!htmlRes.ok) throw new Error('widget_html')
  const html = await htmlRes.text()
  const src = html.match(/src="(\/assets\/index-[^"]+\.js)"/)
  if (!src) throw new Error('widget_bundle')
  const jsRes = await fetch(`${WIDGET_ORIGIN}${src[1]}`)
  if (!jsRes.ok) throw new Error('widget_bundle')
  const key = extractBundleKey(await jsRes.text())
  if (!key) throw new Error('widget_key')
  cachedKey = { value: key, at: Date.now() }
  return key
}

async function bearerCandidates() {
  const envKey = process.env.SALONHUB_API_KEY?.trim() || ''
  const keys = []
  if (envKey) keys.push(envKey)
  try {
    const pub = await publicWidgetKey()
    if (pub && pub !== envKey) keys.push(pub)
  } catch {
    if (!envKey) throw new Error('widget_key')
  }
  return keys
}

async function authorized(url, init) {
  const keys = await bearerCandidates()
  let last = null
  for (const key of keys) {
    const res = await fetch(url, {
      ...init,
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'nl',
        ...(init.headers || {}),
        Authorization: `Bearer ${key}`,
      },
    })
    last = res
    if (res.status !== 401) return res
  }
  return last
}

export async function listTreatments(session) {
  const result = await postForm('OnlineAppointment.Remote.Treatments/get', { session })
  if (result.status !== 200) {
    return { status: 502, payload: { error: 'Behandelingen laden lukt nu niet.' } }
  }
  return { status: 200, payload: { treatments: flattenTreatments(result.data) } }
}

export async function listEmployees(session, treatmentId) {
  const treatment = digits(treatmentId)
  if (!treatment) return { status: 400, payload: { error: 'Kies eerst een behandeling.' } }
  const result = await postForm('OnlineAppointment.Remote.Employees/getForTreatment', {
    session,
    treatment,
  })
  if (result.status !== 200 || !Array.isArray(result.data?.employees)) {
    return { status: 502, payload: { error: 'Kappers laden lukt nu niet.' } }
  }
  const employees = result.data.employees
    .filter((row) => row && (row.type === 'employee' || row.type === 'any') && row.id != null)
    .map((row) => ({
      id: String(row.id),
      name: String(row.name || '').trim(),
      any: row.type === 'any',
    }))
    .filter((row) => row.name)
  employees.sort((a, b) => Number(b.any) - Number(a.any) || a.name.localeCompare(b.name, 'nl'))
  return { status: 200, payload: { employees } }
}

export async function listDates(session, treatmentId, employeeId) {
  const treatment = digits(treatmentId)
  const employee = digits(employeeId)
  if (!treatment || employee === '') {
    return { status: 400, payload: { error: 'Kies een behandeling en een kapper.' } }
  }
  const result = await postForm('OnlineAppointment.Remote.Dates/get', {
    session,
    treatment,
    employee,
    start: 0,
    limit: 42,
  })
  if (result.status !== 200 || !Array.isArray(result.data?.dates)) {
    return { status: 502, payload: { error: 'Dagen laden lukt nu niet.' } }
  }
  const dates = result.data.dates
    .map((row) => (typeof row === 'string' ? row : row?.date))
    .filter((day) => typeof day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(day))
  return { status: 200, payload: { dates } }
}

export async function listTimes(session, treatmentId, employeeId, date) {
  const treatment = digits(treatmentId)
  const employee = digits(employeeId)
  const day = String(date || '')
  if (!treatment || employee === '' || !/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    return { status: 400, payload: { error: 'Kies een dag.' } }
  }
  const result = await postForm('OnlineAppointment.Remote.Times/get', {
    session,
    treatment,
    employee,
    date: day,
  })
  if (result.status !== 200 || !Array.isArray(result.data?.times)) {
    return { status: 502, payload: { error: 'Tijden laden lukt nu niet.' } }
  }
  const times = result.data.times
    .map((row) => (typeof row === 'string' ? row : row?.time))
    .filter((time) => typeof time === 'string' && /^\d{2}:\d{2}:\d{2}$/.test(time))
  return { status: 200, payload: { times } }
}

function customerFrom(body) {
  const customer = body?.customer || {}
  const firstname = clip(customer.firstname, 80)
  const lastname = clip(customer.lastname, 80)
  const email = clip(customer.email, 120)
  const telephone = toE164Nl(customer.telephone)
  if (firstname.length < 2) return { error: 'Vul je voornaam in.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Vul een geldig e-mailadres in.' }
  if (!telephone) return { error: 'Vul een geldig telefoonnummer in.' }
  return { firstname, lastname, email, telephone }
}

export async function createAppointment(body) {
  const session = uuid(body?.session)
  if (!session) return { status: 400, payload: { error: 'Sessie ontbreekt. Begin opnieuw.' } }
  const treatmentId = digits(body?.treatmentId)
  const employeeId = digits(body?.employeeId)
  const date = String(body?.date || '')
  const time = String(body?.time || '')
  const treatmentName = clip(body?.treatmentName, 120)
  const employeeName = clip(body?.employeeName, 120)
  const minutes = Number(body?.minutes)
  if (!treatmentId || !treatmentName) {
    return { status: 400, payload: { error: 'Kies een behandeling.' } }
  }
  if (employeeId === '' || !employeeName) {
    return { status: 400, payload: { error: 'Kies een kapper.' } }
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}:\d{2}$/.test(time)) {
    return { status: 400, payload: { error: 'Kies een dag en een tijd.' } }
  }
  const customer = customerFrom(body)
  if (customer.error) return { status: 400, payload: { error: customer.error } }

  const guid = crypto.randomUUID()
  try {
    const start = new FormData()
    start.append('session', session)
    start.append('client', CLIENT)
    start.append('salon', SALON)
    start.append('guid', guid)
    start.append('application', 'nl.salonhub.afspraak')
    start.append('assistant', 'false')
    await authorized(`${API_BASE}/OnlineAppointment.Remote.Session/start`, {
      method: 'POST',
      body: start,
    })
  } catch {
    // Session start is bookkeeping. Create still carries the same session id.
  }

  const payload = {
    settings: {
      application: 'nl.salonhub.afspraak',
      assistant: false,
      guid,
      origin: '',
      email: {
        enabled: true,
        urls: {
          verify: `${WIDGET_ORIGIN}/{CLIENT}/{SALON}/verify?appointment={APPOINTMENT}&code={CODE}`,
        },
      },
    },
    appointment: {
      date,
      treatments: [
        {
          time,
          treatment: {
            id: Number(treatmentId),
            name: treatmentName,
            length: Number.isFinite(minutes) && minutes > 0 ? minutes : 30,
          },
          employee: {
            id: Number(employeeId),
            name: employeeName,
          },
        },
      ],
    },
    customer: {
      name: { firstname: customer.firstname, lastname: customer.lastname },
      email: customer.email,
      telephone: customer.telephone,
    },
  }

  let res
  try {
    const url = new URL(`${API_BASE}/OnlineAppointment.Remote.Appointments/create`)
    url.searchParams.set('client', CLIENT)
    url.searchParams.set('salon', SALON)
    url.searchParams.set('session', session)
    res = await authorized(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    return { status: 502, payload: { error: 'Afspraak bevestigen lukt nu niet. Bel de salon.' } }
  }

  const data = await readJson(res)
  if (res.status === 409) {
    return { status: 409, payload: { error: 'Dit tijdstip is net vergeven. Kies een andere tijd.' } }
  }
  if (!res.ok || data?.appointment == null) {
    return { status: 502, payload: { error: 'Afspraak bevestigen lukt nu niet. Probeer het opnieuw.' } }
  }
  const status = data.status === 'verify' ? 'verify' : 'confirmed'
  return {
    status: 200,
    payload: {
      ok: true,
      status,
      appointmentId: String(data.appointment),
    },
  }
}

export async function verifyAppointment(body) {
  const session = uuid(body?.session)
  const appointment = digits(body?.appointmentId)
  const code = String(body?.code || '').replace(/\D/g, '')
  if (!session || !appointment) {
    return { status: 400, payload: { error: 'Deze bevestiging is verlopen. Begin opnieuw.' } }
  }
  if (!/^[0-9]{4}$/.test(code)) {
    return { status: 400, payload: { error: 'Vul de code van 4 cijfers in.' } }
  }
  const form = new FormData()
  form.append('session', session)
  form.append('client', CLIENT)
  form.append('salon', SALON)
  form.append('appointment', appointment)
  form.append('code', code)
  let res
  try {
    res = await authorized(`${API_BASE}/OnlineAppointment.Remote.Appointments/verify`, {
      method: 'POST',
      body: form,
    })
  } catch {
    return { status: 502, payload: { error: 'Code controleren lukt nu niet.' } }
  }
  if (res.status === 406) return { status: 406, payload: { error: 'Die code klopt niet.' } }
  if (res.status === 409) {
    return { status: 409, payload: { error: 'Dit tijdstip is niet meer vrij.' } }
  }
  const data = await readJson(res)
  if (!res.ok || data?.status !== 'confirmed') {
    return { status: 502, payload: { error: 'Bevestigen lukt nu niet. Probeer de code opnieuw.' } }
  }
  return { status: 200, payload: { ok: true, status: 'confirmed' } }
}

export async function handleSalonhub(body) {
  const session = uuid(body?.session) || crypto.randomUUID()
  switch (body?.action) {
    case 'treatments':
      return listTreatments(session)
    case 'employees':
      return listEmployees(session, body?.treatmentId)
    case 'dates':
      return listDates(session, body?.treatmentId, body?.employeeId)
    case 'times':
      return listTimes(session, body?.treatmentId, body?.employeeId, body?.date)
    case 'book':
      return createAppointment({ ...body, session: uuid(body?.session) })
    case 'verify':
      return verifyAppointment(body)
    default:
      return { status: 400, payload: { error: 'Onbekende actie.' } }
  }
}
