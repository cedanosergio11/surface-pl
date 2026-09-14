import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/surface-pl/',
  build: {
    outDir: 'dist/client',
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
