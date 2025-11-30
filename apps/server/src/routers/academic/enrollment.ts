import {
  courseEnrollment as courseEnrollmentTable,
  programEnrollment as programEnrollmentTable
} from '@rov/db'
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

  getCourses: protectedProcedure.academic.enrollment.getCourses.handler(
    async ({ input }) => {
      const { termId } = input

      // Fetch course offerings for the program and term
      const offerings = await db.query.courseOffering.findMany({
        where: (offering, { eq }) => eq(offering.termId, termId),
        with: {
          course: true
        }
      })

      return {
        courses: offerings.map((offering) => ({
          id: offering.id,
          courseId: offering.course.id,
          code: offering.course.code,
          title: offering.course.title,
          description: offering.course.description,
          instructor: offering.instructor,
          section: offering.section,
          schedule: offering.schedule,
          credits: offering.course.defaultCredits
        }))
      }
    }
  ),

  enrollProgram: protectedProcedure.academic.enrollment.enrollProgram.handler(
    async ({ input, context }) => {
      const userId = context.session.user.id
      const { programId, institutionEnrollmentId, type } = input

      // Check if already enrolled in this program
      const existingEnrollment = await db.query.programEnrollment.findFirst({
        where: (record, { eq, and }) =>
          and(eq(record.userId, userId), eq(record.programId, programId))
      })

      if (existingEnrollment) {
        throw new Error('ALREADY_ENROLLED')
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
    async ({ input }) => {
      const { termId, courseOfferingIds } = input

      // Verify the term exists
      const term = await db.query.institutionalTerm.findFirst({
        where: (t, { eq }) => eq(t.id, termId)
      })

      if (!term) {
        throw new Error('INVALID_TERM')
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
          where: (record, { eq, and, isNull }) =>
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
          where: (term, { eq }) =>
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
          where: (record, { eq }) => eq(record.termId, latestTerm.id),
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
        where: (record, { eq, and, isNull }) =>
          and(eq(record.userId, userId), isNull(record.graduatedOn)),
        with: {
          program: true
        },
        orderBy: (record, { desc }) => [desc(record.createdAt)]
      })

      if (!programEnrollment) {
        throw new Error('NOT_ENROLLED')
      }

      // Get the most recent institutional term
      const latestTerm = await db.query.institutionalTerm.findFirst({
        where: (term, { eq }) =>
          eq(term.institutionId, programEnrollment.program.institutionId),
        orderBy: (term, { desc }) => [desc(term.startDate)]
      })

      if (!latestTerm) {
        throw new Error('NO_TERM_FOUND')
      }

      // Get enrolled courses for the current term
      const enrolledCourses = await db.query.courseEnrollment.findMany({
        where: (record, { eq }) => eq(record.termId, latestTerm.id),
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
          id: latestTerm.id,
          termName: latestTerm.termName,
          academicYear: latestTerm.academicYear
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
