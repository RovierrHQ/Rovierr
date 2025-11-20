import { RPCHandler } from '@orpc/server/fetch'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
// import { logger, pinoConfig } from '@/lib/logger'
import { logger as honoLogger } from 'hono/logger'
// import { pinoLogger } from 'hono-pino'
// import { nanoid } from 'nanoid'
import { auth } from '@/lib/auth'
import { createContext } from '@/lib/context'
import { env } from '@/lib/env'
import logger from '@/lib/logger'
import { appRouter } from '@/routers'
import { openAPISpec } from './lib/orpc'

const app = new Hono()

// Automatic request/response logging with hono-pino
app.use(honoLogger())
app.use(
  '/*',
  cors({
    origin: env.CORS_ORIGIN.split(',') || '',
    allowMethods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    credentials: true
  })
)

// Extract just the path from BETTER_AUTH_API_URL (e.g., "/api/auth")
const authPath = new URL(env.BETTER_AUTH_API_URL).pathname

app.on(['POST', 'GET'], `${authPath}/**`, (c) => auth.handler(c.req.raw))

const handler = new RPCHandler(appRouter)
app.use('/rpc-v1/*', async (c, next) => {
  const context = await createContext({ context: c })
  const { matched, response } = await handler.handle(c.req.raw, {
    prefix: '/rpc-v1',
    context
  })

  if (matched) {
    return c.newResponse(response.body, response)
  }
  await next()
})

app.get('/', (c) => {
  return c.text('OK')
})

app.get('/api-docs', (c) => {
  return c.json(openAPISpec)
})

// Start the server
const port = Number.parseInt(env.PORT, 10)
const host = env.HOST

logger.info({ port, host, env: env.NODE_ENV }, 'Server starting...')

export default {
  port,
  hostname: host,
  fetch: app.fetch
}
