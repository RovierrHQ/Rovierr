import { ORPCError } from '@orpc/client'
import { db } from '@/db'
import { roadmap as roadmapSchema } from '@/db/schema/roadmap'
import { protectedProcedure, publicProcedure } from '@/lib/orpc'

export const roadmap = {
  add: protectedProcedure.roadmap.add.handler(async ({ input, context }) => {
    try {
      const [inserted] = await db
        .insert(roadmapSchema)
        .values({
          ...input,
          userId: context.session.user.id
        })
        .returning()

      return inserted
    } catch {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'failed to create roadmap'
      })
    }
  }),

  getall: publicProcedure.roadmap.getall.handler(async () => {
    return await { name: 'Ababil' }
  })
}
