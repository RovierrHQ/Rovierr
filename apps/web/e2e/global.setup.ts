import fs from 'node:fs/promises'
import path from 'node:path'
import type { FullConfig } from '@playwright/test'
import dotenv from 'dotenv'
import { setupTestData } from './utils/auth-setup'
import { setupOrgAndTeam, TEST_ORG_ID, TEST_TEAM_ID } from './utils/seed-org'

export default async function globalSetup(_config: FullConfig) {
  const rootDir = path.join(process.cwd(), '../..')
  dotenv.config({ path: path.join(rootDir, 'apps/api/.dev.vars') })

  const databaseUrl = process.env.DATABASE_URL
  const secret = process.env.BETTER_AUTH_SECRET

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL environment variable is not set. ' +
        `Please create a .env file at: ${rootDir}/.env\n` +
        'Example: DATABASE_URL=postgresql://user:pass@host/dbname'
    )
  }

  if (!secret) {
    throw new Error(
      'BETTER_AUTH_SECRET environment variable is not set. ' +
        'Please generate a secret and add it to your .env file. ' +
        'Generate with: openssl rand -base64 32'
    )
  }

  console.log('Setting up test user in Neon database...')
  const testData = await setupTestData(databaseUrl, secret)

  console.log('Setting up test org and team...')
  await setupOrgAndTeam(databaseUrl, testData.userId)

  const authDir = path.join(process.cwd(), 'e2e', '.auth')
  await fs.mkdir(authDir, { recursive: true })

  const cookieObject = {
    name: 'better-auth.session_token',
    value: encodeURIComponent(testData.signedToken),
    domain: 'localhost',
    path: '/',
    httpOnly: true,
    secure: false,
    sameSite: 'Lax' as const,
    expires: testData.expiresAt
  }

  const authState = {
    cookies: [cookieObject],
    origins: []
  }

  const authFilePath = path.join(authDir, 'auth.json')
  await fs.writeFile(authFilePath, JSON.stringify(authState, null, 2))

  const seedFilePath = path.join(authDir, 'seed.json')
  await fs.writeFile(
    seedFilePath,
    JSON.stringify({ orgId: TEST_ORG_ID, teamId: TEST_TEAM_ID }, null, 2)
  )

  console.log(`Auth state created at ${authFilePath}`)
  console.log('Test user:', testData.userId)
}
