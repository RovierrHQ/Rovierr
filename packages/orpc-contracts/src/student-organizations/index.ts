import { oc } from '@orpc/contract'
import { z } from 'zod'

export const createOrganizationInput = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().min(1, 'Description is required').max(1000),
  tags: z.array(z.string()).default([])
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
    })
}
