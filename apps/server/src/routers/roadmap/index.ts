import { db } from '@api/db'
import { betterAuth } from '@api/middleware/auth'
import {
  roadmapComments,
  roadmapCommentUpvote,
  roadmap as roadmapTable,
  roadmapUpvote
} from '@rov/db'
import { and, eq, sql } from 'drizzle-orm'
import { Elysia } from 'elysia'
import { z } from 'zod'

export const roadmap = new Elysia({ name: 'roadmap' })
  .group('/roadmap', (app) =>
    app
      .get(
        '/list',
        async ({ query }) => {
          let page = Number(query.page) || 1
          let limit = Number(query.limit) || 10
          const category = query.category as
            | 'feature-request'
            | 'bug-report'
            | 'improvement'
            | undefined

          const offset = (page - 1) * limit

          const whereConditions = and(
            ...[
              eq(roadmapTable.status, 'publish'),
              category ? eq(roadmapTable.category, category) : undefined
            ].filter(Boolean)
          )

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
            data: roadmaps.map((rm) => ({
              ...rm,
              createdAt: new Date(rm.createdAt).toISOString(),
              updatedAt: new Date(rm.updatedAt).toISOString(),
              upvotes: rm.upvotes.map((uv) => ({
                ...uv,
                createdAt: new Date(uv.createdAt).toISOString(),
                updatedAt: new Date(uv.updatedAt).toISOString()
              })),
              comments: rm.comments.map((c) => ({
                ...c,
                createdAt: new Date(c.createdAt).toISOString(),
                updatedAt: new Date(c.updatedAt).toISOString(),
                upvotes: c.upvotes.map((uv) => ({
                  ...uv,
                  createdAt: new Date(uv.createdAt).toISOString(),
                  updatedAt: new Date(uv.updatedAt).toISOString()
                }))
              }))
            })),
            meta: {
              page,
              limit,
              total,
              totalPage: Math.ceil(total / limit)
            }
          }
        },
        {
          query: z.object({
            page: z.string().optional(),
            limit: z.string().optional(),
            category: z
              .enum(['feature-request', 'bug-report', 'improvement'])
              .optional()
          })
        }
      )

      .use(betterAuth)
      .group('', { auth: true }, (app) =>
        app
          .post(
            '/create',
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
              body: z.object({
                title: z.string(),
                status: z.enum(['publish', 'preview']),
                category: z.enum([
                  'feature-request',
                  'bug-report',
                  'improvement'
                ]),
                description: z.string()
              })
            }
          )

          .post(
            '/vote',
            async ({ body, user, set }) => {
              const { roadmapId } = body
              const userId = user.id

              const [roadmapData] = await db
                .select()
                .from(roadmapTable)
                .where(eq(roadmapTable.id, roadmapId))

              if (!roadmapData) {
                set.status = 404
                return { message: 'roadmap not found' }
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
              body: z.object({
                roadmapId: z.string()
              })
            }
          )

          .post(
            '/createComment',
            async ({ body, user, set }) => {
              const { roadmapId, text } = body
              const userId = user.id

              const [roadmapData] = await db
                .select()
                .from(roadmapTable)
                .where(eq(roadmapTable.id, roadmapId))

              if (!roadmapData) {
                set.status = 404
                return { message: 'roadmap not found' }
              }

              const [createdComment] = await db
                .insert(roadmapComments)
                .values({
                  roadmapId,
                  userId,
                  text
                })
                .returning()

              const commentWithRelations =
                await db.query.roadmapComments.findFirst({
                  where: (comment, { eq: eqFn }) =>
                    eqFn(comment.id, createdComment.id),
                  with: {
                    user: true,
                    upvotes: true
                  }
                })

              if (!commentWithRelations) {
                set.status = 500
                return { message: 'failed to retrieve created comment' }
              }

              return {
                ...commentWithRelations,
                createdAt: new Date(
                  commentWithRelations.createdAt
                ).toISOString(),
                updatedAt: new Date(
                  commentWithRelations.updatedAt
                ).toISOString(),
                upvotes: commentWithRelations.upvotes.map((uv) => ({
                  ...uv,
                  createdAt: new Date(uv.createdAt).toISOString(),
                  updatedAt: new Date(uv.updatedAt).toISOString()
                }))
              }
            },
            {
              body: z.object({
                roadmapId: z.string(),
                text: z.string().min(1)
              })
            }
          )

          .post(
            '/voteComment',
            async ({ body, user, set }) => {
              const { commentId } = body
              const userId = user.id

              const [commentData] = await db
                .select()
                .from(roadmapComments)
                .where(eq(roadmapComments.id, commentId))

              if (!commentData) {
                set.status = 404
                return { message: 'comment not found' }
              }

              if (commentData.userId === userId) {
                set.status = 403
                return { message: 'cannot vote on your own comment' }
              }

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

              await db.insert(roadmapCommentUpvote).values({
                commentId,
                userId,
                roadmapId: commentData.roadmapId
              })

              return { message: 'vote added' }
            },
            {
              body: z.object({
                commentId: z.string()
              })
            }
          )
      )
  )
