import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, devices } from '@playwright/test'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['json', { outputFile: 'playwright-results.json' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'no-auth',
      testMatch: ['**/public.spec.ts'],
      use: {
        ...devices['Desktop Chrome']
      }
    },
    {
      name: 'authenticated',
      testMatch: ['**/auth.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: './e2e/.auth/auth.json'
      }
    }
  ],
  globalSetup: path.resolve(__dirname, './e2e/global.setup.ts'),
  globalTeardown: path.resolve(__dirname, './e2e/global.teardown.ts'),
  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    env: process.env.CI
      ? {
          ...process.env,
          VITE_API_URL: process.env.VITE_API_URL ?? 'http://localhost:3001'
        }
      : undefined
  }
})
