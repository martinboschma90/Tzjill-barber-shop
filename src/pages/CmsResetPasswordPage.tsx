import {useEffect,useRef,useState,type FormEvent} from 'react'
import {Link} from 'react-router-dom'
import {supabase} from '@/lib/supabase'
import {updatePassword} from '@/lib/auth'
export function CmsResetPasswordPage(){
 const [status,setStatus]=useState<'loading'|'invalid'|'ready'|'done'>('loading')
 const [password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[show,setShow]=useState(false)
 const submitting=useRef(false)
 useEffect(()=>{
 if(!supabase){setStatus('invalid');return}
 let cancelled=false
 const hasLinkError=new URLSearchParams(window.location.hash.slice(1)).has('error')||new URLSearchParams(window.location.search).has('error')
 if(hasLinkError){setStatus('invalid');return}
 const {data}=supabase.auth.onAuthStateChange((event,session)=>{if(cancelled)return;if(event==='PASSWORD_RECOVERY'||event==='SIGNED_IN')setStatus(session?'ready':'invalid');if(event==='SIGNED_OUT')setStatus(previous=>previous==='done'?'done':'invalid')})
 void supabase.auth.getSession().then(({data,error})=>{if(!cancelled)setStatus(previous=>previous==='ready'?previous:error||!data.session?'invalid':'ready')}).catch(()=>{if(!cancelled)setStatus('invalid')})
 return ()=>{cancelled=true;data.subscription.unsubscribe()}
 },[])
 async function submit(event:FormEvent){event.preventDefault();if(submitting.current||status!=='ready')return;setError('');if(password.length<12){setError('Gebruik minimaal 12 tekens.');return}if(password!==confirm){setError('De wachtwoorden zijn niet gelijk.');return}submitting.current=true;setBusy(true)
 try{const result=await updatePassword(password);if(result.error){setError('Wijzigen mislukt. Vraag een nieuwe herstellink aan.');return}setPassword('');setConfirm('');setStatus('done');await supabase?.auth.signOut()}catch{setError('Verbinding mislukt. Probeer het opnieuw.')}finally{submitting.current=false;setBusy(false)}}
 const field='mt-2 w-full rounded-lg border border-neutral-300 p-3 text-sm focus:border-neutral-900'
 return <main data-cms data-cms-theme="light" className="flex min-h-svh items-center justify-center bg-neutral-50 p-6 text-neutral-900"><div className="w-full max-w-sm space-y-5 rounded-2xl border bg-white p-6 shadow-sm"><h1 className="text-2xl font-semibold">Wachtwoord instellen</h1>{status==='loading'?<p role="status">Je link controleren…</p>:status==='done'?<p role="status">Je wachtwoord is ingesteld. <Link className="underline" to="/cms/login">Inloggen</Link></p>:status==='ready'?<form onSubmit={submit} className="space-y-4"><p className="text-sm text-neutral-600">Kies een wachtwoord van minimaal 12 tekens.</p><label className="block text-sm font-medium">Nieuw wachtwoord<input className={field} type={show?'text':'password'} autoComplete="new-password" minLength={12} required disabled={busy} value={password} onChange={e=>setPassword(e.target.value)}/></label><label className="block text-sm font-medium">Herhaal wachtwoord<input className={field} type={show?'text':'password'} autoComplete="new-password" required disabled={busy} value={confirm} onChange={e=>setConfirm(e.target.value)}/></label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={show} onChange={e=>setShow(e.target.checked)}/>Wachtwoord tonen</label>{error&&<p role="alert" className="text-sm text-red-700">{error}</p>}<button disabled={busy} className="min-h-11 w-full rounded-lg bg-neutral-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy?'Opslaan…':'Wachtwoord instellen'}</button></form>:<div className="space-y-3 text-sm"><p role="alert">Deze link is ongeldig of verlopen. Gebruik de nieuwste link uit je e-mail of vraag een nieuwe aan.</p><Link className="underline" to="/cms/login">Nieuwe herstellink aanvragen</Link></div>}</div></main>
}
