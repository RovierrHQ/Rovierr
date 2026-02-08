import { createAuth } from '@rov/auth'
import { openAPI } from 'better-auth/plugins'
import { db } from './db'
import { env } from './env'

/**
 * Better Auth Instance
 */
export const auth = createAuth({
  db,
  baseURL: env.SERVER_URL,
  secret: env.BETTER_AUTH_SECRET,
  googleClientId: env.GOOGLE_CLIENT_ID,
  googleClientSecret: env.GOOGLE_CLIENT_SECRET,
  trustedOrigins: [...(env.CORS_ORIGIN.split(',').map((o) => o.trim()) || [])],
  subDomainPrefix: '.rovierr.com',
  plugins: [openAPI()],
  emailPasswordEnabled: env.NODE_ENV === 'development',
  phoneNumber: {
    sendOTP: (params) => {
      console.log('sendOTP', params)
    }
  },
  email: {
    sendEmailVerificationOTP: (params) => {
      console.log('sendEmailVerificationOTP', params)
      return Promise.resolve()
    },
    sendInvitationEmail: (params) => {
      console.log('sendInvitationEmail', params)
      return Promise.resolve()
    }
  }
})
