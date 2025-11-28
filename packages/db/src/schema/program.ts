import { boolean, date, pgTable, text } from 'drizzle-orm/pg-core'
import { primaryId, timestamps } from '../helper'
import { user } from './auth'
import { institution } from './institution'

/** ========================
 *  PROGRAM (Degree / Major)
 *  ======================== */
export const program = pgTable('program', {
  id: primaryId,
  institutionId: text('institution_id')
    .notNull()
    .references(() => institution.id, { onDelete: 'cascade' }),
  code: text('code'), // e.g., BSC-CS
  name: text('name').notNull(), // e.g., B.Sc. in Computer Science, grade 7, A level etc
  description: text('description'),
  degreeLevel: text('degree_level', {
    enum: [
      'higher_secondary',
      'secondary',
      'primary',
      'undergraduate',
      'postgraduate',
      'diploma',
      'certificate',
      'other'
    ]
  }).notNull(),
  isVerified: boolean('is_verified').default(false),
  ...timestamps
})

/** ========================
 *  USER PROGRAM ENROLLMENT
 *  ======================== */
export const programEnrollment = pgTable('program_enrollment', {
  id: primaryId,
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  programId: text('program_id')
    .notNull()
    .references(() => program.id, { onDelete: 'cascade' }),
  startedOn: date('started_on'),
  graduatedOn: date('graduated_on'),
  type: text('type', {
    enum: ['major', 'minor', 'certificate', 'other']
  }).notNull(),
  ...timestamps
})
