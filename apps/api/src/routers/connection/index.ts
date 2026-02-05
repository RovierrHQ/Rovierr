import { db } from '@api/lib/db'
import { betterAuth } from '@api/middleware/auth'
import Elysia from 'elysia'
import { z } from 'zod'
import {
  ALREADY_CONNECTED,
  FORBIDDEN,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  PENDING_REQUEST,
  SELF_CONNECTION
} from './errors'
import {
  connectionIdSchema,
  connectionSchema,
  connectionWithUserSchema,
  listConnectionsSchema,
  listPendingRequestsSchema,
  sendConnectionRequestSchema
} from './schemas'
import { ConnectionService } from './service'

// Initialize connection service
const connectionService = new ConnectionService(db)

export const connection = new Elysia({ name: 'connection' })
  .use(betterAuth)
  .group('/connection', { auth: true }, (app) =>
    app
      // POST /connection/send - Send connection request
      .post(
        '/send',
        async ({ body, user }) => {
          try {
            const result = await connectionService.sendConnectionRequest(
              user.id,
              body
            )
            return result
          } catch (error) {
            if (error instanceof Error) {
              if (error.message === 'SELF_CONNECTION') {
                throw new SELF_CONNECTION('Cannot connect with yourself')
              }
              if (error.message === 'ALREADY_CONNECTED') {
                throw new ALREADY_CONNECTED('Already connected with this user')
              }
              if (error.message === 'PENDING_REQUEST') {
                throw new PENDING_REQUEST('Connection request already pending')
              }
            }
            throw error
          }
        },
        {
          body: sendConnectionRequestSchema,
          response: connectionSchema,
          detail: {
            description: 'Send a connection request to another user',
            summary: 'Send Connection Request',
            tags: ['Connection']
          }
        }
      )

      // POST /connection/accept - Accept connection request
      .post(
        '/accept',
        async ({ body, user }) => {
          try {
            return await connectionService.acceptConnectionRequest(
              user.id,
              body.connectionId
            )
          } catch (error) {
            if (error instanceof Error) {
              if (error.message === 'NOT_FOUND') {
                throw new NOT_FOUND('Connection request not found')
              }
              if (error.message === 'FORBIDDEN') {
                throw new FORBIDDEN(
                  'You do not have permission to accept this request'
                )
              }
            }
            throw error
          }
        },
        {
          body: connectionIdSchema,
          response: connectionSchema,
          detail: {
            description: 'Accept a connection request',
            summary: 'Accept Connection',
            tags: ['Connection']
          }
        }
      )

      // POST /connection/reject - Reject connection request
      .post(
        '/reject',
        async ({ body, user }) => {
          try {
            return await connectionService.rejectConnectionRequest(
              user.id,
              body.connectionId
            )
          } catch (error) {
            if (error instanceof Error) {
              if (error.message === 'NOT_FOUND') {
                throw new NOT_FOUND('Connection request not found')
              }
              if (error.message === 'FORBIDDEN') {
                throw new FORBIDDEN(
                  'You do not have permission to reject this request'
                )
              }
            }
            throw error
          }
        },
        {
          body: connectionIdSchema,
          response: z.object({ success: z.boolean() }),
          detail: {
            description: 'Reject a connection request',
            summary: 'Reject Connection',
            tags: ['Connection']
          }
        }
      )

      // DELETE /connection/remove - Remove connection
      .delete(
        '/remove',
        async ({ body, user }) => {
          try {
            return await connectionService.removeConnection(
              user.id,
              body.connectionId
            )
          } catch (error) {
            if (error instanceof Error) {
              if (error.message === 'NOT_FOUND') {
                throw new NOT_FOUND('Connection not found')
              }
              if (error.message === 'FORBIDDEN') {
                throw new FORBIDDEN(
                  'You do not have permission to remove this connection'
                )
              }
            }
            throw error
          }
        },
        {
          body: connectionIdSchema,
          response: z.object({ success: z.boolean() }),
          detail: {
            description: 'Remove an existing connection',
            summary: 'Remove Connection',
            tags: ['Connection']
          }
        }
      )

      // GET /connection/pending - List pending requests
      .get(
        '/pending',
        async ({ query, user }) => {
          try {
            return await connectionService.listPendingRequests(user.id, query)
          } catch (error) {
            if (error instanceof Error) {
              throw new INTERNAL_SERVER_ERROR(error.message)
            }
            throw error
          }
        },
        {
          query: listPendingRequestsSchema,
          response: z.object({
            connections: z.array(connectionWithUserSchema),
            total: z.number(),
            hasMore: z.boolean()
          }),
          detail: {
            description: 'List pending connection requests',
            summary: 'List Pending Requests',
            tags: ['Connection']
          }
        }
      )

      // GET /connection/list - List connections
      .get(
        '/list',
        async ({ query, user }) => {
          try {
            return await connectionService.listConnections(user.id, query)
          } catch (error) {
            if (error instanceof Error) {
              throw new INTERNAL_SERVER_ERROR(error.message)
            }
            throw error
          }
        },
        {
          query: listConnectionsSchema,
          response: z.object({
            connections: z.array(connectionWithUserSchema),
            total: z.number(),
            hasMore: z.boolean()
          }),
          detail: {
            description: 'List accepted connections',
            summary: 'List Connections',
            tags: ['Connection']
          }
        }
      )
  )
