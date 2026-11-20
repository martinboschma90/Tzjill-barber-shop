import {useRef,useState,type FormEvent} from 'react'
import {Navigate,useLocation,useNavigate} from 'react-router-dom'
import {requestPasswordReset} from '@/lib/auth'
import {useAuth} from '@/cms/auth/AuthProvider'
import {CmsLockedPage} from '@/cms/auth/CmsLockedPage'
import {isCmsLocalBypassAllowed} from '@/lib/cmsLocalBypass'
import {isSupabaseConfigured} from '@/lib/supabaseEnv'
const field='mt-2 w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-3 text-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200'
export function CmsLoginPage(){
 const {ready,session,authRequired,signIn}=useAuth();const location=useLocation();const navigate=useNavigate()
 const requested=(location.state as {from?:string}|null)?.from
 const from=requested?.startsWith('/cms/')&&!requested.startsWith('/cms/login')&&!requested.startsWith('/cms/reset-password')?requested:'/cms/dashboard'
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState(''),[notice,setNotice]=useState(''),[resetMode,setResetMode]=useState(false),[loading,setLoading]=useState(false),[show,setShow]=useState(false)
 const submitting=useRef(false)
 if(isCmsLocalBypassAllowed())return <Navigate to="/cms/dashboard" replace/>
 if(!isSupabaseConfigured)return <CmsLockedPage/>
 if(authRequired&&ready&&session)return <Navigate to={from} replace/>
 async function submit(event:FormEvent){event.preventDefault();if(submitting.current)return;submitting.current=true;setLoading(true);setError('');setNotice('');try{
 if(resetMode){const result=await requestPasswordReset(email);if(result.error)setError('De herstellink kon niet worden aangevraagd. Probeer het later opnieuw.');else setNotice('Als er een account bestaat, ontvang je een herstellink per e-mail. Controleer ook je spammap.')}
 else{const result=await signIn(email,password);if(result.error)setError('Inloggen lukt niet. Controleer je e-mailadres en wachtwoord en probeer opnieuw.');else navigate(from,{replace:true})}
 }catch{setError('Verbinding mislukt. Probeer het opnieuw.')}finally{submitting.current=false;setLoading(false)}}
 return <main data-cms data-cms-theme="light" className="flex min-h-svh items-center justify-center bg-neutral-50 px-5 py-12 text-neutral-900"><div className="w-full max-w-sm"><p className="mb-6 text-center text-sm font-semibold">Tzjill · Websitebeheer</p><div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"><h1 className="text-2xl font-semibold">{resetMode?'Wachtwoord vergeten?':'Inloggen'}</h1><p className="mt-2 text-sm leading-relaxed text-neutral-600">{resetMode?'Vul het e-mailadres van je account in. Je ontvangt een link om een nieuw wachtwoord te kiezen.':'Log in om de website te beheren.'}</p><form onSubmit={submit} className="mt-6 space-y-4"><label className="block text-sm font-medium">E-mailadres<input type="email" autoComplete="username" required value={email} disabled={loading} onChange={e=>setEmail(e.target.value)} className={field}/></label>{!resetMode&&<><label className="block text-sm font-medium">Wachtwoord<input type={show?'text':'password'} autoComplete="current-password" required value={password} disabled={loading} onChange={e=>setPassword(e.target.value)} className={field}/></label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={show} onChange={e=>setShow(e.target.checked)}/>Wachtwoord tonen</label></>}{error&&<p role="alert" className="text-sm text-red-700">{error}</p>}{notice&&<p role="status" className="text-sm text-emerald-800">{notice}</p>}<button disabled={loading} className="min-h-11 w-full rounded-lg bg-neutral-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{loading?'Bezig…':resetMode?'Herstellink aanvragen':'Inloggen'}</button></form><button type="button" disabled={loading} className="mt-4 min-h-11 text-sm underline" onClick={()=>{setResetMode(!resetMode);setError('');setNotice('');setPassword('')}}>{resetMode?'Terug naar inloggen':'Wachtwoord vergeten?'}</button></div><a href="/" className="mt-6 block text-center text-sm text-neutral-600 underline">Terug naar de website</a></div></main>
}
