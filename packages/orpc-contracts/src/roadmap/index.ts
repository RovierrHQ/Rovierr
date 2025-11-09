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

  list: oc
    .route({
      method: 'GET',
      description: 'Retrieve all roadmap',
      tags: ['Roadmap']
    })
    .input(
      z.object({
        query: z.object({
          page: z.number().optional(),
          limit: z.number().optional(),
          status: z.enum(['publish', 'preview']).optional().optional(),
          category: z
            .enum(['feature-request', 'bug-report', 'improvement'])
            .optional()
        })
      })
    )
    .output(
      z.object({
        meta: z
          .object({
            page: z.number(),
            limit: z.number(),
            total: z.number(),
            totalPage: z.number()
          })
          .optional(),
        data: z.array(
          z.object({
            id: z.string(),
            user: z.object({
              id: z.string(),
              name: z.string(),
              email: z.string(),
              image: z.string().nullable()
            }),
            title: z.string(),
            status: z.enum(['publish', 'preview']),
            category: z.enum(['feature-request', 'bug-report', 'improvement']),
            description: z.string(),
            createdAt: z.string(),
            updatedAt: z.string()
          })
        )
      })
    )
}
