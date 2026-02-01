import { auth } from '@api/lib/auth'
import { env } from '@api/lib/env'
import { academicRouter } from '@api/routers/academic'
import { calendarRouter } from '@api/routers/calendar'
import { campusFeed } from '@api/routers/campus-feed'
import { careerRouter } from '@api/routers/career'
// import { chat } from '@api/routers/chat'
import { connection } from '@api/routers/connection'
// import { discussionRouter } from '@api/routers/discussion'
import { form } from '@api/routers/form'
import { realtime } from '@api/routers/realtime'
import { resumeRouter } from '@api/routers/resume'
import { roadmap } from '@api/routers/roadmap'
import { society } from '@api/routers/society'
import { societyRegistrationRouter } from '@api/routers/society/society-registration'
import { stripeRouter } from '@api/routers/stripe'
import { tasks } from '@api/routers/tasks'
import { universityRouter } from '@api/routers/university'
import { user } from '@api/routers/user'
import { verifyStudentRouter } from '@api/routers/verify-student'
import { cors } from '@elysiajs/cors'
import { openapi } from '@elysiajs/openapi'
import { logger } from '@tqman/nice-logger'
import { Elysia } from 'elysia'
import z from 'zod'

// import { societyRegistrationRouter } from './routers/society-registration'

const app = new Elysia()
  .use(
    logger({
      mode: 'combined', // "live" or "combined" (default: "combined")
      withTimestamp: true // optional (default: false)
    })
  )
  .use(
    openapi({
      mapJsonSchema: {
        zod: z.toJSONSchema
      }
    })
  )
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
  .use(user)
  .use(roadmap)
  .use(tasks)
  .use(realtime)
  // .use(chat)
  .use(connection)
  .use(campusFeed)
  // .use(discussionRouter)
  .use(society)
  .use(form)
  .use(academicRouter)
  .use(calendarRouter)
  .use(careerRouter)
  .use(resumeRouter)
  .use(universityRouter)
  .use(verifyStudentRouter)
  .use(stripeRouter)
  .use(societyRegistrationRouter)
  .listen(env.PORT)

export type App = typeof app
