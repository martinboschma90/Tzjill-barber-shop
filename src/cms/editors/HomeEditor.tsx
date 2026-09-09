import { useCms } from '@/cms/CmsProvider'
import { EditorSection, TextArea, TextInput } from '@/cms/fields'
import { MediaUrlField } from '@/cms/media/MediaUrlField'

export function HomeEditor() {
  const { content, setSite } = useCms()
  const { site } = content

  return (
    <div className="space-y-3">
      <EditorSection
        sectionKey="hero"
        title="Hero"
        description="Full-bleed banner, logo and tagline on the homepage."
        defaultOpen
        badge="Content"
        visible={site.homeHeroVisible !== false}
        onVisibleChange={(homeHeroVisible) =>
          setSite((current) => ({ ...current, homeHeroVisible }))
        }
      >
        <TextInput
          label="Site name"
          value={site.name}
          onChange={(name) => setSite((current) => ({ ...current, name }))}
        />
        <TextInput
          label="Full name"
          value={site.fullName}
          onChange={(fullName) => setSite((current) => ({ ...current, fullName }))}
        />
        <MediaUrlField
          label="Hero banner"
          kind="image"
          value={site.homeHeroImageUrl}
          hint="Foto over de hele hero. Leeg = standaard shopfoto."
          onChange={(homeHeroImageUrl) =>
            setSite((current) => ({ ...current, homeHeroImageUrl }))
          }
        />
        <MediaUrlField
          label="Hero video"
          kind="video"
          value={site.homeHeroVideoUrl}
          hint="MP4 over de hele hero. Leeg = mock barber-clip."
          onChange={(homeHeroVideoUrl) =>
            setSite((current) => ({ ...current, homeHeroVideoUrl }))
          }
        />
        <TextArea
          label="Tagline"
          value={site.tagline}
          rows={2}
          onChange={(tagline) => setSite((current) => ({ ...current, tagline }))}
        />
      </EditorSection>
    </div>
  )
}
