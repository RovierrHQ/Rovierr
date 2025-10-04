import { oc } from '@orpc/contract'
import { z } from 'zod'

export const googleCalendar = {
  /**
   * Google Calendar Webhook Handler
   * Receives push notifications when calendar events change
   */
  webhook: oc
    .route({
      method: 'POST',
      description:
        'Receives push notifications when Google Calendar events change.',
      summary: 'Webhook',
      tags: ['Calendar']
    })

    .output(z.object({ success: z.boolean() }))
    .errors({
      BAD_REQUEST: {
        data: z.object({
          message: z.string().default('Missing channel ID')
        })
      },
      INTERNAL_SERVER_ERROR: {
        data: z.object({
          message: z.string().default('Failed to process webhook')
        })
      },
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('Calendar not connected')
        })
      }
    }),

  // Watch calendar for changes (setup push notifications)
  watchCalendar: oc
    .route({
      method: 'POST',
      description:
        'Registers a channel to receive push notifications when Google Calendar changes.',
      summary: 'Watch Calendar',
      tags: ['Calendar']
    })
    .output(
      z.object({
        channelId: z.string(),
        resourceId: z.string(),
        expiration: z.string()
      })
    )
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('Calendar not connected')
        })
      }
    }),

  // Stop watching calendar
  stopWatchCalendar: oc
    .route({
      method: 'POST',
      description:
        'Stops watching a Google Calendar by closing the push notification channel.',
      summary: 'Stop Watching',
      tags: ['Calendar']
    })
    .input(
      z.object({
        channelId: z.string(),
        resourceId: z.string()
      })
    )
    .output(z.object({ success: z.boolean() }))
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('Calendar not connected')
        })
      }
    }),

  // Single unified endpoint for getting upcoming events
  getUpcomingEvents: oc
    .route({
      method: 'GET',
      description:
        'Fetches upcoming events from the connected Google Calendar.',
      summary: 'Get Upcoming Events',
      tags: ['Calendar']
    })
    .input(
      z.object({
        days: z.number().min(0).max(365).default(1), // 0 = today, 1 = tomorrow, 7 = week, etc.
        maxResults: z.number().min(1).max(50).default(10)
      })
    )
    .output(
      z.object({
        connected: z.boolean(),
        hasCalendarAccess: z.boolean(),
        events: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            start: z.string(),
            end: z.string(),
            description: z.string().nullable(),
            location: z.string().nullable(),
            htmlLink: z.string().nullable()
          })
        )
      })
    )
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('Calendar not connected')
        })
      }
    })
}
