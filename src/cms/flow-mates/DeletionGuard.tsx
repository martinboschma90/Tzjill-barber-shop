import { useEffect, useState, type ReactNode, type MouseEvent } from 'react'
import { useCms } from '@/cms/CmsContext'
import type { CmsContent } from '@/cms/content'

export function DeletionGuard({ children }: { children: ReactNode }) {
 const {content,setSite,setTeam}=useCms()
 const [backup,setBackup]=useState<{before:CmsContent;after:CmsContent|null}|null>(null)
 useEffect(()=>{
   if(!backup||content===backup.before)return
   if(!backup.after)setBackup({...backup,after:content})
   else if(content!==backup.after)setBackup(null)
 },[content,backup])
 function confirm(event:MouseEvent<HTMLDivElement>){
   const button=(event.target as Element).closest('button')
   if(!button||button.disabled||!/^((review )?verwijder(en)?|.* verwijderen)$/i.test((button.getAttribute('aria-label')||button.textContent||'').trim()))return
   if(!window.confirm('Dit onderdeel verwijderen? Je kunt dit direct daarna ongedaan maken.')){event.preventDefault();event.stopPropagation();return}
   setBackup({before:content,after:null})
 }
 return <div onClickCapture={confirm}>
 {backup?.after&&<div role="status" className="sticky top-0 z-20 mb-3 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950"><span>Onderdeel verwijderd.</span><button type="button" className="font-semibold underline" onClick={()=>{const before=backup.before;setBackup(null);setSite(()=>before.site);setTeam(()=>before.team)}}>Ongedaan maken</button></div>}
 {children}</div>
}
