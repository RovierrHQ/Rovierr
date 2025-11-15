import { db } from '@/db'
import { protectedProcedure } from '@/lib/orpc'

export const university = {
  list: protectedProcedure.university.list.handler(async () => {
    const universities = await db.query.university.findMany()

    return {
      universities
    }
  })
}
