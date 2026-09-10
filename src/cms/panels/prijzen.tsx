import { createCmsPanel } from '@/cms/panels/createCmsPanel.tsx'
import { PricesEditor } from '@/cms/editors/PricesEditor'
import { PricesPreview } from '@/cms/previews/PricesPreview'

export default createCmsPanel(PricesEditor, PricesPreview)
