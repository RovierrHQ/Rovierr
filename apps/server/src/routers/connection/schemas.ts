/**
 * Connection Schemas
 *
 * Schemas extracted from ORPC contracts for use in Elysia routes
 */

import { z } from 'zod'

// ============================================================================
// Enum Schemas
// ============================================================================

export const connectionStatusSchema = z.enum([
  'pending',
  'accepted',
  'rejected',
  'blocked'
])

// ============================================================================
// Input Schemas
// ============================================================================

/**
 * Schema for sending a connection request
 */
export const sendConnectionRequestSchema = z.object({
  connectedUserId: z.string().min(1, 'User ID is required')
})

/**
 * Schema for accepting/rejecting a connection request
 */
export const connectionIdSchema = z.object({
  connectionId: z.string().min(1, 'Connection ID is required')
})

/**
 * Schema for listing connections with filters
 */
export const listConnectionsSchema = z.object({
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0)
})

/**
 * Schema for listing pending requests
 */
export const listPendingRequestsSchema = z.object({
  type: z.enum(['received', 'sent']),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0)
})

// ============================================================================
// Response Schemas
// ============================================================================

/**
 * Public user schema (minimal user info)
 */
export const publicUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string().nullable(),
  image: z.string().nullable(),
  bio: z.string().nullable(),
  isVerified: z.boolean()
})

/**
 * Connection schema
 */
export const connectionSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  userId: z.string(),
  connectedUserId: z.string(),
  status: connectionStatusSchema,
  requestedAt: z.string(),
  respondedAt: z.string().nullable(),
  expiresAt: z.string().nullable()
})

/**
 * Connection with user information
 */
export const connectionWithUserSchema = connectionSchema.extend({
  user: publicUserSchema.nullable()
})

// ============================================================================
// Type Exports
// ============================================================================

export type SendConnectionRequest = z.infer<typeof sendConnectionRequestSchema>
export type ConnectionId = z.infer<typeof connectionIdSchema>
export type ListConnections = z.infer<typeof listConnectionsSchema>
export type ListPendingRequests = z.infer<typeof listPendingRequestsSchema>
export type PublicUser = z.infer<typeof publicUserSchema>
export type Connection = z.infer<typeof connectionSchema>
export type ConnectionWithUser = z.infer<typeof connectionWithUserSchema>
