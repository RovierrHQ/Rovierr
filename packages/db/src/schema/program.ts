import { relations } from 'drizzle-orm'
import { boolean, date, pgTable, text, unique } from 'drizzle-orm/pg-core'
import { primaryId, timestamps } from '../helper'
import { user } from './auth'
import { instituitionEnrollment, institution } from './institution'

/** ========================
 *  PROGRAM (Degree / Major)
 *  ======================== */
export const program = pgTable(
  'program',
  {
    id: primaryId,
    institutionId: text('institution_id')
      .notNull()
      .references(() => institution.id, { onDelete: 'cascade' }),
    code: text('code').notNull(), // e.g., BSC-CS
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
  },
  (table) => [unique().on(table.institutionId, table.code)]
)

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
  instituitionEnrollmentId: text('instituition_enrollment_id')
    .notNull()
    .references(() => instituitionEnrollment.id, { onDelete: 'cascade' }),
  startedOn: date('started_on'),
  graduatedOn: date('graduated_on'),
  type: text('type', {
    enum: ['major', 'minor', 'certificate', 'other']
  }).notNull(),
  ...timestamps
})

/** ========================
 *  RELATIONS
 *  ======================== */
export const programRelations = relations(program, ({ one, many }) => ({
  institution: one(institution, {
    fields: [program.institutionId],
    references: [institution.id]
  }),
  enrollments: many(programEnrollment)
}))

export const programEnrollmentRelations = relations(
  programEnrollment,
  ({ one }) => ({
    user: one(user, {
      fields: [programEnrollment.userId],
      references: [user.id]
    }),
    program: one(program, {
      fields: [programEnrollment.programId],
      references: [program.id]
    }),
    institutionEnrollment: one(instituitionEnrollment, {
      fields: [programEnrollment.instituitionEnrollmentId],
      references: [instituitionEnrollment.id]
    })
  })
)
