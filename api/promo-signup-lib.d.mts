export function isValidPromoEmail(value: unknown): boolean
export function isNlMobile(value: unknown): boolean
export function normalizeNlMobile(value: unknown): string
export function isValidPromoPayload(payload: unknown): boolean
export function formatPromoEmail(payload: {
  name: string
  email: string
  phone: string
}): { subject: string; text: string; replyTo: string }
export function sendPromoSignupEmail(
  payload: unknown,
): Promise<{ ok: true } | { ok: false; error: string }>
export function acceptPromoSignup(payload: unknown): Promise<{
  stored: boolean
  emailed: boolean
  emailError: string | null
}>
export function promoSignupResponse(result: {
  stored?: boolean
  emailed?: boolean
  emailError?: string | null
}): { status: number; body: { ok?: boolean; stored?: boolean; emailed?: boolean; error?: string } }
