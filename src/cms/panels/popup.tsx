import { PopupEditor } from '@/cms/editors/PopupEditor'
import { PromoSignupModal } from '@/components/promo/PromoSignupModal'
import { PreviewFrame } from '@/cms/previews/PreviewFrame'
import type { CmsPanelProps } from './types'
export default function PopupPanel({slot}:CmsPanelProps){return slot==='editor'?<PopupEditor/>:<PreviewFrame label="Mailingpop-up"><PromoSignupModal preview/></PreviewFrame>}
