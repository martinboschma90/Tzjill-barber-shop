import { describe, expect, it, vi } from 'vitest'
import { pushCmsSnapshot, fetchCmsContentBlob } from '@/cms/api/cmsStore'
import { createDefaultContent } from '@/cms/defaultCmsContent'
const db = vi.hoisted(() => ({ from: vi.fn(), update: vi.fn(), insert: vi.fn(), eq: vi.fn(), select: vi.fn(), maybeSingle: vi.fn() }))
vi.mock('@/lib/supabase', () => ({ isSupabaseConfigured: true, supabase: { from: db.from } }))
function chain() { const query = { update: db.update, insert: db.insert, eq: db.eq, select: db.select, maybeSingle: db.maybeSingle }; for (const fn of [db.from, db.update, db.insert, db.eq, db.select]) fn.mockReturnValue(query) }
describe('atomic CMS document writes', () => {
  it('uses one conditional row update, preserving the exact database precision', async () => {
    chain(); db.maybeSingle.mockResolvedValue({ data: { updated_at: '2026-10-14T10:00:01.654321+00:00' }, error: null })
    const revision = '2026-10-14T10:00:00.123456+00:00'
    const result = await pushCmsSnapshot(createDefaultContent(), revision)
    expect(result.error).toBeNull(); expect(db.from).toHaveBeenCalledTimes(1)
    expect(db.eq.mock.calls).toContainEqual(['updated_at', revision]); expect(db.insert).not.toHaveBeenCalled()
  })
  it('reports a concurrent change when the conditional update matched no rows', async () => {
    chain(); db.maybeSingle.mockResolvedValue({ data: null, error: null })
    expect((await pushCmsSnapshot(createDefaultContent(), 'old')).error).toContain('elders gewijzigd')
    expect(db.from).toHaveBeenCalledTimes(1)
  })
  it('does not treat a failed read as an empty store eligible for initialization', async () => {
    chain(); db.maybeSingle.mockResolvedValue({ data: null, error: { message: 'network' } })
    await expect(fetchCmsContentBlob()).rejects.toThrow('CMS ophalen mislukt')
    expect(db.insert).not.toHaveBeenCalled()
  })
})
