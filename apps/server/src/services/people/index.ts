/**
 * People Service
 * Handles user discovery, search, and connection status enrichment
 */

import { connection, type DB, user } from '@rov/db'
import type { ListUsers, SearchUsers } from '@rov/orpc-contracts'
import { and, count, desc, eq, ilike, or, sql } from 'drizzle-orm'

export class PeopleService {
  private db: DB

  constructor(db: DB) {
    this.db = db
  }

  /**
   * List all users with optional search and pagination
   */
  async listUsers(currentUserId: string, filters: ListUsers) {
    const conditions: ReturnType<typeof eq>[] = []

    // Exclude current user from results
    conditions.push(sql`${user.id} != ${currentUserId}`)

    // Only show verified users
    conditions.push(eq(user.isVerified, true))

    // Add search filter if provided
    if (filters.search) {
      const searchPattern = `%${filters.search}%`
      const searchCondition = or(
        ilike(user.name, searchPattern),
        ilike(user.username, searchPattern),
        ilike(user.email, searchPattern),
        ilike(user.bio, searchPattern)
      )
      if (searchCondition) {
        conditions.push(searchCondition)
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    // Get users
    const users = await this.db
      .select({
        id: user.id,
        name: user.name,
        username: user.username,
        displayUsername: user.displayUsername,
        email: user.email,
        image: user.image,
        bio: user.bio,
        summary: user.summary,
        website: user.website,
        interests: user.interests,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      })
      .from(user)
      .where(whereClause)
      .orderBy(desc(user.createdAt))
      .limit(filters.limit || 50)
      .offset(filters.offset || 0)

    // Enrich with connection status
    const usersWithConnection = await Promise.all(
      users.map(async (u) => {
        const connectionStatus = await this.getConnectionStatus(
          currentUserId,
          u.id
        )
        return {
          ...u,
          ...connectionStatus
        }
      })
    )

    // Get total count
    const [totalResult] = await this.db
      .select({ count: count() })
      .from(user)
      .where(whereClause)

    const total = totalResult?.count || 0
    const hasMore = (filters.offset || 0) + users.length < total

    return {
      users: usersWithConnection,
      total,
      hasMore
    }
  }

  /**
   * Search users by query
   */
  async searchUsers(currentUserId: string, filters: SearchUsers) {
    const searchPattern = `%${filters.query}%`

    // Search across multiple fields
    const users = await this.db
      .select({
        id: user.id,
        name: user.name,
        username: user.username,
        displayUsername: user.displayUsername,
        email: user.email,
        image: user.image,
        bio: user.bio,
        summary: user.summary,
        website: user.website,
        interests: user.interests,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      })
      .from(user)
      .where(
        and(
          sql`${user.id} != ${currentUserId}`,
          eq(user.isVerified, true),
          or(
            ilike(user.name, searchPattern),
            ilike(user.username, searchPattern),
            ilike(user.email, searchPattern),
            ilike(user.bio, searchPattern),
            ilike(user.summary, searchPattern)
          )
        )
      )
      .orderBy(desc(user.createdAt))
      .limit(filters.limit || 50)

    // Enrich with connection status
    const usersWithConnection = await Promise.all(
      users.map(async (u) => {
        const connectionStatus = await this.getConnectionStatus(
          currentUserId,
          u.id
        )
        return {
          ...u,
          ...connectionStatus
        }
      })
    )

    return {
      users: usersWithConnection,
      total: users.length
    }
  }

  /**
   * Get connection status between two users
   */
  private async getConnectionStatus(userId: string, otherUserId: string) {
    // Check if there's a connection in either direction
    const [existingConnection] = await this.db
      .select()
      .from(connection)
      .where(
        or(
          and(
            eq(connection.userId, userId),
            eq(connection.connectedUserId, otherUserId)
          ),
          and(
            eq(connection.userId, otherUserId),
            eq(connection.connectedUserId, userId)
          )
        )
      )
      .limit(1)

    if (!existingConnection) {
      return {
        connectionStatus: 'not_connected' as const,
        connectionId: null
      }
    }

    // Determine status based on who sent the request
    if (existingConnection.status === 'accepted') {
      return {
        connectionStatus: 'connected' as const,
        connectionId: existingConnection.id
      }
    }

    if (existingConnection.status === 'pending') {
      // Check if current user sent the request
      if (existingConnection.userId === userId) {
        return {
          connectionStatus: 'pending_sent' as const,
          connectionId: existingConnection.id
        }
      }
      return {
        connectionStatus: 'pending_received' as const,
        connectionId: existingConnection.id
      }
    }

    return {
      connectionStatus: 'not_connected' as const,
      connectionId: null
    }
  }
}
