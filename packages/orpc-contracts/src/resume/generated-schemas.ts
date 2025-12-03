/**
 * Auto-generated Zod schemas from Drizzle database schemas
 *
 * These schemas are derived from the database structure using drizzle-zod.
 * For API-specific schemas, modifications, or composite schemas, use schemas.ts
 */

import { resume } from '@rov/db/schema'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

// ============================================================================
// Resume Schemas
// ============================================================================
export const insertResumeSchema = createInsertSchema(resume)
export const selectResumeSchema = createSelectSchema(resume)
export const updateResumeSchema = insertResumeSchema
  .partial()
  .required({ id: true })
