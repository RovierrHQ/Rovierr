import { db } from '@api/lib/db'
import { env } from '@api/lib/env'
import { betterAuth } from '@api/middleware/auth'
import Elysia from 'elysia'
import { z } from 'zod'
import {
  CONNECTION_REMOVED,
  INTERNAL_SERVER_ERROR,
  NOT_CONNECTED,
  NOT_PARTICIPANT
} from './errors'
import {
  conversationWithLastMessageSchema,
  conversationWithParticipantsSchema,
  getMessagesSchema,
  getOrCreateConversationSchema,
  listConversationsSchema,
  markAsReadSchema,
  messageSchema,
  messageSearchResultSchema,
  messageWithSenderSchema,
  searchMessagesSchema,
  sendMessageSchema,
  updatePresenceSchema,
  userPresenceSchema
} from './schemas'
import { ChatService, PresenceService } from './service'

// Initialize chat service
const chatService = new ChatService(db, {
  url: env.CENTRIFUGO_URL || 'http://localhost:8000',
  apiKey: env.CENTRIFUGO_API_KEY || ''
})

// Initialize presence service
const presenceService = new PresenceService(db, {
  url: env.CENTRIFUGO_URL || 'http://localhost:8000',
  apiKey: env.CENTRIFUGO_API_KEY || ''
})

export const chat = new Elysia({ name: 'chat' })
  .use(betterAuth)
  .group('/chat', { auth: true }, (app) =>
    app
      // POST /chat/conversation - Get or create conversation
      .post(
        '/conversation',
        async ({ body, user }) => {
          try {
            return await chatService.getOrCreateConversation(user.id, body)
          } catch (error) {
            if (error instanceof Error && error.message === 'NOT_CONNECTED') {
              throw new NOT_CONNECTED('Not connected with this user')
            }
            throw error
          }
        },
        {
          body: getOrCreateConversationSchema,
          response: conversationWithParticipantsSchema,
          detail: {
            description: 'Get existing or create new conversation with a user',
            summary: 'Get/Create Conversation',
            tags: ['Chat']
          }
        }
      )

      // GET /chat/conversations - List conversations
      .get(
        '/conversations',
        async ({ query, user }) => {
          try {
            return await chatService.listConversations(user.id, query)
          } catch (error) {
            if (error instanceof Error) {
              throw new INTERNAL_SERVER_ERROR(error.message)
            }
            throw error
          }
        },
        {
          query: listConversationsSchema,
          response: z.object({
            conversations: z.array(conversationWithLastMessageSchema),
            total: z.number(),
            hasMore: z.boolean()
          }),
          detail: {
            description: 'List all conversations for the current user',
            summary: 'List Conversations',
            tags: ['Chat']
          }
        }
      )

      // POST /chat/message - Send message
      .post(
        '/message',
        async ({ body, user }) => {
          try {
            return await chatService.sendMessage(user.id, body)
          } catch (error) {
            if (error instanceof Error) {
              if (error.message === 'NOT_PARTICIPANT') {
                throw new NOT_PARTICIPANT(
                  'Not a participant in this conversation'
                )
              }
              if (error.message === 'CONNECTION_REMOVED') {
                throw new CONNECTION_REMOVED(
                  'Cannot send message - connection has been removed'
                )
              }
            }
            throw error
          }
        },
        {
          body: sendMessageSchema,
          response: messageSchema,
          detail: {
            description: 'Send a message in a conversation',
            summary: 'Send Message',
            tags: ['Chat']
          }
        }
      )

      // GET /chat/messages - Get messages
      .get(
        '/messages',
        async ({ query, user }) => {
          try {
            return await chatService.getMessages(user.id, query)
          } catch (error) {
            if (error instanceof Error && error.message === 'NOT_PARTICIPANT') {
              throw new NOT_PARTICIPANT(
                'Not a participant in this conversation'
              )
            }
            throw error
          }
        },
        {
          query: getMessagesSchema,
          response: z.object({
            messages: z.array(messageWithSenderSchema),
            hasMore: z.boolean()
          }),
          detail: {
            description: 'Get messages from a conversation',
            summary: 'Get Messages',
            tags: ['Chat']
          }
        }
      )

      // POST /chat/mark-read - Mark messages as read
      .post(
        '/mark-read',
        async ({ body, user }) => {
          try {
            return await chatService.markAsRead(user.id, body)
          } catch (error) {
            if (error instanceof Error && error.message === 'NOT_PARTICIPANT') {
              throw new NOT_PARTICIPANT(
                'Not a participant in this conversation'
              )
            }
            throw error
          }
        },
        {
          body: markAsReadSchema,
          response: z.object({ success: z.boolean() }),
          detail: {
            description: 'Mark messages as read in a conversation',
            summary: 'Mark As Read',
            tags: ['Chat']
          }
        }
      )

      // GET /chat/unread-count - Get unread count
      .get(
        '/unread-count',
        async ({ user }) => {
          try {
            return await chatService.getUnreadCount(user.id)
          } catch (error) {
            if (error instanceof Error) {
              throw new INTERNAL_SERVER_ERROR(error.message)
            }
            throw error
          }
        },
        {
          response: z.object({ count: z.number() }),
          detail: {
            description: 'Get total unread message count',
            summary: 'Get Unread Count',
            tags: ['Chat']
          }
        }
      )

      // GET /chat/search - Search messages
      .get(
        '/search',
        async ({ query, user }) => {
          try {
            return await chatService.searchMessages(user.id, query)
          } catch (error) {
            if (error instanceof Error) {
              throw new INTERNAL_SERVER_ERROR(error.message)
            }
            throw error
          }
        },
        {
          query: searchMessagesSchema,
          response: z.object({
            results: z.array(messageSearchResultSchema),
            total: z.number()
          }),
          detail: {
            description: 'Search messages across all conversations',
            summary: 'Search Messages',
            tags: ['Chat']
          }
        }
      )
  )

  // Presence routes
  .group('/presence', { auth: true }, (app) =>
    app
      // POST /presence/status - Update status
      .post(
        '/status',
        async ({ body, user }) => {
          try {
            return await presenceService.updateStatus(user.id, body)
          } catch (error) {
            if (error instanceof Error) {
              throw new INTERNAL_SERVER_ERROR(error.message)
            }
            throw error
          }
        },
        {
          body: updatePresenceSchema,
          response: z.object({ success: z.boolean() }),
          detail: {
            description: 'Update user online status',
            summary: 'Update Status',
            tags: ['Presence']
          }
        }
      )

      // GET /presence/connections - Get connections status
      .get(
        '/connections',
        async ({ user }) => {
          try {
            return await presenceService.getConnectionsStatus(user.id)
          } catch (error) {
            if (error instanceof Error) {
              throw new INTERNAL_SERVER_ERROR(error.message)
            }
            throw error
          }
        },
        {
          response: z.object({
            statuses: z.array(userPresenceSchema)
          }),
          detail: {
            description: 'Get online status of all connections',
            summary: 'Get Connections Status',
            tags: ['Presence']
          }
        }
      )
  )
