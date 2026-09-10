import { createCmsPanel } from '@/cms/panels/createCmsPanel.tsx'
import { TeamEditor } from '@/cms/editors/TeamEditor'
import { TeamPreview } from '@/cms/previews/TeamPreview'

export default createCmsPanel(TeamEditor, TeamPreview)
