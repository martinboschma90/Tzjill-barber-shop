import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { PageFrame } from '@/components/layout/PageFrame'
export function NotFoundPage() {
  useEffect(() => { document.title = 'Pagina niet gevonden | Tzjill'; const meta = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]'); if (meta) meta.content = 'noindex, nofollow' }, [])
  return <AppShell><PageFrame><h1 className="type-headline">Pagina niet gevonden</h1><p className="type-lead mt-5">Deze pagina bestaat niet meer of het adres klopt niet.</p><Link to="/" className="type-ui mt-8 inline-block underline">Terug naar Home</Link></PageFrame></AppShell> }
