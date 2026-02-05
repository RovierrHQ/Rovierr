import path from 'node:path'
import type { FullConfig } from '@playwright/test'
import dotenv from 'dotenv'
import { cleanupTestData } from './utils/auth-setup'
import { cleanupOrgAndTeam } from './utils/seed-org'

export default async function globalTeardown(_config: FullConfig) {
  const rootDir = path.join(process.cwd(), '../..')
  dotenv.config({ path: path.join(rootDir, 'apps/api/.dev.vars') })

  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error(
      `DATABASE_URL environment variable is not set. Please create a .dev.vars file at: ${rootDir}/apps/api/.dev.vars`
    )
  }

  console.log('Cleaning up test data...')
  await cleanupOrgAndTeam(databaseUrl)
  await cleanupTestData(databaseUrl)
  console.log('Test data cleaned up')
}
