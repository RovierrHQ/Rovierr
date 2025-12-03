/**
 * Chat Service
 * Handles real-time messaging, conversations, and message history
 */

import {
  connection,
  conversation,
  conversationParticipant,
  type DB,
  message,
  user
} from '@rov/db'
import type {
  GetMessages,
  GetOrCreateConversation,
  ListConversations,
  MarkAsRead,
  SearchMessages,
  SendMessage
} from '@rov/orpc-contracts'
import { createCentrifugeServerClient } from '@rov/realtime'
import { and, count, desc, eq, ilike, lt, or, sql } from 'drizzle-orm'

export class ChatService {
  private db: DB
  private centrifugo: ReturnType<typeof createCentrifugeServerClient>

  constructor(db: DB, centrifugoConfig: { url: string; apiKey: string }) {
    this.db = db
    this.centrifugo = createCentrifugeServerClient(centrifugoConfig)
  }

  /**
   * Get existing or create new conversation with a user
   */
  async getOrCreateConversation(
    userId: string,
    input: GetOrCreateConversation
  ) {
    const { userId: otherUserId } = input

    // Check if users are connected
    const [existingConnection] = await this.db
      .select()
      .from(connection)
      .where(
        and(
          or(
            and(
              eq(connection.userId, userId),
              eq(connection.connectedUserId, otherUserId)
            ),
            and(
              eq(connection.userId, otherUserId),
              eq(connection.connectedUserId, userId)
            )
          ),
          eq(connection.status, 'accepted')
        )
      )
      .limit(1)

    if (!existingConnection) {
      throw new Error('NOT_CONNECTED')
    }

    // Check if conversation already exists
    const existingConversation = await this.db
      .select({
        id: conversation.id,
        type: conversation.type,
        name: conversation.name,
        description: conversation.description,
        avatarUrl: conversation.avatarUrl,
        lastMessageAt: conversation.lastMessageAt,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt
      })
      .from(conversation)
      .innerJoin(
        conversationParticipant,
        eq(conversation.id, conversationParticipant.conversationId)
      )
      .where(
        and(
          eq(conversation.type, 'direct'),
          eq(conversationParticipant.userId, userId)
        )
      )

    // Find conversation where both users are participants
    const conversationChecks = await Promise.all(
      existingConversation.map(async (conv) => {
        const [otherParticipant] = await this.db
          .select()
          .from(conversationParticipant)
          .where(
            and(
              eq(conversationParticipant.conversationId, conv.id),
              eq(conversationParticipant.userId, otherUserId)
            )
          )
          .limit(1)

        return { conv, hasOtherParticipant: !!otherParticipant }
      })
    )

    const foundConversation = conversationChecks.find(
      (c) => c.hasOtherParticipant
    )
    if (foundConversation) {
      const participants = await this.getConversationParticipants(
        foundConversation.conv.id
      )
      return {
        ...foundConversation.conv,
        participants
      }
    }

    // Create new conversation
    const [newConversation] = await this.db
      .insert(conversation)
      .values({
        type: 'direct'
      })
      .returning()

    // Add both users as participants
    await this.db.insert(conversationParticipant).values([
      {
        conversationId: newConversation.id,
        userId,
        role: 'member'
      },
      {
        conversationId: newConversation.id,
        userId: otherUserId,
        role: 'member'
      }
    ])

    // Get participants with user info
    const participants = await this.getConversationParticipants(
      newConversation.id
    )

    return {
      ...newConversation,
      participants
    }
  }

