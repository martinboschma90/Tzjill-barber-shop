import { useCallback, useEffect, useMemo, useState } from 'react'
import { Download, RefreshCw } from 'lucide-react'
import { listPromoSignups, type PromoSignupRow } from '@/cms/api/promoSignups'
import { useAuth } from '@/cms/auth/AuthProvider'
import { inputCls, PrimaryButton, SecondaryButton } from '@/cms/flow-mates/cms-ui'
import { downloadPromoCsv, promoSignupsToCsv } from '@/lib/promoCsv'

function sourceLabel(source: string) {
  if (source === 'popup-10y') return 'Popup 10 jaar'
  return source || '—'
}

function formatWhen(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso || '—'
  return date.toLocaleString('nl-NL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function PromoSignupsPanel() {
  const { canEdit } = useAuth()
  const [rows, setRows] = useState<PromoSignupRow[]>([])
  const [total, setTotal] = useState(0)
  const [truncated, setTruncated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  const reload = useCallback(async () => {
    setLoading(true)
    const result = await listPromoSignups()
    setRows(result.signups)
    setTotal(result.total)
    setTruncated(result.truncated)
    setError(result.error)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!canEdit) return
    void reload()
  }, [canEdit, reload])

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return rows
    return rows.filter((row) => {
      return (
        row.name.toLowerCase().includes(needle) ||
        row.email.toLowerCase().includes(needle) ||
        row.phone.includes(needle)
      )
    })
  }, [query, rows])

  if (!canEdit) {
    return (
      <p className="text-sm text-neutral-500">
        Alleen admins en editors kunnen aanmeldingen bekijken.
      </p>
    )
  }

  function onExport() {
    const csv = promoSignupsToCsv(
      visible.map((row) => ({
        name: row.name,
        email: row.email,
        phone: row.phone,
        created_at: row.created_at,
      })),
    )
    downloadPromoCsv('tzjill-aanmeldingen.csv', csv)
  }

  const countLabel = query.trim()
    ? `${visible.length} van ${rows.length}`
    : `${total === 1 ? '1 aanmelding' : `${total} aanmeldingen`}`

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 sm:max-w-sm">
          <label className="sr-only" htmlFor="promo-signup-search">
            Zoek op naam of e-mail
          </label>
          <input
            id="promo-signup-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Zoek op naam of e-mail"
            className={inputCls}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="mr-1 text-xs text-neutral-500">{loading ? 'Laden…' : countLabel}</p>
          <SecondaryButton type="button" onClick={() => void reload()} disabled={loading}>
            <RefreshCw className="h-3.5 w-3.5" />
            Vernieuwen
          </SecondaryButton>
          <PrimaryButton type="button" onClick={onExport} disabled={!visible.length}>
            <Download className="h-3.5 w-3.5" />
            Exporteer CSV
          </PrimaryButton>
        </div>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
          {error}
        </p>
      ) : null}

      {truncated ? (
        <p className="text-xs text-neutral-500">
          Alleen de nieuwste {rows.length} aanmeldingen worden getoond.
        </p>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-neutral-200 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
              <tr>
                <th className="px-4 py-3">Naam</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Telefoon</th>
                <th className="px-4 py-3">Bron</th>
                <th className="px-4 py-3">Aangemeld</th>
              </tr>
            </thead>
            <tbody>
              {loading && !rows.length ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-sm text-neutral-500">
                    Aanmeldingen laden…
                  </td>
                </tr>
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-sm text-neutral-500">
                    {query.trim()
                      ? 'Geen aanmeldingen voor deze zoekopdracht.'
                      : 'Nog geen aanmeldingen.'}
                  </td>
                </tr>
              ) : (
                visible.map((row) => (
                  <tr key={row.id} className="border-b border-neutral-200/70 last:border-0">
                    <td className="px-4 py-3 font-medium text-neutral-900">{row.name}</td>
                    <td className="px-4 py-3 text-neutral-700">{row.email}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-neutral-700">{row.phone}</td>
                    <td className="px-4 py-3 text-neutral-500">
                      <span className="block">{sourceLabel(row.source)}</span>
                      {row.path ? (
                        <span className="mt-0.5 block text-[11px] text-neutral-400">{row.path}</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-neutral-500">
                      {formatWhen(row.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
