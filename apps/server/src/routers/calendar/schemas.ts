/**
 * Calendar Schemas
 *
 * Schemas for Google Calendar integration endpoints.
 */

import { z } from 'zod'

// ============================================================================
// Input Schemas
// ============================================================================

export const stopWatchCalendarSchema = z.object({
  channelId: z.string(),
  resourceId: z.string()
})

export const getUpcomingEventsSchema = z.object({
  days: z.coerce.number().min(0).max(365).default(1), // 0 = today, 1 = tomorrow, 7 = week, etc.
  maxResults: z.coerce.number().min(1).max(50).default(10)
})

// ============================================================================
// Output Schemas
// ============================================================================

export const webhookResponseSchema = z.object({
  success: z.boolean()
})

export const watchCalendarResponseSchema = z.object({
  channelId: z.string(),
  resourceId: z.string(),
  expiration: z.string()
})

export const stopWatchCalendarResponseSchema = z.object({
  success: z.boolean()
})

export const calendarEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  start: z.string(),
  end: z.string(),
  description: z.string().nullable(),
  location: z.string().nullable(),
  htmlLink: z.string().nullable()
})

export const upcomingEventsResponseSchema = z.object({
  connected: z.boolean(),
  hasCalendarAccess: z.boolean(),
  events: z.array(calendarEventSchema)
})

// ============================================================================
// Type Exports
// ============================================================================

export type StopWatchCalendarInput = z.infer<typeof stopWatchCalendarSchema>
export type GetUpcomingEventsInput = z.infer<typeof getUpcomingEventsSchema>
export type CalendarEvent = z.infer<typeof calendarEventSchema>
