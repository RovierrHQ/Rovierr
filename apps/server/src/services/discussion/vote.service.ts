/**
 * Vote Service
 * Handles voting on threads and replies
 */

import { type DB, threadVote } from '@rov/db'
import type { UnvoteInput, VoteInput } from '@rov/orpc-contracts'
import { and, eq, sql } from 'drizzle-orm'

export class VoteService {
  private db: DB

  constructor(db: DB) {
    this.db = db
  }

  // ============================================================================
  // Vote Operations
  // ============================================================================

  /**
   * Vote on a thread or reply
   */
  async vote(input: VoteInput, userId: string) {
    const { threadId, replyId, voteType } = input

    // Check if user has already voted
    const existingVote = await this.db
      .select()
      .from(threadVote)
      .where(
        and(
          eq(threadVote.userId, userId),
          threadId ? eq(threadVote.threadId, threadId) : undefined,
          replyId ? eq(threadVote.replyId, replyId) : undefined
        )
      )

    if (existingVote.length > 0) {
      // Update existing vote
      await this.db
        .update(threadVote)
        .set({ voteType })
        .where(eq(threadVote.id, existingVote[0].id))
    } else {
      // Create new vote
      await this.db.insert(threadVote).values({
        threadId: threadId || null,
        replyId: replyId || null,
        userId,
        voteType
      })
    }

    return this.getVoteCount(threadId, replyId, userId)
  }

  /**
   * Remove a vote from a thread or reply
   */
  async unvote(input: UnvoteInput, userId: string) {
    const { threadId, replyId } = input

    await this.db
      .delete(threadVote)
      .where(
        and(
          eq(threadVote.userId, userId),
          threadId ? eq(threadVote.threadId, threadId) : undefined,
          replyId ? eq(threadVote.replyId, replyId) : undefined
        )
      )

    return this.getVoteCount(threadId, replyId, userId)
  }

  /**
   * Get vote count for a thread or reply
   */
  async getVoteCount(
    threadId: string | undefined,
    replyId: string | undefined,
    userId: string
  ) {
    const conditions: ReturnType<typeof eq>[] = []
    if (threadId) {
      conditions.push(eq(threadVote.threadId, threadId))
    }
    if (replyId) {
      conditions.push(eq(threadVote.replyId, replyId))
    }

    const [upvotesResult] = await this.db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(threadVote)
      .where(and(...conditions, eq(threadVote.voteType, 'up')))

    const [downvotesResult] = await this.db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(threadVote)
      .where(and(...conditions, eq(threadVote.voteType, 'down')))

    const [userVoteResult] = await this.db
      .select({ voteType: threadVote.voteType })
      .from(threadVote)
      .where(and(...conditions, eq(threadVote.userId, userId)))

    return {
      upvotes: upvotesResult?.count || 0,
      downvotes: downvotesResult?.count || 0,
      userVote: userVoteResult?.voteType || null
    }
  }

  /**
   * Get user's vote on a thread or reply
   */
  async getUserVote(
    threadId: string | undefined,
    replyId: string | undefined,
    userId: string
  ) {
    const conditions = [eq(threadVote.userId, userId)]
    if (threadId) {
      conditions.push(eq(threadVote.threadId, threadId))
    }
    if (replyId) {
      conditions.push(eq(threadVote.replyId, replyId))
    }

    const [result] = await this.db
      .select()
      .from(threadVote)
      .where(and(...conditions))

    return result?.voteType || null
  }
}
