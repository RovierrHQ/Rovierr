/**
 * Auto-generated Zod schemas from Drizzle database schemas
 *
 * DO NOT extend THIS schemas here
 *
 * These schemas are derived from the database structure using drizzle-zod.
 * For API-specific schemas, modifications, or composite schemas, use schemas.ts
 */

import { coverLetter, jobApplication, resume } from '@rov/db/schema'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema
} from 'drizzle-zod'

// ============================================================================
// Job Application Schemas
// ============================================================================
export const insertJobApplicationSchema = createInsertSchema(jobApplication)
export const selectJobApplicationSchema = createSelectSchema(jobApplication)
export const updateJobApplicationSchema = createUpdateSchema(jobApplication)

// ============================================================================
// Resume Schemas
// ============================================================================
export const insertResumeSchema = createInsertSchema(resume)
export const selectResumeSchema = createSelectSchema(resume)
export const updateResumeSchema = createUpdateSchema(resume)

// ============================================================================
// Cover Letter Schemas
// ============================================================================
export const insertCoverLetterSchema = createInsertSchema(coverLetter)
export const selectCoverLetterSchema = createSelectSchema(coverLetter)
export const updateCoverLetterSchema = createUpdateSchema(coverLetter)
