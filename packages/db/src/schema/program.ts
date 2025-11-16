import { boolean, date, pgTable, text } from 'drizzle-orm/pg-core'
import { primaryId, timestamps } from '../helper'
import { user } from './auth'
import { university } from './university'

/** ========================
 *  PROGRAM (Degree / Major)
 *  ======================== */
export const program = pgTable('program', {
  id: primaryId,
  universityId: text('university_id')
    .notNull()
    .references(() => university.id, { onDelete: 'cascade' }),
  code: text('code').notNull(), // e.g., BSC-CS
  name: text('name').notNull(), // e.g., B.Sc. in Computer Science
  description: text('description'),
  degreeLevel: text('degree_level').notNull(), // e.g., Bachelor, Master, PhD
  isVerified: boolean('is_verified').default(false),
  ...timestamps
})

/** ========================
 *  USER PROGRAM ENROLLMENT
 *  ======================== */
export const userProgramEnrollment = pgTable('user_program_enrollment', {
  id: primaryId,
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  programId: text('program_id')
    .notNull()
    .references(() => program.id, { onDelete: 'cascade' }),
  studentStatusVerified: boolean('student_status_verified').default(false),
  startedOn: date('started_on'),
  graduatedOn: date('graduated_on'),
  isPrimary: boolean('is_primary').default(false),
  ...timestamps
})
