import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest'
import {handleCmsUsers} from '../api/cms-users-lib.mjs'
const fetcher=vi.fn()
let inviteOk=true
beforeEach(()=>{
 vi.stubEnv('SUPABASE_URL','https://test.supabase.co');vi.stubEnv('SUPABASE_ANON_KEY','anon');vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY','service');vi.stubEnv('VITE_PUBLIC_SITE_URL','https://shop.example');vi.stubGlobal('fetch',fetcher);inviteOk=true
 fetcher.mockImplementation(async(url:string,options:RequestInit={})=>{
  if(url.endsWith('/auth/v1/user'))return Response.json({id:'admin',email:'admin@example.com'})
  if(url.includes('/user_roles?user_id=eq.admin'))return Response.json([{user_id:'admin',role:'admin'}])
  if(url.includes('/user_roles?user_id=eq.foreign'))return Response.json([])
  if(url.includes('/user_roles?user_id=eq.member'))return Response.json([{user_id:'member',role:'editor'}])
  if(url.includes('/auth/v1/admin/users?'))return Response.json({users:[{id:'admin',email:'admin@example.com'},{id:'member',email:'member@example.com'},{id:'foreign',email:'foreign@example.com'}]})
  if(url.includes('/user_roles?select='))return Response.json([{user_id:'admin',role:'admin'},{user_id:'member',role:'editor'}])
  if(url.includes('/auth/v1/invite?'))return Response.json(inviteOk?{id:'new-user'}:{msg:'Mail unavailable'},{status:inviteOk?200:500})
  if(url.includes('/user_roles')&&options.method==='POST')return Response.json({})
  throw new Error('Unexpected call '+url)
 })
})
afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals();fetcher.mockReset()})
async function call(method:string,body:unknown={}){let payload:any;const res={statusCode:0,setHeader:vi.fn(),end:(value:string)=>{payload=JSON.parse(value)}};await handleCmsUsers({method,body,headers:{authorization:'Bearer test'}},res);return {status:res.statusCode,payload}}
describe('Tzjill user management',()=>{
 it('does not disclose users belonging to other sites',async()=>{const result=await call('GET');expect(result.status).toBe(200);expect(result.payload.users.map((u:any)=>u.id)).toEqual(['admin','member'])})
 it('sends the invitation and directs the user to password setup',async()=>{expect((await call('POST',{email:'new@example.com',name:'New',role:'editor'})).status).toBe(200);expect(fetcher.mock.calls.some(([url])=>String(url).includes('/auth/v1/invite?redirect_to=https%3A%2F%2Fshop.example%2Fcms%2Freset-password'))).toBe(true);expect(fetcher.mock.calls.some(([url])=>String(url).includes('generate_link'))).toBe(false)})
 it('reports failed invitation instead of silently creating an account',async()=>{inviteOk=false;expect((await call('POST',{email:'new@example.com',role:'editor'})).status).toBe(502);expect(fetcher.mock.calls.some(([url,options])=>String(url).endsWith('/admin/users')&&options?.method==='POST')).toBe(false)})
 it.each(['PATCH','DELETE'])('rejects %s for an unrelated account',async method=>{expect((await call(method,{userId:'foreign',role:'viewer'})).status).toBe(404)})
 it('removes site membership without deleting the shared account',async()=>{fetcher.mockImplementationOnce(async()=>Response.json({id:'admin',email:'admin@example.com'}));fetcher.mockImplementation(async(url:string,options:RequestInit={})=>{if(url.endsWith('/auth/v1/user'))return Response.json({id:'admin',email:'admin@example.com'});if(url.includes('eq.admin'))return Response.json([{role:'admin'}]);if(url.includes('eq.member'))return Response.json(options.method==='DELETE'?{}:[{role:'editor'}]);throw Error(url)});expect((await call('DELETE',{userId:'member'})).status).toBe(200);expect(fetcher.mock.calls.some(([url,options])=>options?.method==='DELETE'&&String(url).includes('/auth/v1/admin/users/'))).toBe(false)})
 it.each(['viewer','editor'])('rejects management by %s',async role=>{fetcher.mockImplementation(async(url:string)=>url.endsWith('/auth/v1/user')?Response.json({id:'restricted',email:'restricted@example.com'}):Response.json([{role}]));expect((await call('GET')).status).toBe(403)})
})
