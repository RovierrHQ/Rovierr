import { ORPCError } from '@orpc/server'
import { db } from '@/db'
import { env } from '@/lib/env'
import { protectedProcedure } from '@/lib/orpc'
import { ChatService } from '@/services/chat'
import { PresenceService } from '@/services/presence'

const chatService = new ChatService(db, {
  url: env.CENTRIFUGO_URL || 'http://localhost:8000',
  apiKey: env.CENTRIFUGO_API_KEY || ''
})

export const chat = {
  getOrCreateConversation:
    protectedProcedure.chat.getOrCreateConversation.handler(
      async ({ input, context }) => {
        try {
          return await chatService.getOrCreateConversation(
            context.session.user.id,
            input
          )
        } catch (error) {
          if (error instanceof Error && error.message === 'NOT_CONNECTED') {
            throw new ORPCError('NOT_CONNECTED', {
              message: 'Not connected with this user'
            })
          }
          throw error
        }
      }
    ),

  listConversations: protectedProcedure.chat.listConversations.handler(
    async ({ input, context }) => {
      try {
        return await chatService.listConversations(
          context.session.user.id,
          input
        )
      } catch (error) {
        if (error instanceof Error) {
          throw new ORPCError('INTERNAL_SERVER_ERROR', {
            message: error.message
          })
        }
        throw error
      }
    }
  ),

  sendMessage: protectedProcedure.chat.sendMessage.handler(
    async ({ input, context }) => {
      try {
        return await chatService.sendMessage(context.session.user.id, input)
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'NOT_PARTICIPANT') {
            throw new ORPCError('NOT_PARTICIPANT', {
              message: 'Not a participant in this conversation'
            })
          }
          if (error.message === 'CONNECTION_REMOVED') {
            throw new ORPCError('CONNECTION_REMOVED', {
              message: 'Cannot send message - connection has been removed'
            })
          }
        }
        throw error
      }
    }
  ),

  getMessages: protectedProcedure.chat.getMessages.handler(
    async ({ input, context }) => {
      try {
        return await chatService.getMessages(context.session.user.id, input)
      } catch (error) {
        if (error instanceof Error && error.message === 'NOT_PARTICIPANT') {
          throw new ORPCError('NOT_PARTICIPANT', {
            message: 'Not a participant in this conversation'
          })
        }
        throw error
      }
    }
  ),

  markAsRead: protectedProcedure.chat.markAsRead.handler(
    async ({ input, context }) => {
      try {
        return await chatService.markAsRead(context.session.user.id, input)
      } catch (error) {
        if (error instanceof Error && error.message === 'NOT_PARTICIPANT') {
          throw new ORPCError('NOT_PARTICIPANT', {
            message: 'Not a participant in this conversation'
          })
        }
        throw error
      }
    }
  ),

  getUnreadCount: protectedProcedure.chat.getUnreadCount.handler(
    async ({ context }) => {
      try {
        return await chatService.getUnreadCount(context.session.user.id)
      } catch (error) {
        if (error instanceof Error) {
          throw new ORPCError('INTERNAL_SERVER_ERROR', {
            message: error.message
          })
        }
        throw error
      }
    }
  ),

  searchMessages: protectedProcedure.chat.searchMessages.handler(
    async ({ input, context }) => {
      try {
        return await chatService.searchMessages(context.session.user.id, input)
      } catch (error) {
        if (error instanceof Error) {
          throw new ORPCError('INTERNAL_SERVER_ERROR', {
            message: error.message
          })
        }
        throw error
      }
    }
  )
}

export const presence = {
  updateStatus: protectedProcedure.presence.updateStatus.handler(
    async ({ input, context }) => {
      try {
        const presenceService = new PresenceService(db, {
          url: env.CENTRIFUGO_URL || 'http://localhost:8000',
          apiKey: env.CENTRIFUGO_API_KEY || ''
        })
        return await presenceService.updateStatus(
          context.session.user.id,
          input
        )
      } catch (error) {
        if (error instanceof Error) {
          throw new ORPCError('INTERNAL_SERVER_ERROR', {
            message: error.message
          })
        }
        throw error
      }
    }
  ),

  getConnectionsStatus:
    protectedProcedure.presence.getConnectionsStatus.handler(
      async ({ context }) => {
        try {
          const presenceService = new PresenceService(db, {
            url: env.CENTRIFUGO_URL || 'http://localhost:8000',
            apiKey: env.CENTRIFUGO_API_KEY || ''
          })
          return await presenceService.getConnectionsStatus(
            context.session.user.id
          )
        } catch (error) {
          if (error instanceof Error) {
            throw new ORPCError('INTERNAL_SERVER_ERROR', {
              message: error.message
            })
          }
          throw error
        }
      }
    )
}
