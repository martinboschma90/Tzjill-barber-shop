import { DeletionGuard } from '@/cms/flow-mates/DeletionGuard'
import { TextsEditor } from '@/cms/editors/TextsEditor'
import type { ComponentType } from 'react'
import type { CmsPanelProps } from '@/cms/panels/types'

/** Pair an editor and preview into one lazy route chunk. */
export function createCmsPanel(
  Editor: ComponentType,
  Preview: ComponentType,
  textGroups?: string[],
) {
  return function CmsPanel({ slot }: CmsPanelProps) {
    return slot === 'preview' ? <Preview /> : <DeletionGuard><div className="space-y-6"><Editor />{textGroups && <TextsEditor onlyGroups={textGroups} />}</div></DeletionGuard>
  }
}
