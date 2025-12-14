import { auth } from '@api/lib/auth'
import { env } from '@api/lib/env'
import { tasks } from '@api/routers/tasks'
import { cors } from '@elysiajs/cors'
import { openapi } from '@elysiajs/openapi'
import { logger } from '@tqman/nice-logger'
import { Elysia } from 'elysia'

const port = Number.parseInt(env.PORT, 10)

const app = new Elysia()
  .use(
    logger({
      mode: 'combined', // "live" or "combined" (default: "combined")
      withTimestamp: true // optional (default: false)
    })
  )
  .use(openapi())
  .use(
    cors({
      origin: env.CORS_ORIGIN.split(',') || '',
      methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
      credentials: true
    })
  )
  // const authPath = new URL(env.BETTER_AUTH_API_URL).pathname
  .mount(auth.handler)
  .get('/', () => 'OK')
  .get('/health', () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  }))
  .use(tasks)
  .listen(port)

export type App = typeof app
