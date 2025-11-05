import { oc } from '@orpc/contract'
import { z } from 'zod'

export const roadmap = {
  add: oc
    .route({
      method: 'POST',
      description: 'Create new Roadmap',
      summary: 'Create new Roadmap',
      tags: ['Roadmap']
    })
    .input(
      z.object({
        title: z.string(),
        status: z.enum(['publish', 'preview']),
        category: z.enum(['Feature Request', 'Bug Report', 'Improvement']),
        description: z.string()
      })
    )
}
