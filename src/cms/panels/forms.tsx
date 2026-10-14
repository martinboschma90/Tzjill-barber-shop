import { createCmsPanel } from '@/cms/panels/createCmsPanel'
import { FormsEditor } from '@/cms/editors/FormsEditor'
import { ContactPreview } from '@/cms/previews/ContactPreview'
const FormsPanel = createCmsPanel(FormsEditor, ContactPreview)
export default FormsPanel
