/**
 * Shared Schemas
 *
 * Common schemas used across multiple domains
 */

import { z } from 'zod'

// ============================================================================
// User Schemas
// ============================================================================

/**
 * Public user schema - shared across chat, connections, and people
 */
export const publicUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string().nullable(),
  displayUsername: z.string().nullable(),
  image: z.string().nullable(),
  bio: z.string().nullable(),
  isVerified: z.boolean()
})

/**
 * Extended public user schema with additional fields for people discovery
 */
export const extendedPublicUserSchema = publicUserSchema.extend({
  email: z.string(),
  summary: z.string().nullable(),
  website: z.string().nullable(),
  interests: z.array(z.string()).nullable(),
  createdAt: z.string()
})

// ============================================================================
// Type Exports
// ============================================================================

export type PublicUser = z.infer<typeof publicUserSchema>
export type ExtendedPublicUser = z.infer<typeof extendedPublicUserSchema>
