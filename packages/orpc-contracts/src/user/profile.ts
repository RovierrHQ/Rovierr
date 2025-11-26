import { oc } from '@orpc/contract'
import { z } from 'zod'

const socialLinksSchema = z.object({
  whatsapp: z.string().nullable(),
  telegram: z.string().nullable(),
  instagram: z.string().nullable(),
  facebook: z.string().nullable(),
  twitter: z.string().nullable(),
  linkedin: z.string().nullable()
})

export const profile = {
  info: oc
    .route({
      method: 'GET',
      description: 'Gets the profile info for the user.',
      summary: 'Get Profile Info',
      tags: ['User']
    })
    .output(
      z.object({
        currentUniversity: z
          .object({
            id: z.string(),
            name: z.string(),
            logo: z.string().nullable(),
            slug: z.string(),
            country: z.string(),
            city: z.string()
          })
          .optional(),
        studentStatusVerified: z.boolean()
      })
    )
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('User not found')
        })
      }
    }),

  details: oc
    .route({
      method: 'GET',
      description: 'Gets the full profile details for the user.',
      summary: 'Get Profile Details',
      tags: ['User']
    })
    .output(
      z.object({
        id: z.string(),
        name: z.string(),
        username: z.string().nullable(),
        email: z.string(),
        image: z.string().nullable(),
        bio: z.string().nullable(),
        website: z.string().nullable(),
        phoneNumber: z.string().nullable(),
        phoneNumberVerified: z.boolean(),
        socialLinks: socialLinksSchema,
        currentUniversity: z
          .object({
            id: z.string(),
            name: z.string(),
            logo: z.string().nullable(),
            city: z.string(),
            country: z.string()
          })
          .nullable(),
        studentStatusVerified: z.boolean(),
        createdAt: z.date()
      })
    )
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('User not found')
        })
      }
    }),

  update: oc
    .route({
      method: 'PATCH',
      description: 'Updates the user profile.',
      summary: 'Update Profile',
      tags: ['User']
    })
    .input(
      z.object({
        name: z.string().min(1).max(100).optional(),
        username: z
          .string()
          .min(3)
          .max(30)
          .regex(/^[a-zA-Z0-9_-]+$/)
          .optional(),
        bio: z.string().max(500).optional(),
        website: z.string().url().optional().or(z.literal('')),
        whatsapp: z.string().optional().or(z.literal('')),
        telegram: z.string().optional().or(z.literal('')),
        instagram: z.string().optional().or(z.literal('')),
        facebook: z.string().optional().or(z.literal('')),
        twitter: z.string().optional().or(z.literal('')),
        linkedin: z.string().optional().or(z.literal(''))
      })
    )
    .output(
      z.object({
        success: z.boolean(),
        user: z.object({
          id: z.string(),
          name: z.string(),
          username: z.string().nullable(),
          bio: z.string().nullable(),
          website: z.string().nullable(),
          socialLinks: socialLinksSchema
        })
      })
    )
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('User not found')
        })
      },
      USERNAME_TAKEN: {
        data: z.object({
          message: z.string().default('Username is already taken')
        })
      },
      INVALID_INPUT: {
        data: z.object({
          message: z.string()
        })
      }
    }),

  academic: oc
    .route({
      method: 'GET',
      description: 'Gets the academic enrollments for the user.',
      summary: 'Get Academic Enrollments',
      tags: ['User']
    })
    .output(
      z.object({
        enrollments: z.array(
          z.object({
            id: z.string(),
            program: z.object({
              id: z.string(),
              name: z.string(),
              code: z.string(),
              degreeLevel: z.string()
            }),
            university: z.object({
              id: z.string(),
              name: z.string(),
              logo: z.string().nullable()
            }),
            studentStatusVerified: z.boolean(),
            startedOn: z.date().nullable(),
            graduatedOn: z.date().nullable(),
            isPrimary: z.boolean()
          })
        )
      })
    )
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('User not found')
        })
      }
    }),

  activity: oc
    .route({
      method: 'GET',
      description: 'Gets the activity feed for the user.',
      summary: 'Get Activity Feed',
      tags: ['User']
    })
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0)
        })
        .default({ limit: 50, offset: 0 })
    )
    .output(
      z.object({
        activities: z.array(
          z.object({
            id: z.string(),
            type: z.enum(['post', 'comment', 'join', 'event', 'achievement']),
            title: z.string(),
            description: z.string().nullable(),
            timestamp: z.date(),
            metadata: z.record(z.string(), z.any())
          })
        ),
        total: z.number(),
        hasMore: z.boolean()
      })
    )
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('User not found')
        })
      }
    })
}
