/**
 * Auto-generated Zod schemas from Drizzle database schemas
 *
 * DO NOT extend THIS schemas here
 *
 * These schemas are derived from the database structure using drizzle-zod.
 * For API-specific schemas, modifications, or composite schemas, use schemas.ts
 */

import { connection } from '@rov/db/schema'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema
} from 'drizzle-zod'

// ============================================================================
// Connection Schemas
// ============================================================================
export const insertConnectionSchema = createInsertSchema(connection)
export const selectConnectionSchema = createSelectSchema(connection)
export const updateConnectionSchema = createUpdateSchema(connection)
