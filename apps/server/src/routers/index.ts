import { o } from '../lib/orpc'
import { calendar } from './calendar'
import { realtime } from './realtime'
import { roadmap } from './roadmap'
import { university } from './university'
import { user } from './user'

export const appRouter = o.router({
  // Realtime integration
  realtime,

  // calendar integration
  calendar,

  // user integration
  user,

  // university integration
  university,

  // roadmap integration
  roadmap
})
