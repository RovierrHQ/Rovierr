import { ORPCError } from '@orpc/server'
import { db } from '@/db'
import { protectedProcedure } from '@/lib/orpc'
import { ConnectionService } from '@/services/connection'

const connectionService = new ConnectionService(db)

export const connection = {
  send: protectedProcedure.connection.send.handler(
    async ({ input, context }) => {
      try {
        const result = await connectionService.sendConnectionRequest(
          context.session.user.id,
          input
        )
        return result
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'SELF_CONNECTION') {
            throw new ORPCError('SELF_CONNECTION', {
              message: 'Cannot connect with yourself'
            })
          }
          if (error.message === 'ALREADY_CONNECTED') {
            throw new ORPCError('ALREADY_CONNECTED', {
              message: 'Already connected with this user'
            })
          }
          if (error.message === 'PENDING_REQUEST') {
            throw new ORPCError('PENDING_REQUEST', {
              message: 'Connection request already pending'
            })
          }
        }
        throw error
      }
    }
  ),

  accept: protectedProcedure.connection.accept.handler(
    async ({ input, context }) => {
      try {
        return await connectionService.acceptConnectionRequest(
          context.session.user.id,
          input.connectionId
        )
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'NOT_FOUND') {
            throw new ORPCError('NOT_FOUND', {
              message: 'Connection request not found'
            })
          }
          if (error.message === 'FORBIDDEN') {
            throw new ORPCError('FORBIDDEN', {
              message: 'You do not have permission to accept this request'
            })
          }
        }
        throw error
      }
    }
  ),

  reject: protectedProcedure.connection.reject.handler(
    async ({ input, context }) => {
      try {
        return await connectionService.rejectConnectionRequest(
          context.session.user.id,
          input.connectionId
        )
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'NOT_FOUND') {
            throw new ORPCError('NOT_FOUND', {
              message: 'Connection request not found'
            })
          }
          if (error.message === 'FORBIDDEN') {
            throw new ORPCError('FORBIDDEN', {
              message: 'You do not have permission to reject this request'
            })
          }
        }
        throw error
      }
    }
  ),

  remove: protectedProcedure.connection.remove.handler(
    async ({ input, context }) => {
      try {
        return await connectionService.removeConnection(
          context.session.user.id,
          input.connectionId
        )
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'NOT_FOUND') {
            throw new ORPCError('NOT_FOUND', {
              message: 'Connection not found'
            })
          }
          if (error.message === 'FORBIDDEN') {
            throw new ORPCError('FORBIDDEN', {
              message: 'You do not have permission to remove this connection'
            })
          }
        }
        throw error
      }
    }
  ),

  listPending: protectedProcedure.connection.listPending.handler(
    async ({ input, context }) => {
      try {
        return await connectionService.listPendingRequests(
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

  listConnections: protectedProcedure.connection.listConnections.handler(
    async ({ input, context }) => {
      try {
        return await connectionService.listConnections(
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
  )
}
