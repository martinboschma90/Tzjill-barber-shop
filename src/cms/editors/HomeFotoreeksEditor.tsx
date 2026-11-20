import { useCms } from '@/cms/CmsProvider'
import { LookbookEditor } from '@/cms/editors/LookbookEditor'
import { TextGroupFields } from '@/cms/editors/TextGroupFields'
import { EditorSection } from '@/cms/fields'
import { SectionGroup } from '@/cms/flow-mates/cms-ui'

export function HomeFotoreeksEditor() {
  const { content } = useCms()
  const thumbnail = content.site.lookbookImages?.[0]?.src

  return (
    <EditorSection
      sectionKey="texts-InstagramFeed"
      title="Fotoreeks"
      description="Looks-carousel op de homepage — dezelfde foto’s als op lookbook."
      thumbnail={thumbnail}
    >
      <div className="space-y-7">
        <SectionGroup
          title="Kopteksten"
          description="Label, titel en regels boven de fotoreeks."
        >
          <TextGroupFields group="InstagramFeed" />
        </SectionGroup>
        <SectionGroup
          title="Foto’s"
          description="Volgorde en beelden; gedeeld met /lookbook."
        >
          <LookbookEditor />
        </SectionGroup>
      </div>
    </EditorSection>
  )
}