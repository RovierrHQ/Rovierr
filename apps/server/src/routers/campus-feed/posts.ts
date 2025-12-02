import { ORPCError } from '@orpc/server'
import { db } from '@/db'
import { protectedProcedure } from '@/lib/orpc'
import { PostService } from '@/services/campus-feed/post.service'
import { getPresignedUrlFromFullUrl, uploadImageToS3 } from '@/services/s3'

const postService = new PostService(db)

export const posts = {
  // ============================================================================
  // Post CRUD Operations
  // ============================================================================

  create: protectedProcedure.campusFeed.create.handler(
    async ({ input, context }) => {
      try {
        const userId = context.session.user.id
        return await postService.createPost(input, userId, 'user')
      } catch (error) {
        if (error instanceof Error) {
          throw new ORPCError('VALIDATION_ERROR', { message: error.message })
        }
        throw error
      }
    }
  ),

  createEvent: protectedProcedure.campusFeed.createEvent.handler(
    async ({ input, context }) => {
      try {
        const userId = context.session.user.id
        return await postService.createEventPost(input, userId, 'user')
      } catch (error) {
        if (error instanceof Error) {
          throw new ORPCError('VALIDATION_ERROR', { message: error.message })
        }
        throw error
      }
    }
  ),

  list: protectedProcedure.campusFeed.list.handler(
    async ({ input, context }) => {
      const userId = context.session.user.id
      return await postService.listPosts(input, userId)
    }
  ),

  get: protectedProcedure.campusFeed.get.handler(async ({ input, context }) => {
    try {
      const userId = context.session.user.id
      return await postService.getPostById(input.id, userId)
    } catch (error) {
      if (error instanceof Error && error.message === 'Post not found') {
        throw new ORPCError('NOT_FOUND', { message: 'Post not found' })
      }
      throw error
    }
  }),

  delete: protectedProcedure.campusFeed.delete.handler(
    async ({ input, context }) => {
      try {
        const userId = context.session.user.id
        await postService.deletePost(input.id, userId)
        return { success: true }
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Post not found') {
            throw new ORPCError('NOT_FOUND', { message: 'Post not found' })
          }
          if (error.message.includes('Not authorized')) {
            throw new ORPCError('UNAUTHORIZED', {
              message: 'Not authorized to delete this post'
            })
          }
        }
        throw error
      }
    }
  ),

  uploadMedia: protectedProcedure.campusFeed.uploadMedia.handler(
    async ({ input, context }) => {
      try {
        const userId = context.session.user.id

        // For now, we only support images. Video support can be added later
        if (input.mediaType === 'video') {
          throw new Error('Video upload not yet supported')
        }

        // Upload to S3 (returns S3 key URL)
        const s3KeyUrl = await uploadImageToS3(
          input.base64Data,
          'campus-feed',
          userId
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
          throw new ORPCError('VALIDATION_ERROR', { message: error.message })
        }
        throw error
      }
    }
  )
}
