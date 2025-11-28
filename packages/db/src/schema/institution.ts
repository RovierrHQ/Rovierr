import { boolean, date, pgTable, text } from 'drizzle-orm/pg-core'
import { primaryId, timestamps } from '../helper'
import { user } from './auth'

/** ========================
 *  INSTITUTION
 *  Supports universities, high schools, online platforms, bootcamps, coaching centers
 *  ======================== */
export const institution = pgTable('institution', {
  id: primaryId,
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(), // e.g., 'cuhk'
  type: text('type', {
    enum: ['university', 'high_school', 'bootcamp', 'coaching_center', 'other']
  }).notNull(),
  logo: text('logo'),
  country: text('country').notNull(),
  city: text('city').notNull(),
  address: text('address'),
  website: text('website'), // e.g., 'https://www.cuhk.edu.hk/english/index.html'
  validEmailDomains: text('valid_email_domains').array().notNull(),
  ...timestamps
})

export const instituitionEnrollment = pgTable('instituition_enrollment', {
  id: primaryId,
  institutionId: text('institution_id')
    .notNull()
    .references(() => institution.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  studentId: text('student_id').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false),
  studentStatusVerified: boolean('student_status_verified').default(false),
  startedOn: date('started_on'),
  graduatedOn: date('graduated_on'),
  hostInstitutionId: text('host_institution_id').references(
    () => institution.id,
    { onDelete: 'set null' }
  ), // hostinstitution is the main instuition and only avaible if the institutionid is an exchanged institution where the student is enrolled in the exchange program. This is used to track the student's academic journey and enrollment at the host institution.
  ...timestamps
})

export const faculty = pgTable('faculty', {
  id: primaryId,
  institutionId: text('institution_id')
    .notNull()
    .references(() => institution.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  website: text('website'),
  ...timestamps
})

export const department = pgTable('department', {
  id: primaryId,
  facultyId: text('faculty_id').references(() => faculty.id, {
    onDelete: 'cascade'
  }),
  institutionId: text('institution_id')
    .notNull()
    .references(() => institution.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  website: text('website'),
  ...timestamps
})

export const curriculum = pgTable('curriculum', {
  id: primaryId,
  name: text('name').notNull(), // for bangladesh NCTB, then there is Edexcel, Cambridge or IB
  description: text('description'),
  ...timestamps
})

// for univerisity there will not be any record, its mostly for high schools
export const institutionCurriculum = pgTable('institution_curriculum', {
  id: primaryId,
  institutionId: text('institution_id')
    .notNull()
    .references(() => institution.id, { onDelete: 'cascade' }),
  curriculumId: text('curriculum_id')
    .notNull()
    .references(() => curriculum.id, { onDelete: 'cascade' }),
  startDate: date('start_date'),
  endDate: date('end_date'),
  ...timestamps
})

/** ========================
 *  INSTITUTIONAL ACADEMIC TERM
 *  Institution-defined terms (e.g., "Semester 1, 2025-26")
 *  Separate from user's personal academicTerm for their journey
 *  ======================== */
export const institutionalTerm = pgTable('institutional_term', {
  id: primaryId,
  institutionId: text('institution_id')
    .notNull()
    .references(() => institution.id, { onDelete: 'cascade' }),
  academicYear: text('academic_year').notNull(), // e.g., "2025-26"
  termName: text('term_name').notNull(), // e.g., "Semester 1", "Term 2", "Fall"
  startDate: date('start_date'),
  endDate: date('end_date'),
  ...timestamps
})

//? info: we can add this later if needed. but not now.
// export const institutionalTermEnrollment = pgTable(
//   'institutional_term_enrollment',
//   {
//     id: primaryId,
//     termId: text('term_id')
//       .notNull()
//       .references(() => institutionalTerm.id, { onDelete: 'cascade' }),
//     userId: text('user_id')
//       .notNull()
//       .references(() => user.id, { onDelete: 'cascade' }),
//     grade: text('grade'), // e.g., 'A', 'A-', 'B+'
//     gradePoints: text('grade_points'), // e.g., '4.0', '3.7'
//     ...timestamps
//   }
// )
