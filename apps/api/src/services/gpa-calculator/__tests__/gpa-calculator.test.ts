/**
 * Unit Tests for GPA Calculator
 * Tests specific examples, edge cases, and grade validation
 * Validates: Requirements 2.3, 3.2, 8.3, 8.5
 */

import { describe, expect, test } from 'bun:test'
import { type CourseGrade, GPACalculator } from '../index'

const gpaCalculator = new GPACalculator()

describe('GPACalculator - Grade Validation', () => {
  test('validates correct grade formats', () => {
    const validGrades = [
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
    ]

    for (const grade of validGrades) {
      expect(gpaCalculator.validateGrade(grade)).toBe(true)
    }
  })

  test('validates lowercase grades', () => {
    expect(gpaCalculator.validateGrade('a')).toBe(true)
    expect(gpaCalculator.validateGrade('b+')).toBe(true)
    expect(gpaCalculator.validateGrade('c-')).toBe(true)
  })

  test('validates grades with extra whitespace', () => {
    expect(gpaCalculator.validateGrade(' A ')).toBe(true)
    expect(gpaCalculator.validateGrade('  B+  ')).toBe(true)
  })

  test('rejects invalid grade formats', () => {
    const invalidGrades = ['E', 'A++', 'B--', 'Z', '4.0', '', 'Pass', 'Fail']

    for (const grade of invalidGrades) {
      expect(gpaCalculator.validateGrade(grade)).toBe(false)
    }
  })
})

describe('GPACalculator - Grade to Points Conversion', () => {
  test('converts A grades correctly', () => {
    expect(gpaCalculator.gradeToPoints('A+')).toBe(4.0)
    expect(gpaCalculator.gradeToPoints('A')).toBe(4.0)
    expect(gpaCalculator.gradeToPoints('A-')).toBe(3.7)
  })

  test('converts B grades correctly', () => {
    expect(gpaCalculator.gradeToPoints('B+')).toBe(3.3)
    expect(gpaCalculator.gradeToPoints('B')).toBe(3.0)
    expect(gpaCalculator.gradeToPoints('B-')).toBe(2.7)
  })

  test('converts C grades correctly', () => {
    expect(gpaCalculator.gradeToPoints('C+')).toBe(2.3)
    expect(gpaCalculator.gradeToPoints('C')).toBe(2.0)
    expect(gpaCalculator.gradeToPoints('C-')).toBe(1.7)
  })

  test('converts D grades correctly', () => {
    expect(gpaCalculator.gradeToPoints('D+')).toBe(1.3)
    expect(gpaCalculator.gradeToPoints('D')).toBe(1.0)
    expect(gpaCalculator.gradeToPoints('D-')).toBe(0.7)
  })

  test('converts F grade correctly', () => {
    expect(gpaCalculator.gradeToPoints('F')).toBe(0.0)
  })

  test('handles lowercase grades', () => {
    expect(gpaCalculator.gradeToPoints('a')).toBe(4.0)
    expect(gpaCalculator.gradeToPoints('b+')).toBe(3.3)
  })

  test('throws error for invalid grades', () => {
    expect(() => gpaCalculator.gradeToPoints('E')).toThrow(
      'Invalid grade format: E'
    )
    expect(() => gpaCalculator.gradeToPoints('Z')).toThrow(
      'Invalid grade format: Z'
    )
  })
})

