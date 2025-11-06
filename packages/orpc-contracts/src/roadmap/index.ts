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
        category: z.enum(['feature-request', 'bug-report', 'improvement']),
        description: z.string()
      })
    )
    .output(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        category: z.string(),
        status: z.string()
      })
    ),

  getall: oc
    .route({
      method: 'GET',
      description: 'Retrieve all roadmap',
      summary: '',
      tags: ['Roadmap']
    })
    .output(z.object({ name: z.string(), input: z.string().optional() }))
}
