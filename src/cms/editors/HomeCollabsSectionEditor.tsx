import { useCms } from '@/cms/CmsProvider'
import { CollabsEditor } from '@/cms/editors/CollabsEditor'
import { TextGroupFields } from '@/cms/editors/TextGroupFields'
import { EditorSection } from '@/cms/fields'
import { SectionGroup } from '@/cms/flow-mates/cms-ui'

export function HomeCollabsSectionEditor() {
  const { content } = useCms()
  const thumbnail = content.site.collabs?.[0]?.image

  return (
    <EditorSection
      sectionKey="texts-HomeCollabs"
      title="Collabs op de homepage"
      description="Uitgelichte collabs en kopteksten — zelfde items als /collabs."
      thumbnail={thumbnail}
    >
      <div className="space-y-7">
        <SectionGroup
          title="Kopteksten"
          description="Label, titel en linktekst boven de collab-kaarten."
        >
          <TextGroupFields group="HomeCollabs" />
        </SectionGroup>
        <SectionGroup
          title="Collabs"
          description="Foto, video en tekst per item."
        >
          <CollabsEditor />
        </SectionGroup>
      </div>
    </EditorSection>
  )
}