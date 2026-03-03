/**
 * Chat Schemas
 *
 * Schemas extracted from ORPC contracts for use in Elysia routes
 */

import { z } from 'zod'

// ============================================================================
// Enum Schemas
// ============================================================================

export const conversationTypeSchema = z.enum(['direct', 'group'])
export const participantRoleSchema = z.enum(['member', 'admin'])
export const messageTypeSchema = z.enum(['text', 'image', 'file', 'system'])
export const presenceStatusSchema = z.enum(['online', 'offline', 'away'])

// ============================================================================
// Input Schemas
// ============================================================================

/**
 * Schema for getting or creating a conversation
 */
export const getOrCreateConversationSchema = z.object({
  userId: z.string().min(1, 'User ID is required')
})

/**
 * Schema for listing conversations
 */
export const listConversationsSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0)
})

/**
 * Schema for sending a message
 */
export const sendMessageSchema = z.object({
  conversationId: z.string().min(1, 'Conversation ID is required'),
  content: z.string().min(1, 'Message content is required').max(10_000),
  type: messageTypeSchema.default('text'),
  metadata: z.string().nullable().optional(),
  replyToMessageId: z.string().nullable().optional()
})

/**
 * Schema for getting messages
 */
export const getMessagesSchema = z.object({
  conversationId: z.string().min(1, 'Conversation ID is required'),
  limit: z.coerce.number().min(1).max(100).default(50),
  before: z.string().optional() // Message ID to load messages before
})

/**
 * Schema for marking messages as read
 */
export const markAsReadSchema = z.object({
  conversationId: z.string().min(1, 'Conversation ID is required')
})

/**
 * Schema for searching messages
 */
export const searchMessagesSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  limit: z.coerce.number().min(1).max(100).default(20)
})

/**
 * Schema for updating presence status
 */
export const updatePresenceSchema = z.object({
  status: presenceStatusSchema
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
  image: z.string().nullable()
})

/**
 * Conversation schema
 */
export const conversationSchema = z.object({
  id: z.string(),
  type: conversationTypeSchema,
  name: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  lastMessageAt: z.string().nullable()
})

/**
 * Conversation participant schema
 */
export const conversationParticipantSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  userId: z.string(),
  role: participantRoleSchema,
  lastReadAt: z.string().nullable(),
  joinedAt: z.string(),
  leftAt: z.string().nullable()
})

/**
 * Conversation participant with user information
 */
export const conversationParticipantWithUserSchema =
  conversationParticipantSchema.extend({
    user: publicUserSchema
  })

/**
 * Conversation with participants
 */
export const conversationWithParticipantsSchema = conversationSchema.extend({
  participants: z.array(conversationParticipantWithUserSchema)
})

/**
 * Message schema
 */
export const messageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  senderId: z.string(),
  content: z.string(),
  type: messageTypeSchema,
  metadata: z.string().nullable(),
  replyToMessageId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deliveredAt: z.string().nullable(),
  editedAt: z.string().nullable(),
  deletedAt: z.string().nullable()
})

/**
 * Message with sender information
 */
export const messageWithSenderSchema = messageSchema.extend({
  sender: publicUserSchema,
  replyToMessage: messageSchema.nullable().optional()
})

/**
 * Conversation with last message and unread count
 */
export const conversationWithLastMessageSchema = conversationSchema.extend({
  lastMessage: messageSchema.nullable(),
  unreadCount: z.number(),
  otherParticipant: publicUserSchema.nullable() // For direct conversations
})

/**
 * Message search result
 */
export const messageSearchResultSchema = messageSchema.extend({
  sender: publicUserSchema,
  conversation: conversationSchema,
  matchedText: z.string()
})

/**
 * User presence schema
 */
export const userPresenceSchema = z.object({
  userId: z.string(),
  status: presenceStatusSchema,
  lastSeenAt: z.string(),
  updatedAt: z.string()
})

// ============================================================================
// Type Exports
// ============================================================================

export type GetOrCreateConversation = z.infer<
  typeof getOrCreateConversationSchema
>
export type ListConversations = z.infer<typeof listConversationsSchema>
export type SendMessage = z.infer<typeof sendMessageSchema>
export type GetMessages = z.infer<typeof getMessagesSchema>
export type MarkAsRead = z.infer<typeof markAsReadSchema>
export type SearchMessages = z.infer<typeof searchMessagesSchema>
export type UpdatePresence = z.infer<typeof updatePresenceSchema>
export type PublicUser = z.infer<typeof publicUserSchema>
export type Conversation = z.infer<typeof conversationSchema>
export type ConversationParticipant = z.infer<
  typeof conversationParticipantSchema
>
export type ConversationParticipantWithUser = z.infer<
  typeof conversationParticipantWithUserSchema
>
export type ConversationWithParticipants = z.infer<
  typeof conversationWithParticipantsSchema
>
export type Message = z.infer<typeof messageSchema>
export type MessageWithSender = z.infer<typeof messageWithSenderSchema>
export type ConversationWithLastMessage = z.infer<
  typeof conversationWithLastMessageSchema
>
export type MessageSearchResult = z.infer<typeof messageSearchResultSchema>
export type UserPresence = z.infer<typeof userPresenceSchema>
