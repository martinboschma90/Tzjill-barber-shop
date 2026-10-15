import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { BookingFlow } from '@/components/booking/BookingFlow'
import { PublicContentProvider } from '@/cms/PublicContentProvider'
const api = vi.hoisted(() => ({ treatments: vi.fn(), employees: vi.fn(), dates: vi.fn(), times: vi.fn(), book: vi.fn(), verify: vi.fn() }))
vi.mock('@/lib/supabaseEnv', () => ({ isSupabaseConfigured: false, SUPABASE_URL: '', SUPABASE_ANON_KEY: '' }))
vi.mock('@/lib/salonhubApi', () => ({ loadTreatments: api.treatments, loadEmployees: api.employees, loadDates: api.dates, loadTimes: api.times, bookAppointment: api.book, verifyAppointment: api.verify }))
afterEach(() => vi.clearAllMocks())
async function toConfirmation() {
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
  const day = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`
  api.treatments.mockResolvedValue({ treatments: [{ id: '66', name: 'Haircut', groupId: 'male', group: 'Heren', section: 'Haircut', minutes: 30, priceLabel: '€30', priceCents: 3000 }] })
  api.employees.mockResolvedValue({ employees: [{ id: '0', name: 'Geen voorkeur', any: true, photo: '' }] })
  api.dates.mockResolvedValue({ dates: [day] }); api.times.mockResolvedValue({ times: ['12:00:00'] })
  render(<PublicContentProvider><BookingFlow /></PublicContentProvider>)
  await waitFor(() => expect(screen.getByRole('button', { name: /Haircut 30 min/ })).toBeTruthy())
  fireEvent.click(screen.getByRole('button', { name: /Haircut 30 min/ }))
  await waitFor(() => expect((screen.getByRole('button', { name: 'Kies een kapper' }) as HTMLButtonElement).disabled).toBe(false))
  fireEvent.click(screen.getByRole('button', { name: 'Kies een kapper' }))
  const cell = await screen.findByRole('gridcell', { name: new Intl.DateTimeFormat('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' }).format(tomorrow) })
  fireEvent.click(cell); fireEvent.click(await screen.findByRole('button', { name: '12:00', exact: true }))
  await waitFor(() => expect((screen.getByRole('button', { name: 'Verder' }) as HTMLButtonElement).disabled).toBe(false))
  fireEvent.click(screen.getByRole('button', { name: 'Verder' }))
  expect(await screen.findByRole('heading', { name: 'Bevestig je afspraak' })).toBeTruthy()
  fireEvent.change(screen.getByLabelText('Voornaam'), { target: { value: 'Test' } })
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'test@example.com' } })
  fireEvent.change(screen.getByLabelText('Telefoon'), { target: { value: '0612345678' } })
}
describe('booking confirmation with isolated Salonhub responses', () => {
  it('renders confirmed state and ignores duplicate submission before the request completes', async () => {
    let finish!: (value: unknown) => void
    api.book.mockImplementation(() => new Promise((resolve) => { finish = resolve }))
    await toConfirmation()
    const button = screen.getByRole('button', { name: 'Afspraak bevestigen' })
    const form = document.getElementById(button.getAttribute('form')!)!
    fireEvent.submit(form); fireEvent.submit(form)
    expect(api.book).toHaveBeenCalledTimes(1)
    finish({ status: 'confirmed', appointmentId: '123' })
    expect(await screen.findByRole('heading', { name: 'Afspraak staat' })).toBeTruthy()
  })
  it('keeps the customer in the flow when the server rejects a booking', async () => {
    api.book.mockRejectedValue(new Error('Dit tijdstip is net vergeven.'))
    await toConfirmation(); fireEvent.submit(document.getElementById(screen.getByRole('button', { name: 'Afspraak bevestigen' }).getAttribute('form')!)!)
    expect(await screen.findByText('Dit tijdstip is net vergeven.')).toBeTruthy()
    expect(screen.getByLabelText('Voornaam').getAttribute('value')).toBe('Test')
  })
})
