/**
 * Connection Service
 * Handles user-to-user connection requests and management
 */

import { connection, type DB, user } from '@rov/db'
import type {
  ListConnections,
  ListPendingRequests,
  SendConnectionRequest
} from '@rov/orpc-contracts'
import { and, count, desc, eq, or, sql } from 'drizzle-orm'

export class ConnectionService {
  private db: DB

  constructor(db: DB) {
    this.db = db
  }

  /**
   * Send a connection request to another user
   */
  async sendConnectionRequest(userId: string, input: SendConnectionRequest) {
    const { connectedUserId } = input

    // Prevent self-connection
    if (userId === connectedUserId) {
      throw new Error('SELF_CONNECTION')
    }

    // Check if connection already exists
    const [existingConnection] = await this.db
      .select()
      .from(connection)
      .where(
        or(
          and(
            eq(connection.userId, userId),
            eq(connection.connectedUserId, connectedUserId)
          ),
          and(
            eq(connection.userId, connectedUserId),
            eq(connection.connectedUserId, userId)
          )
        )
      )
      .limit(1)

    if (existingConnection) {
      if (existingConnection.status === 'accepted') {
        throw new Error('ALREADY_CONNECTED')
      }
      if (existingConnection.status === 'pending') {
        throw new Error('PENDING_REQUEST')
      }
      // If rejected, check cooldown period (30 days)
      if (
        existingConnection.status === 'rejected' &&
        existingConnection.respondedAt
      ) {
        const rejectedDate = new Date(existingConnection.respondedAt)
        const cooldownEnd = new Date(
          rejectedDate.getTime() + 30 * 24 * 60 * 60 * 1000
        )
        if (new Date() < cooldownEnd) {
          throw new Error('COOLDOWN_PERIOD')
        }
      }
    }

    // Set expiration date (90 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 90)

    // Create connection request
    const [newConnection] = await this.db
      .insert(connection)
      .values({
        userId,
        connectedUserId,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString()
      })
      .returning()

    return newConnection
  }

  /**
   * Accept a connection request
   */
  async acceptConnectionRequest(userId: string, connectionId: string) {
    // Get the connection request
    const [existingConnection] = await this.db
      .select()
      .from(connection)
      .where(eq(connection.id, connectionId))
      .limit(1)

    if (!existingConnection) {
      throw new Error('NOT_FOUND')
    }

    // Verify the current user is the recipient
    if (existingConnection.connectedUserId !== userId) {
      throw new Error('FORBIDDEN')
    }

    // Verify status is pending
    if (existingConnection.status !== 'pending') {
      throw new Error('INVALID_STATUS')
    }

    // Update the connection to accepted
    const [updatedConnection] = await this.db
      .update(connection)
      .set({
        status: 'accepted',
        respondedAt: new Date().toISOString()
      })
      .where(eq(connection.id, connectionId))
      .returning()

    // Create the bidirectional connection
    await this.db.insert(connection).values({
      userId: existingConnection.connectedUserId,
      connectedUserId: existingConnection.userId,
      status: 'accepted',
      requestedAt: existingConnection.requestedAt,
      respondedAt: new Date().toISOString()
    })

    return updatedConnection
  }

  /**
   * Reject a connection request
   */
  async rejectConnectionRequest(userId: string, connectionId: string) {
    // Get the connection request
    const [existingConnection] = await this.db
      .select()
      .from(connection)
      .where(eq(connection.id, connectionId))
      .limit(1)

    if (!existingConnection) {
      throw new Error('NOT_FOUND')
    }

    // Verify the current user is the recipient
    if (existingConnection.connectedUserId !== userId) {
      throw new Error('FORBIDDEN')
    }

    // Verify status is pending
    if (existingConnection.status !== 'pending') {
      throw new Error('INVALID_STATUS')
    }

    // Update the connection to rejected
    await this.db
      .update(connection)
      .set({
        status: 'rejected',
        respondedAt: new Date().toISOString()
      })
      .where(eq(connection.id, connectionId))

    return { success: true }
  }

  /**
   * Remove an existing connection
   */
  async removeConnection(userId: string, connectionId: string) {
    // Get the connection
    const [existingConnection] = await this.db
      .select()
      .from(connection)
      .where(eq(connection.id, connectionId))
      .limit(1)

    if (!existingConnection) {
      throw new Error('NOT_FOUND')
    }

    // Verify the current user is part of the connection
    if (
      existingConnection.userId !== userId &&
      existingConnection.connectedUserId !== userId
    ) {
      throw new Error('FORBIDDEN')
    }

    // Verify status is accepted
    if (existingConnection.status !== 'accepted') {
      throw new Error('INVALID_STATUS')
    }

    // Delete both directions of the connection
    await this.db
      .delete(connection)
      .where(
        or(
          and(
            eq(connection.userId, existingConnection.userId),
            eq(connection.connectedUserId, existingConnection.connectedUserId)
          ),
          and(
            eq(connection.userId, existingConnection.connectedUserId),
            eq(connection.connectedUserId, existingConnection.userId)
          )
        )
      )

    return { success: true }
  }

