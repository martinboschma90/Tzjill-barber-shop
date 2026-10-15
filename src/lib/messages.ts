export async function submitMessage(payload: Record<string, unknown>): Promise<void> {
  const response = await fetch('/api/message', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(20_000) })
  const result = await response.json().catch(() => null)
  if (!response.ok || result?.ok !== true) throw new Error(result?.error || 'Verzenden mislukt. Probeer opnieuw of mail de salon.')
}
