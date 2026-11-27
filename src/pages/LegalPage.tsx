import { SiteText } from '@/cms/SiteText'
import { AppShell } from '@/components/layout/AppShell'
import { PageFrame } from '@/components/layout/PageFrame'
import { useCms } from '@/cms/CmsContext'
export function LegalPage({ kind }: { kind: 'privacy' | 'cookies' }) {
  const { content } = useCms()
  const email = content.site.contact[0]?.email?.trim() ?? ''
  return <AppShell><PageFrame><div className="max-w-3xl space-y-6 text-white/80"><h1 className="type-headline text-white">{kind === 'privacy' ? <SiteText textKey="LegalPage.privacyTitle" /> : <SiteText textKey="LegalPage.cookiesTitle" />}</h1>
    {kind === 'privacy' ? <>
      <p className="type-lead">{content.site.legal.company}<SiteText textKey="LegalPage.1" /></p>
      <h2 className="type-subhead text-white"><SiteText textKey="LegalPage.2" /></h2><p><SiteText textKey="LegalPage.3" /></p>
      <h2 className="type-subhead text-white"><SiteText textKey="LegalPage.4" /></h2><p><SiteText textKey="LegalPage.5" /></p>
      <h2 className="type-subhead text-white"><SiteText textKey="LegalPage.6" /></h2><p><SiteText textKey="LegalPage.7" /></p>
      <h2 className="type-subhead text-white"><SiteText textKey="LegalPage.8" /></h2><p><SiteText textKey="LegalPage.9" />{email ? <a className="underline" href={`mailto:${email}`}>{email}</a> : null}<SiteText textKey="LegalPage.10" /></p>
    </> : <>
      <p className="type-lead"><SiteText textKey="LegalPage.11" /></p>
      <p><SiteText textKey="LegalPage.12" /></p>
      <p><SiteText textKey="LegalPage.13" /></p>
    </>}
    <p className="type-body"><SiteText textKey="LegalPage.14" />{email ? <a className="underline" href={`mailto:${email}`}>{email}</a> : null}</p>
  </div></PageFrame></AppShell>
}
