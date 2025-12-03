/**
 * Presence Service
 * Handles user online/offline status and typing indicators
 */

import { connection, type DB, userPresence } from '@rov/db'
import type { UpdatePresence } from '@rov/orpc-contracts'
import { createCentrifugeServerClient } from '@rov/realtime'
import { and, eq } from 'drizzle-orm'

export class PresenceService {
  private db: DB
  private centrifugo: ReturnType<typeof createCentrifugeServerClient>
  private typingTimeouts: Map<string, NodeJS.Timeout> = new Map()

  constructor(db: DB, centrifugoConfig: { url: string; apiKey: string }) {
    this.db = db
    this.centrifugo = createCentrifugeServerClient(centrifugoConfig)
  }

  /**
   * Update user online status
   */
  async updateStatus(userId: string, input: UpdatePresence) {
    const { status } = input
    const now = new Date().toISOString()

    // Check if presence record exists
    const [existingPresence] = await this.db
      .select()
      .from(userPresence)
      .where(eq(userPresence.userId, userId))
      .limit(1)

    if (existingPresence) {
      // Update existing presence
      await this.db
        .update(userPresence)
        .set({
          status,
          lastSeenAt: status === 'offline' ? now : existingPresence.lastSeenAt,
          updatedAt: now
        })
        .where(eq(userPresence.userId, userId))
    } else {
      // Create new presence record
      await this.db.insert(userPresence).values({
        userId,
        status,
        lastSeenAt: now,
        updatedAt: now
      })
    }

    // Broadcast presence update to connections
    await this.broadcastPresenceUpdate(userId, status, now)

    return { success: true }
  }

  /**
   * Get online status of all connections
   */
  async getConnectionsStatus(userId: string) {
    // Get all accepted connections
    const connections = await this.db
      .select({
        connectedUserId: connection.connectedUserId
      })
      .from(connection)
      .where(
        and(eq(connection.userId, userId), eq(connection.status, 'accepted'))
      )

    const connectionIds = connections.map((c) => c.connectedUserId)

    if (connectionIds.length === 0) {
      return { statuses: [] }
    }

    // Get presence for all connections
    const allPresence = await this.db.select().from(userPresence)

    const filteredStatuses = allPresence.filter((p) =>
      connectionIds.includes(p.userId)
    )

    return { statuses: filteredStatuses }
  }

  /**
   * Broadcast typing indicator
   */
  async broadcastTyping(
    userId: string,
    conversationId: string,
    isTyping: boolean
  ) {
    // Clear existing timeout for this user/conversation
    const timeoutKey = `${userId}:${conversationId}`
    const existingTimeout = this.typingTimeouts.get(timeoutKey)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
      this.typingTimeouts.delete(timeoutKey)
    }

    // Broadcast typing event
    await this.centrifugo.publish(`conversation:${conversationId}`, {
      type: 'typing',
      userId,
      isTyping
    })

    // If user is typing, set timeout to clear after 3 seconds
    if (isTyping) {
      const timeout = setTimeout(async () => {
        await this.centrifugo.publish(`conversation:${conversationId}`, {
          type: 'typing',
          userId,
          isTyping: false
        })
        this.typingTimeouts.delete(timeoutKey)
      }, 3000)

      this.typingTimeouts.set(timeoutKey, timeout)
    }
  }

  /**
   * Handle user connection (WebSocket connect)
   */
  async handleUserConnect(userId: string) {
    await this.updateStatus(userId, { status: 'online' })
  }

  /**
   * Handle user disconnection (WebSocket disconnect)
   */
  async handleUserDisconnect(userId: string) {
    await this.updateStatus(userId, { status: 'offline' })
  }

  /**
   * Broadcast presence update to all connections
   */
  private async broadcastPresenceUpdate(
    userId: string,
    status: 'online' | 'away' | 'offline',
    lastSeenAt: string
  ) {
    // Get all users connected to this user
    const connections = await this.db
      .select({
        connectedUserId: connection.connectedUserId
      })
      .from(connection)
      .where(
        and(eq(connection.userId, userId), eq(connection.status, 'accepted'))
      )

    // Also get reverse connections
    const reverseConnections = await this.db
      .select({
        userId: connection.userId
      })
      .from(connection)
      .where(
        and(
          eq(connection.connectedUserId, userId),
          eq(connection.status, 'accepted')
        )
      )

    const allConnectedUsers = [
      ...connections.map((c) => c.connectedUserId),
      ...reverseConnections.map((c) => c.userId)
    ]

    // Broadcast to each connected user's channel
    await Promise.all(
      allConnectedUsers.map((connectedUserId) =>
        this.centrifugo.publish(`chat:${connectedUserId}`, {
          type: 'presence',
          userId,
          status,
          lastSeenAt
        })
      )
    )
  }

  /**
   * Clean up typing timeouts (call on service shutdown)
   */
  cleanup() {
    for (const timeout of this.typingTimeouts.values()) {
      clearTimeout(timeout)
    }
    this.typingTimeouts.clear()
  }
}
