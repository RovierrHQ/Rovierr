import crypto from 'node:crypto'
import { createDB, eq } from '@rov/db'
import { account, session, user } from '@rov/db/schema/auth'

export const TEST_USER = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@starter.dev',
  sessionToken: 'test-session-token',
  accountId: 'test-account-id',
  providerId: 'google'
} as const

const EXPIRY_DAYS = 7

export function generateSignedSessionToken(
  sessionToken: string,
  secret: string
) {
  const signature = crypto
    .createHmac('sha256', secret)
    .update(sessionToken)
    .digest('base64')
  return `${sessionToken}.${signature}`
}

export async function setupTestData(databaseUrl: string, secret: string) {
  const db = createDB(databaseUrl)

  const now = new Date().toISOString()
  const expiresAt = new Date(Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000)

  const signedToken = generateSignedSessionToken(TEST_USER.sessionToken, secret)

  const existingUser = await db.query.user.findFirst({
    where: eq(user.email, TEST_USER.email)
  })

  if (existingUser) {
    const existingSession = await db.query.session.findFirst({
      where: eq(session.token, TEST_USER.sessionToken)
    })

    if (existingSession) {
      await db
        .update(session)
        .set({ expiresAt, updatedAt: now })
        .where(eq(session.token, TEST_USER.sessionToken))
    } else {
      await db.insert(session).values({
        id: crypto.randomUUID(),
        token: TEST_USER.sessionToken,
        userId: existingUser.id,
        expiresAt,
        createdAt: now,
        updatedAt: now
      })
    }

    return {
      userId: existingUser.id,
      signedToken,
      expiresAt: Math.floor(expiresAt.getTime() / 1000)
    }
  }

  const userId = TEST_USER.id

  await db.insert(user).values({
    id: userId,
    name: TEST_USER.name,
    email: TEST_USER.email,
    emailVerified: true,
    createdAt: now,
    updatedAt: now
  })

  await db.insert(account).values({
    id: TEST_USER.accountId,
    accountId: TEST_USER.accountId,
    providerId: TEST_USER.providerId,
    userId,
    createdAt: now,
    updatedAt: now
  })

  await db.insert(session).values({
    id: crypto.randomUUID(),
    token: TEST_USER.sessionToken,
    userId,
    expiresAt,
    createdAt: now,
    updatedAt: now
  })

  return {
    userId,
    signedToken,
    expiresAt: Math.floor(expiresAt.getTime() / 1000)
  }
}

export async function cleanupTestData(databaseUrl: string) {
  const db = createDB(databaseUrl)

  await db.delete(session).where(eq(session.token, TEST_USER.sessionToken))
  await db.delete(account).where(eq(account.accountId, TEST_USER.accountId))
  await db.delete(user).where(eq(user.email, TEST_USER.email))
}
