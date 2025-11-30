/**
 * Follow Service
 * Handles thread following/unfollowing for notifications
 */

import {
  type DB,
  thread,
  threadFollow,
  threadReply,
  threadVote,
  user
} from '@rov/db'
import type { ListFollowedThreadsQuery } from '@rov/orpc-contracts'
import { and, desc, eq, sql } from 'drizzle-orm'

export class FollowService {
  private db: DB

  constructor(db: DB) {
    this.db = db
  }

  // ============================================================================
  // Follow Operations
  // ============================================================================

  /**
   * Follow a thread
   */
  async followThread(threadId: string, userId: string) {
    // Check if thread exists
    const [existingThread] = await this.db
      .select()
      .from(thread)
      .where(eq(thread.id, threadId))

    if (!existingThread) {
      throw new Error('Thread not found')
    }

    // Check if already following
    const [existingFollow] = await this.db
      .select()
      .from(threadFollow)
      .where(
        and(
          eq(threadFollow.threadId, threadId),
          eq(threadFollow.userId, userId)
        )
      )

    if (!existingFollow) {
      await this.db.insert(threadFollow).values({
        threadId,
        userId
      })
    }

    return { success: true, isFollowing: true }
  }

  /**
   * Unfollow a thread
   */
  async unfollowThread(threadId: string, userId: string) {
    await this.db
      .delete(threadFollow)
      .where(
        and(
          eq(threadFollow.threadId, threadId),
          eq(threadFollow.userId, userId)
        )
      )

    return { success: true, isFollowing: false }
  }

  /**
   * Check if user is following a thread
   */
  async isFollowing(threadId: string, userId: string) {
    const [result] = await this.db
      .select()
      .from(threadFollow)
      .where(
        and(
          eq(threadFollow.threadId, threadId),
          eq(threadFollow.userId, userId)
        )
      )

    return !!result
  }

  /**
   * Get all threads a user is following
   */
  async getFollowedThreads(query: ListFollowedThreadsQuery, userId: string) {
    const { limit, offset } = query

    const threads = await this.db
      .select({
        thread,
        replyCount: sql<number>`(
          SELECT COUNT(*)::int
          FROM ${threadReply}
          WHERE ${threadReply.threadId} = ${thread.id}
        )`,
        upvotes: sql<number>`(
          SELECT COUNT(*)::int
          FROM ${threadVote}
          WHERE ${threadVote.threadId} = ${thread.id}
          AND ${threadVote.voteType} = 'up'
        )`,
        downvotes: sql<number>`(
          SELECT COUNT(*)::int
          FROM ${threadVote}
          WHERE ${threadVote.threadId} = ${thread.id}
          AND ${threadVote.voteType} = 'down'
        )`,
        userVote: sql<'up' | 'down' | null>`(
          SELECT ${threadVote.voteType}
          FROM ${threadVote}
          WHERE ${threadVote.threadId} = ${thread.id}
          AND ${threadVote.userId} = ${userId}
          LIMIT 1
        )`,
        author: user
      })
      .from(threadFollow)
      .innerJoin(thread, eq(threadFollow.threadId, thread.id))
      .leftJoin(user, eq(thread.authorId, user.id))
      .where(eq(threadFollow.userId, userId))
      .orderBy(desc(thread.createdAt))
      .limit(limit)
      .offset(offset)

    // Get total count
    const [totalResult] = await this.db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(threadFollow)
      .where(eq(threadFollow.userId, userId))

    const total = totalResult?.count || 0

    return {
      threads: threads.map((row) => ({
        ...row.thread,
        author: {
          id: row.author?.id || '',
          name: row.thread.isAnonymous ? null : row.author?.name || null,
          image: row.thread.isAnonymous ? null : row.author?.image || null,
          isAnonymous: row.thread.isAnonymous
        },
        votes: {
          upvotes: row.upvotes,
          downvotes: row.downvotes,
          userVote: row.userVote
        },
        replyCount: row.replyCount,
        isFollowing: true
      })),
      total,
      hasMore: offset + limit < total
    }
  }

  /**
   * Get all followers of a thread (for notifications)
   */
  async getFollowers(threadId: string) {
    const followers = await this.db
      .select({ userId: threadFollow.userId })
      .from(threadFollow)
      .where(eq(threadFollow.threadId, threadId))

    return followers.map((f) => f.userId)
  }
}
