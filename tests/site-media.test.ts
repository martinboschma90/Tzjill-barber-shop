import {describe,it,expect} from 'vitest'
import {collectSiteMedia} from '@/cms/media/siteMedia'
import {createDefaultSiteContent, type CmsContent} from '@/cms/content'
import {isLiveSiteAsset,isSourceVideoAsset} from '@/cms/media/liveMedia'
describe('website media library',()=>{
 it('indexes existing website images and videos without duplicates',()=>{
 const site={...createDefaultSiteContent(),homeHeroImageUrl:'/test.jpg',homeHeroVideoUrl:'/hero.mp4',welcomeImageUrl:'/test.jpg'}
 const assets=collectSiteMedia({site,team:[],artists:[]})
 expect(assets.filter(a=>a.url==='/test.jpg')).toHaveLength(1)
 const video=assets.find(a=>a.url==='/hero.mp4')!
 expect(video.publicUrl).toBe('/hero.mp4')
 expect(isLiveSiteAsset(video)).toBe(true)
 expect(isSourceVideoAsset(video)).toBe(false)
 })
 it('rejects unsafe urls and unrelated text',()=>{
 const data={site:{bad:'javascript:alert(1).jpg',relative:'not-a-file',email:'person@example.com',good:'https://cdn.example/photo.webp?width=100'},team:[],artists:[]} as unknown as CmsContent
 expect(collectSiteMedia(data).map(a=>a.url)).toEqual(['https://cdn.example/photo.webp?width=100'])
 })
})
