import { oc } from '@orpc/contract'
import { z } from 'zod'
import {
  commentWithAuthorSchema,
  createCommentSchema,
  createEventPostSchema,
  createPostSchema,
  getCommentsSchema,
  listPostsSchema,
  paginatedCommentsSchema,
  paginatedPostsSchema,
  postWithDetailsSchema,
  rsvpSchema,
  rsvpStatusSchema
} from './schemas'

export const campusFeed = {
  // ============================================================================
  // Post Management
  // ============================================================================
  create: oc
    .route({
      method: 'POST',
      description: 'Create a new post',
      summary: 'Create Post',
      tags: ['Campus Feed']
    })
    .input(createPostSchema)
    .output(postWithDetailsSchema)
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('User not authenticated')
        })
      },
      VALIDATION_ERROR: {
        data: z.object({
          message: z.string(),
          errors: z.record(z.string(), z.string()).optional()
        })
      }
    }),

  createEvent: oc
    .route({
      method: 'POST',
      description: 'Create a new event post',
      summary: 'Create Event Post',
      tags: ['Campus Feed']
    })
    .input(createEventPostSchema)
    .output(postWithDetailsSchema)
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('User not authenticated')
        })
      },
      VALIDATION_ERROR: {
        data: z.object({
          message: z.string(),
          errors: z.record(z.string(), z.string()).optional()
        })
      }
    }),

  list: oc
    .route({
      method: 'GET',
      description: 'List posts with pagination and filters',
      summary: 'List Posts',
      tags: ['Campus Feed']
    })
    .input(listPostsSchema)
    .output(paginatedPostsSchema),

  get: oc
    .route({
      method: 'GET',
      description: 'Get a single post by ID',
      summary: 'Get Post',
      tags: ['Campus Feed']
    })
    .input(z.object({ id: z.string() }))
    .output(postWithDetailsSchema)
    .errors({
      NOT_FOUND: {
        data: z.object({
          message: z.string().default('Post not found')
        })
      }
    }),

  delete: oc
    .route({
      method: 'DELETE',
      description: 'Delete a post',
      summary: 'Delete Post',
      tags: ['Campus Feed']
    })
    .input(z.object({ id: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('Not authorized to delete this post')
        })
      },
      NOT_FOUND: {
        data: z.object({
          message: z.string().default('Post not found')
        })
      }
    }),

  // ============================================================================
  // Interactions
  // ============================================================================
  like: oc
    .route({
      method: 'POST',
      description: 'Like or unlike a post',
      summary: 'Toggle Like',
      tags: ['Campus Feed']
    })
    .input(z.object({ postId: z.string() }))
    .output(
      z.object({
        liked: z.boolean(),
        likeCount: z.number()
      })
    )
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('User not authenticated')
        })
      },
      NOT_FOUND: {
        data: z.object({
          message: z.string().default('Post not found')
        })
      }
    }),

  comment: oc
    .route({
      method: 'POST',
      description: 'Add a comment to a post',
      summary: 'Add Comment',
      tags: ['Campus Feed']
    })
    .input(createCommentSchema)
    .output(commentWithAuthorSchema)
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('User not authenticated')
        })
      },
      NOT_FOUND: {
        data: z.object({
          message: z.string().default('Post not found')
        })
      },
      VALIDATION_ERROR: {
        data: z.object({
          message: z.string()
        })
      }
    }),

  getComments: oc
    .route({
      method: 'GET',
      description: 'Get comments for a post',
      summary: 'Get Comments',
      tags: ['Campus Feed']
    })
    .input(getCommentsSchema)
    .output(paginatedCommentsSchema),

  share: oc
    .route({
      method: 'POST',
      description: 'Share a post',
      summary: 'Share Post',
      tags: ['Campus Feed']
    })
    .input(z.object({ postId: z.string() }))
    .output(
      z.object({
        shareUrl: z.string(),
        shareCount: z.number()
      })
    )
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('User not authenticated')
        })
      },
      NOT_FOUND: {
        data: z.object({
          message: z.string().default('Post not found')
        })
      }
    }),

  // ============================================================================
  // Event RSVP
  // ============================================================================
  rsvp: oc
    .route({
      method: 'POST',
      description: 'RSVP to an event post',
      summary: 'RSVP to Event',
      tags: ['Campus Feed']
    })
    .input(rsvpSchema)
    .output(
      z.object({
        status: rsvpStatusSchema,
        rsvpCount: z.number()
      })
    )
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('User not authenticated')
        })
      },
      NOT_FOUND: {
        data: z.object({
          message: z.string().default('Event post not found')
        })
      }
    }),

  // ============================================================================
  // Media Upload
  // ============================================================================
  uploadMedia: oc
    .route({
      method: 'POST',
      description: 'Upload an image or video for a post',
      summary: 'Upload Media',
      tags: ['Campus Feed']
    })
    .input(
      z.object({
        base64Data: z.string(),
        mediaType: z.enum(['image', 'video'])
      })
    )
    .output(
      z.object({
        url: z.string(), // Presigned URL for preview
        s3KeyUrl: z.string() // S3 key URL for storage in database
      })
    )
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('User not authenticated')
        })
      },
      VALIDATION_ERROR: {
        data: z.object({
          message: z.string()
        })
      }
    })
}
