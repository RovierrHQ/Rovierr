/**
 * Campus Feed Posts Router
 *
 * Handles post CRUD operations
 */

import { db } from '@api/lib/db'
import { betterAuth } from '@api/middleware/auth'
import { getPresignedUrlFromFullUrl, uploadImageToS3 } from '@api/services/s3'
import { Elysia } from 'elysia'
import { z } from 'zod'
import {
  createEventPostSchema,
  createPostSchema,
  deleteResponseSchema,
  listPostsSchema,
  paginatedPostsSchema,
  postWithDetailsSchema,
  uploadMediaResponseSchema,
  uploadMediaSchema
} from './schemas'
import { PostService } from './service/post.service'

const postService = new PostService(db)

export const postsRouter = new Elysia({ name: 'posts' })
  .use(betterAuth)
  .group('/posts', { auth: true }, (app) =>
    /**
     * Create a new post
     * POST /campus-feed/posts
     */
    app
      .post(
        '/',
        async ({ body, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          try {
            return await postService.createPost(body, user.id, 'user')
          } catch (error) {
            if (error instanceof Error) {
              throw new Error(error.message)
            }
            throw error
          }
        },
        {
          body: createPostSchema,
          response: postWithDetailsSchema,
          detail: {
            summary: 'Create Post',
            description: 'Create a new post',
            tags: ['Campus Feed']
          }
        }
      )

      /**
       * Create a new event post
       * POST /campus-feed/posts/events
       */
      .post(
        '/events',
        async ({ body, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          try {
            return await postService.createEventPost(body, user.id, 'user')
          } catch (error) {
            if (error instanceof Error) {
              throw new Error(error.message)
            }
            throw error
          }
        },
        {
          body: createEventPostSchema,
          response: postWithDetailsSchema,
          detail: {
            summary: 'Create Event Post',
            description: 'Create a new event post',
            tags: ['Campus Feed']
          }
        }
      )

      /**
       * List posts with pagination and filters
       * GET /campus-feed/posts
       */
      .get(
        '/',
        async ({ query, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          console.log('[campusFeed.list] Starting with input:', {
            query,
            userId: user.id
          })

          try {
            const result = await postService.listPosts(query, user.id)
            console.log('[campusFeed.list] Successfully fetched posts:', {
              count: result.posts.length,
              total: result.total,
              hasMore: result.hasMore
            })
            return result
          } catch (error) {
            console.error('[campusFeed.list] Error fetching posts:', error)
            if (error instanceof Error) {
              console.error('[campusFeed.list] Error details:', {
                message: error.message,
                stack: error.stack
              })
              throw new Error(`Failed to fetch posts: ${error.message}`)
            }
            throw error
          }
        },
        {
          query: listPostsSchema,
          response: paginatedPostsSchema,
          detail: {
            summary: 'List Posts',
            description: 'List posts with pagination and filters',
            tags: ['Campus Feed']
          }
        }
      )

      /**
       * Get a single post by ID
       * GET /campus-feed/posts/:id
       */
      .get(
        '/:id',
        async ({ params, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          try {
            return await postService.getPostById(params.id, user.id)
          } catch (error) {
            if (error instanceof Error && error.message === 'Post not found') {
              throw new Error('Post not found')
            }
            throw error
          }
        },
        {
          params: z.object({ id: z.string() }),
          response: postWithDetailsSchema,
          detail: {
            summary: 'Get Post',
            description: 'Get a single post by ID',
            tags: ['Campus Feed']
          }
        }
      )

      /**
       * Delete a post
       * DELETE /campus-feed/posts/:id
       */
      .delete(
        '/:id',
        async ({ params, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          try {
            await postService.deletePost(params.id, user.id)
            return { success: true }
          } catch (error) {
            if (error instanceof Error) {
              if (error.message === 'Post not found') {
                throw new Error('Post not found')
              }
              if (error.message.includes('Not authorized')) {
                throw new Error('Not authorized to delete this post')
              }
            }
            throw error
          }
        },
        {
          params: z.object({ id: z.string() }),
          response: deleteResponseSchema,
          detail: {
            summary: 'Delete Post',
            description: 'Delete a post',
            tags: ['Campus Feed']
          }
        }
      )

      /**
       * Upload media for a post
       * POST /campus-feed/posts/media
       */
      .post(
        '/media',
        async ({ body, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          try {
            // For now, we only support images. Video support can be added later
            if (body.mediaType === 'video') {
              throw new Error('Video upload not yet supported')
            }

            // Upload to S3 (returns S3 key URL)
            const s3KeyUrl = await uploadImageToS3(
              body.base64Data,
              'campus-feed',
              user.id
            )

            // Generate presigned URL for immediate preview
            const presignedUrl = await getPresignedUrlFromFullUrl(s3KeyUrl)

            // Return both: presigned URL for preview, S3 key URL for storage
            return {
              url: presignedUrl,
              s3KeyUrl
            }
          } catch (error) {
            if (error instanceof Error) {
              throw new Error(error.message)
            }
            throw error
          }
        },
        {
          body: uploadMediaSchema,
          response: uploadMediaResponseSchema,
          detail: {
            summary: 'Upload Media',
            description: 'Upload an image or video for a post',
            tags: ['Campus Feed']
          }
        }
      )
  )
