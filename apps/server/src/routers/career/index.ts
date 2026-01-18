/**
 * Career Router
 *
 * Main router that combines applications and AI sub-routers
 */

import { Elysia } from 'elysia'
import { aiRouter } from './ai'
import { applicationsRouter } from './applications'

export const careerRouter = new Elysia({ prefix: '/career' })
  .use(applicationsRouter)
  .use(aiRouter)
