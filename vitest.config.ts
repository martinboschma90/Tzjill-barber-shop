import { defineConfig } from 'vitest/config'
import path from 'node:path'
export default defineConfig({
  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
  test: { environment: 'jsdom', setupFiles: ['./tests/setup.ts'], environmentOptions: { jsdom: { url: 'http://localhost:5174' } }, include: ['tests/**/*.test.{ts,tsx}'], clearMocks: true },
})
