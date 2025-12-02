import { oc } from '@orpc/contract'
import { z } from 'zod'
import {
  applicationSchema,
  applicationsListSchema,
  createApplicationSchema,
  fullApplicationSchema,
  listApplicationsSchema,
  parsedJobDataSchema,
  statisticsSchema,
  updateApplicationSchema,
  updateStatusSchema
} from './schemas'

export const career = {
  applications: {
    // ============================================================================
    // Create Application
    // ============================================================================
    create: oc
      .route({
        method: 'POST',
        description: 'Create a new job application',
        summary: 'Create Application',
        tags: ['Career']
      })
      .input(createApplicationSchema)
      .output(applicationSchema)
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
    // Parse URL
    // ============================================================================
    parseUrl: oc
      .route({
        method: 'POST',
        description: 'Parse job post URL and extract information using AI',
        summary: 'Parse Job URL',
        tags: ['Career']
      })
      .input(z.object({ url: z.string().url('Invalid URL') }))
      .output(parsedJobDataSchema)
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        INVALID_URL: {
          data: z.object({
            message: z.string().default('Invalid or inaccessible URL')
          })
        },
        URL_FETCH_FAILED: {
          data: z.object({
            message: z.string().default('Failed to fetch URL content')
          })
        },
        AI_PARSING_FAILED: {
          data: z.object({
            message: z
              .string()
              .default('Failed to parse job information from URL')
          })
        }
      }),

    // ============================================================================
    // List Applications
    // ============================================================================
    list: oc
      .route({
        method: 'GET',
        description: 'List job applications with filters',
        summary: 'List Applications',
        tags: ['Career']
      })
      .input(listApplicationsSchema)
      .output(applicationsListSchema)
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        }
      }),

    // ============================================================================
    // Get Application
    // ============================================================================
    get: oc
      .route({
        method: 'GET',
        description: 'Get a single job application by ID',
        summary: 'Get Application',
        tags: ['Career']
      })
      .input(z.object({ id: z.string().min(1, 'Application ID is required') }))
      .output(fullApplicationSchema)
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        NOT_FOUND: {
          data: z.object({
            message: z.string().default('Application not found')
          })
        },
        FORBIDDEN: {
          data: z.object({
            message: z
              .string()
              .default('You do not have permission to view this application')
          })
        }
      }),

    // ============================================================================
    // Update Application
    // ============================================================================
    update: oc
      .route({
        method: 'PATCH',
        description: 'Update a job application',
        summary: 'Update Application',
        tags: ['Career']
      })
      .input(updateApplicationSchema)
      .output(applicationSchema)
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        NOT_FOUND: {
          data: z.object({
            message: z.string().default('Application not found')
          })
        },
        FORBIDDEN: {
          data: z.object({
            message: z
              .string()
              .default('You do not have permission to edit this application')
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
    // Delete Application
    // ============================================================================
    delete: oc
      .route({
        method: 'DELETE',
        description: 'Delete a job application',
        summary: 'Delete Application',
        tags: ['Career']
      })
      .input(z.object({ id: z.string().min(1, 'Application ID is required') }))
      .output(z.object({ success: z.boolean() }))
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        NOT_FOUND: {
          data: z.object({
            message: z.string().default('Application not found')
          })
        },
        FORBIDDEN: {
          data: z.object({
            message: z
              .string()
              .default('You do not have permission to delete this application')
          })
        }
      }),

    // ============================================================================
    // Update Status
    // ============================================================================
    updateStatus: oc
      .route({
        method: 'PATCH',
        description: 'Update application status',
        summary: 'Update Status',
        tags: ['Career']
      })
      .input(updateStatusSchema)
      .output(applicationSchema)
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        NOT_FOUND: {
          data: z.object({
            message: z.string().default('Application not found')
          })
        },
        FORBIDDEN: {
          data: z.object({
            message: z
              .string()
              .default('You do not have permission to edit this application')
          })
        },
        INVALID_STATUS: {
          data: z.object({
            message: z.string().default('Invalid status value')
          })
        }
      }),

    // ============================================================================
    // Get Statistics
    // ============================================================================
    statistics: oc
      .route({
        method: 'GET',
        description: 'Get application statistics for the current user',
        summary: 'Get Statistics',
        tags: ['Career']
      })
      .input(z.object({}))
      .output(statisticsSchema)
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        }
      })
  }
}

// Export schemas for use in other parts of the application
export * from './schemas'
