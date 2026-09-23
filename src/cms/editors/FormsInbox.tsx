import { useEffect, useMemo, useState } from 'react'
import { Download, RefreshCw, Search } from 'lucide-react'
import {
  CMS_FORMS,
  fetchFormSubmissions,
  type FormSubmission,
} from '@/cms/api/formSubmissions'
import { useAuth } from '@/cms/auth/AuthProvider'
import { downloadTextFile, formSubmissionsToCsv } from '@/cms/formCsv'
import { isSupabaseConfigured } from '@/lib/supabaseEnv'

function formatWhen(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('nl-NL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (/^06\d{8}$/.test(digits)) {
    return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`
  }
  return phone || '—'
}

export function FormsInbox() {
  const { canEdit } = useAuth()
  const [formId, setFormId] = useState(CMS_FORMS[0]?.id ?? '')
  const [rows, setRows] = useState<FormSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<'supabase' | 'dev' | null>(null)
  const [query, setQuery] = useState('')
  const [exportNote, setExportNote] = useState('')

  const [reloadKey, setReloadKey] = useState(0)
  const form = CMS_FORMS.find((item) => item.id === formId) ?? CMS_FORMS[0]

  useEffect(() => {
    if (!canEdit || !formId) return
    let cancelled = false
    setLoading(true)
    void fetchFormSubmissions(formId).then((result) => {
      if (cancelled) return
      setRows(result.submissions)
      setError(result.error)
      setSource(result.source)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [canEdit, formId, reloadKey])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return rows
    return rows.filter((row) => {
      const haystack = `${row.name} ${row.email} ${row.phone}`.toLowerCase()
      return haystack.includes(needle)
    })
  }, [query, rows])

  function onExport() {
    if (!filtered.length || !form) return
    const csv = formSubmissionsToCsv(filtered)
    downloadTextFile(
      `tzjill-${form.id}.csv`,
      csv,
      'text/csv;charset=utf-8',
    )
    setExportNote(
      query.trim()
        ? `CSV gedownload · ${filtered.length} gefilterde rijen.`
        : `CSV gedownload · ${filtered.length} rijen.`,
    )
  }

  if (!canEdit) {
    return (
      <p className="text-sm text-neutral-500">
        Alleen admins en editors kunnen inzendingen bekijken.
      </p>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <aside className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
          Formulieren
        </p>
        <ul className="space-y-2">
          {CMS_FORMS.map((item) => {
            const selected = item.id === form?.id
            const count = selected ? rows.length : null
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    setFormId(item.id)
                    setQuery('')
                    setExportNote('')
                  }}
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                    selected
                      ? 'border-emerald-500/70 bg-white shadow-sm'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                  aria-current={selected ? 'true' : undefined}
                >
                  <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
                    Formulier
                  </span>
                  <span className="mt-2 block text-sm font-semibold text-neutral-900">
                    {item.title}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-neutral-500">
                    {item.description}
                  </span>
                  <span className="mt-3 block text-[11px] font-medium text-neutral-500">
                    {selected && !loading ? `${count} reacties` : 'Reacties openen'}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </aside>

      <section className="min-w-0">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
              Reacties
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              {form?.title} · nieuwste eerst
              {query.trim() && !loading ? ` · ${filtered.length} van ${rows.length}` : ''}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="cms-secondary-action inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Ververs
            </button>
            <button
              type="button"
              onClick={onExport}
              disabled={!filtered.length}
              className="cms-primary-action inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3.5 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
              <Download className="h-3.5 w-3.5" />
              Exporteer CSV
            </button>
          </div>
        </div>

        <label className="relative mb-4 block">
          <span className="sr-only">Zoeken</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setExportNote('')
            }}
            placeholder="Zoek op naam, e-mail of telefoon"
            className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pr-3 pl-10 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-900"
          />
        </label>

        {exportNote ? (
          <p className="mb-4 text-sm text-emerald-700" role="status">
            {exportNote}
          </p>
        ) : null}

        {source === 'dev' && import.meta.env.DEV && !isSupabaseConfigured ? (
          <p className="mb-4 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs leading-relaxed text-neutral-500">
            Lokale ontwikkelserver. Op de live site komen deze aanmeldingen in
            Supabase, nadat de migratie is uitgevoerd.
          </p>
        ) : null}

        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">
            {error}
          </p>
        ) : loading ? (
          <p className="text-sm text-neutral-500">Reacties laden…</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-14 text-center">
            <p className="text-sm font-medium text-neutral-900">
              {query.trim() ? 'Geen reacties voor deze zoekopdracht.' : 'Nog geen reacties.'}
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-neutral-500">
              {query.trim()
                ? 'Pas de zoekterm aan of wis het veld.'
                : 'Zodra iemand de popup verstuurt, staat die aanmelding hier.'}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <caption className="sr-only">
                  Reacties op {form?.title}
                </caption>
                <thead className="border-b border-neutral-200 bg-neutral-50 text-[10px] font-semibold tracking-[0.14em] text-neutral-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Naam</th>
                    <th className="px-4 py-3 font-semibold">E-mail</th>
                    <th className="px-4 py-3 font-semibold">Telefoon</th>
                    <th className="px-4 py-3 font-semibold">Datum</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr key={row.id || `${row.email}-${row.created_at}`} className="border-b border-neutral-100 last:border-0">
                      <td className="px-4 py-3 font-medium text-neutral-900">{row.name}</td>
                      <td className="px-4 py-3 text-neutral-700">{row.email}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-neutral-700">
                        {formatPhone(row.phone)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-neutral-500">
                        {formatWhen(row.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
