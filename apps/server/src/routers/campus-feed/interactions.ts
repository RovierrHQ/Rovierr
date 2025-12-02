import { ORPCError } from '@orpc/server'
import { db } from '@/db'
import { protectedProcedure } from '@/lib/orpc'
import { InteractionService } from '@/services/campus-feed/interaction.service'

const interactionService = new InteractionService(db)

export const interactions = {
  // ============================================================================
  // Like Operations
  // ============================================================================

  like: protectedProcedure.campusFeed.like.handler(
    async ({ input, context }) => {
      try {
        const userId = context.session.user.id
        return await interactionService.toggleLike(input.postId, userId)
      } catch (error) {
        if (error instanceof Error && error.message === 'Post not found') {
          throw new ORPCError('NOT_FOUND', { message: 'Post not found' })
        }
        throw error
      }
    }
  ),

  // ============================================================================
  // Comment Operations
  // ============================================================================

  comment: protectedProcedure.campusFeed.comment.handler(
    async ({ input, context }) => {
      try {
        const userId = context.session.user.id
        return await interactionService.addComment(input, userId)
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Post not found') {
            throw new ORPCError('NOT_FOUND', { message: 'Post not found' })
          }
          throw new ORPCError('VALIDATION_ERROR', { message: error.message })
        }
        throw error
      }
    }
  ),

  getComments: protectedProcedure.campusFeed.getComments.handler(
    async ({ input, context }) => {
      const userId = context.session.user.id
      return await interactionService.getComments(
        input.postId,
        userId,
        input.limit,
        input.offset
      )
    }
  ),

  likeComment: protectedProcedure.campusFeed.likeComment.handler(
    async ({ input, context }) => {
      try {
        const userId = context.session.user.id
        return await interactionService.toggleCommentLike(
          input.commentId,
          userId
        )
      } catch (error) {
        if (error instanceof Error && error.message === 'Comment not found') {
          throw new ORPCError('NOT_FOUND', { message: 'Comment not found' })
        }
        throw error
      }
    }
  ),

  // ============================================================================
  // Share Operations
  // ============================================================================

  share: protectedProcedure.campusFeed.share.handler(
    async ({ input, context }) => {
      try {
        const userId = context.session.user.id
        // TODO: Get base URL from environment or request
        const baseUrl = 'https://rovierr.com'
        return await interactionService.sharePost(input.postId, userId, baseUrl)
      } catch (error) {
        if (error instanceof Error && error.message === 'Post not found') {
          throw new ORPCError('NOT_FOUND', { message: 'Post not found' })
        }
        throw error
      }
    }
  )
}
