/**
 * Google Calendar Router
 *
 * Handles Google Calendar integration including webhooks, watch setup,
 * and event fetching.
 */

import { db } from '@api/db'
import { env } from '@api/lib/env'
import realtime from '@api/lib/realtime'
import { betterAuth } from '@api/middleware/auth'
import { account } from '@rov/db'
import { eq } from 'drizzle-orm'
import { Elysia } from 'elysia'
import type { calendar_v3 } from 'googleapis'
import { google } from 'googleapis'
import {
  CalendarFetchError,
  CalendarNotConnectedError,
  CalendarStopWatchError,
  CalendarWatchError,
  NoAccessTokenError,
  TokenRefreshError
} from './errors'
import {
  getUpcomingEventsSchema,
  stopWatchCalendarResponseSchema,
  stopWatchCalendarSchema,
  upcomingEventsResponseSchema,
  watchCalendarResponseSchema,
  webhookResponseSchema
} from './schemas'

// Helper to get OAuth2 client
const getOAuth2Client = () =>
  new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    `${env.BETTER_AUTH_API_URL}/callback/google`
  )

// Helper to get user's Google account with tokens
const getUserGoogleAccount = async (userId: string) => {
  const [userAccount] = await db
    .select()
    .from(account)
    .where(eq(account.userId, userId))
    .limit(1)

  if (!userAccount?.accessToken) {
    return null
  }

  return userAccount
}

// Helper to refresh access token if needed
const getValidAccessToken = async (
  userAccount: typeof account.$inferSelect
): Promise<string> => {
  if (!userAccount.accessToken) {
    throw new NoAccessTokenError()
  }

  const oauth2Client = getOAuth2Client()

  // Check if token is expired or about to expire (within 5 minutes)
  const now = Date.now()
  const expiresAt = userAccount.accessTokenExpiresAt?.getTime() ?? 0
  const shouldRefresh = expiresAt - now < 5 * 60 * 1000

  if (shouldRefresh && userAccount.refreshToken) {
    oauth2Client.setCredentials({
      refresh_token: userAccount.refreshToken
    })

    try {
      const { credentials } = await oauth2Client.refreshAccessToken()

      // Update tokens in database
      await db
        .update(account)
        .set({
          accessToken: credentials.access_token,
          accessTokenExpiresAt: credentials.expiry_date
            ? new Date(credentials.expiry_date)
            : null
        })
        .where(eq(account.id, userAccount.id))

      if (!credentials.access_token) {
        throw new NoAccessTokenError('No access token received')
      }

      return credentials.access_token
    } catch (error) {
      console.log(
        { error, accountId: userAccount.id },
        'Failed to refresh Google access token'
      )
      throw new TokenRefreshError()
    }
  }

  return userAccount.accessToken
}

// Helper to get calendar client
const getCalendarClient = (accessToken: string) => {
  const oauth2Client = getOAuth2Client()
  oauth2Client.setCredentials({ access_token: accessToken })
  return google.calendar({ version: 'v3', auth: oauth2Client })
}

// Helper to check if user has calendar scopes
const hasCalendarScopes = (userAccount: typeof account.$inferSelect) => {
  const scopes = userAccount.scope?.split(',') ?? []
  return scopes.includes('https://www.googleapis.com/auth/calendar')
}

