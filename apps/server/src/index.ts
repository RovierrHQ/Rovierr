import { cors } from '@elysiajs/cors'
import { RPCHandler } from '@orpc/server/fetch'
import { Elysia } from 'elysia'
import { auth } from '@/lib/auth'
import { createContext } from '@/lib/context'
import { env } from '@/lib/env'
import logger from '@/lib/logger'
import { appRouter } from '@/routers'
import { openAPISpec } from './lib/orpc'

const app = new Elysia()

app.use(
  cors({
    origin: env.CORS_ORIGIN.split(',') || '',
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    credentials: true
  })
)

// Extract just the path from BETTER_AUTH_API_URL (e.g., "/api/auth")
const authPath = new URL(env.BETTER_AUTH_API_URL).pathname

app.all(`${authPath}/*`, async (c) => {
  const response = await auth.handler(c.request)
  return response
})

const handler = new RPCHandler(appRouter)
app.group('/rpc-v1', (app) =>
  app.all('/*', async (c) => {
    const context = await createContext({ context: c })
    const { matched, response } = await handler.handle(c.request, {
      prefix: '/rpc-v1',
      context
    })

    if (matched) {
      return response
    }
    // If not matched, return 404
    c.set.status = 404
    return { error: 'Not found' }
  })
)

app.get('/', () => 'OK')

app.get('/health', () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
  uptime: process.uptime()
}))

app.get('/api-docs', () => openAPISpec)

// Start the server
const port = Number.parseInt(env.PORT, 10)
const host = env.HOST

logger.info({ port, host, env: env.NODE_ENV }, 'Server starting...')

export default {
  port,
  hostname: host,
  fetch: app.fetch
}
