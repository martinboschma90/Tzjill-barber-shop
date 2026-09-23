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
export function safePromoPath(value: unknown): string | null
export function buildPromoRow(
  payload: { name?: unknown; email?: unknown; phone?: unknown },
  meta?: { userAgent?: unknown; path?: unknown },
): {
  name: string
  email: string
  phone: string
  source: string
  user_agent: string | null
  path: string | null
}
export function clearPromoSignupMemory(): void
export function savePromoSignup(
  payload: unknown,
  meta?: { userAgent?: unknown; path?: unknown },
  deps?: { fetch?: typeof fetch },
): Promise<
  | { ok: true; duplicate: boolean }
  | { ok: false; error: string }
>
export function acceptPromoSignup(
  payload: unknown,
  meta?: { userAgent?: unknown; path?: unknown },
  deps?: { fetch?: typeof fetch; sendEmail?: (payload: unknown) => Promise<{ ok: boolean }> },
): Promise<
  | { ok: true; duplicate: boolean; emailed: boolean }
  | { ok: false; error: string }
>
export function handlePromoSignupList(req: unknown, res: unknown): Promise<void>
