/**
 * Thread Service
 * Handles discussion thread CRUD operations, pinning, locking, and listing
 */

import {
  type DB,
  thread,
  threadFollow,
  threadReply,
  threadVote,
  user
} from '@rov/db'
import type {
  CreateThreadInput,
  ListThreadsQuery,
  LockThreadInput,
  PinThreadInput,
  UpdateThreadInput
} from '@rov/orpc-contracts'
import { and, count, desc, eq, ilike, or, sql } from 'drizzle-orm'

export class ThreadService {
  private db: DB

  constructor(db: DB) {
    this.db = db
  }

  // ============================================================================
  // Thread CRUD Operations
  // ============================================================================

  /**
   * Create a new discussion thread
   */
  async createThread(input: CreateThreadInput, authorId: string) {
    const [newThread] = await this.db
      .insert(thread)
      .values({
        ...input,
        authorId,
        viewCount: 0
      })
      .returning()

    // Auto-follow the thread for the author
    await this.db.insert(threadFollow).values({
      threadId: newThread.id,
      userId: authorId
    })

    return this.getThreadById(newThread.id, authorId)
  }

  /**
   * List threads with filtering and pagination
   */
  async listThreads(query: ListThreadsQuery, userId: string) {
    const {
      contextType,
      contextId,
      type,
      unanswered,
      following,
      search,
      sortBy,
      limit,
      offset
    } = query

    // Build where conditions
    const conditions = [
      eq(thread.contextType, contextType),
      eq(thread.contextId, contextId)
    ]

    if (type) {
      conditions.push(eq(thread.type, type))
    }

    if (search) {
      const searchCondition = or(
        ilike(thread.title, `%${search}%`),
        ilike(thread.content, `%${search}%`)
      )
      if (searchCondition) {
        conditions.push(searchCondition)
      }
    }

    // Determine order by clause based on sortBy
    const getOrderBy = () => {
      if (sortBy === 'popular') {
        return [desc(sql`upvotes - downvotes`), desc(thread.createdAt)]
      }
      if (sortBy === 'unanswered') {
        return [sql`reply_count ASC`, desc(thread.createdAt)]
      }
      return [desc(thread.isPinned), desc(thread.createdAt)]
    }

    // Execute query
    const threads = await this.db
      .select({
        thread,
        replyCount: sql<number>`(
          SELECT COUNT(*)::int
          FROM ${threadReply}
          WHERE ${threadReply.threadId} = ${thread.id}
        )`.as('reply_count'),
        upvotes: sql<number>`(
          SELECT COUNT(*)::int
          FROM ${threadVote}
          WHERE ${threadVote.threadId} = ${thread.id}
          AND ${threadVote.voteType} = 'up'
        )`.as('upvotes'),
        downvotes: sql<number>`(
          SELECT COUNT(*)::int
          FROM ${threadVote}
          WHERE ${threadVote.threadId} = ${thread.id}
          AND ${threadVote.voteType} = 'down'
        )`.as('downvotes'),
        userVote: sql<'up' | 'down' | null>`(
          SELECT ${threadVote.voteType}
          FROM ${threadVote}
          WHERE ${threadVote.threadId} = ${thread.id}
          AND ${threadVote.userId} = ${userId}
          LIMIT 1
        )`.as('user_vote'),
        isFollowing: sql<boolean>`(
          SELECT EXISTS(
            SELECT 1
            FROM ${threadFollow}
            WHERE ${threadFollow.threadId} = ${thread.id}
            AND ${threadFollow.userId} = ${userId}
          )
        )`.as('is_following'),
        author: user
      })
      .from(thread)
      .leftJoin(user, eq(thread.authorId, user.id))
      .where(and(...conditions))
      .orderBy(...getOrderBy())
      .limit(limit * 2) // Fetch more to account for filtering
      .offset(offset)

    // Apply post-query filters
    let filteredThreads = threads
    if (unanswered) {
      filteredThreads = filteredThreads.filter((row) => row.replyCount === 0)
    }
    if (following) {
      filteredThreads = filteredThreads.filter((row) => row.isFollowing)
    }

    // Apply pagination after filtering
    const paginatedThreads = filteredThreads.slice(0, limit)

    // Get total count
    const [totalResult] = await this.db
      .select({ count: count() })
      .from(thread)
      .where(and(...conditions))

    const total = totalResult?.count || 0

    return {
      threads: paginatedThreads.map((row) => ({
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
        isFollowing: row.isFollowing
      })),
      total,
      hasMore: offset + limit < total
    }
  }

