import { env } from '@api/lib/env'
import { betterAuth } from '@api/middleware/auth'
import { generateConnectionToken } from '@rov/realtime/server'
import Elysia from 'elysia'
import z from 'zod'

export const realtime = new Elysia({ name: 'realtime' })
  .use(betterAuth)
  .group('/realtime', { auth: true }, (app) =>
    app.get(
      '/token',
      async ({ user }) => {
        const secret = env.CENTRIFUGO_HMAC_SECRET_KEY

        if (!secret) {
          throw new Error('CENTRIFUGO_HMAC_SECRET_KEY not configured')
        }

        const token = await generateConnectionToken(
          user.id,
          secret,
          '1h' // Token valid for 1 hour
        )

        return {
          token,
          expiresIn: 3600 // seconds
        }
      },
      {
        response: z.object({
          token: z.string(),
          expiresIn: z.number()
        })
      }
    )
  )
