import { boolean, pgTable, text } from 'drizzle-orm/pg-core'
import { primaryId, timestamps } from '../helper'
import { user } from './auth'
import { department, institution, institutionalTerm } from './institution'

/** ========================
 *  COURSE
 *  Master course catalog per institution
 *  ======================== */
export const course = pgTable('course', {
  id: primaryId,
  institutionId: text('institution_id')
    .notNull()
    .references(() => institution.id, { onDelete: 'cascade' }),
  code: text('code'), // e.g., 'CSCI2100'
  title: text('title').notNull(),
  description: text('description'),
  defaultCredits: text('default_credits'), // e.g., '3' or '4'
  departmentId: text('department_id').references(() => department.id, {
    onDelete: 'set null'
  }),

  // just in case. safely removable. but lets keep it for now
  createdBy: text('created_by').references(() => user.id, {
    onDelete: 'set null'
  }), // user-created courses
  isVerified: boolean('is_verified').default(false),
  ...timestamps
})

/** ========================
 *  COURSE OFFERING
 *  Represents a specific course offering in a term (shared across users)
 *  Links course + institutional term + section details
 *  Enables LMS-style social features and discovery
 *  ======================== */
export const courseOffering = pgTable('course_offering', {
  id: primaryId,

  courseId: text('course_id')
    .notNull()
    .references(() => course.id, { onDelete: 'cascade' }),

  termId: text('term_id')
    .notNull()
    .references(() => institutionalTerm.id, { onDelete: 'cascade' }),

  section: text('section'), // e.g., "A", "B", "TUT01", "LAB002"
  instructor: text('instructor'),
  capacity: text('capacity'), // Optional enrollment capacity
  schedule: text('schedule'), // Optional JSON or text — "Mon 2PM-4PM"

  ...timestamps
})

/** ========================
 *  COURSE ENROLLMENT
 *  User's enrollment in a course offering
 *  Links user's personal term to a course offering (or direct course for flexibility)
 *  ======================== */
export const courseEnrollment = pgTable('course_enrollment', {
  id: primaryId,
  termId: text('term_id')
    .notNull()
    .references(() => institutionalTerm.id, { onDelete: 'cascade' }),
  courseId: text('course_id').references(() => course.id, {
    onDelete: 'cascade'
  }),
  courseOfferingId: text('course_offering_id').references(
    () => courseOffering.id,
    { onDelete: 'set null' }
  ), // Preferred: links to institutional offering for classmates/social features
  credits: text('credits').notNull(),
  grade: text('grade'), // e.g., 'A', 'A-', 'B+'
  gradePoints: text('grade_points'), // e.g., '4.0', '3.7'
  status: text('status').notNull().default('in_progress'), // 'in_progress' | 'completed' | 'withdrawn'
  ...timestamps
})

/** ========================
 *  RELATIONS
 *  ======================== */
import { relations } from 'drizzle-orm'

export const courseRelations = relations(course, ({ one, many }) => ({
  institution: one(institution, {
    fields: [course.institutionId],
    references: [institution.id]
  }),
  department: one(department, {
    fields: [course.departmentId],
    references: [department.id]
  }),
  createdByUser: one(user, {
    fields: [course.createdBy],
    references: [user.id]
  }),
  offerings: many(courseOffering),
  enrollments: many(courseEnrollment)
}))

export const courseOfferingRelations = relations(
  courseOffering,
  ({ one, many }) => ({
    course: one(course, {
      fields: [courseOffering.courseId],
      references: [course.id]
    }),
    term: one(institutionalTerm, {
      fields: [courseOffering.termId],
      references: [institutionalTerm.id]
    }),
    enrollments: many(courseEnrollment)
  })
)

export const courseEnrollmentRelations = relations(
  courseEnrollment,
  ({ one }) => ({
    term: one(institutionalTerm, {
      fields: [courseEnrollment.termId],
      references: [institutionalTerm.id]
    }),
    course: one(course, {
      fields: [courseEnrollment.courseId],
      references: [course.id]
    }),
    courseOffering: one(courseOffering, {
      fields: [courseEnrollment.courseOfferingId],
      references: [courseOffering.id]
    })
  })
)
