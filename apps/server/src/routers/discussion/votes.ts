import { db } from '@api/db'
import { betterAuth } from '@api/middleware/auth'
import { VoteService } from '@api/services/discussion/vote.service'
import { Elysia } from 'elysia'
import { unvoteSchema, voteSchema } from './schemas'

const voteService = new VoteService(db)

export const votesRouter = new Elysia({ prefix: '/vote' })
  .use(betterAuth)
  .group('', { auth: true }, (app) =>
    app
      .post(
        '/vote',
        async ({ body, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          try {
            const userId = user.id
            return await voteService.vote(body, userId)
          } catch (error) {
            if (error instanceof Error) {
              throw new Error('Thread or reply not found')
            }
            throw error
          }
        },
        {
          body: voteSchema,
          detail: {
            tags: ['Discussion'],
            summary: 'Vote',
            description: 'Vote on a thread or reply'
          }
        }
      )
      .delete(
        '/unvote',
        async ({ body, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          try {
            const userId = user.id
            return await voteService.unvote(body, userId)
          } catch (error) {
            if (error instanceof Error) {
              throw new Error('Thread, reply, or vote not found')
            }
            throw error
          }
        },
        {
          body: unvoteSchema,
          detail: {
            tags: ['Discussion'],
            summary: 'Unvote',
            description: 'Remove a vote from a thread or reply'
          }
        }
      )
  )
