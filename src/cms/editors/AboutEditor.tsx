import { useCms } from '@/cms/CmsProvider'
import { listBtnClass } from '@/cms/editors/listBtn'
import { EditorSection, TextArea, TextInput } from '@/cms/fields'
import { SectionGroup } from '@/cms/flow-mates/cms-ui'
import { MediaUrlField } from '@/cms/media/MediaUrlField'

export function AboutEditor() {
  const { content, setSite } = useCms()
  const { site } = content
  const intro = site.about[0] ?? ''
  const description = site.about.slice(1)

  return (
    <EditorSection
      title="Over ons"
      description="Tekst en media op /over-ons."
      defaultOpen
      thumbnail={site.aboutImages[0] || undefined}
      tabs={[
        {
          id: 'content',
          label: 'Inhoud',
          children: (
            <SectionGroup
              title="Paginatekst"
              description="Titel, intro en alinea’s op de pagina."
            >
              <TextInput
                label="Titel"
                value={site.aboutTitle}
                placeholder="Over ons"
                onChange={(aboutTitle) => setSite((s) => ({ ...s, aboutTitle }))}
              />
              <TextArea
                label="Intro"
                value={intro}
                rows={3}
                placeholder="Korte alinea bovenaan de pagina."
                onChange={(value) =>
                  setSite((s) => ({
                    ...s,
                    about: [value, ...s.about.slice(1)],
                  }))
                }
              />
              {description.map((paragraph, index) => (
                <div key={`about-desc-${index}`} className="space-y-2">
                  <TextArea
                    label={`Alinea ${index + 2}`}
                    value={paragraph}
                    rows={3}
                    onChange={(value) =>
                      setSite((s) => ({
                        ...s,
                        about: s.about.map((p, i) => (i === index + 1 ? value : p)),
                      }))
                    }
                  />
                  <button
                    type="button"
                    className={listBtnClass}
                    onClick={() =>
                      setSite((s) => ({
                        ...s,
                        about: s.about.filter((_, i) => i !== index + 1),
                      }))
                    }
                  >
                    Verwijder alinea
                  </button>
                </div>
              ))}
              <button
                type="button"
                className={listBtnClass}
                onClick={() =>
                  setSite((s) => ({
                    ...s,
                    about: s.about.length ? [...s.about, ''] : ['', ''],
                  }))
                }
              >
                + Alinea
              </button>
              <TextInput
                label="Instagram"
                value={site.instagram}
                placeholder="https://www.instagram.com/tzjill.barber.lounge/"
                onChange={(instagram) => setSite((s) => ({ ...s, instagram }))}
              />
            </SectionGroup>
          ),
        },
        {
          id: 'media',
          label: 'Media',
          children: (
            <SectionGroup
              title="Video"
              description="Optioneel. Leeg = hero-video van home."
            >
              <MediaUrlField
                label="Video"
                kind="video"
                value={site.aboutHeroVideoUrl}
                onChange={(aboutHeroVideoUrl) =>
                  setSite((s) => ({ ...s, aboutHeroVideoUrl }))
                }
              />
            </SectionGroup>
          ),
        },
      ]}
    />
  )
}
