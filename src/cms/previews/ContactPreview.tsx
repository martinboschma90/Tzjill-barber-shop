import { ContactPage } from '@/pages/ContactPage'
import { PreviewFrame } from '@/cms/previews/PreviewFrame'

export function ContactPreview() {
  return (
    <PreviewFrame label="Contact">
      <ContactPage />
    </PreviewFrame>
  )
}
