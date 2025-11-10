import { expo } from '@better-auth/expo'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import {
  customSession,
  emailOTP,
  oneTap,
  organization,
  phoneNumber,
  twoFactor,
  username
} from 'better-auth/plugins'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { db } from '../db'
import * as schema from '../db/schema/auth'
import { user as userTable } from '../db/schema/auth'
import { env } from './env'
import { emitEvent } from './events'
import logger from './logger'

// Define plugin types to avoid TypeScript serialization issues
const expoPlugin = expo()
const twoFactorPlugin = twoFactor()
const phoneNumberPlugin = phoneNumber({
  sendOTP: ({ phoneNumber: number, code }, request) => {
    // Implement sending OTP code via SMS
    logger.info({ number, code, request }, 'Sending OTP code via SMS')
  }
})
const emailOTPPlugin = emailOTP({
  async sendVerificationOTP({ email, otp, type }) {
    if (type === 'email-verification') {
      // Send the OTP for email verification
      await logger.info({ email, otp, type }, 'Sending OTP code via email')
    }
  }
})
const oneTapPlugin = oneTap()
const organizationPlugin = organization({ teams: { enabled: true } })
const usernamePlugin = username()

// export type Session = {}

const customSessionPlugin = customSession(async ({ user, session }) => {
  const userVerified = await db.query.user.findFirst({
    where: eq(userTable.id, user.id),
    columns: { isVerified: true }
  })
  // Add custom session data
  return {
    session,
    user: {
      ...user,
      isVerified: Boolean(userVerified?.isVerified)
    }
  }
})
type AuthPlugins = [
  typeof expoPlugin,
  typeof twoFactorPlugin,
  typeof phoneNumberPlugin,
  typeof emailOTPPlugin,
  typeof oneTapPlugin,
  typeof organizationPlugin,
  typeof usernamePlugin,
  typeof customSessionPlugin
]

const authPlugins: AuthPlugins = [
  expoPlugin,
  twoFactorPlugin,
  phoneNumberPlugin,
  emailOTPPlugin,
  oneTapPlugin,
  organizationPlugin,
  usernamePlugin,
  customSessionPlugin
]

export const auth = betterAuth({
  appName: 'Rovierr',
  baseURL: env.SERVER_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: env.CORS_ORIGIN.split(','),
  plugins: authPlugins,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema
  }),
  emailAndPassword: {
    enabled: false
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      accessType: 'offline',
      prompt: 'select_account consent'
    }
  },
  databaseHooks: {
    user: {
      create: {
        async after(user) {
          await db
            .update(userTable)
            .set({
              username:
                (user.username as string) ||
                `${user.email.split('@')[0].toLowerCase()}${nanoid(5)}`,
              isVerified: false
            })
            .where(eq(userTable.id, user.id))
            .execute()

          // Emit user.created event to PostHog
          await emitEvent('user.created', user.id, {
            email: user.email,
            authProvider: 'google'
          })
        }
      }
    }
  },
  advanced: {
    crossSubDomainCookies: {
      enabled: true
    }
  }
})
