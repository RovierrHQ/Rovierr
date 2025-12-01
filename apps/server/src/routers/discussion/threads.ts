import { ORPCError } from '@orpc/server'
import { db } from '@/db'
import { protectedProcedure } from '@/lib/orpc'
import { ReplyService } from '@/services/discussion/reply.service'
import { ThreadService } from '@/services/discussion/thread.service'

const replyService = new ReplyService(db)
const threadService = new ThreadService(db)

export const threads = {
  // ============================================================================
  // Thread CRUD Operations
  // ============================================================================

  create: protectedProcedure.discussion.thread.create.handler(
    async ({ input, context }) => {
      try {
        const userId = context.session.user.id
        return await threadService.createThread(input, userId)
      } catch (error) {
        if (error instanceof Error && error.message.includes('permission')) {
          throw new ORPCError('FORBIDDEN', { message: error.message })
        }
        throw error
      }
    }
  ),

  list: protectedProcedure.discussion.thread.list.handler(
    async ({ input, context }) => {
      try {
        const userId = context.session.user.id
        return await threadService.listThreads(input, userId)
      } catch (error) {
        if (error instanceof Error && error.message.includes('permission')) {
          throw new ORPCError('FORBIDDEN', { message: error.message })
        }
        throw error
      }
    }
  ),

  get: protectedProcedure.discussion.thread.get.handler(
    async ({ input, context }) => {
      try {
        const userId = context.session.user.id
        const thread = await threadService.getThreadById(input.id, userId)

        // Fetch replies for the thread
        const replies = await replyService.getRepliesForThread(input.id, userId)

        return {
          ...thread,
          replies
        }
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Thread not found') {
            throw new ORPCError('NOT_FOUND', { message: 'Thread not found' })
          }
          if (error.message.includes('permission')) {
            throw new ORPCError('FORBIDDEN', { message: error.message })
          }
        }
        throw error
      }
    }
  ),

  update: protectedProcedure.discussion.thread.update.handler(
    async ({ input, context }) => {
      try {
        const userId = context.session.user.id
        // TODO: Check if user is moderator for the context
        const isModerator = false
        return await threadService.updateThread(input, userId, isModerator)
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Thread not found') {
            throw new ORPCError('NOT_FOUND', { message: 'Thread not found' })
          }
          if (error.message.includes('permission')) {
            throw new ORPCError('FORBIDDEN', { message: error.message })
          }
        }
        throw error
      }
    }
  ),

  delete: protectedProcedure.discussion.thread.delete.handler(
    async ({ input, context }) => {
      try {
        const userId = context.session.user.id
        // TODO: Check if user is moderator for the context
        const isModerator = false
        return await threadService.deleteThread(input.id, userId, isModerator)
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Thread not found') {
            throw new ORPCError('NOT_FOUND', { message: 'Thread not found' })
          }
          if (error.message.includes('permission')) {
            throw new ORPCError('FORBIDDEN', { message: error.message })
          }
        }
        throw error
      }
    }
  ),

  // ============================================================================
  // Moderator Actions
  // ============================================================================

  pin: protectedProcedure.discussion.thread.pin.handler(
    async ({ input, context }) => {
      try {
        const userId = context.session.user.id
        // TODO: Check if user is moderator for the context
        return await threadService.pinThread(input, userId)
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Thread not found') {
            throw new ORPCError('NOT_FOUND', { message: 'Thread not found' })
          }
          throw new ORPCError('FORBIDDEN', {
            message: 'User does not have moderator permission to pin threads'
          })
        }
        throw error
      }
    }
  ),

  lock: protectedProcedure.discussion.thread.lock.handler(
    async ({ input, context }) => {
      try {
        const userId = context.session.user.id
        // TODO: Check if user is moderator for the context
        return await threadService.lockThread(input, userId)
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Thread not found') {
            throw new ORPCError('NOT_FOUND', { message: 'Thread not found' })
          }
          throw new ORPCError('FORBIDDEN', {
            message: 'User does not have moderator permission to lock threads'
          })
        }
        throw error
      }
    }
  )
}
