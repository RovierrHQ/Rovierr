/**
 * Consolidated Discussion Schemas
 *
 * This file uses Drizzle-generated schemas as the source of truth and extends them
 * for API-specific use cases.
 */

import { z } from 'zod'
import {
  insertThreadReplySchema,
  insertThreadSchema,
  selectThreadReplySchema,
  selectThreadSchema,
  selectThreadVoteSchema
} from './generated-schemas'

// ============================================================================
// Enum Schemas - Extracted from generated schemas
// ============================================================================

export const contextTypeSchema = selectThreadSchema.shape.contextType
export const threadTypeSchema = selectThreadSchema.shape.type
export const voteTypeSchema = selectThreadVoteSchema.shape.voteType

// ============================================================================
// Thread Input Schemas
// ============================================================================

/**
 * Schema for creating a new thread
 */
export const createThreadSchema = insertThreadSchema
  .pick({
    contextType: true,
    contextId: true,
    title: true,
    content: true,
    isAnonymous: true,
    type: true,
    tags: true
  })
  .extend({
    title: z.string().min(1, 'Title is required').max(200),
    content: z.string().min(1, 'Content is required').max(10_000),
    isAnonymous: z.boolean().default(false),
    tags: z.array(z.string()).max(5).optional()
  })

/**
 * Schema for updating a thread
 */
export const updateThreadSchema = z.object({
  id: z.string().min(1, 'Thread ID is required'),
  title: z.string().min(1, 'Title is required').max(200).optional(),
  content: z.string().min(1, 'Content is required').max(10_000).optional(),
  tags: z.array(z.string()).max(5).optional()
})

/**
 * Schema for listing threads with filters
 */
export const listThreadsSchema = z.object({
  contextType: contextTypeSchema,
  contextId: z.string().min(1, 'Context ID is required'),
  type: threadTypeSchema.optional(),
  unanswered: z.boolean().optional(),
  following: z.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['recent', 'popular', 'unanswered']).default('recent'),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0)
})

/**
 * Schema for pinning a thread
 */
export const pinThreadSchema = z.object({
  id: z.string().min(1, 'Thread ID is required'),
  isPinned: z.boolean()
})

/**
 * Schema for locking a thread
 */
export const lockThreadSchema = z.object({
  id: z.string().min(1, 'Thread ID is required'),
  isLocked: z.boolean()
})

// ============================================================================
// Reply Input Schemas
// ============================================================================

/**
 * Schema for creating a reply
 */
export const createReplySchema = insertThreadReplySchema
  .pick({
    threadId: true,
    parentReplyId: true,
    content: true,
    isAnonymous: true
  })
  .extend({
    threadId: z.string().min(1, 'Thread ID is required'),
    parentReplyId: z.string().optional(),
    content: z.string().min(1, 'Content is required').max(10_000),
    isAnonymous: z.boolean().default(false)
  })

/**
 * Schema for updating a reply
 */
export const updateReplySchema = z.object({
  id: z.string().min(1, 'Reply ID is required'),
  content: z.string().min(1, 'Content is required').max(10_000)
})

/**
 * Schema for endorsing a reply
 */
export const endorseReplySchema = z.object({
  id: z.string().min(1, 'Reply ID is required'),
  isEndorsed: z.boolean()
})

// ============================================================================
// Vote Input Schemas
// ============================================================================

/**
 * Schema for voting on a thread or reply
 */
export const voteSchema = z
  .object({
    threadId: z.string().optional(),
    replyId: z.string().optional(),
    voteType: voteTypeSchema
  })
  .refine(
    (data) =>
      (data.threadId && !data.replyId) || (!data.threadId && data.replyId),
    {
      message: 'Must provide either threadId or replyId, but not both'
    }
  )

/**
 * Schema for removing a vote
 */
export const unvoteSchema = z
  .object({
    threadId: z.string().optional(),
    replyId: z.string().optional()
  })
  .refine(
    (data) =>
      (data.threadId && !data.replyId) || (!data.threadId && data.replyId),
    {
      message: 'Must provide either threadId or replyId, but not both'
    }
  )