describe('GPACalculator - Term GPA Calculation', () => {
  test('calculates GPA for single course', () => {
    const courses: CourseGrade[] = [
      { grade: 'A', credits: '3', status: 'completed' }
    ]

    const gpa = gpaCalculator.calculateTermGPA(courses)
    expect(gpa).toBe('4.00')
  })

  test('calculates GPA for multiple courses with same grade', () => {
    const courses: CourseGrade[] = [
      { grade: 'B+', credits: '3', status: 'completed' },
      { grade: 'B+', credits: '4', status: 'completed' }
    ]

    const gpa = gpaCalculator.calculateTermGPA(courses)
    expect(gpa).toBe('3.30')
  })

  test('calculates weighted GPA correctly', () => {
    const courses: CourseGrade[] = [
      { grade: 'A', credits: '3', status: 'completed' }, // 4.0 * 3 = 12
      { grade: 'B', credits: '4', status: 'completed' } // 3.0 * 4 = 12
    ]
    // Total: 24 points / 7 credits = 3.43

    const gpa = gpaCalculator.calculateTermGPA(courses)
    expect(gpa).toBe('3.43')
  })

  test('calculates GPA with mixed grades', () => {
    const courses: CourseGrade[] = [
      { grade: 'A', credits: '3', status: 'completed' }, // 12
      { grade: 'B+', credits: '3', status: 'completed' }, // 9.9
      { grade: 'C', credits: '3', status: 'completed' }, // 6
      { grade: 'F', credits: '3', status: 'completed' } // 0
    ]
    // Total: 27.9 / 12 = 2.325 -> 2.32

    const gpa = gpaCalculator.calculateTermGPA(courses)
    expect(gpa).toBe('2.32')
  })

  test('returns null for empty course list', () => {
    const gpa = gpaCalculator.calculateTermGPA([])
    expect(gpa).toBeNull()
  })

  test('returns null for term with only withdrawn courses', () => {
    const courses: CourseGrade[] = [
      { grade: 'A', credits: '3', status: 'withdrawn' },
      { grade: 'B', credits: '4', status: 'withdrawn' }
    ]

    const gpa = gpaCalculator.calculateTermGPA(courses)
    expect(gpa).toBeNull()
  })

  test('returns null for term with only in-progress courses', () => {
    const courses: CourseGrade[] = [
      { grade: 'A', credits: '3', status: 'in_progress' },
      { grade: 'B', credits: '4', status: 'in_progress' }
    ]

    const gpa = gpaCalculator.calculateTermGPA(courses)
    expect(gpa).toBeNull()
  })

  test('excludes withdrawn courses from calculation', () => {
    const courses: CourseGrade[] = [
      { grade: 'A', credits: '3', status: 'completed' },
      { grade: 'F', credits: '3', status: 'withdrawn' }
    ]

    const gpa = gpaCalculator.calculateTermGPA(courses)
    expect(gpa).toBe('4.00')
  })

  test('excludes in-progress courses from calculation', () => {
    const courses: CourseGrade[] = [
      { grade: 'A', credits: '3', status: 'completed' },
      { grade: 'F', credits: '3', status: 'in_progress' }
    ]

    const gpa = gpaCalculator.calculateTermGPA(courses)
    expect(gpa).toBe('4.00')
  })

  test('handles courses with different credit values', () => {
    const courses: CourseGrade[] = [
      { grade: 'A', credits: '1', status: 'completed' }, // 4
      { grade: 'B', credits: '6', status: 'completed' } // 18
    ]
    // Total: 22 / 7 = 3.14

    const gpa = gpaCalculator.calculateTermGPA(courses)
    expect(gpa).toBe('3.14')
  })
})

describe('GPACalculator - Journey GPA Calculation', () => {
  test('calculates journey GPA for single term', () => {
    const terms = [{ gpa: '3.50', credits: '12' }]

    const journeyGPA = gpaCalculator.calculateJourneyGPA(terms)
    expect(journeyGPA).toBe('3.50')
  })

  test('calculates weighted journey GPA for multiple terms', () => {
    const terms = [
      { gpa: '4.00', credits: '12' }, // 48
      { gpa: '3.00', credits: '12' } // 36
    ]
    // Total: 84 / 24 = 3.50

    const journeyGPA = gpaCalculator.calculateJourneyGPA(terms)
    expect(journeyGPA).toBe('3.50')
  })

  test('calculates journey GPA with different credit loads', () => {
    const terms = [
      { gpa: '4.00', credits: '15' }, // 60
      { gpa: '3.00', credits: '9' } // 27
    ]
    // Total: 87 / 24 = 3.625 -> 3.63

    const journeyGPA = gpaCalculator.calculateJourneyGPA(terms)
    expect(journeyGPA).toBe('3.63')
  })

  test('returns null for empty terms list', () => {
    const journeyGPA = gpaCalculator.calculateJourneyGPA([])
    expect(journeyGPA).toBeNull()
  })

  test('returns null for terms with no GPA', () => {
    const terms = [
      { gpa: '', credits: '12' },
      { gpa: '', credits: '12' }
    ]

    const journeyGPA = gpaCalculator.calculateJourneyGPA(terms)
    expect(journeyGPA).toBeNull()
  })

  test('skips terms with invalid GPA values', () => {
    const terms = [
      { gpa: '4.00', credits: '12' },
      { gpa: 'invalid', credits: '12' },
      { gpa: '3.00', credits: '12' }
    ]

    const journeyGPA = gpaCalculator.calculateJourneyGPA(terms)
    expect(journeyGPA).toBe('3.50')
  })
})

