import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { primaryId, timestamps } from '../helper'
import { user } from './auth'

/**
 * ========================
 *  JOB APPLICATIONS
 * ========================
 */
export const jobApplication = pgTable('job_application', {
  id: primaryId,
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),

  // Job details
  companyName: text('company_name').notNull(),
  positionTitle: text('position_title').notNull(),
  jobPostUrl: text('job_post_url'),
  location: text('location'),
  salaryRange: text('salary_range'),

  // Application tracking
  status: text('status', {
    enum: [
      'applied',
      'interview_scheduled',
      'interview_completed',
      'offer_received',
      'rejected',
      'withdrawn'
    ]
  })
    .notNull()
    .default('applied'),

  applicationDate: timestamp('application_date', {
    withTimezone: true,
    mode: 'string'
  })
    .notNull()
    .defaultNow(),
  notes: text('notes'),

  ...timestamps
})
