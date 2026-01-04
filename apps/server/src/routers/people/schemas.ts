/**
 * People Schemas
 *
 * Schemas extracted from ORPC contracts for use in Elysia routes
 */

import { z } from 'zod'

// ============================================================================
// Shared User Schemas
// ============================================================================

export const publicUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string().nullable(),
  displayUsername: z.string().nullable(),
  image: z.string().nullable(),
  bio: z.string().nullable(),
  isVerified: z.boolean()
})

export const extendedPublicUserSchema = publicUserSchema.extend({
  email: z.string(),
  summary: z.string().nullable(),
  website: z.string().nullable(),
  interests: z.array(z.string()).nullable(),
  createdAt: z.string()
})

// ============================================================================
// People Specific Schemas
// ============================================================================

export const publicUserWithConnectionSchema = extendedPublicUserSchema.extend({
  connectionStatus: z
    .enum(['not_connected', 'pending_sent', 'pending_received', 'connected'])
    .nullable(),
  connectionId: z.string().nullable()
})

// ============================================================================
// Input Schemas
// ============================================================================

export const listUsersSchema = z.object({
  search: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0)
})

export const searchUsersSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  limit: z.number().min(1).max(100).default(50)
})

// ============================================================================
// Type Exports
// ============================================================================

export type PublicUser = z.infer<typeof publicUserSchema>
export type ExtendedPublicUser = z.infer<typeof extendedPublicUserSchema>
export type PublicUserWithConnection = z.infer<
  typeof publicUserWithConnectionSchema
>
export type ListUsers = z.infer<typeof listUsersSchema>
export type SearchUsers = z.infer<typeof searchUsersSchema>
