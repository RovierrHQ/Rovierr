import { oc } from '@orpc/contract'
import { z } from 'zod'

export const university = {
  list: oc
    .route({
      method: 'GET',
      description: 'Gets the list of universities.',
      summary: 'Get List of Universities',
      tags: ['University']
    })
    .output(
      z.object({
        universities: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            slug: z.string(),
            logo: z.string().nullable(),
            country: z.string(),
            city: z.string(),
            address: z.string(),
            validEmailDomains: z.array(z.string())
          })
        )
      })
    )
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z
            .string()
            .default('You are not authorized to access this resource')
        })
      }
    })
}
