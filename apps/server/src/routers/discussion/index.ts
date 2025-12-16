import { Elysia } from 'elysia'
import { followsRouter } from './follows'
import { repliesRouter } from './replies'
import { threadsRouter } from './threads'
import { votesRouter } from './votes'

export const discussionRouter = new Elysia({ prefix: '/discussion' })
  .use(threadsRouter)
  .use(repliesRouter)
  .use(votesRouter)
  .use(followsRouter)
