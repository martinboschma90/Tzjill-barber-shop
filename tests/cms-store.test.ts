import { describe, expect, it, vi } from 'vitest'
import { pushCmsSnapshot, fetchCmsContentBlob } from '@/cms/api/cmsStore'
import { createDefaultContent } from '@/cms/defaultCmsContent'

const rpc = vi.hoisted(() => vi.fn())
vi.mock('@/lib/supabase', () => ({ isSupabaseConfigured: true, supabase: { rpc } }))

describe('Co-public CMS document RPC', () => {
  it('saves draft without publishing by default', async () => {
    const revision = '2026-10-14T10:00:00.123456+00:00'
    rpc.mockResolvedValueOnce({
      data: { updated_at: '2026-10-14T10:00:01.654321+00:00' },
      error: null,
    })
    const result = await pushCmsSnapshot(createDefaultContent(), revision, false)
    expect(result.error).toBeNull()
    expect(rpc).toHaveBeenCalledWith('tzjill_save_document', {
      p_draft: expect.anything(),
      p_publish: false,
      p_expected: revision,
    })
  })

  it('publishes when publish flag is true', async () => {
    rpc.mockResolvedValueOnce({
      data: { updated_at: '2026-10-14T10:00:02+00:00' },
      error: null,
    })
    await pushCmsSnapshot(createDefaultContent(), null, true)
    expect(rpc).toHaveBeenCalledWith('tzjill_save_document', {
      p_draft: expect.anything(),
      p_publish: true,
      p_expected: null,
    })
  })

  it('reports a concurrent change from the RPC', async () => {
    rpc.mockResolvedValueOnce({ data: null, error: { code: '40001', message: 'conflict' } })
    expect((await pushCmsSnapshot(createDefaultContent(), 'old', false)).error).toContain(
      'elders gewijzigd',
    )
  })

  it('does not treat a failed read as an empty store', async () => {
    rpc.mockResolvedValueOnce({ data: null, error: { message: 'network' } })
    await expect(fetchCmsContentBlob()).rejects.toThrow('CMS ophalen mislukt')
  })
})