/**
 * Academics router handlers for course management operations.
 *
 * This module contains the server-side handlers for academics-related API endpoints,
 * including course listing, enrollment, and creation operations. All handlers use
 * Drizzle ORM for database interactions and follow the ORPC contract definitions.
 */

import { and, eq } from 'drizzle-orm'
import { db } from '@/db'
import {
  course,
  section,
  semesterCourse,
  userCourseEnrollment
} from '@/db/schema'
import { protectedProcedure } from '@/lib/orpc'

export const academics = {
  /**
   * Lists courses for a given university with optional verification filter.
   *
   * @param input - The input parameters containing universityId and optional isVerified flag
   * @returns Object containing array of courses with their details
   */
  listCourses: protectedProcedure.academics.listCourses.handler(
    async ({ input }) => {
      // Build where conditions based on input filters
      const whereConditions = [eq(course.universityId, input.universityId)]
      if (input.isVerified !== undefined) {
        whereConditions.push(eq(course.isVerified, input.isVerified))
      }

      const rawCourses = await db
        .select()
        .from(course)
        .where(and(...whereConditions))

      // Map database rows to API response format
      const courses = rawCourses.map((row) => ({
        id: row.id,
        universityId: row.universityId,
        code: row.code,
        title: row.title,
        description: row.description,
        createdBy: row.createdBy,
        isVerified: Boolean(row.isVerified),
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }))

      return {
        courses
      }
    }
  ),

  /**
   * Retrieves detailed information for a specific course.
   *
   * @param input - The input parameters containing courseId
   * @returns Object containing the course details
   * @throws Error if course is not found
   */
  getCourse: protectedProcedure.academics.getCourse.handler(
    async ({ input }) => {
      const [courseData] = await db
        .select()
        .from(course)
        .where(eq(course.id, input.courseId))
        .limit(1)

      if (!courseData) {
        throw new Error('Course not found')
      }

      return {
        course: {
          id: courseData.id,
          universityId: courseData.universityId,
          code: courseData.code,
          title: courseData.title,
          description: courseData.description,
          createdBy: courseData.createdBy,
          isVerified: Boolean(courseData.isVerified),
          createdAt: courseData.created_at,
          updatedAt: courseData.updated_at
        }
      }
    }
  ),

  /**
   * Lists semester courses for a given semester with course details.
   *
   * @param input - The input parameters containing semesterId
   * @returns Object containing array of semester courses with nested course information
   */
  listSemesterCourses: protectedProcedure.academics.listSemesterCourses.handler(
    async ({ input }) => {
      const rawData = await db
        .select({
          id: semesterCourse.id,
          courseId: semesterCourse.courseId,
          semesterId: semesterCourse.semesterId,
          createdAt: semesterCourse.created_at,
          updatedAt: semesterCourse.updated_at,
          courseId2: course.id,
          courseCode: course.code,
          courseTitle: course.title,
          courseDescription: course.description
        })
        .from(semesterCourse)
        .innerJoin(course, eq(semesterCourse.courseId, course.id))
        .where(eq(semesterCourse.semesterId, input.semesterId))

      // Map joined data to structured response
      const semesterCourses = rawData.map((row) => ({
        id: row.id,
        courseId: row.courseId,
        semesterId: row.semesterId,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        course: {
          id: row.courseId2,
          code: row.courseCode,
          title: row.courseTitle,
          description: row.courseDescription
        }
      }))

      return {
        semesterCourses
      }
    }
  ),

  /**
   * Lists sections for a given semester course.
   *
   * @param input - The input parameters containing semesterCourseId
   * @returns Object containing array of sections
   */
  listSections: protectedProcedure.academics.listSections.handler(
    async ({ input }) => {
      const rawSections = await db
        .select()
        .from(section)
        .where(eq(section.semesterCourseId, input.semesterCourseId))

      // Map database rows to API response format
      const sections = rawSections.map((row) => ({
        id: row.id,
        semesterCourseId: row.semesterCourseId,
        code: row.code,
        schedule: row.schedule,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }))

      return {
        sections
      }
    }
  ),

  /**
   * Enrolls a user in a course section for a specific semester.
   *
   * @param input - The input parameters containing userSemesterId, semesterCourseId, and sectionId
   * @returns Object containing the enrollment details
   * @throws Error if already enrolled
   */
  enrollInCourse: protectedProcedure.academics.enrollInCourse.handler(
    async ({ input }) => {
      // Check if already enrolled in this course
      const [existing] = await db
        .select()
        .from(userCourseEnrollment)
        .where(
          and(
            eq(userCourseEnrollment.userSemesterId, input.userSemesterId),
            eq(userCourseEnrollment.semesterCourseId, input.semesterCourseId)
          )
        )
        .limit(1)

      if (existing) {
        throw new Error('Already enrolled in this course')
      }

      // Create the enrollment record
      const [rawEnrollment] = await db
        .insert(userCourseEnrollment)
        .values({
          userSemesterId: input.userSemesterId,
          semesterCourseId: input.semesterCourseId,
          sectionId: input.sectionId
        })
        .returning()

      // Format the response
      const enrollment = {
        id: rawEnrollment.id,
        userSemesterId: rawEnrollment.userSemesterId,
        semesterCourseId: rawEnrollment.semesterCourseId,
        sectionId: rawEnrollment.sectionId,
        grade: rawEnrollment.grade,
        createdAt: rawEnrollment.created_at,
        updatedAt: rawEnrollment.updated_at
      }

      return {
        enrollment
      }
    }
  ),

  /**
   * Retrieves all course enrollments for a user's semester.
   *
   * @param input - The input parameters containing userSemesterId
   * @returns Object containing array of enrollments with course and section details
   */
  getUserEnrollments: protectedProcedure.academics.getUserEnrollments.handler(
    async ({ input }) => {
      const rawData = await db
        .select({
          id: userCourseEnrollment.id,
          userSemesterId: userCourseEnrollment.userSemesterId,
          semesterCourseId: userCourseEnrollment.semesterCourseId,
          sectionId: userCourseEnrollment.sectionId,
          grade: userCourseEnrollment.grade,
          createdAt: userCourseEnrollment.created_at,
          updatedAt: userCourseEnrollment.updated_at,
          courseId: course.id,
          courseCode: course.code,
          courseTitle: course.title,
          courseDescription: course.description,
          sectionId2: section.id,
          sectionCode: section.code,
          sectionSchedule: section.schedule
        })
        .from(userCourseEnrollment)
        .innerJoin(
          semesterCourse,
          eq(userCourseEnrollment.semesterCourseId, semesterCourse.id)
        )
        .innerJoin(course, eq(semesterCourse.courseId, course.id))
        .innerJoin(section, eq(userCourseEnrollment.sectionId, section.id))
        .where(eq(userCourseEnrollment.userSemesterId, input.userSemesterId))

      // Map joined data to structured enrollments
      const enrollments = rawData.map((row) => ({
        id: row.id,
        userSemesterId: row.userSemesterId,
        semesterCourseId: row.semesterCourseId,
        sectionId: row.sectionId,
        grade: row.grade,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        course: {
          id: row.courseId,
          code: row.courseCode,
          title: row.courseTitle,
          description: row.courseDescription
        },
        section: {
          id: row.sectionId2,
          code: row.sectionCode,
          schedule: row.sectionSchedule
        }
      }))

      return {
        enrollments
      }
    }
  ),

  /**
   * Creates a new user-generated course.
   *
   * @param input - The input parameters containing universityId, code, title, and optional description
   * @param context - The request context containing session information
   * @returns Object containing the created course details
   * @throws Error if course code already exists
   */
  createCourse: protectedProcedure.academics.createCourse.handler(
    async ({ input, context }) => {
      // Check if course code already exists for this university
      const [existing] = await db
        .select()
        .from(course)
        .where(
          and(
            eq(course.universityId, input.universityId),
            eq(course.code, input.code)
          )
        )
        .limit(1)

      if (existing) {
        throw new Error('Course with this code already exists')
      }

      // Insert the new course
      const [newCourse] = await db
        .insert(course)
        .values({
          universityId: input.universityId,
          code: input.code,
          title: input.title,
          description: input.description,
          createdBy: context.session.user.id,
          isVerified: false
        })
        .returning()

      return {
        course: {
          id: newCourse.id,
          universityId: newCourse.universityId,
          code: newCourse.code,
          title: newCourse.title,
          description: newCourse.description,
          createdBy: newCourse.createdBy ?? '', // Ensure string type
          isVerified: Boolean(newCourse.isVerified),
          createdAt: newCourse.created_at,
          updatedAt: newCourse.updated_at
        }
      }
    }
  )
}
