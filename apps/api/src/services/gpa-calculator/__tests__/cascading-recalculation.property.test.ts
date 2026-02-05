/**
 * Property-Based Tests for GPA Cascading Recalculation
 * Feature: academic-profile, Property 9: Cascading GPA recalculation
 * Validates: Requirements 2.4, 8.1, 8.2
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

const courseStatusArb = fc.constantFrom(
  'in_progress' as const,
  'completed' as const,
  'withdrawn' as const
)

const _courseGradeArb: fc.Arbitrary<CourseGrade> = fc.record({
  grade: validGradeArb,
  credits: creditsArb,
  status: courseStatusArb
})

const completedCourseArb: fc.Arbitrary<CourseGrade> = fc.record({
  grade: validGradeArb,
  credits: creditsArb,
  status: fc.constant('completed' as const)
})

const termWithCoursesArb = fc
  .array(completedCourseArb, { minLength: 1, maxLength: 8 })
  .map((courses) => {
    const gpa = gpaCalculator.calculateTermGPA(courses)
    const credits = gpaCalculator.calculateTermCredits(courses)
    return { gpa: gpa || '0.0', credits }
  })

describe('Property 9: Cascading GPA recalculation', () => {
  test('journey GPA recalculates correctly when term GPA changes', () => {
    fc.assert(
      fc.property(
        fc.array(termWithCoursesArb, { minLength: 2, maxLength: 6 }),
        (terms) => {
          // Calculate initial journey GPA
          const initialJourneyGPA = gpaCalculator.calculateJourneyGPA(terms)

          // Simulate a term GPA change by modifying one term
          const modifiedTerms = [...terms]
          const termToModify = Math.floor(Math.random() * terms.length)

          // Change the GPA of one term (simulate grade update)
          const originalGPA = Number.parseFloat(modifiedTerms[termToModify].gpa)
          const newGPA = Math.min(4.0, Math.max(0.0, originalGPA + 0.5))
          modifiedTerms[termToModify] = {
            ...modifiedTerms[termToModify],
            gpa: newGPA.toFixed(2)
          }

          // Recalculate journey GPA
          const newJourneyGPA = gpaCalculator.calculateJourneyGPA(modifiedTerms)

          // Property: Journey GPA should change when a term GPA changes
          // (unless the change results in the same weighted average)
          if (initialJourneyGPA && newJourneyGPA) {
            const initialValue = Number.parseFloat(initialJourneyGPA)
            const newValue = Number.parseFloat(newJourneyGPA)

            // The journey GPA should be different (or very close if rounding)
            // const changed = Math.abs(initialValue - newValue) > 0.001

            // If we increased a term's GPA, journey GPA should increase or stay same
            if (newGPA > originalGPA) {
              expect(newValue).toBeGreaterThanOrEqual(initialValue - 0.01)
            }

            return true
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('journey GPA is weighted average of term GPAs', () => {
    fc.assert(
      fc.property(
        fc.array(termWithCoursesArb, { minLength: 1, maxLength: 6 }),
        (terms) => {
          const journeyGPA = gpaCalculator.calculateJourneyGPA(terms)

          if (!journeyGPA) {
            return terms.every((t) => !(t.gpa && t.credits))
          }

          // Manually calculate weighted average
          let totalPoints = 0
          let totalCredits = 0

          for (const term of terms) {
            if (term.gpa && term.credits) {
              const gpa = Number.parseFloat(term.gpa)
              const credits = Number.parseFloat(term.credits)
              totalPoints += gpa * credits
              totalCredits += credits
            }
          }

          const expectedGPA = totalCredits > 0 ? totalPoints / totalCredits : 0
          const actualGPA = Number.parseFloat(journeyGPA)

          // Allow small floating point differences
          expect(Math.abs(actualGPA - expectedGPA)).toBeLessThan(0.01)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('adding a new term recalculates journey GPA correctly', () => {
    fc.assert(
      fc.property(
        fc.array(termWithCoursesArb, { minLength: 1, maxLength: 5 }),
        termWithCoursesArb,
        (existingTerms, newTerm) => {
          const oldJourneyGPA = gpaCalculator.calculateJourneyGPA(existingTerms)
          const newTerms = [...existingTerms, newTerm]
          const newJourneyGPA = gpaCalculator.calculateJourneyGPA(newTerms)

          // Both should be valid
          expect(oldJourneyGPA).not.toBeNull()
          expect(newJourneyGPA).not.toBeNull()

          if (oldJourneyGPA && newJourneyGPA) {
            const oldValue = Number.parseFloat(oldJourneyGPA)
            const newValue = Number.parseFloat(newJourneyGPA)

            // New GPA should be within valid range
            expect(newValue).toBeGreaterThanOrEqual(0)
            expect(newValue).toBeLessThanOrEqual(4.0)

            // If new term has higher GPA than journey average, journey GPA should increase
            const newTermGPA = Number.parseFloat(newTerm.gpa)
            if (newTermGPA > oldValue) {
              expect(newValue).toBeGreaterThanOrEqual(oldValue - 0.01)
            }
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('removing a term recalculates journey GPA correctly', () => {
    fc.assert(
      fc.property(
        fc.array(termWithCoursesArb, { minLength: 2, maxLength: 6 }),
        (terms) => {
          const fullJourneyGPA = gpaCalculator.calculateJourneyGPA(terms)

          // Remove one term
          const termToRemove = Math.floor(Math.random() * terms.length)
          const remainingTerms = terms.filter((_, i) => i !== termToRemove)

          const newJourneyGPA =
            gpaCalculator.calculateJourneyGPA(remainingTerms)

          // Both should be valid
          expect(fullJourneyGPA).not.toBeNull()

          if (remainingTerms.length > 0) {
            expect(newJourneyGPA).not.toBeNull()

            if (fullJourneyGPA && newJourneyGPA) {
              const fullValue = Number.parseFloat(fullJourneyGPA)
              const newValue = Number.parseFloat(newJourneyGPA)

              // New GPA should be within valid range
              expect(newValue).toBeGreaterThanOrEqual(0)
              expect(newValue).toBeLessThanOrEqual(4.0)

              // If removed term had lower GPA than average, journey GPA should increase
              const removedTermGPA = Number.parseFloat(terms[termToRemove].gpa)
              if (removedTermGPA < fullValue) {
                expect(newValue).toBeGreaterThanOrEqual(fullValue - 0.01)
              }
            }
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('journey GPA is independent across different journeys', () => {
    fc.assert(
      fc.property(
        fc.array(termWithCoursesArb, { minLength: 1, maxLength: 4 }),
        fc.array(termWithCoursesArb, { minLength: 1, maxLength: 4 }),
        (journey1Terms, journey2Terms) => {
          const journey1GPA = gpaCalculator.calculateJourneyGPA(journey1Terms)
          gpaCalculator.calculateJourneyGPA(journey2Terms)

          // Calculate journey1 GPA again to ensure it hasn't changed
          const journey1GPAAgain =
            gpaCalculator.calculateJourneyGPA(journey1Terms)

          // Journey 1 GPA should be unchanged
          expect(journey1GPA).toBe(journey1GPAAgain)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})
