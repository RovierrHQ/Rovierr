// import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
// import { primaryId, timestamps } from '../helper'
// import { user } from './auth'
// import { semesterCourse } from './course'

// /** ========================
//  *  ASSIGNMENTS
//  *  ======================== */
// export const assignment = pgTable('assignment', {
//   id: primaryId,
//   semesterCourseId: text('semester_course_id')
//     .notNull()
//     .references(() => semesterCourse.id, { onDelete: 'cascade' }),
//   title: text('title').notNull(),
//   description: text('description'),
//   dueDate: timestamp({ withTimezone: true, mode: 'string' }),
//   ...timestamps
// })

// /** ========================
//  *  USER ASSIGNMENT SUBMISSIONS
//  *  ======================== */
// export const userAssignmentSubmission = pgTable('user_assignment_submission', {
//   id: primaryId,
//   assignmentId: text('assignment_id')
//     .notNull()
//     .references(() => assignment.id, { onDelete: 'cascade' }),
//   userId: text('user_id')
//     .notNull()
//     .references(() => user.id, { onDelete: 'cascade' }),
//   submittedAt: timestamp({ withTimezone: true, mode: 'string' }),
//   grade: text('grade'),
//   fileUrl: text('file_url'), // or store content in a separate table
//   ...timestamps
// })
