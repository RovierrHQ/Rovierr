import { db } from '@/db'
import { protectedProcedure } from '@/lib/orpc'

export const enrollment = {
  getVerifiedInstitutions:
    protectedProcedure.academic.enrollment.getVerifiedInstitutions.handler(
      async ({ context }) => {
        const userId = context.session.user.id

        // Fetch verified institution enrollments
        const enrollments = await db.query.instituitionEnrollment.findMany({
          where: (enrollmentRecord, { eq, and }) =>
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
        where: (program, { eq }) => eq(program.institutionId, institutionId),
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
        where: (term, { eq }) => eq(term.institutionId, institutionId),
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

  getCourses: protectedProcedure.academic.enrollment.getCourses.handler(() => {
    // TODO: Fetch courses from database
    // For now, return empty array until course schema is implemented
    return {
      courses: []
    }
  }),

  enrollProgram: protectedProcedure.academic.enrollment.enrollProgram.handler(
    () => {
      // TODO: Implement program enrollment
      // For now, return mock success
      return {
        success: true,
        enrollmentId: 'temp-enrollment-id'
      }
    }
  ),

  enrollCourses: protectedProcedure.academic.enrollment.enrollCourses.handler(
    ({ input }) => {
      // TODO: Implement course enrollment
      // For now, return mock success
      return {
        success: true,
        enrolledCount: input.courseOfferingIds.length
      }
    }
  ),

  getEnrollmentStatus:
    protectedProcedure.academic.enrollment.getEnrollmentStatus.handler(() => {
      // TODO: Implement enrollment status check
      // For now, return mock data
      return {
        hasProgram: false,
        hasCourses: false,
        program: null,
        term: null,
        courses: []
      }
    }),

  getEnrollment: protectedProcedure.academic.enrollment.getEnrollment.handler(
    () => {
      // TODO: Implement full enrollment fetch
      // For now, return mock data
      return {
        program: {
          id: '1',
          name: 'B.Sc. in Computer Science',
          code: 'BSC-CS'
        },
        term: {
          id: '1',
          termName: 'Semester 1',
          academicYear: '2024-25'
        },
        courses: []
      }
    }
  )
}
