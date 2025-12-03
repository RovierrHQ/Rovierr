import { academic } from './academic'
import { calendar } from './calendar'
import { campusFeed } from './campus-feed'
import { career } from './career'
import { discussion } from './discussion'
import { expenses } from './expenses'
import { form } from './form'
import { realtime } from './realtime'
import { resume } from './resume'
import { roadmap } from './roadmap'
import { societyEmail } from './society-email'
import { societyRegistration } from './society-registration'
import { society, studentOrganizations } from './student-organizations'
import { tasks } from './tasks'
import { university } from './university'
import { user } from './user'

// Export individual contracts for router implementation
export { academic } from './academic'
export { campusFeed } from './campus-feed'
export * from './campus-feed/schemas'
export { career } from './career'
export * from './career/schemas'
export { discussion } from './discussion'
export * from './discussion/schemas'
export { form } from './form'
export * from './form/schemas'
export { resume } from './resume'
export * from './resume/schemas'
export { societyEmail } from './society-email'
export * from './society-email/schemas'
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

  // society email integration
  societyEmail,

  // expenses integration
  expenses,

  // tasks integration
  tasks,

  // form integration
  form,

  // academic integration
  academic,

  // discussion integration
  discussion,

  // campus feed integration
  campusFeed,

  // career integration
  career,

  // resume integration
  resume
}
