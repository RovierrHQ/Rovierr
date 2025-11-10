import { ORPCError } from '@orpc/client'
import { and, eq, sql } from 'drizzle-orm'
import { db } from '@/db'
import { roadmap as roadmapTable } from '@/db/schema/roadmap'
import { protectedProcedure, publicProcedure } from '@/lib/orpc'

export const roadmap = {
  create: protectedProcedure.roadmap.create.handler(
    async ({ input, context }) => {
      try {
        const [inserted] = await db
          .insert(roadmapTable)
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
    }
  ),

  list: publicProcedure.roadmap.list.handler(async ({ input }) => {
    try {
      let { page, limit, category } = input.query ?? {}

      page = Number(page) || 1
      limit = Number(limit) || 10

      const offset = (page - 1) * limit

      const whereConditions = and(
        ...[
          eq(roadmapTable.status, 'publish'),
          category ? eq(roadmapTable.category, category) : undefined
        ].filter(Boolean)
      )

      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(roadmapTable)
        .where(whereConditions)

      const total = Number(totalResult[0]?.count ?? 0)

      const result = await db.query.roadmap.findMany({
        where: whereConditions,
        limit,
        offset,
        orderBy: (rm, { desc }) => desc(rm.createdAt),
        with: {
          user: true
        }
      })

      return {
        data: result,
        meta: {
          page,
          limit,
          total,
          totalPage: Math.ceil(total / limit)
        }
      }
    } catch {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'failed to retrieve roadmap'
      })
    }
  })
}
