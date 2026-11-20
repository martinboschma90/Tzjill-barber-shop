import {describe,it,expect} from 'vitest'
import {normalizeSiteContent} from '@/cms/mappers/site'
import {createDefaultSiteContent} from '@/cms/content'
describe('Recovered CMS content',()=>{
 it('preserves defaults for older snapshots',()=>expect(normalizeSiteContent({}).reviews).toEqual(createDefaultSiteContent().reviews))
 it.each(['lookbookImages','products','collabs','treatments','reviews'] as const)('keeps deleted %s empty',key=>expect(normalizeSiteContent({[key]:[]})[key]).toEqual([]))
 it('preserves custom and intentionally empty texts',()=>{const texts={'Newsletter.1':'Mijn tekst','LegalPage.1':''};expect(normalizeSiteContent(JSON.parse(JSON.stringify({texts}))).texts).toEqual(texts)})
 it('filters invalid text values',()=>expect(normalizeSiteContent({texts:{valid:'Tekst',invalid:17}}).texts).toEqual({valid:'Tekst'}))
})
