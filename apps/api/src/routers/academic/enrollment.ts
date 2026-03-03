/**
 * Academic Enrollment Router
 *
 * Handles institution enrollment, program enrollment, term management,
 * and course enrollment for academic features.
 */

import { db } from '@api/lib/db'
import { betterAuth } from '@api/middleware/auth'
import {
  courseEnrollment as courseEnrollmentTable,
  courseOffering as courseOfferingTable,
  course as courseTable,
  programEnrollment as programEnrollmentTable,
  institutionalTermEnrollment as termEnrollmentTable
} from '@rov/db'
import { and, eq, ilike, isNull, or } from 'drizzle-orm'
import { Elysia } from 'elysia'
import {
  AlreadyEnrolledError,
  InvalidTermError,
  NotEnrolledError
} from './errors'
import {
  coursesResponseSchema,
  enrollCoursesResponseSchema,
  enrollCoursesSchema,
  enrollmentDetailsSchema,
  enrollmentStatusResponseSchema,
  enrollProgramResponseSchema,
  enrollProgramSchema,
  getCoursesSchema,
  getInstitutionProgramsSchema,
  getInstitutionTermsSchema,
  programsResponseSchema,
  termsResponseSchema,
  verifiedInstitutionsResponseSchema
} from './schemas'

export const enrollmentRouter = new Elysia({ name: 'Enrollment' })
  .use(betterAuth)
  .group('/enrollment', { auth: true }, (app) =>
    app
      // GET /enrollment/verified-institutions - Get verified institution enrollments
      .get(
        '/verified-institutions',
        async ({ user }) => {
          const userId = user.id

          // Fetch verified institution enrollments
          const enrollments = await db.query.instituitionEnrollment.findMany({
            where: (enrollmentRecord) =>
              and(
                eq(enrollmentRecord.userId, userId),
                eq(enrollmentRecord.emailVerified, true),
                eq(enrollmentRecord.studentStatusVerified, true)
              ),
            with: {
              institution: true
            }
          })

          return {
            institutions: enrollments.map((enrollmentRecord) => ({
              enrollmentId: enrollmentRecord.id,
              institutionId: enrollmentRecord.institutionId,
              institutionName: enrollmentRecord.institution.name,
              institutionLogo: enrollmentRecord.institution.logo,
              studentId: enrollmentRecord.studentId,
              email: enrollmentRecord.email,
              emailVerified: enrollmentRecord.emailVerified ?? false,
              studentStatusVerified:
                enrollmentRecord.studentStatusVerified ?? false,
              startedOn: enrollmentRecord.startedOn ?? null,
              graduatedOn: enrollmentRecord.graduatedOn ?? null
            }))
          }
        },
        {
          response: verifiedInstitutionsResponseSchema,
          detail: {
            description:
              'Get verified institution enrollments for the current user',
            summary: 'Get Verified Institutions',
            tags: ['Academic']
          }
        }
      )

      // GET /enrollment/programs - Get programs for an institution
      .get(
        '/programs',
        async ({ query }) => {
          const { institutionId } = query

          // Fetch programs for the institution
          const programs = await db.query.program.findMany({
            where: (program) => eq(program.institutionId, institutionId),
            orderBy: (program, { asc }) => [asc(program.name)]
          })

          return {
            programs: programs.map((program) => ({
              id: program.id,
              code: program.code,
              name: program.name,
              description: program.description,
              degreeLevel: program.degreeLevel
            }))
          }
        },
        {
          query: getInstitutionProgramsSchema,
          response: programsResponseSchema,
          detail: {
            description: 'Get programs for an institution',
            summary: 'Get Programs',
            tags: ['Academic']
          }
        }
      )

      // GET /enrollment/terms - Get academic terms for an institution
      .get(
        '/terms',
        async ({ query }) => {
          const { institutionId } = query

          // Fetch institutional terms
          const terms = await db.query.institutionalTerm.findMany({
            where: (term) => eq(term.institutionId, institutionId),
            orderBy: (term, { desc }) => [desc(term.startDate)]
          })

          return {
            terms: terms.map((term) => ({
              id: term.id,
              termName: term.termName,
              academicYear: term.academicYear,
              startDate: term.startDate ?? null,
              endDate: term.endDate ?? null
            }))
          }
        },
        {
          query: getInstitutionTermsSchema,
          response: termsResponseSchema,
          detail: {
            description: 'Get academic terms for an institution',
            summary: 'Get Terms',
            tags: ['Academic']
          }
        }
      )

      // GET /enrollment/courses - Get courses for a term
      .get(
        '/courses',
        async ({ query }) => {
          const { termId, search } = query

          // If no search query or less than 4 characters, return empty array
          if (!search || search.trim().length < 4) {
            return {
              courses: []
            }
          }

          const searchPattern = `%${search}%`

          // Fetch course offerings with SQL filtering using joins
          const offerings = await db
            .select({
              id: courseOfferingTable.id,
              courseId: courseTable.id,
              code: courseTable.code,
              title: courseTable.title,
              description: courseTable.description,
              instructor: courseOfferingTable.instructor,
              section: courseOfferingTable.section,
              schedule: courseOfferingTable.schedule,
              credits: courseTable.defaultCredits
            })
            .from(courseOfferingTable)
            .innerJoin(
              courseTable,
              eq(courseTable.id, courseOfferingTable.courseId)
            )
            .where(
              and(
                eq(courseOfferingTable.termId, termId),
                or(
                  ilike(courseTable.code, searchPattern),
                  ilike(courseTable.title, searchPattern)
                )
              )
            )
            .limit(50)

          return {
            courses: offerings
          }
        },
        {
          query: getCoursesSchema,
          response: coursesResponseSchema,
          detail: {
            description: 'Get courses for a program and term',
            summary: 'Get Courses',
            tags: ['Academic']
          }
        }
      )

      // POST /enrollment/program - Enroll in a program
      .post(
        '/program',
        async ({ body, user }) => {
          const userId = user.id
          const { programId, institutionEnrollmentId, type } = body

          // Check if already enrolled in this program
          const existingEnrollment = await db.query.programEnrollment.findFirst(
            {
              where: (record) =>
                and(eq(record.userId, userId), eq(record.programId, programId))
            }
          )

          if (existingEnrollment) {
            throw new AlreadyEnrolledError()
          }

          // Create program enrollment
          const [newEnrollment] = await db
            .insert(programEnrollmentTable)
            .values({
              userId,
              programId,
              instituitionEnrollmentId: institutionEnrollmentId,
              type,
              startedOn: new Date().toISOString().split('T')[0]
            })
            .returning()

          return {
            success: true,
            enrollmentId: newEnrollment.id
          }
        },
        {
          body: enrollProgramSchema,
          response: enrollProgramResponseSchema,
          detail: {
            description: 'Enroll in a program',
            summary: 'Enroll Program',
            tags: ['Academic']
          }
        }
      )

      // POST /enrollment/courses - Enroll in courses for a term
      .post(
        '/courses',
        async ({ body, user }) => {
          const userId = user.id
          const { termId, courseOfferingIds } = body

          // Verify the term exists
          const term = await db.query.institutionalTerm.findFirst({
            where: (t) => eq(t.id, termId)
          })

          if (!term) {
            throw new InvalidTermError()
          }

          // Get user's active program enrollment
          const programEnrollment = await db.query.programEnrollment.findFirst({
            where: (record) =>
              and(eq(record.userId, userId), isNull(record.graduatedOn)),
            orderBy: (record, { desc }) => [desc(record.createdAt)]
          })

          if (!programEnrollment) {
            throw new NotEnrolledError()
          }

          // Create or update term enrollment
          const existingTermEnrollment =
            await db.query.institutionalTermEnrollment.findFirst({
              where: (record) =>
                and(eq(record.userId, userId), eq(record.status, 'active'))
            })

          if (!existingTermEnrollment) {
            await db.insert(termEnrollmentTable).values({
              userId,
              termId,
              status: 'active'
            })
          }

          // Get course offerings
          const offerings = await db.query.courseOffering.findMany({
            where: (offering, { inArray }) =>
              inArray(offering.id, courseOfferingIds),
            with: {
              course: true
            }
          })

          // Create course enrollments
          const enrollments = await db
            .insert(courseEnrollmentTable)
            .values(
              offerings.map((offering) => ({
                userId,
                termId,
                courseId: offering.courseId,
                courseOfferingId: offering.id,
                credits: offering.course.defaultCredits ?? '3',
                status: 'in_progress'
              }))
            )
            .returning()

          return {
            success: true,
            enrolledCount: enrollments.length
          }
        },
        {
          body: enrollCoursesSchema,
          response: enrollCoursesResponseSchema,
          detail: {
            description: 'Enroll in courses for a term',
            summary: 'Enroll Courses',
            tags: ['Academic']
          }
        }
      )

      // GET /enrollment/status - Get user enrollment status
      .get(
        '/status',
        async ({ user }) => {
          const userId = user.id

          // Get the user's active program enrollment
          const programEnrollment = await db.query.programEnrollment.findFirst({
            where: (record) =>
              and(eq(record.userId, userId), isNull(record.graduatedOn)),
            with: {
              program: true
            },
            orderBy: (record, { desc }) => [desc(record.createdAt)]
          })

          if (!programEnrollment) {
            return {
              hasProgram: false,
              hasCourses: false,
              program: null,
              term: null,
              courses: []
            }
          }

          // Get user's active term enrollment
          const termEnrollment =
            await db.query.institutionalTermEnrollment.findFirst({
              where: (record) =>
                and(eq(record.userId, userId), eq(record.status, 'active')),
              with: {
                term: true
              },
              orderBy: (record, { desc }) => [desc(record.createdAt)]
            })

          if (!termEnrollment) {
            return {
              hasProgram: true,
              hasCourses: false,
              program: {
                id: programEnrollment.program.id,
                name: programEnrollment.program.name,
                code: programEnrollment.program.code ?? null
              },
              term: null,
              courses: []
            }
          }

          // Get enrolled courses for the current term
          const enrolledCourses = await db.query.courseEnrollment.findMany({
            where: (record) =>
              and(
                eq(record.userId, userId),
                eq(record.termId, termEnrollment.termId)
              ),
            with: {
              course: true
            }
          })

          return {
            hasProgram: true,
            hasCourses: enrolledCourses.length > 0,
            program: {
              id: programEnrollment.program.id,
              name: programEnrollment.program.name,
              code: programEnrollment.program.code
            },
            term: {
              id: termEnrollment.term.id,
              termName: termEnrollment.term.termName,
              academicYear: termEnrollment.term.academicYear
            },
            courses: enrolledCourses.map((record) => ({
              id: record.id,
              courseId: record.courseId ?? null,
              code: record.course?.code ?? null,
              title: record.course?.title ?? '',
              instructor: null,
              section: null,
              schedule: null
            }))
          }
        },
        {
          response: enrollmentStatusResponseSchema,
          detail: {
            description: 'Get user enrollment status',
            summary: 'Get Enrollment Status',
            tags: ['Academic']
          }
        }
      )

      // GET /enrollment/details - Get full enrollment details
      .get(
        '/details',
        async ({ user }) => {
          const userId = user.id

          // Get the user's active program enrollment
          const programEnrollment = await db.query.programEnrollment.findFirst({
            where: (record) =>
              and(eq(record.userId, userId), isNull(record.graduatedOn)),
            with: {
              program: {
                with: {
                  institution: true
                }
              }
            },
            orderBy: (record, { desc }) => [desc(record.createdAt)]
          })

          if (!programEnrollment) {
            throw new NotEnrolledError()
          }

          // Get user's active term enrollment
          const termEnrollment =
            await db.query.institutionalTermEnrollment.findFirst({
              where: (record) =>
                and(eq(record.userId, userId), eq(record.status, 'active')),
              with: {
                term: true
              },
              orderBy: (record, { desc }) => [desc(record.createdAt)]
            })

          if (!termEnrollment) {
            throw new NotEnrolledError('No active term enrollment found')
          }

          // Get enrolled courses for the current term
          const enrolledCourses = await db.query.courseEnrollment.findMany({
            where: (record) =>
              and(
                eq(record.userId, userId),
                eq(record.termId, termEnrollment.termId)
              ),
            with: {
              course: true,
              courseOffering: true
            }
          })

          return {
            program: {
              id: programEnrollment.program.id,
              name: programEnrollment.program.name,
              code: programEnrollment.program.code,
              institutionId: programEnrollment.program.institutionId
            },
            term: {
              id: termEnrollment.term.id,
              termName: termEnrollment.term.termName,
              academicYear: termEnrollment.term.academicYear
            },
            courses: enrolledCourses.map((record) => {
              // Ensure courseId is included - use direct field access
              const courseId = record.courseId ?? null
              return {
                id: record.id,
                courseId,
                code: record.course?.code ?? null,
                title: record.course?.title ?? '',
                instructor: record.courseOffering?.instructor ?? null,
                section: record.courseOffering?.section ?? null,
                schedule: record.courseOffering?.schedule ?? null
              }
            })
          }
        },
        {
          response: enrollmentDetailsSchema,
          detail: {
            description: 'Get full enrollment details',
            summary: 'Get Enrollment',
            tags: ['Academic']
          }
        }
      )
  )
