/**
 * GPA Calculator Service
 * Handles all GPA calculations for academic profiles
 */

export interface CourseGrade {
  grade: string
  credits: string
  status: 'in_progress' | 'completed' | 'withdrawn'
}

export interface TermGPA {
  gpa: string
  credits: string
}

/**
 * Grade to grade points mapping
 * Based on standard 4.0 scale
 */
const GRADE_POINTS_MAP: Record<string, number> = {
  'A+': 4.0,
  A: 4.0,
  'A-': 3.7,
  'B+': 3.3,
  B: 3.0,
  'B-': 2.7,
  'C+': 2.3,
  C: 2.0,
  'C-': 1.7,
  'D+': 1.3,
  D: 1.0,
  'D-': 0.7,
  F: 0.0
}

/**
 * Valid grade formats
 */
const VALID_GRADES = Object.keys(GRADE_POINTS_MAP)

export class GPACalculator {
  /**
   * Convert a letter grade to grade points
   * @param grade - Letter grade (e.g., 'A', 'B+', 'C-')
   * @returns Grade points on 4.0 scale
   * @throws Error if grade format is invalid
   */
  gradeToPoints(grade: string): number {
    const normalizedGrade = grade.trim().toUpperCase()

    if (!(normalizedGrade in GRADE_POINTS_MAP)) {
      throw new Error(`Invalid grade format: ${grade}`)
    }

    return GRADE_POINTS_MAP[normalizedGrade]
  }

  /**
   * Validate if a grade string is in valid format
   * @param grade - Grade string to validate
   * @returns true if valid, false otherwise
   */
  validateGrade(grade: string): boolean {
    const normalizedGrade = grade.trim().toUpperCase()
    return VALID_GRADES.includes(normalizedGrade)
  }

  /**
   * Calculate GPA for a term based on course enrollments
   * Only includes completed courses in calculation
   * @param enrollments - Array of course enrollments with grades and credits
   * @returns GPA as string (for precision) or null if no completed courses
   */
  calculateTermGPA(enrollments: CourseGrade[]): string | null {
    // Filter to only completed courses
    const completedCourses = enrollments.filter(
      (e) => e.status === 'completed' && e.grade
    )

    if (completedCourses.length === 0) {
      return null
    }

    let totalPoints = 0
    let totalCredits = 0

    for (const enrollment of completedCourses) {
      try {
        if (!enrollment.grade) {
          continue
        }

        const gradePoints = this.gradeToPoints(enrollment.grade)
        const credits = Number.parseFloat(enrollment.credits)

        if (Number.isNaN(credits) || credits < 0) {
          throw new Error(`Invalid credits: ${enrollment.credits}`)
        }

        totalPoints += gradePoints * credits
        totalCredits += credits
      } catch {
        // Skip invalid enrollments
      }
    }

    if (totalCredits === 0) {
      return null
    }

    const gpa = totalPoints / totalCredits
    return gpa.toFixed(2)
  }

  /**
   * Calculate cumulative GPA for a journey based on term GPAs
   * Weighted average of all term GPAs by credits
   * @param terms - Array of terms with GPA and credits
   * @returns Cumulative GPA as string or null if no terms with GPA
   */
  calculateJourneyGPA(terms: TermGPA[]): string | null {
    // Filter to only terms with GPA
    const termsWithGPA = terms.filter((t) => t.gpa && t.credits)

    if (termsWithGPA.length === 0) {
      return null
    }

    let totalPoints = 0
    let totalCredits = 0

    for (const term of termsWithGPA) {
      try {
        const termGPA = Number.parseFloat(term.gpa)
        const termCredits = Number.parseFloat(term.credits)

        if (Number.isNaN(termGPA) || Number.isNaN(termCredits)) {
          continue
        }

        if (termGPA < 0 || termGPA > 4.0) {
          throw new Error(`Invalid GPA value: ${termGPA}`)
        }

        if (termCredits < 0) {
          throw new Error(`Invalid credits: ${termCredits}`)
        }

        totalPoints += termGPA * termCredits
        totalCredits += termCredits
      } catch {
        // Skip invalid terms
      }
    }

    if (totalCredits === 0) {
      return null
    }

    const cumulativeGPA = totalPoints / totalCredits
    return cumulativeGPA.toFixed(2)
  }

  /**
   * Calculate total credits for a term
   * Only includes completed courses
   * @param enrollments - Array of course enrollments
   * @returns Total credits as string
   */
  calculateTermCredits(enrollments: CourseGrade[]): string {
    const completedCourses = enrollments.filter((e) => e.status === 'completed')

    let totalCredits = 0

    for (const enrollment of completedCourses) {
      const credits = Number.parseFloat(enrollment.credits)
      if (!Number.isNaN(credits) && credits >= 0) {
        totalCredits += credits
      }
    }

    return totalCredits.toFixed(1)
  }

  /**
   * Calculate total credits for a journey
   * Sum of all term credits
   * @param terms - Array of terms with credits
   * @returns Total credits as string
   */
  calculateJourneyCredits(terms: TermGPA[]): string {
    let totalCredits = 0

    for (const term of terms) {
      if (term.credits) {
        const credits = Number.parseFloat(term.credits)
        if (!Number.isNaN(credits) && credits >= 0) {
          totalCredits += credits
        }
      }
    }

    return totalCredits.toFixed(1)
  }
}

// Export singleton instance
export const gpaCalculator = new GPACalculator()
