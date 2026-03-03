import { db } from '@api/lib/db'
import { betterAuth } from '@api/middleware/auth'
import { Elysia } from 'elysia'
import {
  createReplySchema,
  endorseReplySchema,
  updateReplySchema
} from './schemas'
import { ReplyService } from './service'

const replyService = new ReplyService(db)

export const repliesRouter = new Elysia({ name: 'reply' })
  .use(betterAuth)
  .group('/reply', { auth: true }, (app) =>
    app
      .post(
        '/create',
        async ({ body, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          try {
            const userId = user.id
            return await replyService.createReply(body, userId)
          } catch (error) {
            if (error instanceof Error) {
              if (error.message === 'Thread not found') {
                throw new Error('Thread or parent reply not found')
              }
              if (error.message === 'Thread is locked') {
                throw new Error(
                  'Thread is locked or user does not have permission to reply'
                )
              }
            }
            throw error
          }
        },
        {
          body: createReplySchema,
          detail: {
            tags: ['Discussion'],
            summary: 'Create Reply',
            description: 'Create a reply to a thread or another reply'
          }
        }
      )
      .patch(
        '/update',
        async ({ body, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          try {
            const userId = user.id
            // TODO: Check if user is moderator for the context
            const isModerator = false
            return await replyService.updateReply(body, userId, isModerator)
          } catch (error) {
            if (error instanceof Error) {
              if (error.message === 'Reply not found') {
                throw new Error('Reply not found')
              }
              if (error.message.includes('permission')) {
                throw new Error(error.message)
              }
            }
            throw error
          }
        },
        {
          body: updateReplySchema,
          detail: {
            tags: ['Discussion'],
            summary: 'Update Reply',
            description: 'Update a reply'
          }
        }
      )
      .delete(
        '/:id',
        async ({ params, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          try {
            const userId = user.id
            // TODO: Check if user is moderator for the context
            const isModerator = false
            return await replyService.deleteReply(
              params.id,
              userId,
              isModerator
            )
          } catch (error) {
            if (error instanceof Error) {
              if (error.message === 'Reply not found') {
                throw new Error('Reply not found')
              }
              if (error.message.includes('permission')) {
                throw new Error(error.message)
              }
            }
            throw error
          }
        },
        {
          detail: {
            tags: ['Discussion'],
            summary: 'Delete Reply',
            description: 'Delete a reply'
          }
        }
      )
      .patch(
        '/endorse',
        async ({ body, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          try {
            const userId = user.id
            // TODO: Check if user is moderator for the context
            return await replyService.endorseReply(body, userId)
          } catch (error) {
            if (error instanceof Error) {
              if (error.message === 'Reply not found') {
                throw new Error('Reply not found')
              }
              throw new Error(
                'User does not have moderator permission to endorse replies'
              )
            }
            throw error
          }
        },
        {
          body: endorseReplySchema,
          detail: {
            tags: ['Discussion'],
            summary: 'Endorse Reply',
            description: 'Endorse or unendorse a reply'
          }
        }
      )
  )
