/**
 * Consolidated Career Schemas
 *
 * This file uses Drizzle-generated schemas as the source of truth and extends them
 * for API-specific use cases.
 */

import { z } from 'zod'
import {
  updateCoverLetterSchema as generatedUpdateCoverLetterSchema,
  updateJobApplicationSchema as generatedUpdateJobApplicationSchema,
  insertJobApplicationSchema,
  selectCoverLetterSchema,
  selectJobApplicationSchema,
  selectResumeSchema
} from './generated-schemas'

// ============================================================================
// Enum Schemas - Extracted from generated schemas
// ============================================================================

/**
 * Extract enum schemas directly from generated schemas using `.shape.fieldName`
 *
 * This approach:
 * - Avoids manual duplication of enum values
 * - Ensures enums stay in sync with database schema
 * - Leverages drizzle-zod's automatic enum extraction
 */
export const applicationStatusSchema = selectJobApplicationSchema.shape.status

// ============================================================================
// Input Schemas - Built from generated schemas
// ============================================================================

/**
 * Schema for creating a new job application
 */
export const createApplicationSchema = insertJobApplicationSchema
  .pick({
    companyName: true,
    positionTitle: true,
    jobPostUrl: true,
    location: true,
    salaryRange: true,
    notes: true
  })
  .extend({
    companyName: z.string().min(1, 'Company name is required').max(200),
    positionTitle: z.string().min(1, 'Position title is required').max(200),
    jobPostUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
    location: z.string().max(200).optional(),
    salaryRange: z.string().max(100).optional(),
    notes: z.string().max(2000).optional()
  })

/**
 * Schema for updating a job application
 */
export const updateApplicationSchema = generatedUpdateJobApplicationSchema
  .pick({
    id: true,
    companyName: true,
    positionTitle: true,
    jobPostUrl: true,
    location: true,
    salaryRange: true,
    notes: true
  })
  .extend({
    id: z.string().min(1, 'Application ID is required'),
    companyName: z
      .string()
      .min(1, 'Company name is required')
      .max(200)
      .optional(),
    positionTitle: z
      .string()
      .min(1, 'Position title is required')
      .max(200)
      .optional(),
    jobPostUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
    location: z.string().max(200).optional(),
    salaryRange: z.string().max(100).optional(),
    notes: z.string().max(2000).optional()
  })

/**
 * Schema for updating application status
 */
export const updateStatusSchema = z.object({
  id: z.string().min(1, 'Application ID is required'),
  status: applicationStatusSchema
})

/**
 * Schema for listing applications with filters
 */
export const listApplicationsSchema = z.object({
  status: applicationStatusSchema.optional(),
  search: z.string().optional(),
  sortBy: z.enum(['recent', 'company', 'status']).default('recent'),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0)
})

// ============================================================================
// Parsed Job Data Schema (from AI)
// ============================================================================

/**
 * Schema for parsed job data from AI service
 */
export const parsedJobDataSchema = z.object({
  companyName: z.string(),
  positionTitle: z.string(),
  location: z.string().nullable(),
  salaryRange: z.string().nullable()
})

// ============================================================================
// Statistics Schema
// ============================================================================

/**
 * Schema for application statistics
 */
export const statisticsSchema = z.object({
  total: z.number(),
  byStatus: z.record(applicationStatusSchema, z.number()),
  upcomingInterviews: z.number(),
  pendingResponses: z.number()
})

// ============================================================================
// Composite Schemas (for API responses)
// ============================================================================

/**
 * Application schema for API responses
 * Converts Date fields to strings for JSON serialization
 */
export const applicationSchema = selectJobApplicationSchema
  .omit({
    applicationDate: true,
    createdAt: true,
    updatedAt: true
  })
  .extend({
    applicationDate: z.string(),
    createdAt: z.string(),
    updatedAt: z.string()
  })

/**
 * Full application schema (same as applicationSchema for now)
 */
export const fullApplicationSchema = applicationSchema

/**
 * Applications list response schema
 */
export const applicationsListSchema = z.object({
  applications: z.array(applicationSchema),
  total: z.number(),
  hasMore: z.boolean()
})

// ============================================================================
// AI Assistant Schemas
// ============================================================================

/**
 * Extended parsed job data schema with additional fields for AI analysis
 */
export const extendedParsedJobDataSchema = parsedJobDataSchema.extend({
  description: z.string(),
  requirements: z.array(z.string()),
  responsibilities: z.array(z.string()),
  skills: z.array(z.string()),
  experienceYears: z.number().nullable(),
  educationLevel: z.string().nullable()
})

/**
 * Schema for resume analysis results
 */
