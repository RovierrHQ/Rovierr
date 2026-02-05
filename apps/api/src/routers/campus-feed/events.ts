/**
 * Campus Feed Events Router
 *
 * Handles event RSVP operations
 */

import { db } from '@api/lib/db'
import { betterAuth } from '@api/middleware/auth'
import { Elysia } from 'elysia'
import { rsvpResponseSchema, rsvpSchema } from './schemas'
import { EventService } from './service/event.service'

const eventService = new EventService(db)

export const eventsRouter = new Elysia({ name: '/events' })
  .use(betterAuth)
  .group('/events', { auth: true }, (app) =>
    /**
     * RSVP to an event post
     * POST /campus-feed/events/rsvp
     */
    app.post(
      '/rsvp',
      async ({ body, user }) => {
        if (!user) {
          throw new Error('User not authenticated')
        }

        try {
          return await eventService.rsvpToEvent(body, user.id)
        } catch (error) {
          if (
            error instanceof Error &&
            error.message === 'Event post not found'
          ) {
            throw new Error('Event post not found')
          }
          throw error
        }
      },
      {
        body: rsvpSchema,
        response: rsvpResponseSchema,
        detail: {
          summary: 'RSVP to Event',
          description: 'RSVP to an event post',
          tags: ['Campus Feed']
        }
      }
    )
  )
