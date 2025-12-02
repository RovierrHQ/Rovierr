/**
 * Auto-generated Zod schemas from Drizzle database schemas
 *
 * DO NOT extend THIS schemas here
 *
 * These schemas are derived from the database structure using drizzle-zod.
 * For API-specific schemas, modifications, or composite schemas, use schemas.ts
 */

import { societyEmail } from '@rov/db/schema'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema
} from 'drizzle-zod'

// ============================================================================
// Society Email Schemas
// ============================================================================
export const insertSocietyEmailSchema = createInsertSchema(societyEmail)
export const selectSocietyEmailSchema = createSelectSchema(societyEmail)
export const updateSocietyEmailSchema = createUpdateSchema(societyEmail)
