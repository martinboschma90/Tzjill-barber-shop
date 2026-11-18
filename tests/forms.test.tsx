import { afterEach, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ContactForm } from '@/components/contact/ContactForm'
import { Newsletter } from '@/components/home/Newsletter'
import { CmsPreviewModeProvider } from '@/cms/previews/PreviewMode'
import { createDefaultContent } from '@/cms/defaultCmsContent'
const send = vi.hoisted(() => vi.fn())
vi.mock('@/lib/messages', () => ({ submitMessage: send }))
vi.mock('@/cms/CmsContext', () => ({ useCms: () => ({ content: createDefaultContent() }) }))
afterEach(() => vi.clearAllMocks())
it.each([ContactForm, Newsletter])('blocks CMS preview form delivery (%s)', (Form) => {
  const blocked = vi.fn()
  const { container } = render(<CmsPreviewModeProvider onBlockedSubmit={blocked}><Form /></CmsPreviewModeProvider>)
  fireEvent.submit(container.querySelector('form')!)
  expect(send).not.toHaveBeenCalled()
  expect(blocked).toHaveBeenCalledTimes(1)
  expect(screen.queryByText(/Je bericht is verstuurd|Je aanmelding is verstuurd/)).toBeNull()
})
function fill() {
  render(<ContactForm />)
  fireEvent.change(screen.getByLabelText('Naam'), { target: { value: 'Test' } })
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'test@example.com' } })
  fireEvent.change(screen.getByLabelText('Bericht'), { target: { value: 'Vraag over openingstijden' } })
  return screen.getByRole('button', { name: 'Verstuur' }).closest('form')!
}
it('shows success only after an accepted response and sends at most once while pending', async () => {
  let finish!: () => void
  send.mockImplementation(() => new Promise<void>((resolve) => { finish = resolve }))
  const form = fill(); fireEvent.submit(form); fireEvent.submit(form)
  expect(send).toHaveBeenCalledTimes(1)
  finish(); expect(await screen.findByText(/Je bericht is verstuurd/)).toBeTruthy()
})
it('preserves the entered message and shows an error when delivery fails', async () => {
  send.mockRejectedValue(new Error('Verzenden is nog niet beschikbaar.'))
  fireEvent.submit(fill())
  expect(await screen.findByRole('alert')).toBeTruthy()
  expect((screen.getByLabelText('Bericht') as HTMLTextAreaElement).value).toBe('Vraag over openingstijden')
  expect(screen.queryByText(/Je bericht is verstuurd/)).toBeNull()
})
