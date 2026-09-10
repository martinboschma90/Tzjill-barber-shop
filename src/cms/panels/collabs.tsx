import { createCmsPanel } from '@/cms/panels/createCmsPanel.tsx'
import { CollabsEditor } from '@/cms/editors/CollabsEditor'
import { CollabsPreview } from '@/cms/previews/CollabsPreview'

export default createCmsPanel(CollabsEditor, CollabsPreview)
