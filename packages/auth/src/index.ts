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
import type { BetterAuthOptions, User } from 'better-auth'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import {
  customSession,
  emailOTP,
  type Invitation,
  type Member,
  type Organization,
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
  emails: {
    sendEmailVerificationOTP: ({
      email,
      otp,
      type
    }: {
      email: string
      otp: string
      type: 'sign-in' | 'email-verification' | 'forget-password'
    }) => Promise<void>
    sendPhoneNumberVerificationOTP: ({
      phoneNumber,
      code
    }: {
      phoneNumber: string
      code: string
    }) => Promise<void>
    sendInvitationEmail: ({
      email,
      organization,
      inviter
    }: {
      id: string
      role: string
      email: string
      organization: Organization
      invitation: Invitation
      inviter: Member & {
        user: User
      }
    }) => Promise<void>
  }
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
    sendOTP: (params) => {
      return config.emails.sendPhoneNumberVerificationOTP(params)
    }
  })
  const emailOTPPlugin = emailOTP({
    sendVerificationOTP(params) {
      return config.emails.sendEmailVerificationOTP(params)
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
    sendInvitationEmail(data) {
      return config.emails.sendInvitationEmail(data)
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
          institutionId: {
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
          },
          // Social links
          instagram: {
            type: 'string',
            input: true,
            required: false
          },
          facebook: {
            type: 'string',
            input: true,
            required: false
          },
          twitter: {
            type: 'string',
            input: true,
            required: false
          },
          linkedin: {
            type: 'string',
            input: true,
            required: false
          },
          whatsapp: {
            type: 'string',
            input: true,
            required: false
          },
          telegram: {
            type: 'string',
            input: true,
            required: false
          },
          website: {
            type: 'string',
            input: true,
            required: false
          },
          // Additional details
          foundingYear: {
            type: 'number',
            input: true,
            required: false
          },
          meetingSchedule: {
            type: 'string',
            input: true,
            required: false
          },
          membershipRequirements: {
            type: 'string',
            input: true,
            required: false
          },
          goals: {
            type: 'string',
            input: true,
            required: false
          },
          // Branding
          primaryColor: {
            type: 'string',
            input: true,
            required: false
          },
          // State tracking
          onboardingCompleted: {
            type: 'boolean',
            input: false,
            required: false,
            defaultValue: false
          },
          profileCompletionPercentage: {
            type: 'number',
            input: false,
            required: false,
            defaultValue: 0
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
    } as unknown as Session
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
      enabled: true,
      requireEmailVerification: false,
      minPasswordLength: 8,
      maxPasswordLength: 128
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
export type Session = {
  session: {
    id: string
    userId: string
    expiresAt: Date
    ipAddress: string
    userAgent: string
    createdAt: Date
    updatedAt: Date
    activeOrganizationId: string | null
    activeTeamId: string | null
  }
  user: {
    id: string
    name: string
    email: string
    emailVerified: boolean
    image: string
    createdAt: Date
    updatedAt: Date
    twoFactorEnabled: boolean
    phoneNumber: string | null
    phoneNumberVerified: boolean
    username: string | null
    displayUsername: string | null
    isVerified: boolean
  }
}

// Re-export common types that clients might need
export type { DB, user as User } from '@rov/db'

// Re-export permissions for use in UI components
export { statement } from './permissions'
