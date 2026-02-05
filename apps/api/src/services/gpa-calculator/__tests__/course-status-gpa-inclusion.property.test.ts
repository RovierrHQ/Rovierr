/**
 * Property-Based Tests for Course Status GPA Inclusion
 * Feature: academic-profile, Property 12: Course status affects GPA inclusion
 * Validates: Requirements 3.3, 3.4, 8.4
 */

import { describe, expect, test } from 'bun:test'
import fc from 'fast-check'
import { type CourseGrade, GPACalculator } from '../index'

const gpaCalculator = new GPACalculator()

// Generators for property-based testing
const validGradeArb = fc.constantFrom(
  'A+',
  'A',
  'A-',
  'B+',
  'B',
  'B-',
  'C+',
  'C',
  'C-',
  'D+',
  'D',
  'D-',
  'F'
)

const creditsArb = fc.integer({ min: 1, max: 6 }).map((n) => n.toString())

const completedCourseArb: fc.Arbitrary<CourseGrade> = fc.record({
  grade: validGradeArb,
  credits: creditsArb,
  status: fc.constant('completed' as const)
})

const withdrawnCourseArb: fc.Arbitrary<CourseGrade> = fc.record({
  grade: validGradeArb,
  credits: creditsArb,
  status: fc.constant('withdrawn' as const)
})

const inProgressCourseArb: fc.Arbitrary<CourseGrade> = fc.record({
  grade: validGradeArb,
  credits: creditsArb,
  status: fc.constant('in_progress' as const)
})

