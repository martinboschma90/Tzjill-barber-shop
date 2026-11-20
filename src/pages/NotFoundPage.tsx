import { SiteText } from '@/cms/SiteText'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { PageFrame } from '@/components/layout/PageFrame'
export function NotFoundPage() {
  useEffect(() => { document.title = 'Pagina niet gevonden | Tzjill'; const meta = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]'); if (meta) meta.content = 'noindex, nofollow' }, [])
  return <AppShell><PageFrame><h1 className="type-headline"><SiteText textKey="NotFoundPage.1" /></h1><p className="type-lead mt-5"><SiteText textKey="NotFoundPage.2" /></p><Link to="/" className="type-ui mt-8 inline-block underline"><SiteText textKey="NotFoundPage.3" /></Link></PageFrame></AppShell> }
