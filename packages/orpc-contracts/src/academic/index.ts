import { oc } from '@orpc/contract'
import { z } from 'zod'

export const academic = {
  enrollment: {
    getVerifiedInstitutions: oc
      .route({
        method: 'GET',
        description:
          'Get verified institution enrollments for the current user',
        summary: 'Get Verified Institutions',
        tags: ['Academic']
      })
      .output(
        z.object({
          institutions: z.array(
            z.object({
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
          )
        })
      )
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        }
      }),

    getPrograms: oc
      .route({
        method: 'GET',
        description: 'Get programs for an institution',
        summary: 'Get Programs',
        tags: ['Academic']
      })
      .input(
        z.object({
          institutionId: z.string()
        })
      )
      .output(
        z.object({
          programs: z.array(
            z.object({
              id: z.string(),
              code: z.string().nullable(),
              name: z.string(),
              description: z.string().nullable(),
              degreeLevel: z.enum([
                'higher_secondary',
                'secondary',
                'primary',
                'undergraduate',
                'postgraduate',
                'diploma',
                'certificate',
                'other'
              ])
            })
          )
        })
      ),

    getTerms: oc
      .route({
        method: 'GET',
        description: 'Get academic terms for an institution',
        summary: 'Get Terms',
        tags: ['Academic']
      })
      .input(
        z.object({
          institutionId: z.string()
        })
      )
      .output(
        z.object({
          terms: z.array(
            z.object({
              id: z.string(),
              termName: z.string(),
              academicYear: z.string(),
              startDate: z.string().nullable(),
              endDate: z.string().nullable()
            })
          )
        })
      ),

    getCourses: oc
      .route({
        method: 'GET',
        description: 'Get courses for a program and term',
        summary: 'Get Courses',
        tags: ['Academic']
      })
      .input(
        z.object({
          termId: z.string(),
          search: z.string().optional()
        })
      )
      .output(
        z.object({
          courses: z.array(
            z.object({
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
          )
        })
      ),

    enrollProgram: oc
      .route({
        method: 'POST',
        description: 'Enroll in a program',
        summary: 'Enroll Program',
        tags: ['Academic']
      })
      .input(
        z.object({
          programId: z.string(),
          institutionEnrollmentId: z.string(),
          type: z
            .enum(['major', 'minor', 'certificate', 'other'])
            .default('major')
        })
      )
      .output(
        z.object({
          success: z.boolean(),
          enrollmentId: z.string()
        })
      )
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        ALREADY_ENROLLED: {
          data: z.object({
            message: z.string().default('Already enrolled in this program')
          })
        }
      }),

    enrollCourses: oc
      .route({
        method: 'POST',
        description: 'Enroll in courses for a term',
        summary: 'Enroll Courses',
        tags: ['Academic']
      })
      .input(
        z.object({
          termId: z.string(),
          courseOfferingIds: z
            .array(z.string())
            .min(1, 'At least one course required')
        })
      )
      .output(
        z.object({
          success: z.boolean(),
          enrolledCount: z.number()
        })
      )
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        INVALID_TERM: {
          data: z.object({
            message: z.string().default('Invalid term')
          })
        }
      }),

    getEnrollmentStatus: oc
      .route({
        method: 'GET',
        description: 'Get user enrollment status',
        summary: 'Get Enrollment Status',
        tags: ['Academic']
      })
      .input(z.object({}))
      .output(
        z.object({
          hasProgram: z.boolean(),
          hasCourses: z.boolean(),
          program: z
            .object({
              id: z.string(),
              name: z.string(),
              code: z.string().nullable()
            })
            .nullable(),
          term: z
            .object({
              id: z.string(),
              termName: z.string(),
              academicYear: z.string()
            })
            .nullable(),
          courses: z.array(
            z.object({
              id: z.string(),
              code: z.string().nullable(),
              title: z.string(),
              instructor: z.string().nullable(),
              section: z.string().nullable(),
              schedule: z.string().nullable()
            })
          )
        })
      ),

    getEnrollment: oc
      .route({
        method: 'GET',
        description: 'Get full enrollment details',
        summary: 'Get Enrollment',
        tags: ['Academic']
      })
      .input(z.object({}))
      .output(
        z.object({
          program: z.object({
            id: z.string(),
            name: z.string(),
            code: z.string().nullable(),
            institutionId: z.string()
          }),
          term: z.object({
            id: z.string(),
            termName: z.string(),
            academicYear: z.string()
          }),
          courses: z.array(
            z.object({
              id: z.string(),
              code: z.string().nullable(),
              title: z.string(),
              instructor: z.string().nullable(),
              section: z.string().nullable(),
              schedule: z.string().nullable()
            })
          )
        })
      )
      .errors({
        NOT_ENROLLED: {
          data: z.object({
            message: z.string().default('User not enrolled in any program')
          })
        }
      })
  }
}
