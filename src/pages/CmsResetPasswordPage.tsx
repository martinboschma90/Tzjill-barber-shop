import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { updatePassword } from '@/lib/auth'

export function CmsResetPasswordPage() {
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    if (!supabase) return
    const { data } = supabase.auth.onAuthStateChange((event) => { if (event === 'PASSWORD_RECOVERY') setReady(true) })
    // The recovery link may have been consumed before this lazy route mounts.
    void supabase.auth.getSession().then(({ data }) => setReady(Boolean(data.session)))
    return () => data.subscription.unsubscribe()
  }, [])
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    if (password.length < 12) { setError('Gebruik minimaal 12 tekens.'); return }
    if (password !== confirm) { setError('De wachtwoorden zijn niet gelijk.'); return }
    setBusy(true)
    const result = await updatePassword(password)
    setBusy(false)
    if (result.error) { setError('Wijzigen mislukt. Open een nieuwe herstellink.'); return }
    setPassword(''); setConfirm(''); setDone(true)
    await supabase?.auth.signOut()
  }
  return <div data-cms className="flex min-h-svh items-center justify-center bg-neutral-50 p-6 text-neutral-900"><div className="w-full max-w-sm space-y-5"><h1 className="text-xl font-semibold">Nieuw wachtwoord</h1>{done ? <p role="status">Je wachtwoord is gewijzigd. <Link className="underline" to="/cms/login">Inloggen</Link></p> : ready ? <form onSubmit={submit} className="space-y-4"><label className="block">Wachtwoord<input className="mt-2 w-full rounded-lg border p-3" type="password" autoComplete="new-password" minLength={12} required value={password} onChange={(event) => setPassword(event.target.value)} /></label><label className="block">Herhaal wachtwoord<input className="mt-2 w-full rounded-lg border p-3" type="password" autoComplete="new-password" required value={confirm} onChange={(event) => setConfirm(event.target.value)} /></label>{error ? <p role="alert">{error}</p> : null}<button disabled={busy} className="rounded-lg bg-neutral-900 px-4 py-3 text-white">{busy ? 'Opslaan…' : 'Wachtwoord wijzigen'}</button></form> : <p>Open de herstellink uit je e-mail. <Link className="underline" to="/cms/login">Nieuwe link aanvragen</Link></p>}</div></div>
}
