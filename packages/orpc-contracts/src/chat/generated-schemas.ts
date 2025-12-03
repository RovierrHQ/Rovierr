/**
 * Auto-generated Zod schemas from Drizzle database schemas
 *
 * DO NOT extend THIS schemas here
 *
 * These schemas are derived from the database structure using drizzle-zod.
 * For API-specific schemas, modifications, or composite schemas, use schemas.ts
 */

import {
  conversation,
  conversationParticipant,
  message,
  userPresence
} from '@rov/db/schema'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema
} from 'drizzle-zod'

// ============================================================================
// Conversation Schemas
// ============================================================================
export const insertConversationSchema = createInsertSchema(conversation)
export const selectConversationSchema = createSelectSchema(conversation)
export const updateConversationSchema = createUpdateSchema(conversation)

// ============================================================================
// Conversation Participant Schemas
// ============================================================================
export const insertConversationParticipantSchema = createInsertSchema(
  conversationParticipant
)
export const selectConversationParticipantSchema = createSelectSchema(
  conversationParticipant
)
export const updateConversationParticipantSchema = createUpdateSchema(
  conversationParticipant
)

// ============================================================================
// Message Schemas
// ============================================================================
export const insertMessageSchema = createInsertSchema(message)
export const selectMessageSchema = createSelectSchema(message)
export const updateMessageSchema = createUpdateSchema(message)

// ============================================================================
// User Presence Schemas
// ============================================================================
export const insertUserPresenceSchema = createInsertSchema(userPresence)
export const selectUserPresenceSchema = createSelectSchema(userPresence)
export const updateUserPresenceSchema = createUpdateSchema(userPresence)
