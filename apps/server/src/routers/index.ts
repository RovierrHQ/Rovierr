import { o } from '../lib/orpc'
import { calendar } from './calendar'
import { expenses } from './expenses'
import { realtime } from './realtime'
import { roadmap } from './roadmap'
import { society } from './society'
import { studentOrganizations } from './student-organizations'
import { tasks } from './tasks'
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
  roadmap,

  // student organizations integration
  studentOrganizations,

  // society integration
  society,

  // expenses integration
  expenses,

  // tasks integration
  tasks
})
