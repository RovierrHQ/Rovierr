/**
 * Auto-generated Zod schemas from Drizzle database schemas
 *
 * DO NOT extend THIS schemas here
 *
 * These schemas are derived from the database structure using drizzle-zod.
 * For API-specific schemas, modifications, or composite schemas, use schemas.ts
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
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema
} from 'drizzle-zod'

// ============================================================================
// Posts Schemas
// ============================================================================
export const insertPostSchema = createInsertSchema(posts)
export const selectPostSchema = createSelectSchema(posts)
export const updatePostSchema = createUpdateSchema(posts)

// ============================================================================
// Post Likes Schemas
// ============================================================================
export const insertPostLikeSchema = createInsertSchema(postLikes)
export const selectPostLikeSchema = createSelectSchema(postLikes)
export const updatePostLikeSchema = createUpdateSchema(postLikes)

// ============================================================================
// Post Comments Schemas
// ============================================================================
export const insertPostCommentSchema = createInsertSchema(postComments)
export const selectPostCommentSchema = createSelectSchema(postComments)
export const updatePostCommentSchema = createUpdateSchema(postComments)

// ============================================================================
// Post Shares Schemas
// ============================================================================
export const insertPostShareSchema = createInsertSchema(postShares)
export const selectPostShareSchema = createSelectSchema(postShares)
export const updatePostShareSchema = createUpdateSchema(postShares)

// ============================================================================
// Event Posts Schemas
// ============================================================================
export const insertEventPostSchema = createInsertSchema(eventPosts)
export const selectEventPostSchema = createSelectSchema(eventPosts)
export const updateEventPostSchema = createUpdateSchema(eventPosts)

// ============================================================================
// Event RSVPs Schemas
// ============================================================================
export const insertEventRsvpSchema = createInsertSchema(eventRsvps)
export const selectEventRsvpSchema = createSelectSchema(eventRsvps)
export const updateEventRsvpSchema = createUpdateSchema(eventRsvps)

// ============================================================================
// Comment Likes Schemas
// ============================================================================
export const insertCommentLikeSchema = createInsertSchema(commentLikes)
export const selectCommentLikeSchema = createSelectSchema(commentLikes)
export const updateCommentLikeSchema = createUpdateSchema(commentLikes)
