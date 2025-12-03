/**
 * People Schemas
 *
 * Schemas for user discovery and search functionality
 */

import { z } from 'zod'
import { extendedPublicUserSchema } from '../shared/schemas'

// ============================================================================
// Input Schemas
// ============================================================================

/**
 * Schema for listing users
 */
export const listUsersSchema = z.object({
  search: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0)
})

/**
 * Schema for searching users
 */
export const searchUsersSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  limit: z.number().min(1).max(100).default(50)
})

// ============================================================================
// Output Schemas
// ============================================================================

// Re-export extended public user schema from shared schemas
export {
  type ExtendedPublicUser as PublicUser,
  extendedPublicUserSchema as publicUserSchema
} from '../shared/schemas'

/**
 * Public user with connection status
 */
export const publicUserWithConnectionSchema = extendedPublicUserSchema.extend({
  connectionStatus: z
    .enum(['not_connected', 'pending_sent', 'pending_received', 'connected'])
    .nullable(),
  connectionId: z.string().nullable()
})

// ============================================================================
// Type Exports
// ============================================================================

export type ListUsers = z.infer<typeof listUsersSchema>
export type SearchUsers = z.infer<typeof searchUsersSchema>
export type PublicUserWithConnection = z.infer<
  typeof publicUserWithConnectionSchema
>
