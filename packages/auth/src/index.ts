import { expo } from '@better-auth/expo'
import type { DB } from '@rov/db'
import * as schema from '@rov/db/schema/auth'
import { type BetterAuthPlugin, betterAuth } from 'better-auth'
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
// import { tanstackStartCookies } from "better-auth/tanstack-start";

export type AuthConfig = {
  phoneNumber: {
    sendOTP: (params: { phoneNumber: string }) => void
  }
  email: {
    sendEmailVerificationOTP: (params: { email: string }) => Promise<void>
    sendInvitationEmail: (params: { email: string }) => Promise<void>
  }
  baseURL: string
  secret: string
  googleClientId: string
  googleClientSecret: string
  trustedOrigins?: string[]
  plugins?: BetterAuthPlugin[]
  db: DB
  /**
   * @example rovierr.com -> api.rovierr.com
   * pass the value as '.rovierr.com'
   */
  subDomainPrefix?: string
  emailPasswordEnabled?: boolean
}

/**
 * Create default roles for an organization
 * Maps Better Auth roles: owner -> president, admin -> vice-president, member -> member
 */
async function createDefaultOrganizationRoles(db: DB, organizationId: string) {
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

  await db.insert(schema.organizationRole).values(
    defaultRoles.map((r) => ({
      id: nanoid(),
      organizationId,
      role: r.role,
      permission: r.permission
    }))
  )
}

/**
 * Create a Better Auth instance with the provided configuration.
 * For Cloudflare Workers, this creates a new DB connection per request.
 *
 * @param config - Auth configuration object
 * @returns Better Auth instance
 */
export function createAuth(config: AuthConfig) {
  // Define plugin types to avoid TypeScript serialization issues
  const expoPlugin = expo()
  const twoFactorPlugin = twoFactor()
  const phoneNumberPlugin = phoneNumber({
    sendOTP: config.phoneNumber.sendOTP
  })
  const emailOTPPlugin = emailOTP({
    sendVerificationOTP: config.email.sendEmailVerificationOTP
  })
  const oneTapPlugin = oneTap()
  const organizationPlugin = organization({
    teams: { enabled: true },
    ac,
    creatorRole: 'president',
    dynamicAccessControl: {
      enabled: true
    },
    sendInvitationEmail: config.email.sendInvitationEmail,
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
      where: eq(schema.user.id, user.id),
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
    appName: 'Rovierr',
    baseURL: config.baseURL,
    secret: config.secret,
    socialProviders: {
      google: {
        clientId: config.googleClientId,
        clientSecret: config.googleClientSecret
      }
    },
    emailAndPassword: { enabled: config.emailPasswordEnabled ?? false },
    database: drizzleAdapter(config.db, {
      provider: 'pg',
      schema
    }),

    trustedOrigins: [...(config.trustedOrigins || [])].filter(Boolean),
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24 // 1 day
    },
    advanced: {
      defaultCookieAttributes: {
        sameSite: config.baseURL.includes('localhost') ? 'lax' : 'none',
        secure: !config.baseURL.includes('localhost'),
        httpOnly: true
      },
      crossSubDomainCookies: {
        enabled: !config.baseURL.includes('localhost'),
        domain: config.subDomainPrefix || undefined
      }
    },
    plugins: [...authPlugins, ...(config.plugins || [])],
    databaseHooks: {
      user: {
        create: {
          async after(user) {
            if (!(user?.id && user?.email)) return

            await config.db
              .update(schema.user)
              .set({
                username:
                  (user.username as string) ||
                  `${user?.email?.split('@')[0]?.toLowerCase()}${nanoid(5)}`,
                isVerified: false
              })
              .where(eq(schema.user.id, user.id))
              .execute()
          }
        }
      }
    }
  })
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
    bannerImage: string | null
    interests: string[]
    bio: string | null
    summary: string | null
    website: string | null
    whatsapp: string | null
    telegram: string | null
    instagram: string | null
    facebook: string | null
    twitter: string | null
    linkedin: string | null
  }
}

export type Organization = {
  logo: string | null
  id: string
  name: string
  slug: string
  createdAt: Date
  // biome-ignore lint/suspicious/noExplicitAny: no strict reason for now
  metadata?: any
  // aditional fields if any
  type?: string | undefined
  visibility?: string | undefined
  institutionId?: string | undefined
  description?: string | undefined
  tags?: string[] | undefined
  banner?: string | undefined
  instagram?: string | undefined
  facebook?: string | undefined
  twitter?: string | undefined
  linkedin?: string | undefined
  whatsapp?: string | undefined
  telegram?: string | undefined
  website?: string | undefined
  foundingYear?: number | undefined
  meetingSchedule?: string | undefined
  membershipRequirements?: string | undefined
  goals?: string | undefined
  primaryColor?: string | undefined
  onboardingCompleted?: boolean | undefined
  profileCompletionPercentage?: number | undefined
}

// ========================================================
// Mock auth instance for schema generation
// ========================================================
// import { createDb } from "@rov/db";
/**
 * Mock auth instance for schema generation
 * @returns Auth instance
 *
 * @example `bun run auth:generate-schema` from the root
 */
// mock auth instance for schema generation:
// export const auth = createAuth({
//   db: createDb("postgresql://postgres:postgres@localhost:5432/postgres"),
//   baseURL: "http://localhost:3000",
//   secret: "secret",
//   googleClientId: "googleClientId",
//   googleClientSecret: "googleClientSecret",
//   trustedOrigins: ["http://localhost:3000"],
//   plugins: [],
//   phoneNumber: {
//     sendOTP: () => {},
//   },
//   email: {
//     sendEmailVerificationOTP: () => Promise.resolve(),
//     sendInvitationEmail: () => Promise.resolve(),
//   },
// });