  /**
   * List all conversations for the current user
   */
  async listConversations(userId: string, filters: ListConversations) {
    const { limit = 50, offset = 0 } = filters

    // Get conversations where user is a participant
    const conversations = await this.db
      .select({
        id: conversation.id,
        type: conversation.type,
        name: conversation.name,
        description: conversation.description,
        avatarUrl: conversation.avatarUrl,
        lastMessageAt: conversation.lastMessageAt,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        participantLastReadAt: conversationParticipant.lastReadAt
      })
      .from(conversation)
      .innerJoin(
        conversationParticipant,
        eq(conversation.id, conversationParticipant.conversationId)
      )
      .where(eq(conversationParticipant.userId, userId))
      .orderBy(desc(conversation.lastMessageAt))
      .limit(limit)
      .offset(offset)

    // Enrich with last message and unread count
    const enrichedConversations = await Promise.all(
      conversations.map(async (conv) => {
        // Get last message
        const [lastMsg] = await this.db
          .select()
          .from(message)
          .where(eq(message.conversationId, conv.id))
          .orderBy(desc(message.createdAt))
          .limit(1)

        // Get unread count
        const lastReadAt =
          conv.participantLastReadAt || new Date(0).toISOString()
        const [unreadResult] = await this.db
          .select({ count: count() })
          .from(message)
          .where(
            and(
              eq(message.conversationId, conv.id),
              sql`${message.createdAt} > ${lastReadAt}`,
              sql`${message.senderId} != ${userId}`
            )
          )

        const unreadCount = unreadResult?.count || 0

        // Get other participant for direct conversations
        const [otherParticipant] = await this.db
          .select({
            id: user.id,
            name: user.name,
            username: user.username,
            displayUsername: user.displayUsername,
            image: user.image,
            bio: user.bio,
            isVerified: user.isVerified
          })
          .from(conversationParticipant)
          .innerJoin(user, eq(conversationParticipant.userId, user.id))
          .where(
            and(
              eq(conversationParticipant.conversationId, conv.id),
              sql`${conversationParticipant.userId} != ${userId}`
            )
          )
          .limit(1)

        return {
          id: conv.id,
          type: conv.type,
          name: conv.name,
          description: conv.description,
          avatarUrl: conv.avatarUrl,
          lastMessageAt: conv.lastMessageAt,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
          lastMessage: lastMsg || null,
          unreadCount,
          otherParticipant: otherParticipant || null
        }
      })
    )

    // Get total count
    const [totalResult] = await this.db
      .select({ count: count() })
      .from(conversationParticipant)
      .where(eq(conversationParticipant.userId, userId))

    const total = totalResult?.count || 0
    const hasMore = offset + conversations.length < total

    return {
      conversations: enrichedConversations,
      total,
      hasMore
    }
  }