  /**
   * Get a single thread by ID with all details
   */
  async getThreadById(threadId: string, userId: string) {
    const [result] = await this.db
      .select({
        thread,
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
        isFollowing: sql<boolean>`(
          SELECT EXISTS(
            SELECT 1
            FROM ${threadFollow}
            WHERE ${threadFollow.threadId} = ${thread.id}
            AND ${threadFollow.userId} = ${userId}
          )
        )`,
        replyCount: sql<number>`(
          SELECT COUNT(*)::int
          FROM ${threadReply}
          WHERE ${threadReply.threadId} = ${thread.id}
        )`,
        author: user
      })
      .from(thread)
      .leftJoin(user, eq(thread.authorId, user.id))
      .where(eq(thread.id, threadId))

    if (!result) {
      throw new Error('Thread not found')
    }

    // Increment view count
    await this.db
      .update(thread)
      .set({ viewCount: sql`${thread.viewCount} + 1` })
      .where(eq(thread.id, threadId))

    return {
      ...result.thread,
      author: {
        id: result.author?.id || '',
        name: result.thread.isAnonymous ? null : result.author?.name || null,
        image: result.thread.isAnonymous ? null : result.author?.image || null,
        isAnonymous: result.thread.isAnonymous
      },
      votes: {
        upvotes: result.upvotes,
        downvotes: result.downvotes,
        userVote: result.userVote
      },
      replyCount: result.replyCount,
      isFollowing: result.isFollowing
    }
  }

  /**
   * Update a thread
   */
  async updateThread(
    input: UpdateThreadInput,
    userId: string,
    isModerator: boolean
  ) {
    const { id, ...updates } = input

    // Check if thread exists and user is the author
    const [existingThread] = await this.db
      .select()
      .from(thread)
      .where(eq(thread.id, id))

    if (!existingThread) {
      throw new Error('Thread not found')
    }

    if (existingThread.authorId !== userId && !isModerator) {
      throw new Error('You do not have permission to update this thread')
    }

    await this.db.update(thread).set(updates).where(eq(thread.id, id))

    return this.getThreadById(id, userId)
  }

  /**
   * Delete a thread
   */
  async deleteThread(threadId: string, userId: string, isModerator: boolean) {
    // Check if thread exists and user is the author
    const [existingThread] = await this.db
      .select()
      .from(thread)
      .where(eq(thread.id, threadId))

    if (!existingThread) {
      throw new Error('Thread not found')
    }

    if (existingThread.authorId !== userId && !isModerator) {
      throw new Error('You do not have permission to delete this thread')
    }

    await this.db.delete(thread).where(eq(thread.id, threadId))

    return { success: true }
  }

  // ============================================================================
  // Moderator Actions
  // ============================================================================

  /**
   * Pin or unpin a thread (moderator only)
   */
  async pinThread(input: PinThreadInput, userId: string) {
    const { id, isPinned } = input

    const [existingThread] = await this.db
      .select()
      .from(thread)
      .where(eq(thread.id, id))

    if (!existingThread) {
      throw new Error('Thread not found')
    }

    await this.db.update(thread).set({ isPinned }).where(eq(thread.id, id))

    return this.getThreadById(id, userId)
  }

  /**
   * Lock or unlock a thread (moderator only)
   */
  async lockThread(input: LockThreadInput, userId: string) {
    const { id, isLocked } = input

    const [existingThread] = await this.db
      .select()
      .from(thread)
      .where(eq(thread.id, id))

    if (!existingThread) {
      throw new Error('Thread not found')
    }

    await this.db.update(thread).set({ isLocked }).where(eq(thread.id, id))

    return this.getThreadById(id, userId)
  }
}
