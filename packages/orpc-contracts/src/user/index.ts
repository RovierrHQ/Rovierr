import { oc } from '@orpc/contract'
import { z } from 'zod'
import { onboarding } from './onboarding'

export const user = {
  profileInfo: oc
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

  onboarding
}
