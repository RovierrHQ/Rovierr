/**
 * Campus Feed Interactions Router
 *
 * Handles likes, comments, and shares
 */

import { db } from '@api/db'
import { env } from '@api/lib/env'
import { betterAuth } from '@api/middleware/auth'
import { InteractionService } from '@api/services/campus-feed/interaction.service'
import { Elysia } from 'elysia'
import { z } from 'zod'
import {
  commentWithAuthorSchema,
  createCommentSchema,
  getCommentsSchema,
  likeResponseSchema,
  paginatedCommentsSchema,
  shareResponseSchema
} from './schemas'

const interactionService = new InteractionService(db)

export const interactionsRouter = new Elysia({ name: 'interactions' })
  .use(betterAuth)
  .group('/interactions', { auth: true }, (app) =>
    /**
     * Like or unlike a post
     * POST /campus-feed/interactions/posts/:postId/like
     */
    app
      .post(
        '/posts/:postId/like',
        async ({ params, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          try {
            return await interactionService.toggleLike(params.postId, user.id)
          } catch (error) {
            if (error instanceof Error && error.message === 'Post not found') {
              throw new Error('Post not found')
            }
            throw error
          }
        },
        {
          params: z.object({ postId: z.string() }),
          response: likeResponseSchema,
          detail: {
            summary: 'Toggle Like',
            description: 'Like or unlike a post',
            tags: ['Campus Feed']
          }
        }
      )

      /**
       * Add a comment to a post
       * POST /campus-feed/interactions/comments
       */
      .post(
        '/comments',
        async ({ body, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          try {
            return await interactionService.addComment(body, user.id)
          } catch (error) {
            if (error instanceof Error) {
              if (error.message === 'Post not found') {
                throw new Error('Post not found')
              }
              throw new Error(error.message)
            }
            throw error
          }
        },
        {
          body: createCommentSchema,
          response: commentWithAuthorSchema,
          detail: {
            summary: 'Add Comment',
            description: 'Add a comment to a post',
            tags: ['Campus Feed']
          }
        }
      )

      /**
       * Get comments for a post
       * GET /campus-feed/interactions/posts/:postId/comments
       */
      .get(
        '/posts/:postId/comments',
        async ({ params, query, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          return await interactionService.getComments(
            params.postId,
            user.id,
            query.limit,
            query.offset
          )
        },
        {
          params: z.object({ postId: z.string() }),
          query: getCommentsSchema,
          response: paginatedCommentsSchema,
          detail: {
            summary: 'Get Comments',
            description: 'Get comments for a post',
            tags: ['Campus Feed']
          }
        }
      )

      /**
       * Like or unlike a comment
       * POST /campus-feed/interactions/comments/:commentId/like
       */
      .post(
        '/comments/:commentId/like',
        async ({ params, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          try {
            return await interactionService.toggleCommentLike(
              params.commentId,
              user.id
            )
          } catch (error) {
            if (
              error instanceof Error &&
              error.message === 'Comment not found'
            ) {
              throw new Error('Comment not found')
            }
            throw error
          }
        },
        {
          params: z.object({ commentId: z.string() }),
          response: likeResponseSchema,
          detail: {
            summary: 'Toggle Comment Like',
            description: 'Like or unlike a comment',
            tags: ['Campus Feed']
          }
        }
      )

      /**
       * Share a post
       * POST /campus-feed/interactions/posts/:postId/share
       */
      .post(
        '/posts/:postId/share',
        async ({ params, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          try {
            const baseUrl = env.WEB_URL || 'https://rovierr.com'
            return await interactionService.sharePost(
              params.postId,
              user.id,
              baseUrl
            )
          } catch (error) {
            if (error instanceof Error && error.message === 'Post not found') {
              throw new Error('Post not found')
            }
            throw error
          }
        },
        {
          params: z.object({ postId: z.string() }),
          response: shareResponseSchema,
          detail: {
            summary: 'Share Post',
            description: 'Share a post',
            tags: ['Campus Feed']
          }
        }
      )
  )
