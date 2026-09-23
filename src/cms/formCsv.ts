export type CsvLead = {
  name: string
  email: string
  phone: string
  created_at: string
}

function escapeCsv(value: string): string {
  const text = String(value ?? '')
  if (/[",\r\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

/** UTF-8 CSV with the columns Martin exports: name, email, phone, created_at. */
export function formSubmissionsToCsv(rows: CsvLead[]): string {
  const lines = ['name,email,phone,created_at']
  for (const row of rows) {
    lines.push(
      [row.name, row.email, row.phone, row.created_at].map(escapeCsv).join(','),
    )
  }
  return `\uFEFF${lines.join('\r\n')}`
}

export function downloadTextFile(filename: string, contents: string, type: string) {
  const blob = new Blob([contents], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
