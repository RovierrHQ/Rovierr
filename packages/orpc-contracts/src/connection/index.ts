import { oc } from '@orpc/contract'
import { z } from 'zod'
import {
  connectionIdSchema,
  connectionSchema,
  connectionWithUserSchema,
  listConnectionsSchema,
  listPendingRequestsSchema,
  sendConnectionRequestSchema
} from './schemas'

export const connection = {
  send: oc
    .route({
      method: 'POST',
      description: 'Send a connection request to another user',
      summary: 'Send Connection Request',
      tags: ['Connection']
    })
    .input(sendConnectionRequestSchema)
    .output(connectionSchema)
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('User not authenticated')
        })
      },
      ALREADY_CONNECTED: {
        data: z.object({
          message: z.string().default('Already connected with this user')
        })
      },
      PENDING_REQUEST: {
        data: z.object({
          message: z.string().default('Connection request already pending')
        })
      },
      SELF_CONNECTION: {
        data: z.object({
          message: z.string().default('Cannot connect with yourself')
        })
      }
    }),

  accept: oc
    .route({
      method: 'POST',
      description: 'Accept a connection request',
      summary: 'Accept Connection',
      tags: ['Connection']
    })
    .input(connectionIdSchema)
    .output(connectionSchema)
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('User not authenticated')
        })
      },
      NOT_FOUND: {
        data: z.object({
          message: z.string().default('Connection request not found')
        })
      },
      FORBIDDEN: {
        data: z.object({
          message: z
            .string()
            .default('You do not have permission to accept this request')
        })
      }
    }),

  reject: oc
    .route({
      method: 'POST',
      description: 'Reject a connection request',
      summary: 'Reject Connection',
      tags: ['Connection']
    })
    .input(connectionIdSchema)
    .output(z.object({ success: z.boolean() }))
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('User not authenticated')
        })
      },
      NOT_FOUND: {
        data: z.object({
          message: z.string().default('Connection request not found')
        })
      },
      FORBIDDEN: {
        data: z.object({
          message: z
            .string()
            .default('You do not have permission to reject this request')
        })
      }
    }),

  remove: oc
    .route({
      method: 'DELETE',
      description: 'Remove an existing connection',
      summary: 'Remove Connection',
      tags: ['Connection']
    })
    .input(connectionIdSchema)
    .output(z.object({ success: z.boolean() }))
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('User not authenticated')
        })
      },
      NOT_FOUND: {
        data: z.object({
          message: z.string().default('Connection not found')
        })
      },
      FORBIDDEN: {
        data: z.object({
          message: z
            .string()
            .default('You do not have permission to remove this connection')
        })
      }
    }),

  listPending: oc
    .route({
      method: 'GET',
      description: 'List pending connection requests',
      summary: 'List Pending Requests',
      tags: ['Connection']
    })
    .input(listPendingRequestsSchema)
    .output(
      z.object({
        connections: z.array(connectionWithUserSchema),
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

  listConnections: oc
    .route({
      method: 'GET',
      description: 'List accepted connections',
      summary: 'List Connections',
      tags: ['Connection']
    })
    .input(listConnectionsSchema)
    .output(
      z.object({
        connections: z.array(connectionWithUserSchema),
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
    })
}
