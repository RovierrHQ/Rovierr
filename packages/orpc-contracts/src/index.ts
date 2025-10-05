import { calendar } from './calendar'
import { realtime } from './realtime'
import { user } from './user'

export const appContract = {
  // Realtime integration
  realtime,

  // calendar integration
  calendar,

  // user integration
  user
}
