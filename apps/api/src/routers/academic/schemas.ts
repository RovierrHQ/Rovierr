/**
 * Academic Enrollment Schemas
 *
 * Schemas for academic enrollment endpoints including institutions, programs,
 * terms, and course enrollments.
 */

import { z } from 'zod'

// ============================================================================
// Enum Schemas
// ============================================================================

export const degreeLevelSchema = z.enum([
  'higher_secondary',
  'secondary',
  'primary',
  'undergraduate',
  'postgraduate',
  'diploma',
  'certificate',
  'other'
])

export const programTypeSchema = z.enum([
  'major',
  'minor',
  'certificate',
  'other'
])

// ============================================================================
// Input Schemas
// ============================================================================

export const getInstitutionProgramsSchema = z.object({
  institutionId: z.string()
})

export const getInstitutionTermsSchema = z.object({
  institutionId: z.string()
})

export const getCoursesSchema = z.object({
  termId: z.string(),
  search: z.string().optional()
})

export const enrollProgramSchema = z.object({
  programId: z.string(),
  institutionEnrollmentId: z.string(),
  type: programTypeSchema.default('major')
})

export const enrollCoursesSchema = z.object({
  termId: z.string(),
  courseOfferingIds: z.array(z.string()).min(1, 'At least one course required')
})

// ============================================================================
// Output Schemas
// ============================================================================

export const institutionEnrollmentSchema = z.object({
  enrollmentId: z.string(),
  institutionId: z.string(),
  institutionName: z.string(),
  institutionLogo: z.string().nullable(),
  studentId: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  studentStatusVerified: z.boolean(),
  startedOn: z.string().nullable(),
  graduatedOn: z.string().nullable()
})

export const programSchema = z.object({
  id: z.string(),
  code: z.string().nullable(),
  name: z.string(),
  description: z.string().nullable(),
  degreeLevel: degreeLevelSchema
})

export const termSchema = z.object({
  id: z.string(),
  termName: z.string(),
  academicYear: z.string(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable()
})

export const courseOfferingSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  code: z.string().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  instructor: z.string().nullable(),
  section: z.string().nullable(),
  schedule: z.string().nullable(),
  credits: z.string().nullable()
})

export const enrolledCourseSchema = z.object({
  id: z.string(),
  courseId: z.string().nullable(),
  code: z.string().nullable(),
  title: z.string(),
  instructor: z.string().nullable(),
  section: z.string().nullable(),
  schedule: z.string().nullable()
})

export const enrollmentStatusProgramSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string().nullable()
})

export const enrollmentStatusTermSchema = z.object({
  id: z.string(),
  termName: z.string(),
  academicYear: z.string()
})

export const enrollmentDetailsSchema = z.object({
  program: z.object({
    id: z.string(),
    name: z.string(),
    code: z.string().nullable(),
    institutionId: z.string()
  }),
  term: enrollmentStatusTermSchema,
  courses: z.array(enrolledCourseSchema)
})

// ============================================================================
// Response Schemas
// ============================================================================

export const verifiedInstitutionsResponseSchema = z.object({
  institutions: z.array(institutionEnrollmentSchema)
})

export const programsResponseSchema = z.object({
  programs: z.array(programSchema)
})

export const termsResponseSchema = z.object({
  terms: z.array(termSchema)
})

export const coursesResponseSchema = z.object({
  courses: z.array(courseOfferingSchema)
})

export const enrollProgramResponseSchema = z.object({
  success: z.boolean(),
  enrollmentId: z.string()
})

export const enrollCoursesResponseSchema = z.object({
  success: z.boolean(),
  enrolledCount: z.number()
})

export const enrollmentStatusResponseSchema = z.object({
  hasProgram: z.boolean(),
  hasCourses: z.boolean(),
  program: enrollmentStatusProgramSchema.nullable(),
  term: enrollmentStatusTermSchema.nullable(),
  courses: z.array(enrolledCourseSchema)
})

// ============================================================================
// Type Exports
// ============================================================================

export type GetInstitutionProgramsInput = z.infer<
  typeof getInstitutionProgramsSchema
>
export type GetInstitutionTermsInput = z.infer<typeof getInstitutionTermsSchema>
export type GetCoursesInput = z.infer<typeof getCoursesSchema>
export type EnrollProgramInput = z.infer<typeof enrollProgramSchema>
export type EnrollCoursesInput = z.infer<typeof enrollCoursesSchema>
