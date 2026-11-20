import { TextsEditor } from '@/cms/editors/TextsEditor'
import { LegalPage } from '@/pages/LegalPage'
import { PreviewFrame } from '@/cms/previews/PreviewFrame'
import type { CmsPanelProps } from './types'
export default function LegalPanel({slot}: CmsPanelProps) {
 return slot === 'editor' ? <TextsEditor onlyGroups={['LegalPage']} /> : <PreviewFrame label="Privacy en cookies"><LegalPage kind="privacy"/><LegalPage kind="cookies"/></PreviewFrame>
}
