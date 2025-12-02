import { ORPCError } from '@orpc/server'
import { db } from '@/db'
import { protectedProcedure } from '@/lib/orpc'
import { EventService } from '@/services/campus-feed/event.service'

const eventService = new EventService(db)

export const events = {
  // ============================================================================
  // RSVP Operations
  // ============================================================================

  rsvp: protectedProcedure.campusFeed.rsvp.handler(
    async ({ input, context }) => {
      try {
        const userId = context.session.user.id
        return await eventService.rsvpToEvent(input, userId)
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === 'Event post not found'
        ) {
          throw new ORPCError('NOT_FOUND', { message: 'Event post not found' })
        }
        throw error
      }
    }
  )
}
