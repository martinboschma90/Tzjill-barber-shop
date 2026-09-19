import { useCms } from '@/cms/CmsProvider'
import { EditorSection, TextArea, TextInput } from '@/cms/fields'
import { MediaUrlField } from '@/cms/media/MediaUrlField'
import { INSTAGRAM_URL } from '@/data/site'

const listBtnClass =
  'cms-secondary-action rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[11px] font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900'

export function FooterEditor() {
  const { content, setSite } = useCms()
  const { site } = content

  return (
    <>
      <EditorSection
        title="Merk"
        description="Naam en logo in de footer."
        tabs={[
          {
            id: 'content',
            label: 'Inhoud',
            children: (
              <>
                <TextInput
                  label="Korte naam"
                  value={site.name}
                  onChange={(name) => setSite((s) => ({ ...s, name }))}
                />
                <TextInput
                  label="Shopnaam"
                  value={site.fullName}
                  onChange={(fullName) => setSite((s) => ({ ...s, fullName }))}
                />
                <TextArea
                  label="Footer tekst"
                  value={site.tagline}
                  rows={3}
                  hint="Mag meerdere regels."
                  onChange={(tagline) => setSite((s) => ({ ...s, tagline }))}
                />
              </>
            ),
          },
          {
            id: 'media',
            label: 'Logo',
            children: (
              <MediaUrlField
                label="Logo"
                kind="image"
                value={site.logoUrl}
                hint="Leeg = standaard Tzjill-logo."
                onChange={(logoUrl) => setSite((s) => ({ ...s, logoUrl }))}
              />
            ),
          },
        ]}
      />

      <EditorSection
        title="Contact"
        description="Mail, telefoon en WhatsApp in de footer."
      >
        {site.contact.map((item, index) => (
          <div
            key={`footer-contact-${index}`}
            className="space-y-3 rounded-xl border border-ink/8 bg-ink/[0.03] p-3.5"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="type-label text-[0.65rem] tracking-[0.14em] text-ink/40 uppercase">
                Contact {index + 1}
              </p>
              <button
                type="button"
                className={listBtnClass}
                onClick={() =>
                  setSite((s) => ({
                    ...s,
                    contact: s.contact.filter((_, i) => i !== index),
                  }))
                }
              >
                Verwijder
              </button>
            </div>
            <TextInput
              label="Label"
              value={item.label}
              onChange={(label) =>
                setSite((s) => ({
                  ...s,
                  contact: s.contact.map((c, i) =>
                    i === index ? { ...c, label } : c,
                  ),
                }))
              }
            />
            <TextInput
              label="Email"
              value={item.email}
              onChange={(email) =>
                setSite((s) => ({
                  ...s,
                  contact: s.contact.map((c, i) =>
                    i === index ? { ...c, email } : c,
                  ),
                }))
              }
            />
          </div>
        ))}
        <button
          type="button"
          className={listBtnClass}
          onClick={() =>
            setSite((s) => ({
              ...s,
              contact: [...s.contact, { label: 'Contact', email: '' }],
            }))
          }
        >
          + Contact
        </button>
        <TextInput
          label="Telefoon"
          value={site.phoneNumber}
          onChange={(phoneNumber) => setSite((s) => ({ ...s, phoneNumber }))}
          hint="Zichtbaar in de footer."
        />
        <TextInput
          label="WhatsApp"
          value={site.whatsappNumber}
          onChange={(whatsappNumber) =>
            setSite((s) => ({ ...s, whatsappNumber }))
          }
          hint="Zichtbaar in de footer."
        />
      </EditorSection>

      <EditorSection title="Social" description="Instagram-link in de footer.">
        <TextInput
          label="Instagram"
          value={site.instagram}
          placeholder={INSTAGRAM_URL}
          hint="Officieel shopprofiel. Tracking (?stkn=) wordt genegeerd."
          onChange={(instagram) => setSite((s) => ({ ...s, instagram }))}
        />
      </EditorSection>

      <EditorSection
        title="Links"
        description="Privacy en andere links onderaan."
      >
        {site.legalLinks.map((link, index) => (
          <div
            key={`footer-nav-${index}`}
            className="space-y-3 rounded-xl border border-ink/8 bg-ink/[0.03] p-3.5"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="type-label text-[0.65rem] tracking-[0.14em] text-ink/40 uppercase">
                Link {index + 1}
              </p>
              <button
                type="button"
                className={listBtnClass}
                onClick={() =>
                  setSite((s) => ({
                    ...s,
                    legalLinks: s.legalLinks.filter((_, i) => i !== index),
                  }))
                }
              >
                Verwijder
              </button>
            </div>
            <TextInput
              label="Label"
              value={link.label}
              onChange={(label) =>
                setSite((s) => ({
                  ...s,
                  legalLinks: s.legalLinks.map((l, i) =>
                    i === index ? { ...l, label } : l,
                  ),
                }))
              }
            />
            <TextInput
              label="URL"
              value={link.href}
              onChange={(href) =>
                setSite((s) => ({
                  ...s,
                  legalLinks: s.legalLinks.map((l, i) =>
                    i === index ? { ...l, href } : l,
                  ),
                }))
              }
            />
          </div>
        ))}
        <button
          type="button"
          className={listBtnClass}
          onClick={() =>
            setSite((s) => ({
              ...s,
              legalLinks: [...s.legalLinks, { label: 'Link', href: '#' }],
            }))
          }
        >
          + Link
        </button>
      </EditorSection>

      <EditorSection
        title="Copyright"
        description="Regel onderaan de site."
      >
        <TextInput
          label="Jaar"
          value={String(site.year)}
          onChange={(value) => {
            const year = Number.parseInt(value, 10)
            if (!Number.isNaN(year)) {
              setSite((s) => ({ ...s, year }))
            }
          }}
        />
        <TextInput
          label="Copyright tekst"
          value={site.copyrightText}
          hint="Leeg = ©jaar + shopnaam."
          placeholder={`©${site.year} ${site.fullName || site.name}`}
          onChange={(copyrightText) =>
            setSite((s) => ({ ...s, copyrightText }))
          }
        />
      </EditorSection>

      <EditorSection
        title="Adres"
        description="Bedrijfsnaam en adres in de footer."
      >
        <TextInput
          label="Bedrijf"
          value={site.legal.company}
          onChange={(company) =>
            setSite((s) => ({ ...s, legal: { ...s.legal, company } }))
          }
        />
        <TextInput
          label="KVK / extra"
          value={site.legal.vat}
          onChange={(vat) =>
            setSite((s) => ({ ...s, legal: { ...s.legal, vat } }))
          }
        />
        {(site.legal.addressLines.length
          ? site.legal.addressLines
          : ['', '']
        ).map((line, index) => (
          <TextInput
            key={`footer-address-${index}`}
            label={`Adresregel ${index + 1}`}
            value={line}
            onChange={(value) =>
              setSite((s) => {
                const lines =
                  s.legal.addressLines.length > 0
                    ? [...s.legal.addressLines]
                    : ['', '']
                lines[index] = value
                return {
                  ...s,
                  legal: {
                    ...s.legal,
                    addressLines: lines.filter((l) => l.trim().length > 0),
                  },
                }
              })
            }
          />
        ))}
      </EditorSection>
    </>
  )
}
