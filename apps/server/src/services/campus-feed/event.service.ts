/**
 * Event Service
 * Handles event RSVP operations for campus feed event posts
 */

import { type DB, eventPosts, eventRsvps } from '@rov/db'
import type { RSVPInput } from '@rov/orpc-contracts'
import { and, count, eq } from 'drizzle-orm'

export class EventService {
  private db: DB

  constructor(db: DB) {
    this.db = db
  }

  // ============================================================================
  // RSVP Operations
  // ============================================================================

  /**
   * RSVP to an event post
   */
  async rsvpToEvent(
    input: RSVPInput,
    userId: string
  ): Promise<{
    status: 'going' | 'interested' | 'not_going'
    rsvpCount: number
  }> {
    const { eventPostId, status } = input

    // Check if event post exists
    const [eventPost] = await this.db
      .select()
      .from(eventPosts)
      .where(eq(eventPosts.id, eventPostId))
      .limit(1)

    if (!eventPost) {
      throw new Error('Event post not found')
    }

    // Check if user already has an RSVP
    const [existingRsvp] = await this.db
      .select()
      .from(eventRsvps)
      .where(
        and(
          eq(eventRsvps.eventPostId, eventPostId),
          eq(eventRsvps.userId, userId)
        )
      )
      .limit(1)

    if (existingRsvp) {
      // Update existing RSVP
      await this.db
        .update(eventRsvps)
        .set({ status })
        .where(
          and(
            eq(eventRsvps.eventPostId, eventPostId),
            eq(eventRsvps.userId, userId)
          )
        )
    } else {
      // Create new RSVP
      await this.db.insert(eventRsvps).values({
        eventPostId,
        userId,
        status
      })
    }

    // Get updated RSVP count (only count 'going' and 'interested')
    const [rsvpCountResult] = await this.db
      .select({ count: count() })
      .from(eventRsvps)
      .where(eq(eventRsvps.eventPostId, eventPostId))

    return {
      status,
      rsvpCount: rsvpCountResult?.count || 0
    }
  }

  /**
   * Get RSVPs for an event
   */
  async getEventRsvps(eventPostId: string) {
    const rsvps = await this.db
      .select()
      .from(eventRsvps)
      .where(eq(eventRsvps.eventPostId, eventPostId))

    return rsvps
  }

  /**
   * Get user's RSVP status for an event
   */
  async getUserRsvpStatus(
    eventPostId: string,
    userId: string
  ): Promise<'going' | 'interested' | 'not_going' | null> {
    const [rsvp] = await this.db
      .select()
      .from(eventRsvps)
      .where(
        and(
          eq(eventRsvps.eventPostId, eventPostId),
          eq(eventRsvps.userId, userId)
        )
      )
      .limit(1)

    return rsvp?.status || null
  }
}
