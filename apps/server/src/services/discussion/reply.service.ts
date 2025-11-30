/**
 * Reply Service
 * Handles discussion reply CRUD operations and endorsements
 */

import { type DB, thread, threadReply, threadVote, user } from '@rov/db'
import type {
  CreateReplyInput,
  EndorseReplyInput,
  UpdateReplyInput
} from '@rov/orpc-contracts'
import { eq, sql } from 'drizzle-orm'

export class ReplyService {
  private db: DB

  constructor(db: DB) {
    this.db = db
  }

  // ============================================================================
  // Reply CRUD Operations
  // ============================================================================

  /**
   * Create a new reply to a thread or another reply
   */
  async createReply(input: CreateReplyInput, authorId: string) {
    const { threadId, parentReplyId, content, isAnonymous } = input

    // Check if thread exists and is not locked
    const [existingThread] = await this.db
      .select()
      .from(thread)
      .where(eq(thread.id, threadId))

    if (!existingThread) {
      throw new Error('Thread not found')
    }

    if (existingThread.isLocked) {
      throw new Error('Thread is locked')
    }

    // If parentReplyId is provided, check if it exists
    if (parentReplyId) {
      const [parentReply] = await this.db
        .select()
        .from(threadReply)
        .where(eq(threadReply.id, parentReplyId))

      if (!parentReply) {
        throw new Error('Parent reply not found')
      }
    }

    // Create the reply
    const [newReply] = await this.db
      .insert(threadReply)
      .values({
        threadId,
        parentReplyId: parentReplyId || null,
        authorId,
        content,
        isAnonymous
      })
      .returning()

    return this.getReplyById(newReply.id, authorId)
  }

  /**
   * Get a reply by ID with author and vote information
   */
  async getReplyById(replyId: string, userId: string) {
    const [result] = await this.db
      .select({
        reply: threadReply,
        upvotes: sql<number>`(
          SELECT COUNT(*)::int
          FROM ${threadVote}
          WHERE ${threadVote.replyId} = ${threadReply.id}
          AND ${threadVote.voteType} = 'up'
        )`,
        downvotes: sql<number>`(
          SELECT COUNT(*)::int
          FROM ${threadVote}
          WHERE ${threadVote.replyId} = ${threadReply.id}
          AND ${threadVote.voteType} = 'down'
        )`,
        userVote: sql<'up' | 'down' | null>`(
          SELECT ${threadVote.voteType}
          FROM ${threadVote}
          WHERE ${threadVote.replyId} = ${threadReply.id}
          AND ${threadVote.userId} = ${userId}
          LIMIT 1
        )`,
        author: user
      })
      .from(threadReply)
      .leftJoin(user, eq(threadReply.authorId, user.id))
      .where(eq(threadReply.id, replyId))

    if (!result) {
      throw new Error('Reply not found')
    }

    return {
      ...result.reply,
      author: {
        id: result.author?.id || '',
        name: result.reply.isAnonymous ? null : result.author?.name || null,
        image: result.reply.isAnonymous ? null : result.author?.image || null,
        isAnonymous: result.reply.isAnonymous
      },
      votes: {
        upvotes: result.upvotes,
        downvotes: result.downvotes,
        userVote: result.userVote
      }
    }
  }

  /**
   * Update a reply
   */
  async updateReply(
    input: UpdateReplyInput,
    userId: string,
    isModerator: boolean
  ) {
    const { id, content } = input

    // Check if reply exists and user is the author
    const [existingReply] = await this.db
      .select()
      .from(threadReply)
      .where(eq(threadReply.id, id))

    if (!existingReply) {
      throw new Error('Reply not found')
    }

    if (existingReply.authorId !== userId && !isModerator) {
      throw new Error('You do not have permission to update this reply')
    }

    await this.db
      .update(threadReply)
      .set({ content })
      .where(eq(threadReply.id, id))

    return this.getReplyById(id, userId)
  }

