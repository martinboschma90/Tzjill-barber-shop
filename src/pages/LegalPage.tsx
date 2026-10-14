import { AppShell } from '@/components/layout/AppShell'
import { PageFrame } from '@/components/layout/PageFrame'
import { useCms } from '@/cms/CmsContext'
export function LegalPage({ kind }: { kind: 'privacy' | 'cookies' }) {
  const { content } = useCms()
  const email = content.site.contact[0]?.email || 'info@tzjill.nl'
  return <AppShell><PageFrame><div className="max-w-3xl space-y-6 text-white/80"><h1 className="type-headline text-white">{kind === 'privacy' ? 'Privacy' : 'Cookies en externe diensten'}</h1>
    {kind === 'privacy' ? <>
      <p className="type-lead">{content.site.legal.company} verwerkt de gegevens die je via deze website aan ons geeft.</p>
      <h2 className="type-subhead text-white">Afspraak en contact</h2><p>Voor een afspraak vraagt Salonhub om je naam, e-mailadres en telefoonnummer. Deze gegevens worden gebruikt om je afspraak te maken en te bevestigen. Een contactbericht bevat de gegevens die je zelf invult; het wordt per e-mail bij de salon afgeleverd.</p>
      <h2 className="type-subhead text-white">Aanmeldingen</h2><p>Als je je aanmeldt voor de nieuwsbrief of jubileumactie gebruiken we je opgegeven contactgegevens voor die aanmelding. Je kunt je toestemming intrekken door ons te mailen.</p>
      <h2 className="type-subhead text-white">Diensten achter deze site</h2><p>De website gebruikt Vercel voor hosting en bezoekersstatistieken, Supabase voor het CMS, Salonhub voor afspraken en een e-maildienst voor formulierberichten. De kaart van Google wordt pas geladen als je daar zelf voor kiest.</p>
      <h2 className="type-subhead text-white">Vragen over je gegevens</h2><p>Wil je je gegevens inzien, laten corrigeren of laten verwijderen? Mail <a className="underline" href={`mailto:${email}`}>{email}</a>. Deel alleen gegevens die nodig zijn voor je vraag.</p>
    </> : <>
      <p className="type-lead">De site bewaart lokaal je weergavevoorkeur, de laatst geladen publieke inhoud en of je de jubileumpopup hebt gesloten. CMS-login bewaart daarnaast een sessie op jouw apparaat.</p>
      <p>Vercel Web Analytics wordt gebruikt voor bezoekersstatistieken. De Google-kaart maakt pas verbinding met Google nadat je op ‘Kaart laden’ hebt gedrukt. Via links naar Instagram en Salonhub gelden de instellingen van die diensten.</p>
      <p>Je kunt lokale websitegegevens verwijderen via de privacy-instellingen van je browser. Je hoeft de kaart niet te laden om een afspraak te maken.</p>
    </>}
    <p className="type-body">Contact: <a className="underline" href={`mailto:${email}`}>{email}</a></p>
  </div></PageFrame></AppShell>
}
