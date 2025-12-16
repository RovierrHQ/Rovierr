/**
 * University Schemas
 *
 * Schemas for university listing endpoint
 */

import { institution } from '@rov/db/schema'
import { createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

// ============================================================================
// Generated Schemas from Database
// ============================================================================
export const selectInstitutionSchema = createSelectSchema(institution)

// ============================================================================
// Output Schemas
// ============================================================================

export const universitySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  logo: z.string().nullable(),
  country: z.string(),
  city: z.string(),
  address: z.string(),
  validEmailDomains: z.array(z.string())
})

export const listUniversitiesOutputSchema = z.object({
  universities: z.array(universitySchema)
})

// ============================================================================
// Type Exports
// ============================================================================

export type University = z.infer<typeof universitySchema>
export type ListUniversitiesOutput = z.infer<
  typeof listUniversitiesOutputSchema
>
