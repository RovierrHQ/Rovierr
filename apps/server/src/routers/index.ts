import { publicProcedure } from '../lib/orpc'
import { calendar } from './calendar'
import { realtime } from './realtime'

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return 'OK'
  }),

  // Realtime integration
  realtime,

  // calendar integration
  calendar
}
export type AppRouter = typeof appRouter
