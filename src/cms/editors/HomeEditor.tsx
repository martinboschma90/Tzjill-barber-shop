import { useCms } from '@/cms/CmsProvider'
import { EditorSection, TextArea, TextInput } from '@/cms/fields'
import { SectionGroup } from '@/cms/flow-mates/cms-ui'
import { MediaUrlField } from '@/cms/media/MediaUrlField'
import { cloneTreatments } from '@/cms/content'
import { listBtnClass } from '@/cms/editors/listBtn'

export function HomeEditor() {
  const { content, setSite } = useCms()
  const { site } = content
  const treatments = site.treatments?.length
    ? site.treatments
    : cloneTreatments()

  return (
    <div className="space-y-3">
      <EditorSection
        sectionKey="hero"
        title="Hero"
        description="Eerste indruk — grote kop, foto of video."
        defaultOpen
        thumbnail={site.homeHeroImageUrl || '/brand/hero.jpg'}
        visible={site.homeHeroVisible !== false}
        onVisibleChange={(homeHeroVisible) =>
          setSite((current) => ({ ...current, homeHeroVisible }))
        }
        tabs={[
          {
            id: 'content',
            label: 'Inhoud',
            children: (
              <div className="space-y-7">
                <SectionGroup
                  title="Hero-tekst"
                  description="Shopnaam, korte naam en de tagline over de foto of video."
                >
                  <TextInput
                    label="Shopnaam"
                    value={site.fullName}
                    placeholder="Tzjill Barber & Lounge"
                    onChange={(fullName) =>
                      setSite((current) => ({ ...current, fullName }))
                    }
                  />
                  <TextInput
                    label="Korte naam"
                    value={site.name}
                    placeholder="Tzjill"
                    onChange={(name) =>
                      setSite((current) => ({ ...current, name }))
                    }
                  />
                  <TextArea
                    label="Tagline"
                    value={site.tagline}
                    rows={2}
                    onChange={(tagline) =>
                      setSite((current) => ({ ...current, tagline }))
                    }
                  />
                </SectionGroup>
              </div>
            ),
          },
          {
            id: 'media',
            label: 'Media',
            children: (
              <SectionGroup
                title="Hero-achtergrond"
                description="Een lusvideo speelt over de afbeelding wanneer beide zijn ingesteld."
              >
                <MediaUrlField
                  label="Hero-video"
                  kind="video"
                  value={site.homeHeroVideoUrl}
                  onChange={(homeHeroVideoUrl) =>
                    setSite((current) => ({ ...current, homeHeroVideoUrl }))
                  }
                />
                <MediaUrlField
                  label="Hero-afbeelding (reserve)"
                  kind="image"
                  value={site.homeHeroImageUrl}
                  onChange={(homeHeroImageUrl) =>
                    setSite((current) => ({ ...current, homeHeroImageUrl }))
                  }
                />
              </SectionGroup>
            ),
          },
        ]}
      />

      <EditorSection
        sectionKey="welcome"
        title="Welkom"
        description="Intro onder de hero, met portret."
        thumbnail={site.welcomeImageUrl || '/lookbook/05.png'}
        tabs={[
          {
            id: 'content',
            label: 'Inhoud',
            children: (
              <SectionGroup
                title="Welkomsttekst"
                description="Label, titel en alinea naast het portret."
              >
                <TextInput
                  label="Label"
                  value={site.welcomeKicker}
                  onChange={(welcomeKicker) =>
                    setSite((current) => ({ ...current, welcomeKicker }))
                  }
                />
                <TextArea
                  label="Titel"
                  value={site.welcomeTitle}
                  rows={2}
                  hint="Enter = nieuwe regel."
                  onChange={(welcomeTitle) =>
                    setSite((current) => ({ ...current, welcomeTitle }))
                  }
                />
                <TextArea
                  label="Tekst"
                  value={site.welcomeText}
                  rows={3}
                  onChange={(welcomeText) =>
                    setSite((current) => ({ ...current, welcomeText }))
                  }
                />
              </SectionGroup>
            ),
          },
          {
            id: 'media',
            label: 'Media',
            children: (
              <SectionGroup
                title="Portret"
                description="Foto naast de welkomsttekst."
              >
                <MediaUrlField
                  label="Portret"
                  kind="image"
                  value={site.welcomeImageUrl}
                  onChange={(welcomeImageUrl) =>
                    setSite((current) => ({ ...current, welcomeImageUrl }))
                  }
                />
              </SectionGroup>
            ),
          },
        ]}
      />

      <EditorSection
        sectionKey="treatments"
        title="Behandelingen"
        description="Uitgelichte signatures op de homepage."
        thumbnail={treatments[0]?.image}
        tabs={[
          {
            id: 'content',
            label: 'Inhoud',
            children: (
              <div className="space-y-7">
                <SectionGroup
                  title="Sectiekop"
                  description="Label, titel en intro boven de kaarten."
                >
                  <TextInput
                    label="Label"
                    value={site.treatmentsKicker}
                    onChange={(treatmentsKicker) =>
                      setSite((current) => ({ ...current, treatmentsKicker }))
                    }
                  />
                  <TextArea
                    label="Titel"
                    value={site.treatmentsTitle}
                    rows={2}
                    onChange={(treatmentsTitle) =>
                      setSite((current) => ({ ...current, treatmentsTitle }))
                    }
                  />
                  <TextArea
                    label="Intro"
                    value={site.treatmentsIntro}
                    rows={2}
                    onChange={(treatmentsIntro) =>
                      setSite((current) => ({ ...current, treatmentsIntro }))
                    }
                  />
                </SectionGroup>
                <SectionGroup
                  title="Kaarten"
                  description="Foto’s van elke kaart staan onder Media."
                >
                  {treatments.map((item, index) => (
                    <div
                      key={`${item.title}-${index}`}
                      className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50/70 p-3.5"
                    >
                      <TextInput
                        label={`Kaart ${index + 1}`}
                        value={item.title}
                        onChange={(title) =>
                          setSite((s) => ({
                            ...s,
                            treatments: treatments.map((row, i) =>
                              i === index ? { ...row, title } : row,
                            ),
                          }))
                        }
                      />
                      <TextArea
                        label="Tekst"
                        value={item.text}
                        rows={2}
                        onChange={(text) =>
                          setSite((s) => ({
                            ...s,
                            treatments: treatments.map((row, i) =>
                              i === index ? { ...row, text } : row,
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
                        treatments: [
                          ...treatments,
                          {
                            title: 'Nieuwe behandeling',
                            text: '',
                            image: '/lookbook/01.jpg',
                          },
                        ],
                      }))
                    }
                  >
                    + Kaart
                  </button>
                </SectionGroup>
              </div>
            ),
          },
          {
            id: 'media',
            label: 'Media',
            children: (
              <SectionGroup
                title="Kaartfoto’s"
                description="Eén foto per behandeling."
              >
                {treatments.map((item, index) => (
                  <MediaUrlField
                    key={`${item.title}-${index}-media`}
                    label={`Kaart ${index + 1}`}
                    kind="image"
                    value={item.image}
                    onChange={(image) =>
                      setSite((s) => ({
                        ...s,
                        treatments: treatments.map((row, i) =>
                          i === index ? { ...row, image } : row,
                        ),
                      }))
                    }
                  />
                ))}
              </SectionGroup>
            ),
          },
        ]}
      />
    </div>
  )
}
