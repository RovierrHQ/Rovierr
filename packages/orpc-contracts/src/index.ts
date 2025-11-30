import { academic } from './academic'
import { calendar } from './calendar'
import { expenses } from './expenses'
import { form } from './form'
import { realtime } from './realtime'
import { roadmap } from './roadmap'
import { societyRegistration } from './society-registration'
import { society, studentOrganizations } from './student-organizations'
import { tasks } from './tasks'
import { university } from './university'
import { user } from './user'

// Export individual contracts for router implementation
export { academic } from './academic'
export { form } from './form'
export * from './form/schemas'
export { societyRegistration } from './society-registration'
export * from './society-registration/schemas'
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

  // society registration integration
  societyRegistration,

  // expenses integration
  expenses,

  // tasks integration
  tasks,

  // form integration
  form,

  // academic integration
  academic
}
