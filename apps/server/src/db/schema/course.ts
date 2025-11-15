import { boolean, pgTable, text } from 'drizzle-orm/pg-core'
import { primaryId, timestamps } from '../helper'
import { user } from './auth'
import { semester, userSemester } from './semester'
import { university } from './university'

/** ========================
 *  COURSE
 *  ======================== */
export const course = pgTable('course', {
  id: primaryId,
  universityId: text('university_id')
    .notNull()
    .references(() => university.id, { onDelete: 'cascade' }),
  code: text('code').notNull(), // e.g., CSCI 3130
  title: text('title').notNull(),
  description: text('description'),
  createdBy: text('created_by').references(() => user.id, {
    onDelete: 'cascade'
  }), // user-created courses
  isVerified: boolean('is_verified').default(false),
  ...timestamps
})

/** ========================
 *  SEMESTER COURSE OFFERINGS
 *  ======================== */
export const semesterCourse = pgTable('semester_course', {
  id: primaryId,
  courseId: text('course_id')
    .notNull()
    .references(() => course.id, { onDelete: 'cascade' }),
  semesterId: text('semester_id')
    .notNull()
    .references(() => semester.id, { onDelete: 'cascade' }),
  ...timestamps
})

export const section = pgTable('section', {
  id: primaryId,
  semesterCourseId: text('semester_course_id')
    .notNull()
    .references(() => semesterCourse.id, { onDelete: 'cascade' }),
  code: text('code').notNull(), // e.g., "A", "B", or "LAB1"
  schedule: text('schedule'), // optional: timing info
  ...timestamps
})

/** ========================
 *  USER COURSE ENROLLMENT
 *  ======================== */
export const userCourseEnrollment = pgTable('user_course_enrollment', {
  id: primaryId,
  userSemesterId: text('user_semester_id')
    .notNull()
    .references(() => userSemester.id, { onDelete: 'cascade' }),
  semesterCourseId: text('semester_course_id')
    .notNull()
    .references(() => semesterCourse.id, { onDelete: 'cascade' }),
  sectionId: text('section_id')
    .notNull()
    .references(() => section.id, { onDelete: 'cascade' }),
  grade: text('grade'),
  ...timestamps
})
