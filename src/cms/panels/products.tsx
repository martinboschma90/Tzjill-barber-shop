import { createCmsPanel } from '@/cms/panels/createCmsPanel.tsx'
import { ProductsEditor } from '@/cms/editors/ProductsEditor'
import { ProductsPreview } from '@/cms/previews/ProductsPreview'

export default createCmsPanel(ProductsEditor, ProductsPreview)
