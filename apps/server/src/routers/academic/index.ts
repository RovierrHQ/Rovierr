/**
 * Academic Router
 *
 * Main router for academic features including enrollment management.
 */

import { Elysia } from 'elysia'
import { enrollmentRouter } from './enrollment'

export const academicRouter = new Elysia({ prefix: '/academic' }).use(
  enrollmentRouter
)
