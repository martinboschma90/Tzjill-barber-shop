import assert from 'node:assert/strict'
import { test } from 'node:test'
import { formSubmissionsToCsv } from './formCsv.ts'

test('csv uses name, email, phone, created_at and escapes commas', () => {
  const csv = formSubmissionsToCsv([
    {
      name: 'Noor, Bakker',
      email: 'noor@example.nl',
      phone: '0612345678',
      created_at: '2026-09-23T08:00:00.000Z',
    },
  ])
  assert.equal(csv.charCodeAt(0), 0xfeff)
  assert.match(csv, /^\uFEFFname,email,phone,created_at\r\n/u)
  assert.match(csv, /"Noor, Bakker",noor@example.nl,0612345678,2026-09-23T08:00:00.000Z/)
})
