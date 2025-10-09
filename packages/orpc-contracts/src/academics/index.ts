/**
 * ORPC contract definitions for academics-related API endpoints.
 *
 * This module defines the type-safe contracts for course management operations,
 * including course listing, enrollment, and creation. All contracts use Zod
 * schemas for input validation and output typing, ensuring consistency between
 * client and server implementations.
 */

import { oc } from '@orpc/contract'
import { z } from 'zod'

/**
 * Academics API contracts.
 *
 * Contains route definitions for course management, semester offerings,
 * section listings, and user enrollment operations.
 */
export const academics = {
  // Course-related routes
  /**
   * Contract for listing courses with optional verification filter.
   * Supports filtering by university and verification status.
   */
  listCourses: oc
    .route({
      method: 'GET',
      description: 'Gets the list of courses for a university.',
      summary: 'Get List of Courses',
      tags: ['Academics']
    })
    .input(
      z.object({
        universityId: z.string(),
        isVerified: z.boolean().optional()
      })
    )
    .output(
      z.object({
        courses: z.array(
          z.object({
            id: z.string(),
            universityId: z.string(),
            code: z.string(),
            title: z.string(),
            description: z.string().nullable(),
            createdBy: z.string().nullable(),
            isVerified: z.boolean(),
            createdAt: z.string(),
            updatedAt: z.string()
          })
        )
      })
    )
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z
            .string()
            .default('You are not authorized to access this resource')
        })
      },
      NOT_FOUND: {
        data: z.object({
          message: z.string().default('University not found')
        })
      }
    }),

  /**
   * Contract for retrieving detailed information about a specific course.
   */
  getCourse: oc
    .route({
      method: 'GET',
      description: 'Gets details of a specific course.',
      summary: 'Get Course Details',
      tags: ['Academics']
    })
    .input(
      z.object({
        courseId: z.string()
      })
    )
    .output(
      z.object({
        course: z.object({
          id: z.string(),
          universityId: z.string(),
          code: z.string(),
          title: z.string(),
          description: z.string().nullable(),
          createdBy: z.string().nullable(),
          isVerified: z.boolean(),
          createdAt: z.string(),
          updatedAt: z.string()
        })
      })
    )
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z
            .string()
            .default('You are not authorized to access this resource')
        })
      },
      NOT_FOUND: {
        data: z.object({
          message: z.string().default('Course not found')
        })
      }
    }),

  // Semester Course-related routes
  /**
   * Contract for listing courses offered in a specific semester.
   * Returns semester courses with nested course information.
   */
  listSemesterCourses: oc
    .route({
      method: 'GET',
      description: 'Gets the list of courses offered in a semester.',
      summary: 'Get Semester Courses',
      tags: ['Academics']
    })
    .input(
      z.object({
        semesterId: z.string()
      })
    )
    .output(
      z.object({
        semesterCourses: z.array(
          z.object({
            id: z.string(),
            courseId: z.string(),
            semesterId: z.string(),
            course: z.object({
              id: z.string(),
              code: z.string(),
              title: z.string(),
              description: z.string().nullable()
            }),
            createdAt: z.string(),
            updatedAt: z.string()
          })
        )
      })
    )
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z
            .string()
            .default('You are not authorized to access this resource')
        })
      },
      NOT_FOUND: {
        data: z.object({
          message: z.string().default('Semester not found')
        })
      }
    }),

  // Section-related routes
  /**
   * Contract for listing sections available for a semester course.
   * Sections represent different class times/locations for the same course.
   */
  listSections: oc
    .route({
      method: 'GET',
      description: 'Gets the list of sections for a semester course.',
      summary: 'Get Course Sections',
      tags: ['Academics']
    })
    .input(
      z.object({
        semesterCourseId: z.string()
      })
    )
    .output(
      z.object({
        sections: z.array(
          z.object({
            id: z.string(),
            semesterCourseId: z.string(),
            code: z.string(),
            schedule: z.string().nullable(),
            createdAt: z.string(),
            updatedAt: z.string()
          })
        )
      })
    )
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z
            .string()
            .default('You are not authorized to access this resource')
        })
      },
      NOT_FOUND: {
        data: z.object({
          message: z.string().default('Semester course not found')
        })
      }
    }),

  // Enrollment-related routes
  /**
   * Contract for enrolling a user in a specific course section.
   * Prevents duplicate enrollments in the same course.
   */
  enrollInCourse: oc
    .route({
      method: 'POST',
      description: 'Enrolls a user in a course section.',
      summary: 'Enroll in Course',
      tags: ['Academics']
    })
    .input(
      z.object({
        userSemesterId: z.string(),
        semesterCourseId: z.string(),
        sectionId: z.string()
      })
    )
    .output(
      z.object({
        enrollment: z.object({
          id: z.string(),
          userSemesterId: z.string(),
          semesterCourseId: z.string(),
          sectionId: z.string(),
          grade: z.string().nullable(),
          createdAt: z.string(),
          updatedAt: z.string()
        })
      })
    )
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z
            .string()
            .default('You are not authorized to access this resource')
        })
      },
      CONFLICT: {
        data: z.object({
          message: z.string().default('Already enrolled in this course')
        })
      },
      NOT_FOUND: {
        data: z.object({
          message: z.string().default('Section or user semester not found')
        })
      }
    }),

  /**
   * Contract for retrieving all course enrollments for a user's semester.
   * Includes detailed course and section information for each enrollment.
   */
  getUserEnrollments: oc
    .route({
      method: 'GET',
      description: 'Gets the list of course enrollments for a user semester.',
      summary: 'Get User Enrollments',
      tags: ['Academics']
    })
    .input(
      z.object({
        userSemesterId: z.string()
      })
    )
    .output(
      z.object({
        enrollments: z.array(
          z.object({
            id: z.string(),
            userSemesterId: z.string(),
            semesterCourseId: z.string(),
            sectionId: z.string(),
            grade: z.string().nullable(),
            course: z.object({
              id: z.string(),
              code: z.string(),
              title: z.string(),
              description: z.string().nullable()
            }),
            section: z.object({
              id: z.string(),
              code: z.string(),
              schedule: z.string().nullable()
            }),
            createdAt: z.string(),
            updatedAt: z.string()
          })
        )
      })
    )
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z
            .string()
            .default('You are not authorized to access this resource')
        })
      },
      NOT_FOUND: {
        data: z.object({
          message: z.string().default('User semester not found')
        })
      }
    }),

  /**
   * Contract for creating a new user-generated course.
   * Requires university association and unique course code validation.
   */
  createCourse: oc
    .route({
      method: 'POST',
      description: 'Creates a new user-generated course.',
      summary: 'Create Course',
      tags: ['Academics']
    })
    .input(
      z.object({
        universityId: z.string(),
        code: z.string(),
        title: z.string(),
        description: z.string().optional()
      })
    )
    .output(
      z.object({
        course: z.object({
          id: z.string(),
          universityId: z.string(),
          code: z.string(),
          title: z.string(),
          description: z.string().nullable(),
          createdBy: z.string(),
          isVerified: z.boolean(),
          createdAt: z.string(),
          updatedAt: z.string()
        })
      })
    )
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z
            .string()
            .default('You are not authorized to create courses')
        })
      },
      CONFLICT: {
        data: z.object({
          message: z.string().default('Course with this code already exists')
        })
      }
    })
}
