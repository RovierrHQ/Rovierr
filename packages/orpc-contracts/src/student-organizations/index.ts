import { oc } from '@orpc/contract'
import { z } from 'zod'
import { societySchema, updateSocietyFieldsSchema } from './schemas'

export * from './schemas'

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

// Note: Organization creation is now handled by Better-Auth authClient.organization.create()
// These contracts are for additional operations not covered by Better-Auth

export const studentOrganizations = {
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

// Society-specific contracts
// Note: Society creation uses Better-Auth authClient.organization.create() with additional fields
// These contracts handle society-specific operations not covered by Better-Auth

export const society = {
  // Get enriched society data (organization + society fields)
  getById: oc
    .route({
      method: 'GET',
      description: 'Get society by ID with all fields',
      summary: 'Get Society',
      tags: ['Societies']
    })
    .input(z.object({ id: z.string() }))
    .output(societySchema.nullable())
    .errors({
      NOT_FOUND: {
        data: z.object({
          message: z.string().default('Society not found')
        })
      }
    }),

  getBySlug: oc
    .route({
      method: 'GET',
      description: 'Get society by slug with all fields',
      summary: 'Get Society by Slug',
      tags: ['Societies']
    })
    .input(z.object({ slug: z.string() }))
    .output(societySchema.nullable())
    .errors({
      NOT_FOUND: {
        data: z.object({
          message: z.string().default('Society not found')
        })
      }
    }),

  // Update society-specific fields only (name/slug/logo updated via Better-Auth)
  updateFields: oc
    .route({
      method: 'PATCH',
      description:
        'Update society-specific fields (social links, branding, additional details)',
      summary: 'Update Society Fields',
      tags: ['Societies']
    })
    .input(
      z.object({
        organizationId: z.string(),
        data: updateSocietyFieldsSchema
      })
    )
    .output(societySchema)
    .errors({
      NOT_FOUND: {
        data: z.object({
          message: z.string().default('Society not found')
        })
      },
      FORBIDDEN: {
        data: z.object({
          message: z
            .string()
            .default('You do not have permission to update this society')
        })
      },
      VALIDATION_ERROR: {
        data: z.object({
          message: z.string(),
          fields: z.record(z.string(), z.array(z.string())).optional()
        })
      }
    }),

  // Upload banner (logo handled by Better-Auth)
  uploadBanner: oc
    .route({
      method: 'POST',
      description: 'Upload banner image for society',
      summary: 'Upload Society Banner',
      tags: ['Societies']
    })
    .input(
      z.object({
        organizationId: z.string()
        // Note: File upload handled via FormData in actual implementation
      })
    )
    .output(z.object({ url: z.string() }))
    .errors({
      FORBIDDEN: {
        data: z.object({
          message: z
            .string()
            .default(
              'You do not have permission to upload banner for this society'
            )
        })
      },
      VALIDATION_ERROR: {
        data: z.object({
          message: z.string()
        })
      },
      UPLOAD_FAILED: {
        data: z.object({
          message: z.string().default('Failed to upload banner')
        })
      }
    }),

  // Mark onboarding as complete
  completeOnboarding: oc
    .route({
      method: 'POST',
      description: 'Mark society onboarding as complete',
      summary: 'Complete Onboarding',
      tags: ['Societies']
    })
    .input(z.object({ organizationId: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .errors({
      NOT_FOUND: {
        data: z.object({
          message: z.string().default('Society not found')
        })
      },
      FORBIDDEN: {
        data: z.object({
          message: z
            .string()
            .default('You do not have permission to update this society')
        })
      }
    })
}
