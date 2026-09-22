export type LiveTreatment = {
  id: string
  name: string
  groupId: string
  group: string
  minutes: number
  priceLabel: string
  priceCents: number
}

export type LiveEmployee = {
  id: string
  name: string
  any: boolean
}

type ApiError = { error?: string }

async function postSalonhub<T>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch('/api/salonhub', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  })
  const data = (await res.json().catch(() => null)) as (T & ApiError) | null
  if (!res.ok) {
    throw new Error(data?.error || 'De agenda reageert niet.')
  }
  return data as T
}

export function loadTreatments(session: string) {
  return postSalonhub<{ treatments: LiveTreatment[] }>({ action: 'treatments', session })
}

export function loadEmployees(session: string, treatmentId: string) {
  return postSalonhub<{ employees: LiveEmployee[] }>({
    action: 'employees',
    session,
    treatmentId,
  })
}

export function loadDates(session: string, treatmentId: string, employeeId: string) {
  return postSalonhub<{ dates: string[] }>({
    action: 'dates',
    session,
    treatmentId,
    employeeId,
  })
}

export function loadTimes(
  session: string,
  treatmentId: string,
  employeeId: string,
  date: string,
) {
  return postSalonhub<{ times: string[] }>({
    action: 'times',
    session,
    treatmentId,
    employeeId,
    date,
  })
}

export function bookAppointment(
  session: string,
  input: {
    treatmentId: string
    treatmentName: string
    minutes: number
    employeeId: string
    employeeName: string
    date: string
    time: string
    customer: {
      firstname: string
      lastname: string
      email: string
      telephone: string
    }
  },
) {
  return postSalonhub<{ ok: true; status: 'confirmed' | 'verify'; appointmentId: string }>({
    action: 'book',
    session,
    ...input,
  })
}

export function verifyAppointment(session: string, appointmentId: string, code: string) {
  return postSalonhub<{ ok: true; status: 'confirmed' }>({
    action: 'verify',
    session,
    appointmentId,
    code,
  })
}
