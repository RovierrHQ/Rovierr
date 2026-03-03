/**
 * Campus Feed Router Schemas
 *
 * Zod schemas for campus feed endpoints
 * These schemas are based on the database structure and extended for API use
 */

import {
  commentLikes,
  eventPosts,
  eventRsvps,
  postComments,
  postLikes,
  postShares,
  posts
} from '@rov/db/schema'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

// ============================================================================
// Generated Schemas from Database
// ============================================================================

// Posts
export const insertPostSchema = createInsertSchema(posts)
export const selectPostSchema = createSelectSchema(posts)

// Post Likes
export const insertPostLikeSchema = createInsertSchema(postLikes)
export const selectPostLikeSchema = createSelectSchema(postLikes)

// Post Comments
export const insertPostCommentSchema = createInsertSchema(postComments)
export const selectPostCommentSchema = createSelectSchema(postComments)

// Post Shares
export const insertPostShareSchema = createInsertSchema(postShares)
export const selectPostShareSchema = createSelectSchema(postShares)

// Event Posts
export const insertEventPostSchema = createInsertSchema(eventPosts)
export const selectEventPostSchema = createSelectSchema(eventPosts)

// Event RSVPs
export const insertEventRsvpSchema = createInsertSchema(eventRsvps)
export const selectEventRsvpSchema = createSelectSchema(eventRsvps)

// Comment Likes
export const insertCommentLikeSchema = createInsertSchema(commentLikes)
export const selectCommentLikeSchema = createSelectSchema(commentLikes)

// ============================================================================
// Enum Schemas - Extracted from generated schemas
// ============================================================================

/**
 * Extract enum schemas directly from generated schemas using `.shape.fieldName`
 *
 * This approach:
 * - Avoids manual duplication of enum values
 * - Ensures enums stay in sync with database schema
 * - Leverages drizzle-zod's automatic enum extraction
 */
export const authorTypeSchema = selectPostSchema.shape.authorType
export const postTypeSchema = selectPostSchema.shape.type
export const postVisibilitySchema = selectPostSchema.shape.visibility
export const rsvpStatusSchema = selectEventRsvpSchema.shape.status

// ============================================================================
// Input Schemas - Built from generated schemas
// ============================================================================

/**
 * Schema for creating a new post
 */
export const createPostSchema = insertPostSchema
  .pick({
    content: true,
    imageUrl: true,
    type: true,
    visibility: true
  })
  .extend({
    content: z
      .string()
      .min(1, 'Content is required')
      .max(5000, 'Content too long'),
    imageUrl: z.string().url('Invalid image URL').optional(),
    type: postTypeSchema.default('post'),
    visibility: postVisibilitySchema.default('public')
  })

/**
 * Schema for creating an event post with event details
 */
export const createEventPostSchema = createPostSchema.extend({
  type: z.literal('event'),
  eventDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  eventTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
  location: z.string().min(1, 'Location is required').max(200)
})

/**
 * Schema for creating a comment
 */
export const createCommentSchema = z.object({
  postId: z.string().min(1, 'Post ID is required'),
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment too long')
})

/**
 * Schema for RSVP to an event
 */
export const rsvpSchema = z.object({
  eventPostId: z.string().min(1, 'Event post ID is required'),
  status: rsvpStatusSchema
})

// ============================================================================
// Query Schemas
// ============================================================================

/**
 * Schema for listing posts with filters and pagination
 */
export const listPostsSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  type: postTypeSchema.optional(),
  authorId: z.string().optional(),
  authorType: authorTypeSchema.optional()
})

/**
 * Schema for getting comments with pagination
 */
export const getCommentsSchema = z.object({
  postId: z.string().min(1, 'Post ID is required'),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0)
})

// ============================================================================
// Composite Schemas (for API responses with relations)
// ============================================================================

/**
 * Author information schema for campus feed posts
 */
export const campusFeedAuthorSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().nullable(),
  role: z.string() // e.g., "Computer Science, Year 3" or "Official Club"
})

/**
 * Event details schema for API responses
 */
export const eventDetailsSchema = selectEventPostSchema
  .omit({
    postId: true,
    createdAt: true,
    updatedAt: true
  })
  .extend({
    id: z.string(), // Event post ID for RSVP
    eventDate: z.string(),
    eventTime: z.string(),
    location: z.string()
  })

/**
 * Post with author and interaction counts
 */
export const postWithDetailsSchema = selectPostSchema
  .omit({
    createdAt: true,
    updatedAt: true
  })
  .extend({
    createdAt: z.string(),
    updatedAt: z.string(),
    author: campusFeedAuthorSchema,
    likeCount: z.number(),
    commentCount: z.number(),
    shareCount: z.number(),
    isLikedByCurrentUser: z.boolean(),
    eventDetails: eventDetailsSchema.optional(),
    rsvpCount: z.number().optional(),
    currentUserRSVP: rsvpStatusSchema.optional()
  })

/**
 * Comment with author information
 */
export const commentWithAuthorSchema = selectPostCommentSchema
  .omit({
    createdAt: true,
    updatedAt: true
  })
  .extend({
    createdAt: z.string(),
    updatedAt: z.string(),
    author: campusFeedAuthorSchema,
    likeCount: z.number(),
    isLikedByCurrentUser: z.boolean()
  })

/**
 * Paginated posts response
 */
export const paginatedPostsSchema = z.object({
  posts: z.array(postWithDetailsSchema),
  total: z.number(),
  hasMore: z.boolean()
})

/**
 * Paginated comments response
 */
export const paginatedCommentsSchema = z.object({
  comments: z.array(commentWithAuthorSchema),
  total: z.number(),
  hasMore: z.boolean()
})

// ============================================================================
// Additional Response Schemas
// ============================================================================

export const likeResponseSchema = z.object({
  liked: z.boolean(),
  likeCount: z.number()
})

export const shareResponseSchema = z.object({
  shareUrl: z.string(),
  shareCount: z.number()
})

export const rsvpResponseSchema = z.object({
  status: rsvpStatusSchema,
  rsvpCount: z.number()
})

export const uploadMediaSchema = z.object({
  base64Data: z.string(),
  mediaType: z.enum(['image', 'video'])
})

export const uploadMediaResponseSchema = z.object({
  url: z.string(),
  s3KeyUrl: z.string()
})

export const deleteResponseSchema = z.object({
  success: z.boolean()
})

// ============================================================================
// Type Exports
// ============================================================================

export type CreatePostInput = z.infer<typeof createPostSchema>
export type CreateEventPostInput = z.infer<typeof createEventPostSchema>
export type CreateCommentInput = z.infer<typeof createCommentSchema>
export type RSVPInput = z.infer<typeof rsvpSchema>
export type ListPostsQuery = z.infer<typeof listPostsSchema>
export type GetCommentsQuery = z.infer<typeof getCommentsSchema>
export type PostWithDetails = z.infer<typeof postWithDetailsSchema>
export type CommentWithAuthor = z.infer<typeof commentWithAuthorSchema>
export type CampusFeedAuthor = z.infer<typeof campusFeedAuthorSchema>
export type EventDetails = z.infer<typeof eventDetailsSchema>
