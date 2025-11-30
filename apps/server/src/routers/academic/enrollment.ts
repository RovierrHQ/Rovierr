import { ORPCError } from '@orpc/server'
import {
  courseEnrollment as courseEnrollmentTable,
  courseOffering as courseOfferingTable,
  course as courseTable,
  programEnrollment as programEnrollmentTable,
  institutionalTermEnrollment as termEnrollmentTable
} from '@rov/db'
import { and, eq, ilike, isNull, or } from 'drizzle-orm'
import { db } from '@/db'
import { protectedProcedure } from '@/lib/orpc'

export const enrollment = {
  getVerifiedInstitutions:
    protectedProcedure.academic.enrollment.getVerifiedInstitutions.handler(
      async ({ context }) => {
        const userId = context.session.user.id

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
      }
    ),

  getPrograms: protectedProcedure.academic.enrollment.getPrograms.handler(
    async ({ input }) => {
      const { institutionId } = input

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
    }
  ),

  getTerms: protectedProcedure.academic.enrollment.getTerms.handler(
    async ({ input }) => {
      const { institutionId } = input

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
    }
  ),

  getCourses: protectedProcedure.academic.enrollment.getCourses.handler(
    async ({ input }) => {
      const { termId, search } = input

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
    }
  ),

  enrollProgram: protectedProcedure.academic.enrollment.enrollProgram.handler(
    async ({ input, context }) => {
      const userId = context.session.user.id
      const { programId, institutionEnrollmentId, type } = input

      // Check if already enrolled in this program
      const existingEnrollment = await db.query.programEnrollment.findFirst({
        where: (record) =>
          and(eq(record.userId, userId), eq(record.programId, programId))
      })

      if (existingEnrollment) {
        throw new ORPCError('ALREADY_ENROLLED', {
          message: 'Already enrolled in this program'
        })
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
    }
  ),

  enrollCourses: protectedProcedure.academic.enrollment.enrollCourses.handler(
    async ({ input, context }) => {
      const userId = context.session.user.id
      const { termId, courseOfferingIds } = input

      // Verify the term exists
      const term = await db.query.institutionalTerm.findFirst({
        where: (t) => eq(t.id, termId)
      })

      if (!term) {
        throw new ORPCError('INVALID_TERM', {
          message: 'Invalid term'
        })
      }

      // Get user's active program enrollment
      const programEnrollment = await db.query.programEnrollment.findFirst({
        where: (record) =>
          and(eq(record.userId, userId), isNull(record.graduatedOn)),
        orderBy: (record, { desc }) => [desc(record.createdAt)]
      })

      if (!programEnrollment) {
        throw new ORPCError('NOT_ENROLLED', {
          message: 'User not enrolled in any program'
        })
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
    }
  ),

  getEnrollmentStatus:
    protectedProcedure.academic.enrollment.getEnrollmentStatus.handler(
      async ({ context }) => {
        const userId = context.session.user.id

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

        // Get the most recent institutional term for the institution
        const latestTerm = await db.query.institutionalTerm.findFirst({
          where: (term) =>
            eq(term.institutionId, programEnrollment.program.institutionId),
          orderBy: (term, { desc }) => [desc(term.startDate)]
        })

        if (!latestTerm) {
          return {
            hasProgram: true,
            hasCourses: false,
            program: {
              id: programEnrollment.program.id,
              name: programEnrollment.program.name,
              code: programEnrollment.program.code
            },
            term: null,
            courses: []
          }
        }

        // Get enrolled courses for the current term
        const enrolledCourses = await db.query.courseEnrollment.findMany({
          where: (record) => eq(record.termId, latestTerm.id),
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
            id: latestTerm.id,
            termName: latestTerm.termName,
            academicYear: latestTerm.academicYear
          },
          courses: enrolledCourses.map((record) => ({
            id: record.id,
            code: record.course?.code ?? null,
            title: record.course?.title ?? '',
            instructor: null,
            section: null,
            schedule: null
          }))
        }
      }
    ),

  getEnrollment: protectedProcedure.academic.enrollment.getEnrollment.handler(
    async ({ context }) => {
      const userId = context.session.user.id

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
        throw new ORPCError('NOT_ENROLLED', {
          message: 'User not enrolled in any program'
        })
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
        throw new ORPCError('NOT_FOUND', {
          message: 'No active term enrollment found'
        })
      }

      // Get enrolled courses for the current term
      const enrolledCourses = await db.query.courseEnrollment.findMany({
        where: (record) => eq(record.termId, termEnrollment.termId),
        with: {
          course: true,
          courseOffering: true
        }
      })

      return {
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
          code: record.course?.code ?? null,
          title: record.course?.title ?? '',
          instructor: record.courseOffering?.instructor ?? null,
          section: record.courseOffering?.section ?? null,
          schedule: record.courseOffering?.schedule ?? null
        }))
      }
    }
  )
}
