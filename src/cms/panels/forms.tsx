import { useLocation } from 'react-router-dom'
import { FormsEditor } from '@/cms/editors/FormsEditor'
import { TextsEditor } from '@/cms/editors/TextsEditor'
import { ContactPreview } from '@/cms/previews/ContactPreview'
import { PreviewFrame } from '@/cms/previews/PreviewFrame'
import { Newsletter } from '@/components/home/Newsletter'
import type { CmsPanelProps } from './types'
export default function FormsPanel({slot}:CmsPanelProps){
 const {pathname}=useLocation()
 const newsletter=pathname.endsWith('/newsletter')
 if(slot==='preview')return newsletter?<PreviewFrame label="Nieuwsbrief"><Newsletter/></PreviewFrame>:<ContactPreview/>
 return <div className="space-y-5"><FormsEditor/>{newsletter&&<TextsEditor onlyGroups={['Newsletter']}/>}</div>
}
