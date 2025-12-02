/**
 * Consolidated Career Schemas
 *
 * This file uses Drizzle-generated schemas as the source of truth and extends them
 * for API-specific use cases.
 */

import { z } from 'zod'
import {
  updateJobApplicationSchema as generatedUpdateJobApplicationSchema,
  insertJobApplicationSchema,
  selectJobApplicationSchema
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