export const resumeAnalysisSchema = z.object({
  matchScore: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  keywordMatches: z.object({
    found: z.array(z.string()),
    missing: z.array(z.string())
  }),
  sectionScores: z.record(
    z.string(),
    z.object({
      score: z.number(),
      feedback: z.string()
    })
  ),
  overallFeedback: z.string()
})

/**
 * Schema for individual resume suggestions
 */
export const resumeSuggestionSchema = z.object({
  id: z.string(),
  section: z.enum([
    'experience',
    'projects',
    'education',
    'basicInfo',
    'certifications'
  ]),
  itemId: z.string().nullable(),
  field: z.string(),
  originalContent: z.string(),
  proposedContent: z.string(),
  reasoning: z.string(),
  impactScore: z.number().min(1).max(10),
  keywords: z.array(z.string())
})

/**
 * Schema for parsing job description (text input)
 */
export const parseJobDescriptionSchema = z.object({
  text: z.string().min(1, 'Job description is required').max(10_000)
})

/**
 * Schema for parsing job description (URL input)
 */
export const parseJobUrlSchema = z.object({
  url: z.string().url('Invalid URL')
})

/**
 * Schema for analyzing resume against job
 */
export const analyzeResumeSchema = z.object({
  resumeId: z.string().min(1, 'Resume ID is required'),
  jobApplicationId: z.string().min(1, 'Job application ID is required'),
  jobData: extendedParsedJobDataSchema
})

/**
 * Schema for creating optimized resume
 */
export const createOptimizedResumeSchema = z.object({
  sourceResumeId: z.string().min(1, 'Source resume ID is required'),
  jobApplicationId: z.string().min(1, 'Job application ID is required'),
  selectedSuggestions: z.array(z.string()),
  title: z.string().min(1, 'Resume title is required').max(200)
})

/**
 * Schema for generating cover letter
 */
export const generateCoverLetterSchema = z.object({
  resumeId: z.string().min(1, 'Resume ID is required'),
  jobData: extendedParsedJobDataSchema,
  applicationId: z.string().optional()
})

/**
 * Schema for updating cover letter
 */
export const updateCoverLetterSchema = generatedUpdateCoverLetterSchema
  .pick({
    id: true,
    content: true
  })
  .extend({
    id: z.string().min(1, 'Cover letter ID is required'),
    content: z.string().min(1, 'Content is required')
  })

// ============================================================================
// Cover Letter Composite Schemas
// ============================================================================

/**
 * Cover letter schema for API responses
 */
export const coverLetterSchema = selectCoverLetterSchema
  .omit({
    createdAt: true,
    updatedAt: true
  })
  .extend({
    createdAt: z.string(),
    updatedAt: z.string()
  })

/**
 * Full cover letter with related data
 */
export const fullCoverLetterSchema = coverLetterSchema

// ============================================================================
// Resume Composite Schemas
// ============================================================================

/**
 * Resume schema for API responses
 */
export const resumeSchema = selectResumeSchema
  .omit({
    createdAt: true,
    updatedAt: true
  })
  .extend({
    createdAt: z.string(),
    updatedAt: z.string()
  })

/**
 * Resume with optimization metadata
 */
export const resumeWithMetadataSchema = resumeSchema.extend({
  sourceResume: resumeSchema.nullable(),
  optimizedForJob: applicationSchema.nullable()
})

// ============================================================================
// Type Exports
// ============================================================================

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>
export type ListApplicationsQuery = z.infer<typeof listApplicationsSchema>
export type ParsedJobData = z.infer<typeof parsedJobDataSchema>
export type ApplicationStatistics = z.infer<typeof statisticsSchema>
export type Application = z.infer<typeof applicationSchema>
export type FullApplication = z.infer<typeof fullApplicationSchema>
export type ApplicationsList = z.infer<typeof applicationsListSchema>

// AI Assistant Types
export type ExtendedParsedJobData = z.infer<typeof extendedParsedJobDataSchema>
export type ResumeAnalysis = z.infer<typeof resumeAnalysisSchema>
export type ResumeSuggestion = z.infer<typeof resumeSuggestionSchema>
export type ParseJobDescriptionInput = z.infer<typeof parseJobDescriptionSchema>
export type ParseJobUrlInput = z.infer<typeof parseJobUrlSchema>
export type AnalyzeResumeInput = z.infer<typeof analyzeResumeSchema>
export type CreateOptimizedResumeInput = z.infer<
  typeof createOptimizedResumeSchema
>
export type GenerateCoverLetterInput = z.infer<typeof generateCoverLetterSchema>
export type UpdateCoverLetterInput = z.infer<typeof updateCoverLetterSchema>
export type CoverLetter = z.infer<typeof coverLetterSchema>
export type FullCoverLetter = z.infer<typeof fullCoverLetterSchema>
export type Resume = z.infer<typeof resumeSchema>
export type ResumeWithMetadata = z.infer<typeof resumeWithMetadataSchema>
