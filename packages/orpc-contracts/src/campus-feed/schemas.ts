/**
 * Consolidated Campus Feed Schemas
 *
 * This file uses Drizzle-generated schemas as the source of truth and extends them
 * for API-specific use cases.
 */

import { z } from 'zod'
import {
  insertPostSchema,
  selectEventPostSchema,
  selectEventRsvpSchema,
  selectPostCommentSchema,
  selectPostSchema
} from './generated-schemas'

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
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  type: postTypeSchema.optional(),
  authorId: z.string().optional(),
  authorType: authorTypeSchema.optional()
})

/**
 * Schema for getting comments with pagination
 */
export const getCommentsSchema = z.object({
  postId: z.string().min(1, 'Post ID is required'),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0)
})

// ============================================================================
// Composite Schemas (for API responses with relations)
// ============================================================================

/**
 * Author information schema
 */
export const authorSchema = z.object({
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
    id: true,
    postId: true,
    createdAt: true,
    updatedAt: true
  })
  .extend({
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
    author: authorSchema,
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
    author: authorSchema
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
export type Author = z.infer<typeof authorSchema>
export type EventDetails = z.infer<typeof eventDetailsSchema>
