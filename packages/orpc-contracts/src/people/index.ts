import { oc } from '@orpc/contract'
import { z } from 'zod'
import {
  listUsersSchema,
  publicUserWithConnectionSchema,
  searchUsersSchema
} from './schemas'

export const people = {
  list: oc
    .route({
      method: 'GET',
      description: 'List all users with optional filters',
      summary: 'List Users',
      tags: ['People']
    })
    .input(listUsersSchema)
    .output(
      z.object({
        users: z.array(publicUserWithConnectionSchema),
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

  search: oc
    .route({
      method: 'GET',
      description: 'Search users by name, username, university, or program',
      summary: 'Search Users',
      tags: ['People']
    })
    .input(searchUsersSchema)
    .output(
      z.object({
        users: z.array(publicUserWithConnectionSchema),
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
