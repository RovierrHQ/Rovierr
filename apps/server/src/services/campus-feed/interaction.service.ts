/**
 * Interaction Service
 * Handles likes, comments, and shares for campus feed posts
 */

import { type DB, postComments, postLikes, postShares, user } from '@rov/db'
import type { CommentWithAuthor, CreateCommentInput } from '@rov/orpc-contracts'
import { and, count, desc, eq } from 'drizzle-orm'
import { getPresignedUrlFromFullUrl, isS3Url } from '@/services/s3'

export class InteractionService {
  private db: DB

  constructor(db: DB) {
    this.db = db
  }

  // ============================================================================
  // Like Operations
  // ============================================================================

  /**
   * Toggle like on a post (like if not liked, unlike if already liked)
   */
  async toggleLike(
    postId: string,
    userId: string
  ): Promise<{ liked: boolean; likeCount: number }> {
    // Check if user already liked the post
    const [existingLike] = await this.db
      .select()
      .from(postLikes)
      .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)))
      .limit(1)

    if (existingLike) {
      // Unlike: remove the like
      await this.db
        .delete(postLikes)
        .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)))
    } else {
      // Like: add the like
      await this.db.insert(postLikes).values({
        postId,
        userId
      })
    }

    // Get updated like count
    const [likeCountResult] = await this.db
      .select({ count: count() })
      .from(postLikes)
      .where(eq(postLikes.postId, postId))

    return {
      liked: !existingLike,
      likeCount: likeCountResult?.count || 0
    }
  }

  // ============================================================================
  // Comment Operations
  // ============================================================================

  /**
   * Add a comment to a post
   */
  async addComment(
    input: CreateCommentInput,
    userId: string
  ): Promise<CommentWithAuthor> {
    const [newComment] = await this.db
      .insert(postComments)
      .values({
        postId: input.postId,
        userId,
        content: input.content
      })
      .returning()

    return this.getCommentWithAuthor(newComment.id)
  }

  /**
   * Get comments for a post with pagination
   */
  async getComments(
    postId: string,
    limit = 20,
    offset = 0
  ): Promise<{
    comments: CommentWithAuthor[]
    total: number
    hasMore: boolean
  }> {
    // Get comments
    const commentsResult = await this.db
      .select()
      .from(postComments)
      .where(eq(postComments.postId, postId))
      .orderBy(desc(postComments.createdAt))
      .limit(limit + 1) // Fetch one extra to check if there are more
      .offset(offset)

    const hasMore = commentsResult.length > limit
    const commentsToReturn = hasMore
      ? commentsResult.slice(0, limit)
      : commentsResult

    // Get full details for each comment
    const commentsWithAuthor = await Promise.all(
      commentsToReturn.map((comment) => this.getCommentWithAuthor(comment.id))
    )

    // Get total count
    const [totalResult] = await this.db
      .select({ count: count() })
      .from(postComments)
      .where(eq(postComments.postId, postId))

    return {
      comments: commentsWithAuthor,
      total: totalResult?.count || 0,
      hasMore
    }
  }

  /**
   * Get a comment with author information
   */
  private async getCommentWithAuthor(
    commentId: string
  ): Promise<CommentWithAuthor> {
    const [comment] = await this.db
      .select({
        id: postComments.id,
        postId: postComments.postId,
        userId: postComments.userId,
        content: postComments.content,
        createdAt: postComments.createdAt,
        updatedAt: postComments.updatedAt,
        authorId: user.id,
        authorName: user.name,
        authorAvatar: user.image
      })
      .from(postComments)
      .innerJoin(user, eq(postComments.userId, user.id))
      .where(eq(postComments.id, commentId))
      .limit(1)

    if (!comment) {
      throw new Error('Comment not found')
    }

    // Convert S3 avatar URL to presigned URL
    const authorAvatar =
      comment.authorAvatar && isS3Url(comment.authorAvatar)
        ? await getPresignedUrlFromFullUrl(comment.authorAvatar).catch(
            () => comment.authorAvatar
          )
        : comment.authorAvatar

    return {
      id: comment.id,
      postId: comment.postId,
      userId: comment.userId,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: {
        id: comment.authorId,
        name: comment.authorName,
        avatar: authorAvatar,
        role: 'Student' // TODO: Fetch actual role from user profile
      }
    }
  }

  // ============================================================================
  // Share Operations
  // ============================================================================

  /**
   * Share a post
   */
  async sharePost(
    postId: string,
    userId: string,
    baseUrl: string
  ): Promise<{ shareUrl: string; shareCount: number }> {
    // Record the share
    await this.db.insert(postShares).values({
      postId,
      userId
    })

    // Get updated share count
    const [shareCountResult] = await this.db
      .select({ count: count() })
      .from(postShares)
      .where(eq(postShares.postId, postId))

    // Generate shareable URL
    const shareUrl = `${baseUrl}/campus-feed/post/${postId}`

    return {
      shareUrl,
      shareCount: shareCountResult?.count || 0
    }
  }
}