// ============================================================================
// Follow Input Schemas
// ============================================================================

/**
 * Schema for following a thread
 */
export const followThreadSchema = z.object({
  threadId: z.string().min(1, 'Thread ID is required')
})

/**
 * Schema for unfollowing a thread
 */
export const unfollowThreadSchema = z.object({
  threadId: z.string().min(1, 'Thread ID is required')
})

/**
 * Schema for listing followed threads
 */
export const listFollowedThreadsSchema = z.object({
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0)
})

// ============================================================================
// Composite Schemas (for API responses with relations)
// ============================================================================

/**
 * Author schema for thread/reply responses
 */
export const authorSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  image: z.string().nullable(),
  isAnonymous: z.boolean()
})

/**
 * Vote count schema
 */
export const voteCountSchema = z.object({
  upvotes: z.number(),
  downvotes: z.number(),
  userVote: voteTypeSchema.nullable()
})

/**
 * Base reply type for recursive definition
 */
export type ReplyType = {
  id: string
  threadId: string
  authorId: string
  parentReplyId: string | null
  content: string
  isAnonymous: boolean
  isEndorsed: boolean
  endorsedBy: string | null
  endorsedAt: string | null
  createdAt: string
  updatedAt: string
  author: z.infer<typeof authorSchema>
  votes: z.infer<typeof voteCountSchema>
  childReplies?: ReplyType[]
}

/**
 * Reply schema with author and votes
 */
export const replySchema: z.ZodType<ReplyType> = selectThreadReplySchema
  .omit({
    createdAt: true,
    updatedAt: true,
    endorsedAt: true
  })
  .extend({
    createdAt: z.string(),
    updatedAt: z.string(),
    endorsedAt: z.string().nullable(),
    author: authorSchema,
    votes: voteCountSchema,
    childReplies: z.array(z.lazy(() => replySchema)).optional()
  })

/**
 * Full thread schema with replies and metadata
 */
export const fullThreadSchema = selectThreadSchema
  .omit({
    createdAt: true,
    updatedAt: true
  })
  .extend({
    createdAt: z.string(),
    updatedAt: z.string(),
    author: authorSchema,
    votes: voteCountSchema,
    replyCount: z.number(),
    isFollowing: z.boolean(),
    replies: z.array(replySchema).optional()
  })

/**
 * Thread list item schema (without full replies)
 */
export const threadListItemSchema = selectThreadSchema
  .omit({
    createdAt: true,
    updatedAt: true
  })
  .extend({
    createdAt: z.string(),
    updatedAt: z.string(),
    author: authorSchema,
    votes: voteCountSchema,
    replyCount: z.number(),
    isFollowing: z.boolean()
  })

// ============================================================================
// Type Exports
// ============================================================================

export type CreateThreadInput = z.infer<typeof createThreadSchema>
export type UpdateThreadInput = z.infer<typeof updateThreadSchema>
export type ListThreadsQuery = z.infer<typeof listThreadsSchema>
export type PinThreadInput = z.infer<typeof pinThreadSchema>
export type LockThreadInput = z.infer<typeof lockThreadSchema>

export type CreateReplyInput = z.infer<typeof createReplySchema>
export type UpdateReplyInput = z.infer<typeof updateReplySchema>
export type EndorseReplyInput = z.infer<typeof endorseReplySchema>

export type VoteInput = z.infer<typeof voteSchema>
export type UnvoteInput = z.infer<typeof unvoteSchema>

export type FollowThreadInput = z.infer<typeof followThreadSchema>
export type UnfollowThreadInput = z.infer<typeof unfollowThreadSchema>
export type ListFollowedThreadsQuery = z.infer<typeof listFollowedThreadsSchema>

export type Author = z.infer<typeof authorSchema>
export type VoteCount = z.infer<typeof voteCountSchema>
export type Reply = z.infer<typeof replySchema>
export type FullThread = z.infer<typeof fullThreadSchema>
export type ThreadListItem = z.infer<typeof threadListItemSchema>
