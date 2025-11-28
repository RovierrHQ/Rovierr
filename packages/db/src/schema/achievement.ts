import { date, pgTable, text } from 'drizzle-orm/pg-core'
import { primaryId, timestamps } from '../helper'
import { programEnrollment } from './program'

/** ========================
 *  ACHIEVEMENT
 *  Awards, scholarships, competitions, certificates
 *  ======================== */
export const achievement = pgTable('achievement', {
  id: primaryId,
  programEnrollmentId: text('program_enrollment_id')
    .notNull()
    .references(() => programEnrollment.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  dateAwarded: date('date_awarded').notNull(),
  type: text('type').notNull(), // 'award' | 'competition' | 'scholarship' | 'certificate'
  ...timestamps
})
