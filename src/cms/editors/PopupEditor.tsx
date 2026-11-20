import { useCms } from '@/cms/CmsContext'
import { EditorSection, TextInput, TextArea } from '@/cms/fields'
import { MediaUrlField } from '@/cms/media/MediaUrlField'
import { popupDefaults } from '@/cms/popupDefaults'
export function PopupEditor(){
 const {content:{site},setSite}=useCms()
 const update=(key:string,value:string)=>setSite(s=>({...s,texts:{...s.texts,[key]:value}}))
 return <EditorSection title="Mailingpop-up" defaultOpen visible={site.promoSignupVisible!==false} onVisibleChange={promoSignupVisible=>setSite(s=>({...s,promoSignupVisible}))} description="De aanmelding voor de jubileumactie."><div className="space-y-5">
 <TextInput label="Label boven de titel" value={site.texts['popup.label']??popupDefaults['popup.label']} onChange={v=>update('popup.label',v)}/>
 <TextArea label="Titel" value={site.texts['popup.title']??popupDefaults['popup.title']} onChange={v=>update('popup.title',v)}/>
 <TextArea label="Uitleg" value={site.texts['popup.intro']??popupDefaults['popup.intro']} onChange={v=>update('popup.intro',v)}/>
 <TextInput label="Tekst op de knop" value={site.texts['popup.button']??popupDefaults['popup.button']} onChange={v=>update('popup.button',v)}/>
 <TextArea label="Bericht na aanmelden" value={site.texts['popup.success']??popupDefaults['popup.success']} onChange={v=>update('popup.success',v)}/>
 <MediaUrlField label="Afbeelding" kind="image" value={site.texts['popup.image']??popupDefaults['popup.image']} onChange={v=>update('popup.image',v)}/>
 </div></EditorSection>
}
