import { useCms } from '@/cms/CmsContext'
import { EditorSection, TextInput, TextArea } from '@/cms/fields'
import { MediaUrlField } from '@/cms/media/MediaUrlField'
import type { SiteContent } from '@/cms/content'
export function ReviewsEditor() {
 const {content: {site}, setSite} = useCms()
 const update = (index: number, patch: Partial<SiteContent['reviews'][number]>) => setSite(s => ({...s, reviews: s.reviews.map((r,i) => i === index ? {...r,...patch} : r)}))
 return <EditorSection sectionKey="reviews" title="Reviews" visible={site.reviewsVisible} onVisibleChange={reviewsVisible => setSite(s => ({...s,reviewsVisible}))}>
 <div className="space-y-5"><TextInput label="Titel" value={site.reviewsTitle} onChange={reviewsTitle => setSite(s=>({...s,reviewsTitle}))}/><TextArea label="Intro" value={site.reviewsIntro} onChange={reviewsIntro=>setSite(s=>({...s,reviewsIntro}))}/>
 {site.reviews.map((r,i)=><div key={i} className="space-y-3 rounded-xl border p-4"><TextInput label="Naam" value={r.name} onChange={name=>update(i,{name})}/><TextInput label="Omschrijving" value={r.role} onChange={role=>update(i,{role})}/><TextArea label="Reviewtekst" value={r.quote} onChange={quote=>update(i,{quote})}/><MediaUrlField label="Foto" kind="image" value={r.image} onChange={image=>update(i,{image})}/><button type="button" className="text-sm underline" onClick={()=>setSite(s=>({...s,reviews:s.reviews.filter((_,n)=>n!==i)}))}>Review verwijderen</button></div>)}
 <button type="button" className="rounded-lg border px-4 py-2 text-sm" onClick={()=>setSite(s=>({...s,reviews:[...s.reviews,{name:'',role:'',quote:'',image:'',video:''}]}))}>+ Review toevoegen</button></div></EditorSection>
}
