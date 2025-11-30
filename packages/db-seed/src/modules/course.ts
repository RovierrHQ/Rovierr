/** biome-ignore-all lint: ok */
import type { DB } from '@rov/db'
import { course } from '@rov/db/schema'
import { file } from 'bun'
import { parse } from 'csv-parse/sync'
import { nanoid } from 'nanoid'
import type { SeedModule, SeedOptions, SeedResult } from '../types'

interface CourseCSVRow {
  institution_slug: string
  code: string
  title: string
  description: string
  default_credits: string
  department_code: string
  is_verified: string
}

interface CourseRecord {
  id: string
  institutionId: string
  code: string | null
  title: string
  description: string | null
  defaultCredits: string | null
  departmentId: string | null
  createdBy: string | null
  isVerified: boolean
  institutionSlug?: string
  departmentCode?: string
}

/**
 * Load courses from CSV file
 */
async function loadCoursesFromCSV(): Promise<CourseRecord[]> {
  const csvPath = `${import.meta.dir}/../data/courses.csv`
  const csvFile = file(csvPath)
  const csvContent = await csvFile.text()

  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as CourseCSVRow[]

  return records.map((row) => ({
    id: nanoid(),
    institutionId: '', // Will be resolved from slug
    institutionSlug: row.institution_slug,
    code: row.code || null,
    title: row.title,
    description: row.description || null,
    defaultCredits: row.default_credits || null,
    departmentId: null, // Will be resolved from department_code if provided
    departmentCode: row.department_code || undefined,
    createdBy: null,
    isVerified: row.is_verified === 'true'
  }))
}

/**
 * Validate course record
 */
function validateCourse(record: CourseRecord): boolean {
  return !!(record.institutionId && record.title)
}

/**
 * Course seed module
 */
export const courseSeed: SeedModule = {
  name: 'course',
  dependencies: ['institution'], // Depends on institutions being seeded first

  async seed(db: DB, options: SeedOptions): Promise<SeedResult> {
    const startTime = Date.now()
    let data: CourseRecord[] = []

    // Load from CSV
    try {
      const csvData = await loadCoursesFromCSV()
      data = [...data, ...csvData]
    } catch (err) {
      // Failed to load CSV
      return {
        tableName: 'course',
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

    // Resolve institution IDs from slugs
    const { institution, department } = await import('@rov/db/schema')
    const { eq } = await import('drizzle-orm')

    for (const courseRecord of data) {
      // Resolve institution ID
      if (courseRecord.institutionSlug) {
        const inst = await db.query.institution.findFirst({
          where: eq(institution.slug, courseRecord.institutionSlug)
        })
        if (inst) {
          courseRecord.institutionId = inst.id
        }
      }

      // Department lookup can be added later if needed
      // For now, departmentId will remain null
    }

    // Validate records
    const validRecords = data.filter(validateCourse)
    const invalidCount = data.length - validRecords.length

    let inserted = 0
    let skipped = 0
    const errors: SeedResult['errors'] = []

    // Set total for progress tracking
    if (options.progress) {
      options.progress.setTotal(validRecords.length)
    }

    // Insert records
    for (const courseRecord of validRecords) {
      try {
        // Remove helper fields before inserting
        const { institutionSlug, departmentCode, ...courseData } = courseRecord
        await db.insert(course).values(courseData)
        inserted++
        if (options.progress) {
          options.progress.increment(`${inserted}/${validRecords.length}`)
        }
      } catch (err) {
        skipped++
        errors.push({
          record: courseRecord,
          error: err as Error,
          phase: 'execution'
        })
      }
    }

    if (options.progress) {
      options.progress.complete()
    }

    return {
      tableName: 'course',
      recordsInserted: inserted,
      recordsSkipped: skipped + invalidCount,
      errors,
      duration: Date.now() - startTime
    }
  },

  async clear(db: DB): Promise<void> {
    await db.delete(course)
  }
}

export default courseSeed
