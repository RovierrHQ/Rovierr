import { oc } from '@orpc/contract'
import { z } from 'zod'
import { profileUpdateSchema, socialLinksSchema } from './profile-schemas'

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
        bannerImage: z.string().nullable(),
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
        createdAt: z.date(),
        major: z.string().nullable(),
        yearOfStudy: z.string().nullable()
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
    .input(profileUpdateSchema)
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
    }),

  public: oc
    .route({
      method: 'GET',
      description: 'Gets the public profile for a user by username.',
      summary: 'Get Public Profile',
      tags: ['User']
    })
    .input(
      z.object({
        username: z.string().min(1)
      })
    )
    .output(
      z.object({
        id: z.string(),
        name: z.string(),
        username: z.string(),
        image: z.string().nullable(),
        bannerImage: z.string().nullable(),
        bio: z.string().nullable(),
        website: z.string().nullable(),
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
        createdAt: z.date(),
        major: z.string().nullable(),
        yearOfStudy: z.string().nullable()
      })
    )
    .errors({
      NOT_FOUND: {
        data: z.object({
          message: z.string().default('User not found')
        })
      }
    })
}
