import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
// Node 26's optional native localStorage shadows jsdom; keep a deterministic browser storage adapter.
const entries = new Map<string, string>()
const storage = { getItem: (key: string) => entries.get(key) ?? null, setItem: (key: string, value: string) => { entries.set(key, String(value)) }, removeItem: (key: string) => { entries.delete(key) }, clear: () => entries.clear(), key: (index: number) => [...entries.keys()][index] ?? null, get length() { return entries.size } }
Object.defineProperty(window, 'localStorage', { value: storage, configurable: true })
Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true })
afterEach(() => { cleanup(); entries.clear() })
