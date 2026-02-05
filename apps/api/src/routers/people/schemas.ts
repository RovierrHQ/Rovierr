/**
 * People Schemas
 *
 * Schemas for user discovery and search functionality
 */

import { z } from 'zod'
// ============================================================================
// Input Schemas
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
export type PublicUser = z.infer<typeof publicUserSchema>
export type ExtendedPublicUser = z.infer<typeof extendedPublicUserSchema>
