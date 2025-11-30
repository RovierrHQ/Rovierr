import { ORPCError } from '@orpc/server'
import { db } from '@/db'
import { protectedProcedure } from '@/lib/orpc'
import { VoteService } from '@/services/discussion/vote.service'

const voteService = new VoteService(db)

export const votes = {
  vote: protectedProcedure.discussion.vote.vote.handler(
    async ({ input, context }) => {
      try {
        const userId = context.session.user.id
        return await voteService.vote(input, userId)
      } catch (error) {
        if (error instanceof Error) {
          throw new ORPCError('NOT_FOUND', {
            message: 'Thread or reply not found'
          })
        }
        throw error
      }
    }
  ),

  unvote: protectedProcedure.discussion.vote.unvote.handler(
    async ({ input, context }) => {
      try {
        const userId = context.session.user.id
        return await voteService.unvote(input, userId)
      } catch (error) {
        if (error instanceof Error) {
          throw new ORPCError('NOT_FOUND', {
            message: 'Thread, reply, or vote not found'
          })
        }
        throw error
      }
    }
  )
}
