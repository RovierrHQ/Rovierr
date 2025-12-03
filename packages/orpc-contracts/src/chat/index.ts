import { oc } from '@orpc/contract'
import { z } from 'zod'
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

export const chat = {
  getOrCreateConversation: oc
    .route({
      method: 'POST',
      description: 'Get existing or create new conversation with a user',
      summary: 'Get/Create Conversation',
      tags: ['Chat']
    })
    .input(getOrCreateConversationSchema)
    .output(conversationWithParticipantsSchema)
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('User not authenticated')
        })
      },
      NOT_CONNECTED: {
        data: z.object({
          message: z.string().default('Not connected with this user')
        })
      }
    }),

  listConversations: oc
    .route({
      method: 'GET',
      description: 'List all conversations for the current user',
      summary: 'List Conversations',
      tags: ['Chat']
    })
    .input(listConversationsSchema)
    .output(
      z.object({
        conversations: z.array(conversationWithLastMessageSchema),
        total: z.number(),
        hasMore: z.boolean()
      })
    )
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('User not authenticated')
        })
      }
    }),

  sendMessage: oc
    .route({
      method: 'POST',
      description: 'Send a message in a conversation',
      summary: 'Send Message',
      tags: ['Chat']
    })
    .input(sendMessageSchema)
    .output(messageSchema)
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('User not authenticated')
        })
      },
      NOT_PARTICIPANT: {
        data: z.object({
          message: z.string().default('Not a participant in this conversation')
        })
      },
      CONNECTION_REMOVED: {
        data: z.object({
          message: z
            .string()
            .default('Cannot send message - connection has been removed')
        })
      }
    }),

  getMessages: oc
    .route({
      method: 'GET',
      description: 'Get messages from a conversation',
      summary: 'Get Messages',
      tags: ['Chat']
    })
    .input(getMessagesSchema)
    .output(
      z.object({
        messages: z.array(messageWithSenderSchema),
        hasMore: z.boolean()
      })
    )
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('User not authenticated')
        })
      },
      NOT_PARTICIPANT: {
        data: z.object({
          message: z.string().default('Not a participant in this conversation')
        })
      }
    }),

  markAsRead: oc
    .route({
      method: 'POST',
      description: 'Mark messages as read in a conversation',
      summary: 'Mark As Read',
      tags: ['Chat']
    })
    .input(markAsReadSchema)
    .output(z.object({ success: z.boolean() }))
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('User not authenticated')
        })
      },
      NOT_PARTICIPANT: {
        data: z.object({
          message: z.string().default('Not a participant in this conversation')
        })
      }
    }),

  getUnreadCount: oc
    .route({
      method: 'GET',
      description: 'Get total unread message count',
      summary: 'Get Unread Count',
      tags: ['Chat']
    })
    .output(z.object({ count: z.number() }))
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('User not authenticated')
        })
      }
    }),

  searchMessages: oc
    .route({
      method: 'GET',
      description: 'Search messages across all conversations',
      summary: 'Search Messages',
      tags: ['Chat']
    })
    .input(searchMessagesSchema)
    .output(
      z.object({
        results: z.array(messageSearchResultSchema),
        total: z.number()
      })
    )
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('User not authenticated')
        })
      }
    })
}

export const presence = {
  updateStatus: oc
    .route({
      method: 'POST',
      description: 'Update user online status',
      summary: 'Update Status',
      tags: ['Presence']
    })
    .input(updatePresenceSchema)
    .output(z.object({ success: z.boolean() }))
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('User not authenticated')
        })
      }
    }),

  getConnectionsStatus: oc
    .route({
      method: 'GET',
      description: 'Get online status of all connections',
      summary: 'Get Connections Status',
      tags: ['Presence']
    })
    .output(
      z.object({
        statuses: z.array(userPresenceSchema)
      })
    )
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('User not authenticated')
        })
      }
    })
}
