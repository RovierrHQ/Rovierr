import { expo } from '@better-auth/expo'
import type { DB } from '@rov/db'
import {
  account,
  invitation,
  member,
  organization as organizationTable,
  session as sessionTable,
  team,
  teamMember,
  twoFactor as twoFactorTable,
  user as userTable,
  verification
} from '@rov/db'
import type { BetterAuthOptions } from 'better-auth'
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

export interface AuthConfig {
  appName: string
  baseURL: string
  secret: string
  trustedOrigins: string[]
  db: DB
  google: {
    clientId: string
    clientSecret: string
  }
  callbacks?: {
    onUserCreated?: (user: {
      id: string
      email: string
      name: string
      [key: string]: unknown
    }) => Promise<void>
    sendOTP?: (params: {
      phoneNumber: string
      code: string
      request?: Request
    }) => void
    sendEmailOTP?: (params: {
      email: string
      otp: string
      type: string
    }) => Promise<void>
  }
}

/**
 * Create a configured Better Auth instance
 * @param config - Auth configuration
 * @returns Configured Better Auth instance
 */
export function createAuth(config: AuthConfig) {
  // Define plugin types to avoid TypeScript serialization issues
  const expoPlugin = expo()
  const twoFactorPlugin = twoFactor()
  const phoneNumberPlugin = phoneNumber({
    sendOTP: (params, request) => {
      config.callbacks?.sendOTP?.({
        phoneNumber: params.phoneNumber,
        code: params.code,
        request: request ?? undefined
      })
    }
  })
  const emailOTPPlugin = emailOTP({
    async sendVerificationOTP({ email, otp, type }) {
      if (type === 'email-verification') {
        await config.callbacks?.sendEmailOTP?.({ email, otp, type })
      }
    }
  })
  const oneTapPlugin = oneTap()
  const organizationPlugin = organization({
    teams: { enabled: true },
    dynamicAccessControl: {
      enabled: true
    }
  })
  const usernamePlugin = username()

  const customSessionPlugin = customSession(async ({ user, session }) => {
    const userVerified = await config.db.query.user.findFirst({
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

  return betterAuth({
    appName: config.appName,
    baseURL: config.baseURL,
    secret: config.secret,
    trustedOrigins: config.trustedOrigins,
    plugins: authPlugins,
    database: drizzleAdapter(config.db, {
      provider: 'pg',
      schema: {
        account,
        invitation,
        member,
        organization: organizationTable,
        session: sessionTable,
        team,
        teamMember,
        twoFactor: twoFactorTable,
        user: userTable,
        verification
      }
    }),
    emailAndPassword: {
      enabled: false
    },
    socialProviders: {
      google: {
        clientId: config.google.clientId,
        clientSecret: config.google.clientSecret,
        accessType: 'offline',
        prompt: 'select_account consent'
      }
    },
    databaseHooks: {
      user: {
        create: {
          async after(user) {
            if (!(user?.id && user?.email)) return

            await config.db
              .update(userTable)
              .set({
                username:
                  (user.username as string) ||
                  `${user?.email?.split('@')[0]?.toLowerCase()}${nanoid(5)}`,
                isVerified: false
              })
              .where(eq(userTable.id, user.id))
              .execute()

            // Call the user created callback if provided
            await config.callbacks?.onUserCreated?.(user)
          }
        }
      }
    },
    advanced: {
      crossSubDomainCookies: {
        enabled: true
      }
    }
  } satisfies BetterAuthOptions)
}

// Export types
export type Auth = ReturnType<typeof createAuth>

// Re-export common types that clients might need
export type { DB, user as User } from '@rov/db'
