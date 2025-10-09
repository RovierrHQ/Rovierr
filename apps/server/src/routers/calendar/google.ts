import { ORPCError } from '@orpc/server'
import { eq } from 'drizzle-orm'
import type { calendar_v3 } from 'googleapis'
import { google } from 'googleapis'
import { db } from '@/db'
import { account } from '@/db/schema/auth'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'
import { protectedProcedure, publicProcedure } from '@/lib/orpc'
import realtime from '@/lib/realtime'

// Helper to get OAuth2 client
const getOAuth2Client = () => {
  return new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    `${env.BETTER_AUTH_API_URL}/callback/google`
  )
}

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
    throw new ORPCError('UNAUTHORIZED', {
      message: 'No access token available'
    })
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
        throw new ORPCError('UNAUTHORIZED', {
          message: 'No access token received'
        })
      }

      return credentials.access_token
    } catch (error) {
      logger.error(
        { error, accountId: userAccount.id },
        'Failed to refresh Google access token'
      )
      throw new ORPCError('UNAUTHORIZED', {
        message: 'Failed to refresh Google access token'
      })
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

export const googleCalendar = {
  /**
   * Google Calendar Webhook Handler
   * Receives push notifications when calendar events change
   */
  webhook: publicProcedure.calendar.google.webhook.handler(
    async ({ context }) => {
      // Get the channel ID from the headers
      const channelId = context.headers.get('x-goog-channel-id')
      const resourceState = context.headers.get('x-goog-resource-state')
      const resourceId = context.headers.get('x-goog-resource-id')

      logger.info(
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
        throw new ORPCError('BAD_REQUEST', {
          message: 'Missing channel ID'
        })
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

        logger.info(
          { userId, channel: `calendar:${userId}` },
          'Published calendar update to Centrifugo'
        )

        return { success: true }
      } catch (error) {
        logger.error({ error, userId }, 'Failed to process calendar webhook')
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Failed to process webhook'
        })
      }
    }
  ),

  // Watch calendar for changes (setup push notifications)
  watchCalendar: protectedProcedure.calendar.google.watchCalendar.handler(
    async ({ context }) => {
      const userAccount = await getUserGoogleAccount(context.session.user.id)

      if (!(userAccount && hasCalendarScopes(userAccount))) {
        throw new ORPCError('UNAUTHORIZED', {
          message: 'Calendar not connected'
        })
      }

      const accessToken = await getValidAccessToken(userAccount)
      const calendar = getCalendarClient(accessToken)

      // Generate a unique channel ID for this user
      const channelId = `calendar-${context.session.user.id}`
      const webhookUrl = `${env.SERVER_URL}/rpc-v1/calendar/google/webhook`

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
        logger.error(
          { error, userId: context.session.user.id },
          'Failed to setup calendar watch'
        )
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Failed to setup calendar watch'
        })
      }
    }
  ),

  // Stop watching calendar
  stopWatchCalendar:
    protectedProcedure.calendar.google.stopWatchCalendar.handler(
      async ({ context, input }) => {
        const userAccount = await getUserGoogleAccount(context.session.user.id)

        if (!(userAccount && hasCalendarScopes(userAccount))) {
          throw new ORPCError('UNAUTHORIZED', {
            message: 'Calendar not connected'
          })
        }

        const accessToken = await getValidAccessToken(userAccount)
        const calendar = getCalendarClient(accessToken)

        try {
          await calendar.channels.stop({
            requestBody: {
              id: input.channelId,
              resourceId: input.resourceId
            }
          })

          return { success: true }
        } catch (error) {
          logger.error(
            { error, userId: context.session.user.id },
            'Failed to stop calendar watch'
          )
          throw new ORPCError('INTERNAL_SERVER_ERROR', {
            message: 'Failed to stop calendar watch'
          })
        }
      }
    ),

  // Single unified endpoint for getting upcoming events
  getUpcomingEvents:
    protectedProcedure.calendar.google.getUpcomingEvents.handler(
      async ({ context, input }) => {
        const userAccount = await getUserGoogleAccount(context.session.user.id)

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
        logger.info(
          {
            userId: context.session.user.id,
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
        endTime.setDate(endTime.getDate() + input.days)
        endTime.setHours(23, 59, 59, 999)

        try {
          const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: now.toISOString(),
            timeMax: endTime.toISOString(),
            maxResults: input.maxResults,
            singleEvents: true,
            orderBy: 'startTime'
          })

          const rawEvents = response.data.items || []

          const events = rawEvents
            .filter((event: calendar_v3.Schema$Event) => {
              return (
                event.id &&
                event.start &&
                (event.start.dateTime || event.start.date)
              )
            })
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
          logger.error(
            { error, userId: context.session.user.id },
            'Failed to fetch calendar events'
          )
          throw new ORPCError('INTERNAL_SERVER_ERROR', {
            message: 'Failed to fetch calendar events'
          })
        }
      }
    )
}
