/** biome-ignore-all lint: ok */

import type { DB } from '@rov/db'
import {
  course,
  courseOffering,
  institution,
  institutionalTerm
} from '@rov/db/schema'
import { file, Glob } from 'bun'
import { and, eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import type {
  PrepareDataResult,
  SeedModule,
  SeedOptions,
  SeedResult
} from '../types'

interface CourseJSON {
  code: string
  title: string
  career: string
  units: string
  grading: string
  components: string
  campus: string
  academic_group: string
  requirements: string
  description: string
  outcome: string
  syllabus: string
  required_readings: string
  recommended_readings: string
  terms?: {
    [termName: string]: {
      [sectionName: string]: {
        startTimes: string[]
        endTimes: string[]
        days: number[]
        locations: string[]
        instructors: string[]
        meetingDates: string[]
      }
    }
  }
  assessments?: Record<string, string>
}

interface CourseRecord {
  id: string
  institutionId: string
  code: string
  title: string
  description: string | null
  defaultCredits: string | null
  departmentId: string | null
  createdBy: string | null
  isVerified: boolean
}

interface CourseOfferingRecord {
  id: string
  courseId: string
  termId: string
  section: string | null
  instructor: string | null
  capacity: string | null
  schedule: string | null
}

interface CourseOfferingWithHelpers extends CourseOfferingRecord {
  termName?: string
  academicYear?: string
}

/**
 * Load all course JSON files from the courses directory
 */
async function loadCoursesFromJSON(institutionId: string): Promise<{
  courses: CourseRecord[]
  offerings: CourseOfferingWithHelpers[]
}> {
  const coursesPath = `${import.meta.dir}/../data/courses`

  // Use Bun's Glob to find all JSON files
  const glob = new Glob('*.json')
  const files = glob.scanSync(coursesPath)

  const allCourses: CourseRecord[] = []
  const allOfferings: CourseOfferingRecord[] = []

  for (const fileName of files) {
    const departmentCode = fileName.replace('.json', '')
    const jsonPath = `${coursesPath}/${fileName}`
    const jsonFile = file(jsonPath)
    const jsonContent = await jsonFile.text()

    try {
      const coursesData = JSON.parse(jsonContent) as CourseJSON[]

      for (const courseData of coursesData) {
        const courseId = nanoid()
        const fullCode = `${departmentCode}${courseData.code}`

        // Create course record
        const courseRecord: CourseRecord = {
          id: courseId,
          institutionId,
          code: fullCode,
          title: courseData.title,
          description: courseData.description || null,
          defaultCredits: courseData.units || null,
          departmentId: null,
          createdBy: null,
          isVerified: true
        }

        allCourses.push(courseRecord)

        // Create course offerings from terms
        if (courseData.terms) {
          for (const [termName, sections] of Object.entries(courseData.terms)) {
            for (const [sectionName, sectionData] of Object.entries(sections)) {
              // Extract section code (e.g., "A-LEC (6949)" -> "A")
              const sectionMatch = sectionName.match(/^([A-Z0-9]+)-/)
              const sectionCode = sectionMatch ? sectionMatch[1] : sectionName

              // Build schedule string
              const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
              const scheduleStr = sectionData.days
                .map((day, idx) => {
                  const dayName = dayNames[day]
                  const startTime = sectionData.startTimes[idx] || ''
                  const endTime = sectionData.endTimes[idx] || ''
                  return `${dayName} ${startTime}-${endTime}`
                })
                .join(' / ')

              const offeringRecord: CourseOfferingWithHelpers = {
                id: nanoid(),
                courseId,
                termId: '', // Will be resolved later
                section: sectionCode || null,
                instructor: sectionData.instructors[0] || null,
                capacity: null,
                schedule: scheduleStr || null,
                termName: termName, // Helper field for resolution
                academicYear: '' // Helper field for resolution
              }

              // Parse term name to extract academic year
              // e.g., "2025-26 Term 1" -> academicYear: "2025-26", termName: "Fall Semester"
              const termMatch = termName.match(/^(\d{4}-\d{2})\s+Term\s+(\d+)/)
              if (termMatch && termMatch[1] && termMatch[2]) {
                const academicYear = termMatch[1]
                const termNumber = termMatch[2]

                // Map term number to term name
                const termNameMap: Record<string, string> = {
                  '1': 'Fall Semester',
                  '2': 'Spring Semester'
                }

                ;(offeringRecord as any).academicYear = academicYear
                ;(offeringRecord as any).termName =
                  termNameMap[termNumber] || termName
              }

              allOfferings.push(offeringRecord)
            }
          }
        }
      }
    } catch (err) {
      console.warn(`Failed to parse ${fileName}:`, err)
    }
  }

  return { courses: allCourses, offerings: allOfferings }
}

/**
 * CUHK Courses JSON seed module
 */
export const cuhkCoursesJsonSeed: SeedModule<{
  courses: CourseRecord[]
  offerings: CourseOfferingWithHelpers[]
}> = {
  name: 'cuhk-courses',
  dependencies: ['institution', 'institutional-term'],

  async prepareData(db: DB, options: SeedOptions) {
    // Get CUHK institution ID
    const cuhkInstitution = await db.query.institution.findFirst({
      where: eq(institution.slug, 'cuhk')
    })

    if (!cuhkInstitution) {
      return {
        data: { courses: [], offerings: [] },
        invalidCount: 0
      }
    }

    // Load courses and offerings from JSON
    const { courses, offerings } = await loadCoursesFromJSON(cuhkInstitution.id)

    return {
      data: { courses, offerings },
      invalidCount: 0
    }
  },

  async seed(db: DB, options: SeedOptions): Promise<SeedResult> {
    const startTime = Date.now()
    const errors: SeedResult['errors'] = []

    // Get CUHK institution ID
    const { eq, and } = await import('drizzle-orm')

    const cuhkInstitution = await db.query.institution.findFirst({
      where: eq(institution.slug, 'cuhk')
    })

    if (!cuhkInstitution) {
      return {
        tableName: 'course',
        recordsInserted: 0,
        recordsSkipped: 0,
        errors: [
          {
            record: null,
            error: new Error('CUHK institution not found'),
            phase: 'validation'
          }
        ],
        duration: Date.now() - startTime
      }
    }

    // Get prepared data
    const { data } = await this.prepareData(db, options)
    const { courses, offerings } = data

    let coursesInserted = 0
    let coursesSkipped = 0
    let offeringsInserted = 0
    let offeringsSkipped = 0

    // Set total for progress tracking
    const totalItems = courses.length + offerings.length
    if (options.progress) {
      options.progress.setTotal(totalItems)
    }

    // Insert courses
    for (const courseRecord of courses) {
      try {
        await db.insert(course).values(courseRecord)
        coursesInserted++
        if (options.progress) {
          options.progress.increment(
            `Courses: ${coursesInserted}/${courses.length}`
          )
        }
      } catch (err) {
        coursesSkipped++
        errors.push({
          record: courseRecord,
          error: err as Error,
          phase: 'execution'
        })
      }
    }

    // Resolve term IDs and insert offerings
    for (const offering of offerings) {
      try {
        const termName = offering.termName
        const academicYear = offering.academicYear

        if (termName && academicYear) {
          const term = await db.query.institutionalTerm.findFirst({
            where: and(
              eq(institutionalTerm.termName, termName),
              eq(institutionalTerm.academicYear, academicYear),
              eq(institutionalTerm.institutionId, cuhkInstitution.id)
            )
          })

          if (term) {
            offering.termId = term.id

            // Remove helper fields
            const {
              termName: _,
              academicYear: __,
              ...offeringData
            } = offering as any

            await db.insert(courseOffering).values(offeringData)
            offeringsInserted++
            if (options.progress) {
              options.progress.increment(
                `Offerings: ${offeringsInserted}/${offerings.length}`
              )
            }
          } else {
            offeringsSkipped++
          }
        } else {
          offeringsSkipped++
        }
      } catch (err) {
        offeringsSkipped++
        errors.push({
          record: offering,
          error: err as Error,
          phase: 'execution'
        })
      }
    }

    // Mark progress as complete
    if (options.progress) {
      options.progress.complete()
    }

    return {
      tableName: 'course + course_offering',
      recordsInserted: coursesInserted + offeringsInserted,
      recordsSkipped: coursesSkipped + offeringsSkipped,
      errors,
      duration: Date.now() - startTime
    }
  },

  async clear(db: DB): Promise<void> {
    // Clear CUHK courses only
    const { institution, course: courseTable } = await import('@rov/db/schema')
    const { eq } = await import('drizzle-orm')

    const cuhkInstitution = await db.query.institution.findFirst({
      where: eq(institution.slug, 'cuhk')
    })

    if (cuhkInstitution) {
      await db
        .delete(courseTable)
        .where(eq(courseTable.institutionId, cuhkInstitution.id))
    }
  }
}

export default cuhkCoursesJsonSeed
