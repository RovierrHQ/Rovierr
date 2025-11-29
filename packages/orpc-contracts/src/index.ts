import { calendar } from './calendar'
import { expenses } from './expenses'
import { realtime } from './realtime'
import { roadmap } from './roadmap'
import { society, studentOrganizations } from './student-organizations'
import { tasks } from './tasks'
import { university } from './university'
import { user } from './user'

// Export schemas for use in forms
export * from './student-organizations/schemas'

export const appContract = {
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
}
