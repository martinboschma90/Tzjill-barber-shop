import { createCmsPanel } from '@/cms/panels/createCmsPanel.tsx'
import { LookbookEditor } from '@/cms/editors/LookbookEditor'
import { LookbookPreview } from '@/cms/previews/LookbookPreview'

export default createCmsPanel(LookbookEditor, LookbookPreview)
