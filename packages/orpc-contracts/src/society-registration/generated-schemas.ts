/**
 * Auto-generated Zod schemas from Drizzle database schemas
 *
 * DO NOT extend THIS schemas here
 *
 * These schemas are derived from the database structure using drizzle-zod.
 * For API-specific schemas, modifications, or composite schemas, use schemas.ts
 */

import { joinRequests, registrationSettings } from '@rov/db/schema'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema
} from 'drizzle-zod'

// ============================================================================
// Registration Settings Schemas
// ============================================================================
export const insertRegistrationSettingsSchema =
  createInsertSchema(registrationSettings)
export const selectRegistrationSettingsSchema =
  createSelectSchema(registrationSettings)
export const updateRegistrationSettingsSchema =
  createUpdateSchema(registrationSettings)

// ============================================================================
// Join Requests Schemas
// ============================================================================
export const insertJoinRequestSchema = createInsertSchema(joinRequests)
export const selectJoinRequestSchema = createSelectSchema(joinRequests)
export const updateJoinRequestSchema = createUpdateSchema(joinRequests)
