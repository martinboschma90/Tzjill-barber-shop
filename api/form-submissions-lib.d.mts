export const PROMO_FORM_ID: string

export function devFormStoreAllowed(): boolean
export function usesDevFormStore(): boolean
export function resetDevFormStore(): void
export function listDevFormSubmissions(formId?: string): Array<{
  id: string
  form_id: string
  name: string
  email: string
  phone: string
  created_at: string
  meta: Record<string, unknown>
}>
export function recordFormSubmission(
  payload: unknown,
  formId?: string,
): Promise<{ ok: boolean; id?: string | null; duplicate?: boolean; error?: string }>
