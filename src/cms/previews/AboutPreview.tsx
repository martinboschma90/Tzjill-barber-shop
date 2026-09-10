import { AboutPage } from '@/pages/AboutPage'
import { PreviewFrame } from '@/cms/previews/PreviewFrame'

export function AboutPreview() {
  return (
    <PreviewFrame label="Over ons">
      <AboutPage />
    </PreviewFrame>
  )
}
