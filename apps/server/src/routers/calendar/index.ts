/**
 * Calendar Router
 *
 * Main router for calendar features including Google Calendar integration.
 */

import { Elysia } from 'elysia'
import { googleCalendarRouter } from './google'

export const calendarRouter = new Elysia({ prefix: '/calendar' }).use(
  googleCalendarRouter
)
