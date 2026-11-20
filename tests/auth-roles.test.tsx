import {act,render,screen,waitFor} from '@testing-library/react'
import {beforeEach,expect,it,vi} from 'vitest'
import {AuthProvider,useAuth} from '@/cms/auth/AuthProvider'
const state=vi.hoisted(()=>({callback:null as any,getSession:vi.fn(),rpc:vi.fn(),row:vi.fn()}))
vi.mock('@/lib/cmsLocalBypass',()=>({isCmsLocalBypassAllowed:()=>false}))
vi.mock('@/lib/auth',()=>({isSupabaseConfigured:true,getSession:state.getSession,onAuthStateChange:(cb:any)=>{state.callback=cb;return {data:{subscription:{unsubscribe:vi.fn()}}}},signInWithPassword:vi.fn(),signOut:vi.fn()}))
vi.mock('@/lib/supabase',()=>({supabase:{rpc:state.rpc,from:()=>({select:()=>({eq:()=>({maybeSingle:state.row})})})}}))
function Probe(){const auth=useAuth();return <div>{auth.role}:{String(auth.canEdit)}:{String(auth.canManageUsers)}</div>}
beforeEach(()=>{state.getSession.mockReset();state.rpc.mockReset();state.row.mockReset()})
it.each([['admin',true,true],['editor',true,false],['viewer',false,false]])('limits %s permissions',async(role,edit,users)=>{state.getSession.mockResolvedValue({user:{id:'test',email:'test@example.com'}});state.rpc.mockResolvedValue({data:role});state.row.mockResolvedValue({data:{role}});render(<AuthProvider><Probe/></AuthProvider>);expect(await screen.findByText(`${role}:${edit}:${users}`)).toBeTruthy()})
it('ignores an old admin lookup after changing to a viewer',async()=>{
 let finish!:(value:unknown)=>void
 state.getSession.mockResolvedValue({user:{id:'old',email:'old@example.com'}})
 state.rpc.mockImplementationOnce(()=>new Promise(resolve=>{finish=resolve})).mockResolvedValue({data:'viewer'})
 state.row.mockResolvedValue({data:{role:'viewer'}})
 render(<AuthProvider><Probe/></AuthProvider>)
 await waitFor(()=>expect(state.rpc).toHaveBeenCalledTimes(1))
 await act(async()=>{state.callback('SIGNED_IN',{user:{id:'new',email:'new@example.com'}})})
 await act(async()=>{finish({data:'admin'})})
 expect(screen.getByText('viewer:false:false')).toBeTruthy()
})
