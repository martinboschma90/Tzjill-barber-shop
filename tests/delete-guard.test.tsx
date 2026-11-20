import {useState} from 'react'
import {render,screen,fireEvent} from '@testing-library/react'
import {expect,it,vi} from 'vitest'
import {CmsContext,type CmsContextValue} from '@/cms/CmsContext'
import {createDefaultContent} from '@/cms/defaultCmsContent'
import {DeletionGuard} from '@/cms/flow-mates/DeletionGuard'
function Example(){
 const [content,setContent]=useState(createDefaultContent)
 const value={content,setSite:(updater:CmsContextValue['setSite'] extends (arg:infer T)=>void?T:never)=>setContent(c=>({...c,site:updater(c.site)})),setTeam:(updater:Parameters<CmsContextValue['setTeam']>[0])=>setContent(c=>({...c,team:updater(c.team)}))} as CmsContextValue
 return <CmsContext.Provider value={value}><DeletionGuard><span>{content.site.reviews.length} reviews</span><button onClick={()=>value.setSite(s=>({...s,reviews:[]}))}>Verwijder</button></DeletionGuard></CmsContext.Provider>
}
it('cancels removal when confirmation is rejected',()=>{vi.spyOn(window,'confirm').mockReturnValueOnce(false);render(<Example/>);fireEvent.click(screen.getByText('Verwijder'));expect(screen.getByText('3 reviews')).toBeTruthy()})
it('restores a confirmed removal',async()=>{vi.spyOn(window,'confirm').mockReturnValueOnce(true);render(<Example/>);fireEvent.click(screen.getByText('Verwijder'));expect(screen.getByText('0 reviews')).toBeTruthy();fireEvent.click(await screen.findByText('Ongedaan maken'));expect(screen.getByText('3 reviews')).toBeTruthy()})
