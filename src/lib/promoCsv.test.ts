import assert from 'node:assert/strict'
import test from 'node:test'
import { promoSignupsToCsv } from './promoCsv.ts'

test('csv export uses the promised columns and quotes commas', () => {
  const csv = promoSignupsToCsv([
    {
      name: 'Noa, Bakker',
      email: 'noa@example.nl',
      phone: '0612345678',
      created_at: '2026-09-23T08:00:00.000Z',
    },
  ])
  assert.equal(
    csv,
    '\uFEFFname,email,phone,created_at\r\n"Noa, Bakker","noa@example.nl","0612345678","2026-09-23T08:00:00.000Z"\r\n',
  )
})
