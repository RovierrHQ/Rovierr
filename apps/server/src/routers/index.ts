import { o } from '../lib/orpc'
import { calendar } from './calendar'
import { realtime } from './realtime'
import { user } from './user'

export const appRouter = o.router({
  // Realtime integration
  realtime,

  // calendar integration
  calendar,

  // user integration
  user
})
