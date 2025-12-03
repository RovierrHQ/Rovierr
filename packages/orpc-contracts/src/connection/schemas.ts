/**
 * Connection Schemas
 *
 * This file uses Drizzle-generated schemas as the source of truth and extends them
 * for API-specific use cases.
 */

import { z } from 'zod'
import { publicUserSchema } from '../shared/schemas'
import { selectConnectionSchema } from './generated-schemas'

// ============================================================================
// Enum Schemas - Extracted from generated schemas
// ============================================================================

export const connectionStatusSchema = selectConnectionSchema.shape.status

// ============================================================================
// Input Schemas - Built from generated schemas
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
// Composite Schemas (for API responses with relations)
// ============================================================================

// Re-export publicUserSchema from shared schemas
export { type PublicUser, publicUserSchema } from '../shared/schemas'

/**
 * Connection schema with timestamps as strings
 */
export const connectionSchema = selectConnectionSchema
  .omit({
    createdAt: true,
    updatedAt: true,
    requestedAt: true,
    respondedAt: true,
    expiresAt: true
  })
  .extend({
    createdAt: z.string(),
    updatedAt: z.string(),
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
export type Connection = z.infer<typeof connectionSchema>
export type ConnectionWithUser = z.infer<typeof connectionWithUserSchema>
