import { expo } from '@better-auth/expo'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import {
  emailOTP,
  oneTap,
  organization,
  phoneNumber,
  twoFactor
} from 'better-auth/plugins'
import { db } from '../db'
import * as schema from '../db/schema/auth'
import { env } from './env'
import logger from './logger'

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
  plugins: [
    expo(),
    twoFactor(),
    phoneNumber({
      sendOTP: ({ phoneNumber: number, code }, request) => {
        // Implement sending OTP code via SMS
        logger.info({ number, code, request }, 'Sending OTP code via SMS')
      }
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (type === 'email-verification') {
          // Send the OTP for email verification
          await logger.info({ email, otp, type }, 'Sending OTP code via email')
        }
      }
    }),
    oneTap(),
    organization({ teams: { enabled: true } })
  ]
})
