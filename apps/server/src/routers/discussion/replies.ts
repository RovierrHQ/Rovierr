import { ORPCError } from '@orpc/server'
import { db } from '@/db'
import { protectedProcedure } from '@/lib/orpc'
import { ReplyService } from '@/services/discussion/reply.service'

const replyService = new ReplyService(db)

export const replies = {
  create: protectedProcedure.discussion.reply.create.handler(
    async ({ input, context }) => {
      try {
        const userId = context.session.user.id
        return await replyService.createReply(input, userId)
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Thread not found') {
            throw new ORPCError('NOT_FOUND', {
              message: 'Thread or parent reply not found'
            })
          }
          if (error.message === 'Thread is locked') {
            throw new ORPCError('FORBIDDEN', {
              message:
                'Thread is locked or user does not have permission to reply'
            })
          }
        }
        throw error
      }
    }
  ),

  update: protectedProcedure.discussion.reply.update.handler(
    async ({ input, context }) => {
      try {
        const userId = context.session.user.id
        // TODO: Check if user is moderator for the context
        const isModerator = false
        return await replyService.updateReply(input, userId, isModerator)
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Reply not found') {
            throw new ORPCError('NOT_FOUND', { message: 'Reply not found' })
          }
          if (error.message.includes('permission')) {
            throw new ORPCError('FORBIDDEN', { message: error.message })
          }
        }
        throw error
      }
    }
  ),

  delete: protectedProcedure.discussion.reply.delete.handler(
    async ({ input, context }) => {
      try {
        const userId = context.session.user.id
        // TODO: Check if user is moderator for the context
        const isModerator = false
        return await replyService.deleteReply(input.id, userId, isModerator)
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Reply not found') {
            throw new ORPCError('NOT_FOUND', { message: 'Reply not found' })
          }
          if (error.message.includes('permission')) {
            throw new ORPCError('FORBIDDEN', { message: error.message })
          }
        }
        throw error
      }
    }
  ),

  endorse: protectedProcedure.discussion.reply.endorse.handler(
    async ({ input, context }) => {
      try {
        const userId = context.session.user.id
        // TODO: Check if user is moderator for the context
        return await replyService.endorseReply(input, userId)
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Reply not found') {
            throw new ORPCError('NOT_FOUND', { message: 'Reply not found' })
          }
          throw new ORPCError('FORBIDDEN', {
            message:
              'User does not have moderator permission to endorse replies'
          })
        }
        throw error
      }
    }
  )
}
