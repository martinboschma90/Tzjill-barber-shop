import { useCms } from '@/cms/CmsProvider'
import { EditorSection, TextArea, TextInput } from '@/cms/fields'

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
    </EditorSection>
  )
}
