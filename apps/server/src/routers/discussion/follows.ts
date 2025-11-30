import { ORPCError } from '@orpc/server'
import { db } from '@/db'
import { protectedProcedure } from '@/lib/orpc'
import { FollowService } from '@/services/discussion/follow.service'

const followService = new FollowService(db)

export const follows = {
  follow: protectedProcedure.discussion.follow.follow.handler(
    async ({ input, context }) => {
      try {
        const userId = context.session.user.id
        return await followService.followThread(input.threadId, userId)
      } catch (error) {
        if (error instanceof Error && error.message === 'Thread not found') {
          throw new ORPCError('NOT_FOUND', { message: 'Thread not found' })
        }
        throw error
      }
    }
  ),

  unfollow: protectedProcedure.discussion.follow.unfollow.handler(
    async ({ input, context }) => {
      try {
        const userId = context.session.user.id
        return await followService.unfollowThread(input.threadId, userId)
      } catch (error) {
        if (error instanceof Error && error.message === 'Thread not found') {
          throw new ORPCError('NOT_FOUND', { message: 'Thread not found' })
        }
        throw error
      }
    }
  ),

  list: protectedProcedure.discussion.follow.list.handler(
    async ({ input, context }) => {
      const userId = context.session.user.id
      return await followService.getFollowedThreads(input, userId)
    }
  )
}
