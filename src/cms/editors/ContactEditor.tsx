import { useCms } from '@/cms/CmsProvider'
import { EditorSection, TextArea, TextInput } from '@/cms/fields'
import { MediaUrlField } from '@/cms/media/MediaUrlField'

export function ContactEditor() {
  const { content, setSite } = useCms()
  const { site } = content
  const inbox = site.contact[0] ?? { label: 'Mail', email: 'info@tzjill.nl' }

  return (
    <EditorSection title="Contact" description="Gegevens op /contact en in de footer." defaultOpen>
      <TextArea
        label="Intro"
        value={site.contactIntro}
        rows={3}
        placeholder="Afspraak, vragen of collab."
        onChange={(contactIntro) => setSite((s) => ({ ...s, contactIntro }))}
      />
      <TextInput
        label="E-mail"
        value={inbox.email}
        placeholder="info@tzjill.nl"
        onChange={(email) =>
          setSite((s) => ({
            ...s,
            contact: [{ ...inbox, email }, ...s.contact.slice(1)],
          }))
        }
      />
      <TextInput
        label="Telefoon"
        value={site.phoneNumber}
        placeholder="+31 6 …"
        onChange={(phoneNumber) => setSite((s) => ({ ...s, phoneNumber }))}
      />
      <TextInput
        label="WhatsApp"
        value={site.whatsappNumber}
        placeholder="+31 6 …"
        onChange={(whatsappNumber) => setSite((s) => ({ ...s, whatsappNumber }))}
      />
      <TextInput
        label="Instagram"
        value={site.instagram}
        placeholder="https://www.instagram.com/…"
        onChange={(instagram) => setSite((s) => ({ ...s, instagram }))}
      />
      <MediaUrlField
        label="Hero-foto op contact"
        kind="image"
        value={site.contactHeroImageUrl}
        hint="Leeg = geen grote foto bovenaan /contact."
        onChange={(contactHeroImageUrl) =>
          setSite((s) => ({ ...s, contactHeroImageUrl }))
        }
      />
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Openingstijden</h3>
        {site.openingHours.map((row, index) => <TextInput key={row.day} label={row.day} value={row.time} placeholder="09:00 – 18:00 of Gesloten" onChange={(time) => setSite((previous) => ({ ...previous, openingHours: previous.openingHours.map((hours, i) => i === index ? { ...hours, time } : hours) }))} />)}
      </div>
    </EditorSection>
  )
}