  /**
   * Send a message in a conversation
   */
  async sendMessage(userId: string, input: SendMessage) {
    const {
      conversationId,
      content,
      type = 'text',
      metadata,
      replyToMessageId
    } = input

    // Verify user is a participant
    const [participant] = await this.db
      .select()
      .from(conversationParticipant)
      .where(
        and(
          eq(conversationParticipant.conversationId, conversationId),
          eq(conversationParticipant.userId, userId)
        )
      )
      .limit(1)

    if (!participant) {
      throw new Error('NOT_PARTICIPANT')
    }

    // Check if connection is still active (for direct conversations)
    const [conv] = await this.db
      .select()
      .from(conversation)
      .where(eq(conversation.id, conversationId))
      .limit(1)

    if (conv?.type === 'direct') {
      // Get other participant
      const [otherParticipant] = await this.db
        .select()
        .from(conversationParticipant)
        .where(
          and(
            eq(conversationParticipant.conversationId, conversationId),
            sql`${conversationParticipant.userId} != ${userId}`
          )
        )
        .limit(1)

      if (otherParticipant) {
        // Check if connection still exists
        const [activeConnection] = await this.db
          .select()
          .from(connection)
          .where(
            and(
              or(
                and(
                  eq(connection.userId, userId),
                  eq(connection.connectedUserId, otherParticipant.userId)
                ),
                and(
                  eq(connection.userId, otherParticipant.userId),
                  eq(connection.connectedUserId, userId)
                )
              ),
              eq(connection.status, 'accepted')
            )
          )
          .limit(1)

        if (!activeConnection) {
          throw new Error('CONNECTION_REMOVED')
        }
      }
    }

    // Create message
    const [newMessage] = await this.db
      .insert(message)
      .values({
        conversationId,
        senderId: userId,
        content,
        type,
        metadata: metadata || null,
        replyToMessageId: replyToMessageId || null,
        deliveredAt: new Date().toISOString()
      })
      .returning()

    // Get sender information to include in real-time broadcast
    const [sender] = await this.db
      .select({
        id: user.id,
        name: user.name,
        username: user.username,
        displayUsername: user.displayUsername,
        image: user.image,
        bio: user.bio,
        isVerified: user.isVerified
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)

    const messageWithSender = {
      ...newMessage,
      sender
    }

    // Update conversation last message timestamp
    await this.db
      .update(conversation)
      .set({ lastMessageAt: newMessage.createdAt })
      .where(eq(conversation.id, conversationId))

    // Get all participants to notify them
    const participants = await this.db
      .select()
      .from(conversationParticipant)
      .where(eq(conversationParticipant.conversationId, conversationId))

    // Publish to Centrifugo for real-time delivery
    await this.centrifugo.publish(`conversation:${conversationId}`, {
      type: 'new_message',
      message: messageWithSender
    })

    // Notify all participants on their personal chat channels
    const publishPromises = participants.map((p) => {
      return this.centrifugo.publish(`chat:${p.userId}`, {
        type: 'new_message',
        conversationId,
        message: messageWithSender
      })
    })

    await Promise.all(publishPromises)

    return newMessage
  }

  /**
   * Get messages from a conversation
   */
  async getMessages(userId: string, filters: GetMessages) {
    const { conversationId, limit = 50, before } = filters

    // Verify user is a participant
    const [participant] = await this.db
      .select()
      .from(conversationParticipant)
      .where(
        and(
          eq(conversationParticipant.conversationId, conversationId),
          eq(conversationParticipant.userId, userId)
        )
      )
      .limit(1)

    if (!participant) {
      throw new Error('NOT_PARTICIPANT')
    }

    // Build query conditions
    const conditions = [eq(message.conversationId, conversationId)]
    if (before) {
      // Get the timestamp of the 'before' message
      const [beforeMessage] = await this.db
        .select()
        .from(message)
        .where(eq(message.id, before))
        .limit(1)

      if (beforeMessage) {
        conditions.push(lt(message.createdAt, beforeMessage.createdAt))
      }
    }

    // Get messages with sender information
    const messages = await this.db
      .select({
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        type: message.type,
        metadata: message.metadata,
        replyToMessageId: message.replyToMessageId,
        deliveredAt: message.deliveredAt,
        editedAt: message.editedAt,
        isEdited: message.isEdited,
        deletedAt: message.deletedAt,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        sender: {
          id: user.id,
          name: user.name,
          username: user.username,
          displayUsername: user.displayUsername,
          image: user.image,
          bio: user.bio,
          isVerified: user.isVerified
        }
      })
      .from(message)
      .innerJoin(user, eq(message.senderId, user.id))
      .where(and(...conditions))
      .orderBy(desc(message.createdAt))
      .limit(limit)

    // Check if there are more messages
    const hasMore = messages.length === limit

    return {
      messages: messages.reverse(), // Reverse to show oldest first
      hasMore
    }
  }

  /**
   * Mark messages as read in a conversation
   */
  async markAsRead(userId: string, input: MarkAsRead) {
    const { conversationId } = input

    // Verify user is a participant
    const [participant] = await this.db
      .select()
      .from(conversationParticipant)
      .where(
        and(
          eq(conversationParticipant.conversationId, conversationId),
          eq(conversationParticipant.userId, userId)
        )
      )
      .limit(1)

    if (!participant) {
      throw new Error('NOT_PARTICIPANT')
    }

    // Update last read timestamp
    await this.db
      .update(conversationParticipant)
      .set({ lastReadAt: new Date().toISOString() })
      .where(
        and(
          eq(conversationParticipant.conversationId, conversationId),
          eq(conversationParticipant.userId, userId)
        )
      )

    return { success: true }
  }

  /**
   * Get total unread message count
   */
  async getUnreadCount(userId: string) {
    // Get all conversations where user is a participant
    const participants = await this.db
      .select({
        conversationId: conversationParticipant.conversationId,
        lastReadAt: conversationParticipant.lastReadAt
      })
      .from(conversationParticipant)
      .where(eq(conversationParticipant.userId, userId))

    const unreadCounts = await Promise.all(
      participants.map(async (participant) => {
        const lastReadAt = participant.lastReadAt || new Date(0).toISOString()

        const [result] = await this.db
          .select({ count: count() })
          .from(message)
          .where(
            and(
              eq(message.conversationId, participant.conversationId),
              sql`${message.createdAt} > ${lastReadAt}`,
              sql`${message.senderId} != ${userId}`
            )
          )

        return result?.count || 0
      })
    )

    const totalUnread = unreadCounts.reduce((sum, cnt) => sum + cnt, 0)

    return { count: totalUnread }
  }

  /**
   * Search messages across all conversations
   */
  async searchMessages(userId: string, filters: SearchMessages) {
    const { query, limit = 20 } = filters
    const searchPattern = `%${query}%`

    // Get conversations where user is a participant
    const userConversations = await this.db
      .select({ conversationId: conversationParticipant.conversationId })
      .from(conversationParticipant)
      .where(eq(conversationParticipant.userId, userId))

    const conversationIds = userConversations.map((c) => c.conversationId)

    if (conversationIds.length === 0) {
      return { results: [], total: 0 }
    }

    // Search messages
    const messages = await this.db
      .select({
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        type: message.type,
        metadata: message.metadata,
        replyToMessageId: message.replyToMessageId,
        deliveredAt: message.deliveredAt,
        editedAt: message.editedAt,
        isEdited: message.isEdited,
        deletedAt: message.deletedAt,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        sender: {
          id: user.id,
          name: user.name,
          username: user.username,
          displayUsername: user.displayUsername,
          image: user.image,
          bio: user.bio,
          isVerified: user.isVerified
        },
        conversation: {
          id: conversation.id,
          type: conversation.type,
          name: conversation.name,
          description: conversation.description,
          avatarUrl: conversation.avatarUrl,
          lastMessageAt: conversation.lastMessageAt,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt
        }
      })
      .from(message)
      .innerJoin(user, eq(message.senderId, user.id))
      .innerJoin(conversation, eq(message.conversationId, conversation.id))
      .where(
        and(
          sql`${message.conversationId} = ANY(${conversationIds})`,
          ilike(message.content, searchPattern)
        )
      )
      .orderBy(desc(message.createdAt))
      .limit(limit)

    // Add matched text highlighting
    const results = messages.map((msg) => ({
      ...msg,
      matchedText: msg.content
    }))

    return {
      results,
      total: results.length
    }
  }

  /**
   * Get conversation participants with user information
   */
  private async getConversationParticipants(conversationId: string) {
    return await this.db
      .select({
        id: conversationParticipant.id,
        conversationId: conversationParticipant.conversationId,
        userId: conversationParticipant.userId,
        role: conversationParticipant.role,
        lastReadAt: conversationParticipant.lastReadAt,
        isMuted: conversationParticipant.isMuted,
        joinedAt: conversationParticipant.joinedAt,
        leftAt: conversationParticipant.leftAt,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          displayUsername: user.displayUsername,
          image: user.image,
          bio: user.bio,
          isVerified: user.isVerified
        }
      })
      .from(conversationParticipant)
      .innerJoin(user, eq(conversationParticipant.userId, user.id))
      .where(eq(conversationParticipant.conversationId, conversationId))
  }
}