  /**
   * Delete a reply
   */
  async deleteReply(replyId: string, userId: string, isModerator: boolean) {
    // Check if reply exists and user is the author
    const [existingReply] = await this.db
      .select()
      .from(threadReply)
      .where(eq(threadReply.id, replyId))

    if (!existingReply) {
      throw new Error('Reply not found')
    }

    if (existingReply.authorId !== userId && !isModerator) {
      throw new Error('You do not have permission to delete this reply')
    }

    await this.db.delete(threadReply).where(eq(threadReply.id, replyId))

    return { success: true }
  }

  // ============================================================================
  // Moderator Actions
  // ============================================================================

  /**
   * Endorse or unendorse a reply (moderator only)
   */
  async endorseReply(input: EndorseReplyInput, userId: string) {
    const { id, isEndorsed } = input

    const [existingReply] = await this.db
      .select()
      .from(threadReply)
      .where(eq(threadReply.id, id))

    if (!existingReply) {
      throw new Error('Reply not found')
    }

    await this.db
      .update(threadReply)
      .set({
        isEndorsed,
        endorsedBy: isEndorsed ? userId : null,
        endorsedAt: isEndorsed ? new Date().toISOString() : null
      })
      .where(eq(threadReply.id, id))

    return this.getReplyById(id, userId)
  }

  /**
   * Get all replies for a thread with nested structure
   */
  async getRepliesForThread(threadId: string, userId: string) {
    const replies = await this.db
      .select({
        reply: threadReply,
        upvotes: sql<number>`(
          SELECT COUNT(*)::int
          FROM ${threadVote}
          WHERE ${threadVote.replyId} = ${threadReply.id}
          AND ${threadVote.voteType} = 'up'
        )`,
        downvotes: sql<number>`(
          SELECT COUNT(*)::int
          FROM ${threadVote}
          WHERE ${threadVote.replyId} = ${threadReply.id}
          AND ${threadVote.voteType} = 'down'
        )`,
        userVote: sql<'up' | 'down' | null>`(
          SELECT ${threadVote.voteType}
          FROM ${threadVote}
          WHERE ${threadVote.replyId} = ${threadReply.id}
          AND ${threadVote.userId} = ${userId}
          LIMIT 1
        )`,
        author: user
      })
      .from(threadReply)
      .leftJoin(user, eq(threadReply.authorId, user.id))
      .where(eq(threadReply.threadId, threadId))

    // Build nested structure
    type ReplyWithChildren = Awaited<ReturnType<typeof this.getReplyById>> & {
      childReplies: ReplyWithChildren[]
    }
    const replyMap = new Map<string, ReplyWithChildren>()
    const rootReplies: ReplyWithChildren[] = []

    // First pass: create all reply objects
    for (const row of replies) {
      const replyObj = {
        ...row.reply,
        author: {
          id: row.author?.id || '',
          name: row.reply.isAnonymous ? null : row.author?.name || null,
          image: row.reply.isAnonymous ? null : row.author?.image || null,
          isAnonymous: row.reply.isAnonymous
        },
        votes: {
          upvotes: row.upvotes,
          downvotes: row.downvotes,
          userVote: row.userVote
        },
        childReplies: []
      }
      replyMap.set(row.reply.id, replyObj)
    }

    // Second pass: build hierarchy
    for (const row of replies) {
      const replyObj = replyMap.get(row.reply.id)
      if (!replyObj) continue

      if (row.reply.parentReplyId) {
        const parent = replyMap.get(row.reply.parentReplyId)
        if (parent) {
          parent.childReplies.push(replyObj)
        }
      } else {
        rootReplies.push(replyObj)
      }
    }

    // Sort: endorsed first, then by votes
    const sortReplies = (replyList: ReplyWithChildren[]): void => {
      replyList.sort((a, b) => {
        if (a.isEndorsed && !b.isEndorsed) return -1
        if (!a.isEndorsed && b.isEndorsed) return 1
        const aScore = a.votes.upvotes - a.votes.downvotes
        const bScore = b.votes.upvotes - b.votes.downvotes
        return bScore - aScore
      })
      for (const reply of replyList) {
        if (reply.childReplies.length > 0) {
          sortReplies(reply.childReplies)
        }
      }
    }

    sortReplies(rootReplies)

    return rootReplies
  }
}
