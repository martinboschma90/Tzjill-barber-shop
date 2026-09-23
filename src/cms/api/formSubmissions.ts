import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export const PROMO_FORM_ID = 'promo-10y'

export type FormDefinition = {
  id: string
  title: string
  description: string
}

/** Known forms. More can be added later; rows are keyed by form_id. */
export const CMS_FORMS: FormDefinition[] = [
  {
    id: PROMO_FORM_ID,
    title: '10 jaar Tzjill',
    description: 'Popup op de site: meld je aan voor te gekke prijzen.',
  },
]

export type FormSubmission = {
  id: string
  form_id: string
  name: string
  email: string
  phone: string
  created_at: string
}

function asSubmission(row: Record<string, unknown>): FormSubmission | null {
  const email = typeof row.email === 'string' ? row.email.trim() : ''
  if (!email) return null
  return {
    id: String(row.id || ''),
    form_id: String(row.form_id || ''),
    name: String(row.name || ''),
    email,
    phone: String(row.phone || ''),
    created_at: String(row.created_at || ''),
  }
}

export async function fetchFormSubmissions(
  formId: string,
): Promise<{ submissions: FormSubmission[]; error: string | null; source: 'supabase' | 'dev' }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('form_submissions')
      .select('id,form_id,name,email,phone,created_at')
      .eq('form_id', formId)
      .order('created_at', { ascending: false })
      .limit(1000)
    if (error) {
      const missing = /form_submissions|PGRST205|schema cache/i.test(error.message || '')
      return {
        submissions: [],
        source: 'supabase',
        error: missing
          ? 'De tabel form_submissions bestaat nog niet. Voer de migratie uit in Supabase.'
          : 'Inzendingen laden mislukt.',
      }
    }
    const submissions = (Array.isArray(data) ? data : [])
      .map((row) => asSubmission(row as unknown as Record<string, unknown>))
      .filter((row): row is FormSubmission => Boolean(row))
    return { submissions, error: null, source: 'supabase' }
  }

  try {
    const response = await fetch(
      `/api/form-submissions?form_id=${encodeURIComponent(formId)}`,
    )
    const payload = (await response.json().catch(() => null)) as {
      submissions?: unknown
      error?: string
    } | null
    if (!response.ok) {
      return {
        submissions: [],
        source: 'dev',
        error: payload?.error || 'Inzendingen laden mislukt.',
      }
    }
    const submissions = (Array.isArray(payload?.submissions) ? payload.submissions : [])
      .map((row) =>
        row && typeof row === 'object'
          ? asSubmission(row as Record<string, unknown>)
          : null,
      )
      .filter((row): row is FormSubmission => Boolean(row))
    return { submissions, error: null, source: 'dev' }
  } catch {
    return { submissions: [], error: 'Inzendingen laden mislukt.', source: 'dev' }
  }
}
