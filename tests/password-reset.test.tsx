import {render,screen,fireEvent} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import {beforeEach,expect,it,vi} from 'vitest'
import {CmsResetPasswordPage} from '@/pages/CmsResetPasswordPage'
const auth=vi.hoisted(()=>({getSession:vi.fn(),onAuthStateChange:vi.fn(()=>({data:{subscription:{unsubscribe:vi.fn()}}})),signOut:vi.fn()}))
const update=vi.hoisted(()=>vi.fn())
vi.mock('@/lib/supabase',()=>({supabase:{auth}}))
vi.mock('@/lib/auth',()=>({updatePassword:update}))
beforeEach(()=>{auth.getSession.mockResolvedValue({data:{session:{user:{id:'test'}}},error:null});auth.signOut.mockResolvedValue({error:null});update.mockReset()})
function open(){render(<MemoryRouter><CmsResetPasswordPage/></MemoryRouter>)}
it('explains expired or missing sessions',async()=>{auth.getSession.mockResolvedValue({data:{session:null},error:null});open();expect((await screen.findByRole('alert')).textContent).toContain('ongeldig of verlopen');expect(update).not.toHaveBeenCalled()})
it('does not send mismatching passwords',async()=>{open();fireEvent.change(await screen.findByLabelText('Nieuw wachtwoord'),{target:{value:'long-password-1'}});fireEvent.change(screen.getByLabelText('Herhaal wachtwoord'),{target:{value:'long-password-2'}});fireEvent.submit(screen.getByRole('button',{name:'Wachtwoord instellen'}).closest('form')!);expect(screen.getByRole('alert').textContent).toContain('niet gelijk');expect(update).not.toHaveBeenCalled()})
it('handles connection failure and permits retry',async()=>{update.mockRejectedValueOnce(Error('network')).mockResolvedValueOnce({error:null});open();fireEvent.change(await screen.findByLabelText('Nieuw wachtwoord'),{target:{value:'long-password-1'}});fireEvent.change(screen.getByLabelText('Herhaal wachtwoord'),{target:{value:'long-password-1'}});const form=screen.getByRole('button',{name:'Wachtwoord instellen'}).closest('form')!;fireEvent.submit(form);expect((await screen.findByRole('alert')).textContent).toContain('Verbinding mislukt');fireEvent.submit(form);expect(await screen.findByText(/Je wachtwoord is ingesteld/)).toBeTruthy();expect(auth.signOut).toHaveBeenCalled()})
