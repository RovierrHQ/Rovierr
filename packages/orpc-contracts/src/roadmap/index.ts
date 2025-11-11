import { oc } from '@orpc/contract'
import { z } from 'zod'

const commentSchema = z.object({
  id: z.string(),
  text: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    image: z.string().nullable()
  }),
  upvotes: z.array(
    z.object({
      id: z.string(),
      userId: z.string(),
      createdAt: z.string(),
      updatedAt: z.string()
    })
  )
})

export const roadmap = {
  create: oc
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
            updatedAt: z.string(),
            upvotes: z.array(
              z.object({
                id: z.string(),
                userId: z.string(),
                roadmapId: z.string(),
                createdAt: z.string(),
                updatedAt: z.string()
              })
            ),
            comments: z.array(commentSchema)
          })
        )
      })
    ),

  vote: oc
    .route({
      method: 'POST',
      description: 'Add vote or remove vote!',
      tags: ['Roadmap']
    })
    .input(
      z.object({
        roadmapId: z.string()
      })
    )
    .output(
      z.object({
        message: z.string()
      })
    ),

  createComment: oc
    .route({
      method: 'POST',
      description: 'Create a new comment on a roadmap item',
      summary: 'Create comment',
      tags: ['Roadmap']
    })
    .input(
      z.object({
        roadmapId: z.string(),
        text: z.string().min(1, 'Comment text is required')
      })
    )
    .output(commentSchema)
}
