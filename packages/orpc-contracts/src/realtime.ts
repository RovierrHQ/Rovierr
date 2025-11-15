import { oc } from '@orpc/contract'
import { z } from 'zod'

export const realtime = {
  // Get Centrifugo connection token for authenticated user
  getConnectionToken: oc
    .route({
      method: 'GET',
      description: 'Get Centrifugo connection token for authenticated user',
      summary: 'Get Connection Token',
      tags: ['Realtime']
    })
    .output(
      z.object({
        token: z.string(),
        expiresIn: z.number()
      })
    )
}
