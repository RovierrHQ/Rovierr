import { oc } from '@orpc/contract'
import { z } from 'zod'
import {
  analyzeResumeSchema,
  applicationSchema,
  applicationsListSchema,
  coverLetterSchema,
  createApplicationSchema,
  createOptimizedResumeSchema,
  extendedParsedJobDataSchema,
  fullApplicationSchema,
  generateCoverLetterSchema,
  listApplicationsSchema,
  parsedJobDataSchema,
  parseJobDescriptionSchema,
  parseJobUrlSchema,
  resumeAnalysisSchema,
  resumeSchema,
  resumeSuggestionSchema,
  statisticsSchema,
  updateApplicationSchema,
  updateCoverLetterSchema,
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
  },

  // ============================================================================
  // AI Assistant Routes
  // ============================================================================
  ai: {
    // ============================================================================
    // Parse Job Description (Text)
    // ============================================================================
    parseJobDescription: oc
      .route({
        method: 'POST',
        description: 'Parse job description from text using AI',
        summary: 'Parse Job Description',
        tags: ['Career', 'AI']
      })
      .input(parseJobDescriptionSchema)
      .output(extendedParsedJobDataSchema)
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
        },
        AI_PARSING_FAILED: {
          data: z.object({
            message: z.string().default('Failed to parse job description')
          })
        }
      }),

    // ============================================================================
    // Parse Job URL
    // ============================================================================
    parseJobUrl: oc
      .route({
        method: 'POST',
        description: 'Parse job description from URL using AI',
        summary: 'Parse Job URL',
        tags: ['Career', 'AI']
      })
      .input(parseJobUrlSchema)
      .output(extendedParsedJobDataSchema)
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
            message: z.string().default('Failed to parse job information')
          })
        }
      }),

    // ============================================================================
    // Analyze Resume
    // ============================================================================
    analyzeResume: oc
      .route({
        method: 'POST',
        description: 'Analyze resume against job description using AI',
        summary: 'Analyze Resume',
        tags: ['Career', 'AI']
      })
      .input(analyzeResumeSchema)
      .output(
        z.object({
          analysis: resumeAnalysisSchema,
          suggestions: z.array(resumeSuggestionSchema)
        })
      )
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        NOT_FOUND: {
          data: z.object({
            message: z.string().default('Resume not found')
          })
        },
        FORBIDDEN: {
          data: z.object({
            message: z
              .string()
              .default('You do not have permission to access this resume')
          })
        },
        AI_ANALYSIS_FAILED: {
          data: z.object({
            message: z.string().default('Failed to analyze resume')
          })
        }
      }),

    // ============================================================================
    // Create Optimized Resume
    // ============================================================================
    createOptimizedResume: oc
      .route({
        method: 'POST',
        description: 'Create optimized resume version with applied suggestions',
        summary: 'Create Optimized Resume',
        tags: ['Career', 'AI']
      })
      .input(createOptimizedResumeSchema)
      .output(resumeSchema)
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        NOT_FOUND: {
          data: z.object({
            message: z.string().default('Source resume not found')
          })
        },
        FORBIDDEN: {
          data: z.object({
            message: z
              .string()
              .default('You do not have permission to access this resume')
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
    // Generate Cover Letter
    // ============================================================================
    generateCoverLetter: oc
      .route({
        method: 'POST',
        description: 'Generate cover letter using AI',
        summary: 'Generate Cover Letter',
        tags: ['Career', 'AI']
      })
      .input(generateCoverLetterSchema)
      .output(coverLetterSchema)
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        NOT_FOUND: {
          data: z.object({
            message: z.string().default('Resume not found')
          })
        },
        FORBIDDEN: {
          data: z.object({
            message: z
              .string()
              .default('You do not have permission to access this resume')
          })
        },
        AI_GENERATION_FAILED: {
          data: z.object({
            message: z.string().default('Failed to generate cover letter')
          })
        }
      }),

    // ============================================================================
    // Get Cover Letter
    // ============================================================================
    getCoverLetter: oc
      .route({
        method: 'GET',
        description: 'Get cover letter by ID',
        summary: 'Get Cover Letter',
        tags: ['Career', 'AI']
      })
      .input(z.object({ id: z.string().min(1, 'Cover letter ID is required') }))
      .output(coverLetterSchema)
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        NOT_FOUND: {
          data: z.object({
            message: z.string().default('Cover letter not found')
          })
        },
        FORBIDDEN: {
          data: z.object({
            message: z
              .string()
              .default('You do not have permission to access this cover letter')
          })
        }
      }),

    // ============================================================================
    // Update Cover Letter
    // ============================================================================
    updateCoverLetter: oc
      .route({
        method: 'PATCH',
        description: 'Update cover letter content',
        summary: 'Update Cover Letter',
        tags: ['Career', 'AI']
      })
      .input(updateCoverLetterSchema)
      .output(coverLetterSchema)
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        NOT_FOUND: {
          data: z.object({
            message: z.string().default('Cover letter not found')
          })
        },
        FORBIDDEN: {
          data: z.object({
            message: z
              .string()
              .default('You do not have permission to edit this cover letter')
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
    // Delete Cover Letter
    // ============================================================================
    deleteCoverLetter: oc
      .route({
        method: 'DELETE',
        description: 'Delete cover letter',
        summary: 'Delete Cover Letter',
        tags: ['Career', 'AI']
      })
      .input(z.object({ id: z.string().min(1, 'Cover letter ID is required') }))
      .output(z.object({ success: z.boolean() }))
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        NOT_FOUND: {
          data: z.object({
            message: z.string().default('Cover letter not found')
          })
        },
        FORBIDDEN: {
          data: z.object({
            message: z
              .string()
              .default('You do not have permission to delete this cover letter')
          })
        }
      })
  }
}

// Export schemas for use in other parts of the application
export * from './schemas'
