import { db } from '@api/db'
import {
  sendEmailVerificationOTP,
  sendInvitationEmail,
  sendPhoneNumberVerificationOTP
} from '@api/services/email/sender'
import { createAuth } from '@rov/auth'
import { env } from './env'

export const auth = createAuth({
  appName: 'Rovierr',
  baseURL: `${env.SERVER_URL}/auth`,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: env.CORS_ORIGIN.split(','),
  db,
  emails: {
    sendEmailVerificationOTP,
    sendPhoneNumberVerificationOTP,
    sendInvitationEmail
  },
  google: {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET
  }
})