describe('GPACalculator - Credits Calculation', () => {
  test('calculates term credits for completed courses', () => {
    const courses: CourseGrade[] = [
      { grade: 'A', credits: '3', status: 'completed' },
      { grade: 'B', credits: '4', status: 'completed' }
    ]

    const credits = gpaCalculator.calculateTermCredits(courses)
    expect(credits).toBe('7.0')
  })

  test('excludes withdrawn courses from credit calculation', () => {
    const courses: CourseGrade[] = [
      { grade: 'A', credits: '3', status: 'completed' },
      { grade: 'B', credits: '4', status: 'withdrawn' }
    ]

    const credits = gpaCalculator.calculateTermCredits(courses)
    expect(credits).toBe('3.0')
  })

  test('excludes in-progress courses from credit calculation', () => {
    const courses: CourseGrade[] = [
      { grade: 'A', credits: '3', status: 'completed' },
      { grade: 'B', credits: '4', status: 'in_progress' }
    ]

    const credits = gpaCalculator.calculateTermCredits(courses)
    expect(credits).toBe('3.0')
  })

  test('returns 0.0 for empty course list', () => {
    const credits = gpaCalculator.calculateTermCredits([])
    expect(credits).toBe('0.0')
  })

  test('calculates journey credits from terms', () => {
    const terms = [
      { gpa: '4.00', credits: '12' },
      { gpa: '3.50', credits: '15' }
    ]

    const credits = gpaCalculator.calculateJourneyCredits(terms)
    expect(credits).toBe('27.0')
  })

  test('returns 0.0 for empty terms list', () => {
    const credits = gpaCalculator.calculateJourneyCredits([])
    expect(credits).toBe('0.0')
  })
})

describe('GPACalculator - Edge Cases', () => {
  test('handles all F grades', () => {
    const courses: CourseGrade[] = [
      { grade: 'F', credits: '3', status: 'completed' },
      { grade: 'F', credits: '3', status: 'completed' }
    ]

    const gpa = gpaCalculator.calculateTermGPA(courses)
    expect(gpa).toBe('0.00')
  })

  test('handles all A+ grades', () => {
    const courses: CourseGrade[] = [
      { grade: 'A+', credits: '3', status: 'completed' },
      { grade: 'A+', credits: '4', status: 'completed' }
    ]

    const gpa = gpaCalculator.calculateTermGPA(courses)
    expect(gpa).toBe('4.00')
  })

  test('handles single credit course', () => {
    const courses: CourseGrade[] = [
      { grade: 'A', credits: '1', status: 'completed' }
    ]

    const gpa = gpaCalculator.calculateTermGPA(courses)
    expect(gpa).toBe('4.00')
  })

  test('handles high credit course', () => {
    const courses: CourseGrade[] = [
      { grade: 'B+', credits: '6', status: 'completed' }
    ]

    const gpa = gpaCalculator.calculateTermGPA(courses)
    expect(gpa).toBe('3.30')
  })

  test('handles term with no completed courses returns null', () => {
    const courses: CourseGrade[] = [
      { grade: 'A', credits: '3', status: 'in_progress' },
      { grade: 'B', credits: '3', status: 'withdrawn' }
    ]

    const gpa = gpaCalculator.calculateTermGPA(courses)
    expect(gpa).toBeNull()
  })
})
