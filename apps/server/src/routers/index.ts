import { o } from '../lib/orpc'
import { academic } from './academic'
import { calendar } from './calendar'
import { campusFeed } from './campus-feed'
import { career } from './career'
import { discussion } from './discussion'
import { expenses } from './expenses'
import { form } from './form'
import { realtime } from './realtime'
import { resumeRouter } from './resume'
import { roadmap } from './roadmap'
import { society } from './society'
import { societyEmail } from './society-email'
import { societyRegistration } from './society-registration'
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

  // academic integration
  academic,

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

  // discussion integration
  discussion,

  // campus feed integration
  campusFeed,

  // career integration
  career,

  // resume integration
  resume: resumeRouter
})
