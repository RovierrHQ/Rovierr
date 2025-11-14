import { ORPCError } from '@orpc/client'
import { and, eq, sql } from 'drizzle-orm'
import { db } from '@/db'
import {
  roadmapComments,
  roadmapCommentUpvote,
  roadmap as roadmapTable,
  roadmapUpvote
} from '@/db/schema/roadmap'
import { protectedProcedure, publicProcedure } from '@/lib/orpc'

export const roadmap = {
  create: protectedProcedure.roadmap.create.handler(
    async ({ input, context }) => {
      try {
        const [inserted] = await db
          .insert(roadmapTable)
          .values({
            ...input,
            userId: context.session.user.id
          })
          .returning()

        return inserted
      } catch {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'failed to create roadmap'
        })
      }
    }
  ),

  list: publicProcedure.roadmap.list.handler(async ({ input }) => {
    try {
      let { page, limit, category } = input.query ?? {}

      page = Number(page) || 1
      limit = Number(limit) || 10

      const offset = (page - 1) * limit

      const whereConditions = and(
        ...[
          eq(roadmapTable.status, 'publish'),
          category ? eq(roadmapTable.category, category) : undefined
        ].filter(Boolean)
      )

      // Single query using relational API with upvotes included
      // Get count separately as it's needed for pagination metadata
      const [countResult, roadmaps] = await Promise.all([
        db
          .select({ count: sql<number>`count(*)` })
          .from(roadmapTable)
          .where(whereConditions),
        db.query.roadmap.findMany({
          where: whereConditions,
          limit,
          offset,
          orderBy: (rm, { desc: descFn }) => descFn(rm.createdAt),
          with: {
            user: true,
            upvotes: true,
            comments: {
              with: {
                user: true,
                upvotes: true
              },
              orderBy: (comment, { asc: ascFn }) => ascFn(comment.createdAt)
            }
          }
        })
      ])

      const total = Number(countResult[0]?.count ?? 0)

      return {
        data: roadmaps,
        meta: {
          page,
          limit,
          total,
          totalPage: Math.ceil(total / limit)
        }
      }
    } catch {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'failed to retrieve roadmap'
      })
    }
  }),

  vote: publicProcedure.roadmap.vote.handler(async ({ input, context }) => {
    try {
      const { roadmapId } = input
      const userId = context.session?.user.id

      if (!userId) {
        throw new ORPCError('UNAUTHORIZED', {
          message: 'login required to vote'
        })
      }

      const [roadmapData] = await db
        .select()
        .from(roadmapTable)
        .where(eq(roadmapTable.id, roadmapId))

      if (!roadmapData) {
        throw new ORPCError('NOT_FOUND', { message: 'roadmap not found' })
      }

      const [existingVote] = await db
        .select()
        .from(roadmapUpvote)
        .where(
          and(
            eq(roadmapUpvote.roadmapId, roadmapId),
            eq(roadmapUpvote.userId, userId)
          )
        )

      if (existingVote) {
        await db
          .delete(roadmapUpvote)
          .where(
            and(
              eq(roadmapUpvote.roadmapId, roadmapId),
              eq(roadmapUpvote.userId, userId)
            )
          )

        return { message: 'vote removed', voted: false }
      }

      await db.insert(roadmapUpvote).values({
        roadmapId,
        userId
      })

      return { message: 'vote added', voted: true }
    } catch {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'failed to toggle vote'
      })
    }
  }),

  createComment: protectedProcedure.roadmap.createComment.handler(
    async ({ input, context }) => {
      try {
        const { roadmapId, text } = input
        const userId = context.session.user.id

        // Validate roadmap exists
        const [roadmapData] = await db
          .select()
          .from(roadmapTable)
          .where(eq(roadmapTable.id, roadmapId))

        if (!roadmapData) {
          throw new ORPCError('NOT_FOUND', { message: 'roadmap not found' })
        }

        // Create comment
        const [createdComment] = await db
          .insert(roadmapComments)
          .values({
            roadmapId,
            userId,
            text
          })
          .returning()

        // Fetch comment with relations
        const commentWithRelations = await db.query.roadmapComments.findFirst({
          where: (comment, { eq: eqFn }) => eqFn(comment.id, createdComment.id),
          with: {
            user: true,
            upvotes: true
          }
        })

        if (!commentWithRelations) {
          throw new ORPCError('INTERNAL_SERVER_ERROR', {
            message: 'failed to retrieve created comment'
          })
        }

        return commentWithRelations
      } catch (error) {
        if (error instanceof ORPCError) {
          throw error
        }
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'failed to create comment'
        })
      }
    }
  ),

  voteComment: publicProcedure.roadmap.voteComment.handler(
    async ({ input, context }) => {
      try {
        const { commentId } = input
        const userId = context.session?.user.id

        if (!userId) {
          throw new ORPCError('UNAUTHORIZED', {
            message: 'login required to vote'
          })
        }

        // Get comment with user info to check ownership
        const [commentData] = await db
          .select()
          .from(roadmapComments)
          .where(eq(roadmapComments.id, commentId))

        if (!commentData) {
          throw new ORPCError('NOT_FOUND', { message: 'comment not found' })
        }

        // Prevent users from voting on their own comments
        if (commentData.userId === userId) {
          throw new ORPCError('FORBIDDEN', {
            message: 'cannot vote on your own comment'
          })
        }

        // Check if vote already exists
        const [existingVote] = await db
          .select()
          .from(roadmapCommentUpvote)
          .where(
            and(
              eq(roadmapCommentUpvote.commentId, commentId),
              eq(roadmapCommentUpvote.userId, userId)
            )
          )

        if (existingVote) {
          // Remove vote
          await db
            .delete(roadmapCommentUpvote)
            .where(
              and(
                eq(roadmapCommentUpvote.commentId, commentId),
                eq(roadmapCommentUpvote.userId, userId)
              )
            )

          return { message: 'vote removed' }
        }

        // Add vote
        await db.insert(roadmapCommentUpvote).values({
          commentId,
          userId,
          roadmapId: commentData.roadmapId
        })

        return { message: 'vote added' }
      } catch (error) {
        if (error instanceof ORPCError) {
          throw error
        }
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'failed to toggle vote'
        })
      }
    }
  )
}
