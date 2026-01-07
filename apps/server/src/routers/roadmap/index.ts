import { db } from '@api/db'
import { betterAuth } from '@api/middleware/auth'
import {
  roadmapComments,
  roadmapCommentUpvote,
  roadmap as roadmapTable,
  roadmapUpvote
} from '@rov/db'
import { and, eq, sql } from 'drizzle-orm'
import Elysia from 'elysia'
import {
  createCommentSchema,
  createRoadmapSchema,
  listRoadmapQuerySchema,
  voteCommentSchema,
  voteRoadmapSchema
} from './schemas'

export const roadmap = new Elysia({ name: 'roadmap' })
  .use(betterAuth)
  .group('/roadmap', (app) =>
    app
      .post(
        '/',
        async ({ body, user }) => {
          const [inserted] = await db
            .insert(roadmapTable)
            .values({
              ...body,
              userId: user.id
            })
            .returning()

          return inserted
        },
        {
          auth: true,
          body: createRoadmapSchema
        }
      )
      .get(
        '/',
        async ({ query }) => {
          let { page, limit, category } = query

          page = page || 1
          limit = limit || 10

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
        },
        {
          query: listRoadmapQuerySchema
        }
      )
      .post(
        '/vote',
        async ({ body, user }) => {
          const { roadmapId } = body
          const userId = user.id

          const [roadmapData] = await db
            .select()
            .from(roadmapTable)
            .where(eq(roadmapTable.id, roadmapId))

          if (!roadmapData) {
            throw new Error('NOT_FOUND')
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
        },
        {
          auth: true,
          body: voteRoadmapSchema
        }
      )
      .post(
        '/comment',
        async ({ body, user }) => {
          const { roadmapId, text } = body
          const userId = user.id

          // Validate roadmap exists
          const [roadmapData] = await db
            .select()
            .from(roadmapTable)
            .where(eq(roadmapTable.id, roadmapId))

          if (!roadmapData) {
            throw new Error('NOT_FOUND')
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
          const commentWithRelations = await db.query.roadmapComments.findFirst(
            {
              where: (comment, { eq: eqFn }) =>
                eqFn(comment.id, createdComment.id),
              with: {
                user: true,
                upvotes: true
              }
            }
          )

          if (!commentWithRelations) {
            throw new Error('INTERNAL_SERVER_ERROR')
          }

          return commentWithRelations
        },
        {
          auth: true,
          body: createCommentSchema
        }
      )
      .post(
        '/comment/vote',
        async ({ body, user }) => {
          const { commentId } = body
          const userId = user.id

          // Get comment with user info to check ownership
          const [commentData] = await db
            .select()
            .from(roadmapComments)
            .where(eq(roadmapComments.id, commentId))

          if (!commentData) {
            throw new Error('NOT_FOUND')
          }

          // Prevent users from voting on their own comments
          if (commentData.userId === userId) {
            throw new Error('FORBIDDEN')
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
        },
        {
          auth: true,
          body: voteCommentSchema
        }
      )
  )
