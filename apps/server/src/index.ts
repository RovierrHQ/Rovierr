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

const app = new Hono()

// Automatic request/response logging with hono-pino
app.use(honoLogger())
app.use(
  '/*',
  cors({
    origin: env.CORS_ORIGIN.split(',') || '',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    credentials: true
  })
)

app.on(['POST', 'GET'], '/api/auth/**', (c) => auth.handler(c.req.raw))

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

// Start the server
const port = Number.parseInt(env.PORT, 10)
const host = env.HOST

logger.info({ port, host, env: env.NODE_ENV }, 'Server starting...')

export default {
  port,
  hostname: host,
  fetch: app.fetch
}
