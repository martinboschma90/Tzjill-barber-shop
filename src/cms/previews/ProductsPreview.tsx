import { ProductsPage } from '@/pages/ProductsPage'
import { PreviewFrame } from '@/cms/previews/PreviewFrame'

export function ProductsPreview() {
  return (
    <PreviewFrame label="Producten">
      <ProductsPage />
    </PreviewFrame>
  )
}
