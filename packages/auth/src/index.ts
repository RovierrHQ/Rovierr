import { expo } from '@better-auth/expo'
import type { DB } from '@rov/db'
import {
  account,
  invitation,
  member as memberTable,
  organizationRole as organizationRoleTable,
  organization as organizationTable,
  session as sessionTable,
  team,
  teamMember,
  twoFactor as twoFactorTable,
  user as userTable,
  verification
} from '@rov/db'
import type { BetterAuthOptions } from 'better-auth'
import { betterAuth, logger } from 'better-auth'
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
import {
  ac,
  defaultMember,
  defaultPresident,
  defaultVicePresident
} from './permissions'

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
}

/**
 * Create default roles for an organization
 * Maps Better Auth roles: owner -> president, admin -> vice-president, member -> member
 */
export async function createDefaultOrganizationRoles(
  db: DB,
  organizationId: string
) {
  const defaultRoles = [
    {
      role: 'president',
      permission: JSON.stringify(defaultPresident.statements)
    },
    {
      role: 'vice-president',
      permission: JSON.stringify(defaultVicePresident.statements)
    },
    {
      role: 'member',
      permission: JSON.stringify(defaultMember.statements)
    }
  ]

  await db.insert(organizationRoleTable).values(
    defaultRoles.map((r) => ({
      id: nanoid(),
      organizationId,
      role: r.role,
      permission: r.permission
    }))
  )
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
      logger.error('sendOTP', {
        phoneNumber: params.phoneNumber,
        code: params.code,
        request: request ?? undefined
      })
      return Promise.resolve()
    }
  })
  const emailOTPPlugin = emailOTP({
    sendVerificationOTP({ email, otp, type }) {
      logger.error('sendVerificationOTP', { email, otp, type })
      return Promise.resolve()
    }
  })
  const oneTapPlugin = oneTap()
  const organizationPlugin = organization({
    teams: { enabled: true },
    ac,
    creatorRole: 'president',
    dynamicAccessControl: {
      enabled: true
    },
    schema: {
      organization: {
        additionalFields: {
          type: {
            type: 'string',
            input: true,
            required: false
          },
          visibility: {
            type: 'string',
            input: true,
            required: false
          },
          isVerified: {
            type: 'boolean',
            input: false,
            required: false
          },
          universityId: {
            type: 'string',
            input: true,
            required: false
          },
          description: {
            type: 'string',
            input: true,
            required: false
          },
          tags: {
            type: 'string[]',
            input: true,
            required: false
          },
          banner: {
            type: 'string',
            input: true,
            required: false
          }
        }
      }
    },
    organizationHooks: {
      // Create default roles after organization is created
      afterCreateOrganization: async ({ organization: org }) => {
        if (!org?.id) return

        await createDefaultOrganizationRoles(config.db, org.id)
      }
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
        member: memberTable,
        organization: organizationTable,
        session: sessionTable,
        team,
        teamMember,
        twoFactor: twoFactorTable,
        user: userTable,
        verification,
        organizationRole: organizationRoleTable
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

// Re-export permissions for use in UI components
export { statement } from './permissions'
