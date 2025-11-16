import { calendar } from './calendar'
import { realtime } from './realtime'
import { roadmap } from './roadmap'
import { studentOrganizations } from './student-organizations'
import { university } from './university'
import { user } from './user'

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
  studentOrganizations
}
