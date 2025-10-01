import { RPCHandler } from '@orpc/server/fetch'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { auth } from './lib/auth'
import { createContext } from './lib/context'
import { env } from './lib/env'
import { appRouter } from './routers/index'

const app = new Hono()

app.use(logger())
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
const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000
const host = process.env.HOST || '0.0.0.0'

export default {
  port,
  hostname: host,
  fetch: app.fetch
}
