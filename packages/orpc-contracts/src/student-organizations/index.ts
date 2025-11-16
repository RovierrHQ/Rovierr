import { oc } from '@orpc/contract'
import { z } from 'zod'

export const createOrganizationInput = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().min(1, 'Description is required').max(1000),
  tags: z.array(z.string()).default([])
})

const organizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string().nullable(),
  description: z.string().nullable(),
  tags: z.array(z.string()).nullable(),
  type: z.enum(['student', 'university']),
  visibility: z.enum(['public', 'campus_only', 'private']),
  memberCount: z.number()
})

export const studentOrganizations = {
  create: oc
    .route({
      method: 'POST',
      description: 'Create a new student organization/club',
      summary: 'Create Organization',
      tags: ['Student Organizations']
    })
    .input(createOrganizationInput)
    .output(
      z.object({
        organizationId: z.string(),
        success: z.boolean()
      })
    )
    .errors({
      USER_NOT_VERIFIED: {
        data: z.object({
          message: z
            .string()
            .default('Only verified users can create organizations')
        })
      },
      ORGANIZATION_CREATION_FAILED: {
        data: z.object({
          message: z.string().default('Failed to create organization')
        })
      }
    }),

  listAllOrganizations: oc
    .route({
      method: 'GET',
      description: 'List all public organizations/clubs',
      summary: 'List All Organizations',
      tags: ['Student Organizations']
    })
    .input(
      z.object({
        query: z
          .object({
            page: z.number().optional(),
            limit: z.number().optional()
          })
          .optional()
      })
    )
    .output(
      z.object({
        meta: z
          .object({
            page: z.number(),
            limit: z.number(),
            total: z.number(),
            totalPage: z.number()
          })
          .optional(),
        data: z.array(organizationSchema)
      })
    )
}
