import { oc } from '@orpc/contract'
import { z } from 'zod'
import {
  createResumeSchema,
  fullResumeSchema,
  listResumesSchema,
  selectResumeSchema,
  updateResumeMetadataSchema,
  updateResumeSectionSchema
} from './schemas'

export const resume = {
  // ============================================================================
  // List Resumes
  // ============================================================================
  list: oc
    .route({
      method: 'GET',
      description: 'List all resumes for the authenticated user',
      summary: 'List Resumes',
      tags: ['Resume']
    })
    .input(listResumesSchema)
    .output(
      z.object({
        resumes: z.array(
          selectResumeSchema.omit({ data: true }).extend({
            createdAt: z.string(),
            updatedAt: z.string()
          })
        ),
        total: z.number(),
        hasMore: z.boolean()
      })
    )
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('User not authenticated')
        })
      }
    }),

  // ============================================================================
  // Get Resume
  // ============================================================================
  get: oc
    .route({
      method: 'GET',
      description: 'Get a resume by ID with all data',
      summary: 'Get Resume',
      tags: ['Resume']
    })
    .input(z.object({ id: z.string().min(1, 'Resume ID is required') }))
    .output(fullResumeSchema)
    .errors({
      NOT_FOUND: {
        data: z.object({
          message: z.string().default('Resume not found')
        })
      },
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('Not authorized to access this resume')
        })
      }
    }),

  // ============================================================================
  // Create Resume
  // ============================================================================
  create: oc
    .route({
      method: 'POST',
      description: 'Create a new resume',
      summary: 'Create Resume',
      tags: ['Resume']
    })
    .input(createResumeSchema)
    .output(
      z.object({
        id: z.string(),
        title: z.string(),
        createdAt: z.string()
      })
    )
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('User not authenticated')
        })
      },
      VALIDATION_ERROR: {
        data: z.object({
          message: z.string(),
          errors: z.record(z.string(), z.string())
        })
      }
    }),

  // ============================================================================
  // Update Resume Metadata
  // ============================================================================
  updateMetadata: oc
    .route({
      method: 'PATCH',
      description: 'Update resume title, position, status, or template',
      summary: 'Update Resume Metadata',
      tags: ['Resume']
    })
    .input(updateResumeMetadataSchema)
    .output(
      selectResumeSchema.omit({ data: true }).extend({
        createdAt: z.string(),
        updatedAt: z.string()
      })
    )
    .errors({
      NOT_FOUND: {
        data: z.object({
          message: z.string().default('Resume not found')
        })
      },
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('Not authorized to update this resume')
        })
      },
      VALIDATION_ERROR: {
        data: z.object({
          message: z.string(),
          errors: z.record(z.string(), z.string())
        })
      }
    }),

  // ============================================================================
  // Update Resume Section
  // ============================================================================
  updateSection: oc
    .route({
      method: 'PATCH',
      description: 'Update a specific section of resume data',
      summary: 'Update Resume Section',
      tags: ['Resume']
    })
    .input(updateResumeSectionSchema)
    .output(
      z.object({
        success: z.boolean(),
        updatedAt: z.string()
      })
    )
    .errors({
      NOT_FOUND: {
        data: z.object({
          message: z.string().default('Resume not found')
        })
      },
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('Not authorized to update this resume')
        })
      },
      VALIDATION_ERROR: {
        data: z.object({
          message: z.string(),
          errors: z.record(z.string(), z.string())
        })
      }
    }),

  // ============================================================================
  // Delete Resume
  // ============================================================================
  delete: oc
    .route({
      method: 'DELETE',
      description: 'Delete a resume',
      summary: 'Delete Resume',
      tags: ['Resume']
    })
    .input(z.object({ id: z.string().min(1, 'Resume ID is required') }))
    .output(z.object({ success: z.boolean() }))
    .errors({
      NOT_FOUND: {
        data: z.object({
          message: z.string().default('Resume not found')
        })
      },
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('Not authorized to delete this resume')
        })
      }
    })
}

export * from './generated-schemas'
// Export schemas for use in other parts of the application
export * from './schemas'
