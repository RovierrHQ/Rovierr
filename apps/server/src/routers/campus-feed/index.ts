/**
 * Campus Feed Router
 *
 * Main router that combines posts, events, and interactions
 */

import { Elysia } from 'elysia'
import { eventsRouter } from './events'
import { interactionsRouter } from './interactions'
import { postsRouter } from './posts'

export const campusFeedRouter = new Elysia({ prefix: '/campus-feed' })
  .use(postsRouter)
  .use(eventsRouter)
  .use(interactionsRouter)

// Export for use in main app
export const campusFeed = campusFeedRouter
