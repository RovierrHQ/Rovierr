/**
 * Auto-generated Zod schemas from Drizzle database schemas
 *
 * These schemas are derived from the database structure using drizzle-zod.
 * For API-specific schemas, modifications, or composite schemas, use schemas.ts
 */

import { thread, threadFollow, threadReply, threadVote } from '@rov/db/schema'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

// ============================================================================
// Thread Schemas
// ============================================================================
export const insertThreadSchema = createInsertSchema(thread)
export const selectThreadSchema = createSelectSchema(thread)

// ============================================================================
// Thread Reply Schemas
// ============================================================================
export const insertThreadReplySchema = createInsertSchema(threadReply)
export const selectThreadReplySchema = createSelectSchema(threadReply)

// ============================================================================
// Thread Vote Schemas
// ============================================================================
export const insertThreadVoteSchema = createInsertSchema(threadVote)
export const selectThreadVoteSchema = createSelectSchema(threadVote)

// ============================================================================
// Thread Follow Schemas
// ============================================================================
export const insertThreadFollowSchema = createInsertSchema(threadFollow)
export const selectThreadFollowSchema = createSelectSchema(threadFollow)
