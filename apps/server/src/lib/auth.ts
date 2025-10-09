import { expo } from '@better-auth/expo'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import {
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

type AuthPlugins = [
  typeof expoPlugin,
  typeof twoFactorPlugin,
  typeof phoneNumberPlugin,
  typeof emailOTPPlugin,
  typeof oneTapPlugin,
  typeof organizationPlugin,
  typeof usernamePlugin
]

const authPlugins: AuthPlugins = [
  expoPlugin,
  twoFactorPlugin,
  phoneNumberPlugin,
  emailOTPPlugin,
  oneTapPlugin,
  organizationPlugin,
  usernamePlugin
]

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema
  }),
  trustedOrigins: env.CORS_ORIGIN.split(','),
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
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.SERVER_URL,
  plugins: authPlugins,
  databaseHooks: {
    user: {
      create: {
        async after(user) {
          await db
            .update(userTable)
            .set({
              username:
                (user.username as string) ||
                `${user.email.split('@')[0].toLowerCase()}${nanoid(5)}`
            })
            .where(eq(userTable.id, user.id))
            .execute()
        }
      }
    }
  }
})
