import { date, pgTable, text } from 'drizzle-orm/pg-core'
import { primaryId, timestamps } from '../helper'
import { user } from './auth'
import { program } from './program'
import { university } from './university'

/** ========================
 *  SEMESTER
 *  ======================== */
export const semester = pgTable('semester', {
  id: primaryId,
  universityId: text('university_id')
    .notNull()
    .references(() => university.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), // e.g., Fall 2025
  startDate: date('start_date'),
  endDate: date('end_date'),
  ...timestamps
})

/** ========================
 *  USER SEMESTER ENROLLMENT
 *  ======================== */
export const userSemester = pgTable('user_semester', {
  id: primaryId,
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  programId: text('program_id')
    .notNull()
    .references(() => program.id, { onDelete: 'cascade' }),
  semesterId: text('semester_id')
    .notNull()
    .references(() => semester.id, { onDelete: 'cascade' }),
  exchangeSemesterId: text('exchange_semester_id').references(
    () => semester.id,
    { onDelete: 'cascade' }
  ),
  ...timestamps
})
