/** biome-ignore-all lint: ok */
import type { DB } from '@rov/db'
import {
  course,
  courseOffering,
  institution,
  institutionalTerm
} from '@rov/db/schema'
import { file } from 'bun'
import { parse } from 'csv-parse/sync'
import { and, eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import type { SeedModule, SeedOptions, SeedResult } from '../types'

interface CourseOfferingCSVRow {
  institution_slug: string
  course_code: string
  term_name: string
  academic_year: string
  section: string
  instructor: string
  capacity: string
  schedule: string
}

interface CourseOfferingRecord {
  id: string
  courseId: string
  termId: string
  section: string | null
  instructor: string | null
  capacity: string | null
  schedule: string | null
  institutionSlug?: string
  courseCode?: string
  termName?: string
  academicYear?: string
}

/**
 * Load course offerings from CSV file
 */
async function loadCourseOfferingsFromCSV(): Promise<CourseOfferingRecord[]> {
  const csvPath = `${import.meta.dir}/../data/course-offerings.csv`
  const csvFile = file(csvPath)
  const csvContent = await csvFile.text()

  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as CourseOfferingCSVRow[]

  return records.map((row) => ({
    id: nanoid(),
    courseId: '', // Will be resolved
    termId: '', // Will be resolved
    section: row.section || null,
    instructor: row.instructor || null,
    capacity: row.capacity || null,
    schedule: row.schedule || null,
    institutionSlug: row.institution_slug,
    courseCode: row.course_code,
    termName: row.term_name,
    academicYear: row.academic_year
  }))
}

/**
 * Validate course offering record
 */
function validateCourseOffering(record: CourseOfferingRecord): boolean {
  return !!(record.courseId && record.termId)
}

/**
 * Course Offering seed module
 */
export const courseOfferingSeed: SeedModule = {
  name: 'course-offering',
  dependencies: ['course', 'institutional-term'], // Depends on courses and terms

  async seed(db: DB, options: SeedOptions): Promise<SeedResult> {
    const startTime = Date.now()
    let data: CourseOfferingRecord[] = []

    // Load from CSV
    try {
      const csvData = await loadCourseOfferingsFromCSV()
      data = [...data, ...csvData]
    } catch (err) {
      // Failed to load CSV
      return {
        tableName: 'course_offering',
        recordsInserted: 0,
        recordsSkipped: 0,
        errors: [
          {
            record: null,
            error: err as Error,
            phase: 'validation'
          }
        ],
        duration: Date.now() - startTime
      }
    }

    for (const offering of data) {
      // First resolve institution ID from slug
      let institutionId: string | null = null
      if (offering.institutionSlug) {
        const inst = await db.query.institution.findFirst({
          where: eq(institution.slug, offering.institutionSlug)
        })
        if (inst) {
          institutionId = inst.id
        }
      }

      // Resolve course ID from code and institution
      if (offering.courseCode && institutionId) {
        const courseRecord = await db.query.course.findFirst({
          where: and(
            eq(course.code, offering.courseCode),
            eq(course.institutionId, institutionId)
          )
        })
        if (courseRecord) {
          offering.courseId = courseRecord.id
        }
      }

      // Resolve term ID from term name, academic year, and institution
      if (offering.termName && offering.academicYear && institutionId) {
        const term = await db.query.institutionalTerm.findFirst({
          where: and(
            eq(institutionalTerm.termName, offering.termName),
            eq(institutionalTerm.academicYear, offering.academicYear),
            eq(institutionalTerm.institutionId, institutionId)
          )
        })
        if (term) {
          offering.termId = term.id
        }
      }
    }

    // Validate records
    const validRecords = data.filter(validateCourseOffering)
    const invalidCount = data.length - validRecords.length

    let inserted = 0
    let skipped = 0
    const errors: SeedResult['errors'] = []

    // Set total for progress tracking
    if (options.progress) {
      options.progress.setTotal(validRecords.length)
    }

    // Insert records
    for (const offering of validRecords) {
      try {
        // Remove helper fields before inserting
        const {
          institutionSlug,
          courseCode,
          termName,
          academicYear,
          ...offeringData
        } = offering
        await db.insert(courseOffering).values(offeringData)
        inserted++
        if (options.progress) {
          options.progress.increment(`${inserted}/${validRecords.length}`)
        }
      } catch (err) {
        skipped++
        errors.push({
          record: offering,
          error: err as Error,
          phase: 'execution'
        })
      }
    }

    if (options.progress) {
      options.progress.complete()
    }

    return {
      tableName: 'course_offering',
      recordsInserted: inserted,
      recordsSkipped: skipped + invalidCount,
      errors,
      duration: Date.now() - startTime
    }
  },

  async clear(db: DB): Promise<void> {
    await db.delete(courseOffering)
  }
}

export default courseOfferingSeed
