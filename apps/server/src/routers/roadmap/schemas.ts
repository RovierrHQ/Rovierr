/**
 * Roadmap Schemas
 *
 * Schemas extracted from ORPC contracts for use in Elysia routes
 */

import { z } from 'zod'

// ============================================================================
// Shared Schemas
// ============================================================================

const publicUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  image: z.string().nullable()
})

export const commentSchema = z.object({
  id: z.string(),
  text: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  user: publicUserSchema,
  upvotes: z.array(
    z.object({
      id: z.string(),
      userId: z.string(),
      createdAt: z.string(),
      updatedAt: z.string()
    })
  )
})

// ============================================================================
// Input Schemas
// ============================================================================

export const createRoadmapSchema = z.object({
  title: z.string(),
  status: z.enum(['publish', 'preview']),
  category: z.enum(['feature-request', 'bug-report', 'improvement']),
  description: z.string()
})

export const listRoadmapQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(10),
  status: z.enum(['publish', 'preview']).optional(),
  category: z.enum(['feature-request', 'bug-report', 'improvement']).optional()
})

export const voteRoadmapSchema = z.object({
  roadmapId: z.string()
})

export const createCommentSchema = z.object({
  roadmapId: z.string(),
  text: z.string().min(1, 'Comment text is required')
})

export const voteCommentSchema = z.object({
  commentId: z.string()
})

// ============================================================================
// Response Schemas
// ============================================================================

export const roadmapItemSchema = z.object({
  id: z.string(),
  user: publicUserSchema,
  title: z.string(),
  status: z.enum(['publish', 'preview']),
  category: z.enum(['feature-request', 'bug-report', 'improvement']),
  description: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  upvotes: z.array(
    z.object({
      id: z.string(),
      userId: z.string(),
      roadmapId: z.string(),
      createdAt: z.string(),
      updatedAt: z.string()
    })
  ),
  comments: z.array(commentSchema)
})

export const roadmapListResponseSchema = z.object({
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPage: z.number()
  }),
  data: z.array(roadmapItemSchema)
})

// ============================================================================
// Type Exports
// ============================================================================

export type CreateRoadmap = z.infer<typeof createRoadmapSchema>
export type ListRoadmapQuery = z.infer<typeof listRoadmapQuerySchema>
export type VoteRoadmap = z.infer<typeof voteRoadmapSchema>
export type CreateComment = z.infer<typeof createCommentSchema>
export type VoteComment = z.infer<typeof voteCommentSchema>
