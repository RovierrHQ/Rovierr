import { generateConnectionToken } from '@rov/realtime/server'
import { env } from '@/lib/env'
import { protectedProcedure } from '../lib/orpc'

export const realtime = {
  // Get Centrifugo connection token for authenticated user
  getConnectionToken: protectedProcedure
    .route({ method: 'GET' })
    .handler(async ({ context }) => {
      const secret = env.CENTRIFUGO_HMAC_SECRET_KEY

      if (!secret) {
        throw new Error('CENTRIFUGO_HMAC_SECRET_KEY not configured')
      }

      const token = await generateConnectionToken(
        context.session.user.id,
        secret,
        '1h' // Token valid for 1 hour
      )

      return {
        token,
        expiresIn: 3600 // seconds
      }
    })
}
