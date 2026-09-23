export type PromoCsvRow = {
  name: string
  email: string
  phone: string
  created_at: string
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`
}

/** UTF-8 CSV with the columns the CMS export promises. */
export function promoSignupsToCsv(rows: PromoCsvRow[]): string {
  const lines = ['name,email,phone,created_at']
  for (const row of rows) {
    lines.push(
      [row.name, row.email, row.phone, row.created_at].map(csvCell).join(','),
    )
  }
  return `\uFEFF${lines.join('\r\n')}\r\n`
}

export function downloadPromoCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
