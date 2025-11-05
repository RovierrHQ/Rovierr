import { protectedProcedure } from '@/lib/orpc'

export const roadmap = {
  add: protectedProcedure.roadmap.add.handler(({ input }) => {
    return input
  })
}