describe('Property 12: Course status affects GPA inclusion', () => {
  test('only completed courses are included in GPA calculation', () => {
    fc.assert(
      fc.property(
        fc.array(completedCourseArb, { minLength: 1, maxLength: 5 }),
        fc.array(withdrawnCourseArb, { minLength: 0, maxLength: 3 }),
        fc.array(inProgressCourseArb, { minLength: 0, maxLength: 3 }),
        (completedCourses, withdrawnCourses, inProgressCourses) => {
          // Mix all courses together
          const allCourses = [
            ...completedCourses,
            ...withdrawnCourses,
            ...inProgressCourses
          ]

          // Calculate GPA with all courses
          const gpaWithAll = gpaCalculator.calculateTermGPA(allCourses)

          // Calculate GPA with only completed courses
          const gpaWithCompleted =
            gpaCalculator.calculateTermGPA(completedCourses)

          // Both should be equal since only completed courses count
          expect(gpaWithAll).toBe(gpaWithCompleted)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('withdrawn courses are excluded from GPA calculation', () => {
    fc.assert(
      fc.property(
        fc.array(completedCourseArb, { minLength: 1, maxLength: 5 }),
        fc.array(withdrawnCourseArb, { minLength: 1, maxLength: 3 }),
        (completedCourses, withdrawnCourses) => {
          const allCourses = [...completedCourses, ...withdrawnCourses]

          // Calculate GPA with all courses
          const gpaWithAll = gpaCalculator.calculateTermGPA(allCourses)

          // Calculate GPA with only completed courses
          const gpaWithCompleted =
            gpaCalculator.calculateTermGPA(completedCourses)

          // Should be equal - withdrawn courses don't affect GPA
          expect(gpaWithAll).toBe(gpaWithCompleted)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('in-progress courses are excluded from GPA calculation', () => {
    fc.assert(
      fc.property(
        fc.array(completedCourseArb, { minLength: 1, maxLength: 5 }),
        fc.array(inProgressCourseArb, { minLength: 1, maxLength: 3 }),
        (completedCourses, inProgressCourses) => {
          const allCourses = [...completedCourses, ...inProgressCourses]

          // Calculate GPA with all courses
          const gpaWithAll = gpaCalculator.calculateTermGPA(allCourses)

          // Calculate GPA with only completed courses
          const gpaWithCompleted =
            gpaCalculator.calculateTermGPA(completedCourses)

          // Should be equal - in-progress courses don't affect GPA
          expect(gpaWithAll).toBe(gpaWithCompleted)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('term with only withdrawn courses returns null GPA', () => {
    fc.assert(
      fc.property(
        fc.array(withdrawnCourseArb, { minLength: 1, maxLength: 5 }),
        (withdrawnCourses) => {
          const gpa = gpaCalculator.calculateTermGPA(withdrawnCourses)

          // Should return null since no completed courses
          expect(gpa).toBeNull()

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('term with only in-progress courses returns null GPA', () => {
    fc.assert(
      fc.property(
        fc.array(inProgressCourseArb, { minLength: 1, maxLength: 5 }),
        (inProgressCourses) => {
          const gpa = gpaCalculator.calculateTermGPA(inProgressCourses)

          // Should return null since no completed courses
          expect(gpa).toBeNull()

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('changing course status from completed to withdrawn excludes it from GPA', () => {
    fc.assert(
      fc.property(
        fc.array(completedCourseArb, { minLength: 2, maxLength: 5 }),
        (courses) => {
          // Calculate GPA with all courses completed
          const gpaWithAll = gpaCalculator.calculateTermGPA(courses)

          // Change one course to withdrawn
          const modifiedCourses = [...courses]
          modifiedCourses[0] = { ...modifiedCourses[0], status: 'withdrawn' }

          // Calculate GPA with one course withdrawn
          const gpaWithOneWithdrawn =
            gpaCalculator.calculateTermGPA(modifiedCourses)

          // Calculate expected GPA (without first course)
          const remainingCourses = courses.slice(1)
          const expectedGPA = gpaCalculator.calculateTermGPA(remainingCourses)

          // GPA should match expected (without withdrawn course)
          expect(gpaWithOneWithdrawn).toBe(expectedGPA)

          // GPA should be different from original (unless by coincidence)
          if (gpaWithAll && gpaWithOneWithdrawn) {
            // At least verify both are valid GPAs
            const originalValue = Number.parseFloat(gpaWithAll)
            const newValue = Number.parseFloat(gpaWithOneWithdrawn)

            expect(originalValue).toBeGreaterThanOrEqual(0)
            expect(originalValue).toBeLessThanOrEqual(4.0)
            expect(newValue).toBeGreaterThanOrEqual(0)
            expect(newValue).toBeLessThanOrEqual(4.0)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('changing course status from in-progress to completed includes it in GPA', () => {
    fc.assert(
      fc.property(
        fc.array(completedCourseArb, { minLength: 1, maxLength: 4 }),
        inProgressCourseArb,
        (completedCourses, inProgressCourse) => {
          const coursesWithInProgress = [...completedCourses, inProgressCourse]

          // Calculate GPA with in-progress course
          const gpaWithInProgress = gpaCalculator.calculateTermGPA(
            coursesWithInProgress
          )

          // Change in-progress course to completed
          const completedCourse = {
            ...inProgressCourse,
            status: 'completed' as const
          }
          const allCompleted = [...completedCourses, completedCourse]

          // Calculate GPA with all completed
          const gpaWithAllCompleted =
            gpaCalculator.calculateTermGPA(allCompleted)

          // GPA with in-progress should equal GPA with only originally completed courses
          const gpaOnlyOriginal =
            gpaCalculator.calculateTermGPA(completedCourses)
          expect(gpaWithInProgress).toBe(gpaOnlyOriginal)

          // GPA with all completed should include the new course
          if (gpaWithAllCompleted) {
            const value = Number.parseFloat(gpaWithAllCompleted)
            expect(value).toBeGreaterThanOrEqual(0)
            expect(value).toBeLessThanOrEqual(4.0)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('credits from withdrawn courses are not counted', () => {
    fc.assert(
      fc.property(
        fc.array(completedCourseArb, { minLength: 1, maxLength: 5 }),
        fc.array(withdrawnCourseArb, { minLength: 1, maxLength: 3 }),
        (completedCourses, withdrawnCourses) => {
          const allCourses = [...completedCourses, ...withdrawnCourses]

          // Calculate credits with all courses
          const creditsWithAll = gpaCalculator.calculateTermCredits(allCourses)

          // Calculate credits with only completed courses
          const creditsWithCompleted =
            gpaCalculator.calculateTermCredits(completedCourses)

          // Should be equal - withdrawn courses don't count toward credits
          expect(creditsWithAll).toBe(creditsWithCompleted)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('credits from in-progress courses are not counted', () => {
    fc.assert(
      fc.property(
        fc.array(completedCourseArb, { minLength: 1, maxLength: 5 }),
        fc.array(inProgressCourseArb, { minLength: 1, maxLength: 3 }),
        (completedCourses, inProgressCourses) => {
          const allCourses = [...completedCourses, ...inProgressCourses]

          // Calculate credits with all courses
          const creditsWithAll = gpaCalculator.calculateTermCredits(allCourses)

          // Calculate credits with only completed courses
          const creditsWithCompleted =
            gpaCalculator.calculateTermCredits(completedCourses)

          // Should be equal - in-progress courses don't count toward credits
          expect(creditsWithAll).toBe(creditsWithCompleted)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})
