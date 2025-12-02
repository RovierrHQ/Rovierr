/**
 * Post Service
 * Handles campus feed post CRUD operations
 */

import {
  type DB,
  eventPosts,
  eventRsvps,
  organization,
  postComments,
  postLikes,
  postShares,
  posts,
  user
} from '@rov/db'
import type {
  CreateEventPostInput,
  CreatePostInput,
  ListPostsQuery,
  PostWithDetails
} from '@rov/orpc-contracts'
import { and, count, desc, eq, type SQL } from 'drizzle-orm'
import { getPresignedUrlFromFullUrl, isS3Url } from '@/services/s3'

export class PostService {
  private db: DB

  constructor(db: DB) {
    this.db = db
  }

  // ============================================================================
  // Post CRUD Operations
  // ============================================================================

  /**
   * Create a new post
   */
  async createPost(
    input: CreatePostInput,
    authorId: string,
    authorType: 'user' | 'organization' = 'user'
  ): Promise<PostWithDetails> {
    const [newPost] = await this.db
      .insert(posts)
      .values({
        ...input,
        authorId,
        authorType
      })
      .returning()

    return this.getPostById(newPost.id, authorId)
  }

  /**
   * Create an event post with event details
   */
  async createEventPost(
    input: CreateEventPostInput,
    authorId: string,
    authorType: 'user' | 'organization' = 'user'
  ): Promise<PostWithDetails> {
    // Extract event details from input
    const { eventDate, eventTime, location, ...postData } = input

    // Create the post
    const [newPost] = await this.db
      .insert(posts)
      .values({
        ...postData,
        authorId,
        authorType,
        type: 'event'
      })
      .returning()

    // Create the event details
    await this.db.insert(eventPosts).values({
      postId: newPost.id,
      eventDate,
      eventTime,
      location
    })

    return this.getPostById(newPost.id, authorId)
  }

  /**
   * Get a single post by ID with all details
   */
  async getPostById(
    postId: string,
    currentUserId?: string
  ): Promise<PostWithDetails> {
    const [post] = await this.db
      .select({
        id: posts.id,
        authorId: posts.authorId,
        authorType: posts.authorType,
        content: posts.content,
        imageUrl: posts.imageUrl,
        type: posts.type,
        visibility: posts.visibility,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt
      })
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1)

    if (!post) {
      throw new Error('Post not found')
    }

    // Get author information
    const author = await this.getAuthorInfo(post.authorId, post.authorType)

    // Get interaction counts
    const [likesResult] = await this.db
      .select({ count: count() })
      .from(postLikes)
      .where(eq(postLikes.postId, postId))

    const [commentsResult] = await this.db
      .select({ count: count() })
      .from(postComments)
      .where(eq(postComments.postId, postId))

    const [sharesResult] = await this.db
      .select({ count: count() })
      .from(postShares)
      .where(eq(postShares.postId, postId))

    // Check if current user liked the post
    let isLikedByCurrentUser = false
    if (currentUserId) {
      const [like] = await this.db
        .select()
        .from(postLikes)
        .where(
          and(eq(postLikes.postId, postId), eq(postLikes.userId, currentUserId))
        )
        .limit(1)
      isLikedByCurrentUser = !!like
    }

    // Get event details if it's an event post
    let eventDetails:
      | { eventDate: string; eventTime: string; location: string }
      | undefined
    let rsvpCount: number | undefined
    let currentUserRSVP: 'going' | 'interested' | 'not_going' | undefined
    if (post.type === 'event') {
      const [event] = await this.db
        .select()
        .from(eventPosts)
        .where(eq(eventPosts.postId, postId))
        .limit(1)

      if (event) {
        eventDetails = {
          eventDate: event.eventDate,
          eventTime: event.eventTime,
          location: event.location
        }

        // Get RSVP count
        const [rsvpResult] = await this.db
          .select({ count: count() })
          .from(eventRsvps)
          .where(eq(eventRsvps.eventPostId, event.id))

        rsvpCount = rsvpResult?.count || 0

        // Get current user's RSVP status
        if (currentUserId) {
          const [rsvp] = await this.db
            .select()
            .from(eventRsvps)
            .where(
              and(
                eq(eventRsvps.eventPostId, event.id),
                eq(eventRsvps.userId, currentUserId)
              )
            )
            .limit(1)
          currentUserRSVP = rsvp?.status
        }
      }
    }

