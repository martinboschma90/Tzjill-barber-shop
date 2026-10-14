import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { CmsProvider, useCms } from '@/cms/CmsProvider'
import { createDefaultContent } from '@/cms/defaultCmsContent'
import { CMS_CONTENT_TS_KEY } from '@/cms/storageKeys'
import { createSnapshotQueue } from '@/cms/snapshotQueue'

const mocks = vi.hoisted(() => ({ fetch: vi.fn(), push: vi.fn(), legacy: vi.fn(), role: { canEdit: true } }))
vi.mock('@/lib/supabaseEnv', () => ({ isSupabaseConfigured: true }))
vi.mock('@/cms/auth/AuthProvider', () => ({ useAuth: () => ({ ready: true, session: { user: { id: 'owner' } }, authRequired: true, canEdit: mocks.role.canEdit }) }))
vi.mock('@/cms/api/cmsStore', () => ({ fetchCmsContentBlob: mocks.fetch, pushCmsSnapshot: mocks.push }))
vi.mock('@/cms/api/artistsCache', () => ({ fetchArtistsFromSupabaseCached: mocks.legacy, invalidateArtistsCache: vi.fn() }))
vi.mock('@/cms/api/site', () => ({ fetchSiteSettingsFromSupabase: mocks.legacy }))
vi.mock('@/cms/api/team', () => ({ fetchTeamMembersFromSupabase: mocks.legacy }))
function Probe() { const cms = useCms(); return <><p>{cms.content.site.name}</p><p>{cms.content.team.length} teamleden</p><button onClick={() => cms.setSite((site) => ({ ...site, name: 'Gewijzigd' }))}>Wijzig</button></> }
afterEach(() => { cleanup(); localStorage.clear(); vi.useRealTimers(); mocks.role.canEdit = true })

describe('CMS hydration', () => {
  it('takes remote content over a newer local cache and performs no writes on open', async () => {
    const local = createDefaultContent(); local.site.name = 'Oude cache'; localStorage.setItem('tzjill-cms-content-v1', JSON.stringify(local)); localStorage.setItem(CMS_CONTENT_TS_KEY, String(Date.now() + 100000))
    const remote = createDefaultContent(); remote.site.name = 'Remote'; remote.team = []
    mocks.fetch.mockResolvedValue({ content: remote, updatedAt: 100, revision: 'server.123456' })
    render(<CmsProvider><Probe /></CmsProvider>)
    expect(await screen.findByText('Remote')).toBeTruthy()
    expect(screen.getByText('0 teamleden')).toBeTruthy()
    expect(mocks.push).not.toHaveBeenCalled(); expect(mocks.legacy).not.toHaveBeenCalled()
  })
  it('does not fall back to a write when the initial read fails', async () => {
    mocks.fetch.mockRejectedValue(new Error('CMS ophalen mislukt'))
    render(<CmsProvider><Probe /></CmsProvider>)
    expect(await screen.findByRole('alert')).toBeTruthy(); expect(mocks.push).not.toHaveBeenCalled(); expect(mocks.legacy).not.toHaveBeenCalled()
  })
  it('saves an actual edit with the exact revision', async () => {
    mocks.fetch.mockResolvedValue({ content: createDefaultContent(), updatedAt: 100, revision: '2026-10-14T10:00:00.123456+00:00' })
    mocks.push.mockResolvedValue({ error: null, revision: 'next', updatedAt: 200 })
    render(<CmsProvider><Probe /></CmsProvider>)
    await screen.findByText('Tzjill'); fireEvent.click(screen.getByText('Wijzig'))
    await waitFor(() => expect(mocks.push).toHaveBeenCalled(), { timeout: 2000 })
    expect(mocks.push.mock.calls.at(-1)?.[0].site.name).toBe('Gewijzigd')
    expect(mocks.push.mock.calls.at(-1)?.[1]).toBe('2026-10-14T10:00:00.123456+00:00')
  })
})

describe('serialized saves', () => {
  it('coalesces pending edits and advances the server revision without overlapping requests', async () => {
    let finish!: (value: { error: null; revision: string; updatedAt: number }) => void
    const write = vi.fn().mockImplementationOnce(() => new Promise((resolve) => { finish = resolve })).mockResolvedValue({ error: null, revision: 'r3', updatedAt: 3 })
    const queue = createSnapshotQueue(write, 'r1')
    const first = queue.save('first'); const second = queue.save('second'); const third = queue.save('last')
    expect(write).toHaveBeenCalledTimes(1)
    finish({ error: null, revision: 'r2', updatedAt: 2 }); await act(async () => { await Promise.all([first, second, third]) })
    expect(write.mock.calls).toEqual([['first', 'r1'], ['last', 'r2']])
  })
  it('blocks further writes after a conflict so newer remote content is not overwritten', async () => {
    const write = vi.fn().mockResolvedValue({ error: 'Conflict', revision: 'old', updatedAt: null })
    const queue = createSnapshotQueue(write, 'old')
    expect((await queue.save('draft')).error).toBe('Conflict')
    await queue.save('more edits'); expect(write).toHaveBeenCalledTimes(1)
  })
})