  /**
   * List pending connection requests
   */
  async listPendingRequests(userId: string, filters: ListPendingRequests) {
    const { type, limit = 50, offset = 0 } = filters

    const whereClause =
      type === 'received'
        ? and(
            eq(connection.connectedUserId, userId),
            eq(connection.status, 'pending')
          )
        : and(eq(connection.userId, userId), eq(connection.status, 'pending'))

    // Get connections with user information
    const connections = await this.db
      .select({
        id: connection.id,
        userId: connection.userId,
        connectedUserId: connection.connectedUserId,
        status: connection.status,
        requestedAt: connection.requestedAt,
        respondedAt: connection.respondedAt,
        expiresAt: connection.expiresAt,
        createdAt: connection.createdAt,
        updatedAt: connection.updatedAt,
        // Get the other user's information
        otherUser: {
          id: user.id,
          name: user.name,
          username: user.username,
          displayUsername: user.displayUsername,
          image: user.image,
          bio: user.bio,
          isVerified: user.isVerified
        }
      })
      .from(connection)
      .leftJoin(
        user,
        type === 'received'
          ? eq(connection.userId, user.id)
          : eq(connection.connectedUserId, user.id)
      )
      .where(whereClause)
      .orderBy(desc(connection.requestedAt))
      .limit(limit)
      .offset(offset)

    // Format the response
    const formattedConnections = connections
      .filter((conn) => conn.otherUser !== null)
      .map((conn) => ({
        id: conn.id,
        userId: conn.userId,
        connectedUserId: conn.connectedUserId,
        status: conn.status,
        requestedAt: conn.requestedAt,
        respondedAt: conn.respondedAt,
        expiresAt: conn.expiresAt,
        createdAt: conn.createdAt,
        updatedAt: conn.updatedAt,
        user: conn.otherUser
      }))

    // Get total count
    const [totalResult] = await this.db
      .select({ count: count() })
      .from(connection)
      .where(whereClause)

    const total = totalResult?.count || 0
    const hasMore = offset + connections.length < total

    return {
      connections: formattedConnections,
      total,
      hasMore
    }
  }

  /**
   * List accepted connections
   */
  async listConnections(userId: string, filters: ListConnections) {
    const { limit = 50, offset = 0 } = filters

    const whereClause = and(
      eq(connection.userId, userId),
      eq(connection.status, 'accepted')
    )

    // Get connections with user information
    const connections = await this.db
      .select({
        id: connection.id,
        userId: connection.userId,
        connectedUserId: connection.connectedUserId,
        status: connection.status,
        requestedAt: connection.requestedAt,
        respondedAt: connection.respondedAt,
        expiresAt: connection.expiresAt,
        createdAt: connection.createdAt,
        updatedAt: connection.updatedAt,
        // Get the connected user's information
        connectedUser: {
          id: user.id,
          name: user.name,
          username: user.username,
          displayUsername: user.displayUsername,
          image: user.image,
          bio: user.bio,
          isVerified: user.isVerified
        }
      })
      .from(connection)
      .leftJoin(user, eq(connection.connectedUserId, user.id))
      .where(whereClause)
      .orderBy(desc(connection.respondedAt))
      .limit(limit)
      .offset(offset)

    // Format the response
    const formattedConnections = connections
      .filter((conn) => conn.connectedUser !== null)
      .map((conn) => ({
        id: conn.id,
        userId: conn.userId,
        connectedUserId: conn.connectedUserId,
        status: conn.status,
        requestedAt: conn.requestedAt,
        respondedAt: conn.respondedAt,
        expiresAt: conn.expiresAt,
        createdAt: conn.createdAt,
        updatedAt: conn.updatedAt,
        user: conn.connectedUser
      }))

    // Get total count
    const [totalResult] = await this.db
      .select({ count: count() })
      .from(connection)
      .where(whereClause)

    const total = totalResult?.count || 0
    const hasMore = offset + connections.length < total

    return {
      connections: formattedConnections,
      total,
      hasMore
    }
  }

  /**
   * Expire old connection requests (called by a cron job)
   */
  async expireOldRequests() {
    const now = new Date()

    // Find and update expired requests
    const expiredConnections = await this.db
      .update(connection)
      .set({ status: 'rejected' })
      .where(
        and(
          eq(connection.status, 'pending'),
          sql`${connection.expiresAt} < ${now.toISOString()}`
        )
      )
      .returning()

    return {
      expired: expiredConnections.length
    }
  }
}