    // Convert S3 URLs to presigned URLs
    const imageUrl =
      post.imageUrl && isS3Url(post.imageUrl)
        ? await getPresignedUrlFromFullUrl(post.imageUrl).catch(
            () => post.imageUrl
          )
        : post.imageUrl

    const authorAvatar =
      author.avatar && isS3Url(author.avatar)
        ? await getPresignedUrlFromFullUrl(author.avatar).catch(
            () => author.avatar
          )
        : author.avatar

    return {
      ...post,
      imageUrl,
      author: {
        ...author,
        avatar: authorAvatar
      },
      likeCount: likesResult?.count || 0,
      commentCount: commentsResult?.count || 0,
      shareCount: sharesResult?.count || 0,
      isLikedByCurrentUser,
      eventDetails,
      rsvpCount,
      currentUserRSVP
    }
  }

  /**
   * List posts with filtering and pagination
   */
  async listPosts(
    query: ListPostsQuery,
    currentUserId?: string
  ): Promise<{ posts: PostWithDetails[]; total: number; hasMore: boolean }> {
    const { limit = 20, offset = 0, type, authorId, authorType } = query

    // Build where conditions
    const conditions: SQL[] = []
    if (type) {
      conditions.push(eq(posts.type, type))
    }
    if (authorId) {
      conditions.push(eq(posts.authorId, authorId))
    }
    if (authorType) {
      conditions.push(eq(posts.authorType, authorType))
    }

    // Get posts
    const postsResult = await this.db
      .select()
      .from(posts)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(posts.createdAt))
      .limit(limit + 1) // Fetch one extra to check if there are more
      .offset(offset)

    const hasMore = postsResult.length > limit
    const postsToReturn = hasMore ? postsResult.slice(0, limit) : postsResult

    // Get full details for each post
    const postsWithDetails = await Promise.all(
      postsToReturn.map((post) => this.getPostById(post.id, currentUserId))
    )

    // Get total count
    const [totalResult] = await this.db
      .select({ count: count() })
      .from(posts)
      .where(conditions.length > 0 ? and(...conditions) : undefined)

    return {
      posts: postsWithDetails,
      total: totalResult?.count || 0,
      hasMore
    }
  }

  /**
   * Delete a post
   */
  async deletePost(postId: string, userId: string): Promise<void> {
    // Check if user owns the post
    const [post] = await this.db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1)

    if (!post) {
      throw new Error('Post not found')
    }

    if (post.authorId !== userId) {
      throw new Error('Not authorized to delete this post')
    }

    // Delete the post (cascade will handle related records)
    await this.db.delete(posts).where(eq(posts.id, postId))
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Get author information based on author type
   */
  private async getAuthorInfo(
    authorId: string,
    authorType: 'user' | 'organization'
  ) {
    if (authorType === 'user') {
      const [userInfo] = await this.db
        .select({
          id: user.id,
          name: user.name,
          avatar: user.image
        })
        .from(user)
        .where(eq(user.id, authorId))
        .limit(1)

      if (!userInfo) {
        throw new Error('User not found')
      }

      // For now, we'll use a placeholder for role
      // In a real implementation, you'd fetch this from a profile or academic table
      return {
        ...userInfo,
        role: 'Student' // TODO: Fetch actual role from user profile
      }
    }
    const [orgInfo] = await this.db
      .select({
        id: organization.id,
        name: organization.name,
        avatar: organization.logo
      })
      .from(organization)
      .where(eq(organization.id, authorId))
      .limit(1)

    if (!orgInfo) {
      throw new Error('Organization not found')
    }

    return {
      ...orgInfo,
      role: 'Official Club'
    }
  }
}
