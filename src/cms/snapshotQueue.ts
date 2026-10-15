export type SnapshotResult = { error: string | null; revision: string | null; updatedAt: number | null }

/** One writer per CMS session; every next save uses the revision returned by the last one. */
export function createSnapshotQueue<T>(
  write: (snapshot: T, expectedRevision: string | null) => Promise<SnapshotResult>,
  initialRevision: string | null,
) {
  let revision = initialRevision
  let pending: { snapshot: T } | null = null
  let active: Promise<SnapshotResult> | null = null
  let blocked: SnapshotResult | null = null
  return {
    save(snapshot: T): Promise<SnapshotResult> {
      if (blocked) return Promise.resolve(blocked)
      pending = { snapshot }
      if (active) return active
      active = (async () => {
        let result: SnapshotResult = { error: null, revision, updatedAt: null }
        while (pending) {
          const next = pending.snapshot
          pending = null
          try {
            result = await write(next, revision)
          } catch {
            result = { error: 'Opslaan mislukt. Je wijzigingen blijven lokaal bewaard. Herlaad om opnieuw te verbinden.', revision, updatedAt: null }
          }
          if (result.error) {
            blocked = result
            pending = null
            break
          }
          revision = result.revision
        }
        return result
      })().finally(() => { active = null })
      return active
    },
  }
}