export const googleCalendarRouter = new Elysia({ prefix: '/google' })
  .use(betterAuth)

  // POST /google/webhook - Google Calendar webhook handler (public)
  .post(
    '/webhook',
    async ({ headers }) => {
      // Get the channel ID from the headers
      const channelId = headers['x-goog-channel-id']
      const resourceState = headers['x-goog-resource-state']
      const resourceId = headers['x-goog-resource-id']

      console.info(
        {
          channelId,
          resourceState,
          resourceId
        },
        'Received Google Calendar webhook'
      )

      // Verify this is a sync or exists notification (not initial sync)
      if (resourceState === 'sync') {
        return { success: true }
      }

      if (!channelId) {
        throw new Error('Missing channel ID')
      }

      // Extract user ID from channel ID (format: calendar-{userId})
      const userId = channelId.replace('calendar-', '')

      try {
        // Publish real-time update to the user's channel via Centrifugo
        await realtime.publish(`calendar:${userId}`, {
          type: 'calendar_updated',
          timestamp: Date.now(),
          resourceId,
          resourceState
        })

        console.info(
          { userId, channel: `calendar:${userId}` },
          'Published calendar update to Centrifugo'
        )

        return { success: true }
      } catch (error) {
        console.log({ error, userId }, 'Failed to process calendar webhook')
        throw new Error('Failed to process webhook')
      }
    },
    {
      response: webhookResponseSchema,
      detail: {
        description:
          'Receives push notifications when Google Calendar events change.',
        summary: 'Webhook',
        tags: ['Calendar']
      }
    }
  )

  // Protected routes
  // POST /google/watch - Watch calendar for changes
  .post(
    '/watch',
    async ({ user }) => {
          const userAccount = await getUserGoogleAccount(user.id)

          if (!(userAccount && hasCalendarScopes(userAccount))) {
            throw new CalendarNotConnectedError()
          }

          const accessToken = await getValidAccessToken(userAccount)
          const calendar = getCalendarClient(accessToken)

          // Generate a unique channel ID for this user
          const channelId = `calendar-${user.id}`
          const webhookUrl = `${env.SERVER_URL}/calendar/google/webhook`

          try {
            const response = await calendar.events.watch({
              calendarId: 'primary',
              requestBody: {
                id: channelId,
                type: 'web_hook',
                address: webhookUrl,
                // Optional: set expiration (max 1 year for calendar API)
                expiration: String(Date.now() + 365 * 24 * 60 * 60 * 1000)
              }
            })

            return {
              channelId: response.data.id || '',
              resourceId: response.data.resourceId || '',
              expiration: response.data.expiration || ''
            }
          } catch (error) {
            console.log(
              { error, userId: user.id },
              'Failed to setup calendar watch'
            )
            throw new CalendarWatchError()
          }
        },
        {
          auth: true,
          response: watchCalendarResponseSchema,
          detail: {
            description:
              'Registers a channel to receive push notifications when Google Calendar changes.',
            summary: 'Watch Calendar',
            tags: ['Calendar']
          }
        }
      )

      // POST /google/stop-watch - Stop watching calendar
      .post(
        '/stop-watch',
        async ({ body, user }) => {
          const userAccount = await getUserGoogleAccount(user.id)

          if (!(userAccount && hasCalendarScopes(userAccount))) {
            throw new CalendarNotConnectedError()
          }

          const accessToken = await getValidAccessToken(userAccount)
          const calendar = getCalendarClient(accessToken)

          try {
            await calendar.channels.stop({
              requestBody: {
                id: body.channelId,
                resourceId: body.resourceId
              }
            })

            return { success: true }
          } catch (error) {
            console.log(
              { error, userId: user.id },
              'Failed to stop calendar watch'
            )
            throw new CalendarStopWatchError()
          }
        },
        {
          auth: true,
          body: stopWatchCalendarSchema,
          response: stopWatchCalendarResponseSchema,
          detail: {
            description:
              'Stops watching a Google Calendar by closing the push notification channel.',
            summary: 'Stop Watching',
            tags: ['Calendar']
          }
        }
      )

      // GET /google/upcoming-events - Get upcoming events
      .get(
        '/upcoming-events',
        async ({ query, user }) => {
          const userAccount = await getUserGoogleAccount(user.id)

          // Not connected at all
          if (!userAccount) {
            return {
              connected: false,
              hasCalendarAccess: false,
              events: []
            }
          }

          // Connected but no calendar scope
          if (!hasCalendarScopes(userAccount)) {
            return {
              connected: true,
              hasCalendarAccess: false,
              events: []
            }
          }

          // Fetch events
          console.info(
            {
              userId: user.id,
              hasRefreshToken: !!userAccount.refreshToken,
              tokenExpiresAt: userAccount.accessTokenExpiresAt,
              scopes: userAccount.scope
            },
            'Attempting to get calendar events'
          )

          const accessToken = await getValidAccessToken(userAccount)
          const calendar = getCalendarClient(accessToken)

          const now = new Date()
          const startTime = new Date(now)
          startTime.setHours(0, 0, 0, 0)

          const endTime = new Date(startTime)
          endTime.setDate(endTime.getDate() + query.days)
          endTime.setHours(23, 59, 59, 999)

          try {
            const response = await calendar.events.list({
              calendarId: 'primary',
              timeMin: now.toISOString(),
              timeMax: endTime.toISOString(),
              maxResults: query.maxResults,
              singleEvents: true,
              orderBy: 'startTime'
            })

            const rawEvents = response.data.items || []

            const events = rawEvents
              .filter(
                (event: calendar_v3.Schema$Event) =>
                  event.id &&
                  event.start &&
                  (event.start.dateTime || event.start.date)
              )
              .map((event: calendar_v3.Schema$Event) => {
                const eventStart =
                  event.start?.dateTime || event.start?.date || ''
                const eventEnd = event.end?.dateTime || event.end?.date || ''

                return {
                  id: event.id || '',
                  title: event.summary || 'Untitled Event',
                  start: eventStart,
                  end: eventEnd,
                  description: event.description || null,
                  location: event.location || null,
                  htmlLink: event.htmlLink || null
                }
              })

            return {
              connected: true,
              hasCalendarAccess: true,
              events
            }
          } catch (error) {
            console.log(
              { error, userId: user.id },
              'Failed to fetch calendar events'
            )
            throw new CalendarFetchError()
          }
        },
        {
          auth: true,
          query: getUpcomingEventsSchema,
          response: upcomingEventsResponseSchema,
          detail: {
            description:
              'Fetches upcoming events from the connected Google Calendar.',
            summary: 'Get Upcoming Events',
            tags: ['Calendar']
          }
        }
      )
