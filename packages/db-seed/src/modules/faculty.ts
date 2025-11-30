/** biome-ignore-all lint: ok */
import type { DB } from '@rov/db'
import { faculty, institution } from '@rov/db/schema'
import { file } from 'bun'
import { parse } from 'csv-parse/sync'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import type {
  PrepareDataResult,
  SeedModule,
  SeedOptions,
  SeedResult
} from '../types'
import { chunk, DEFAULT_BATCH_SIZE } from '../utils/batch'

interface FacultyCSVRow {
  institutionSlug: string
  name: string
  description?: string
  website?: string
}

interface FacultyRecord {
  id: string
  institutionId: string
  name: string
  description?: string
  website?: string
}

/**
 * Load faculties from CSV file
 */
async function loadFacultiesFromCSV(db: DB): Promise<FacultyRecord[]> {
  const csvPath = `${import.meta.dir}/../data/cuhk-faculties.csv`
  const csvFile = file(csvPath)
  const csvContent = await csvFile.text()

  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as FacultyCSVRow[]

  // Get all institutions to map slugs to IDs
  const institutions = await db.select().from(institution)
  const institutionMap = new Map(
    institutions.map((inst) => [inst.slug, inst.id])
  )

  const facultyRecords: FacultyRecord[] = []

  for (const row of records) {
    const institutionId = institutionMap.get(row.institutionSlug)
    if (!institutionId) {
      console.warn(`Institution not found for slug: ${row.institutionSlug}`)
      continue
    }

    facultyRecords.push({
      id: nanoid(),
      institutionId,
      name: row.name,
      description: row.description || undefined,
      website: row.website || undefined
    })
  }

  return facultyRecords
}

/**
 * Validate faculty record
 */
function validateFaculty(record: FacultyRecord): boolean {
  return !!(record.name && record.institutionId)
}

/**
 * Faculty seed module
 */
export const facultySeed: SeedModule<{ faculties: FacultyRecord[] }> = {
  name: 'faculty',
  dependencies: ['institution'],

  async prepareData(db: DB, options: SeedOptions) {
    let data: FacultyRecord[] = []

    // Load from CSV
    try {
      const csvData = await loadFacultiesFromCSV(db)
      data = [...data, ...csvData]
    } catch (error) {
      console.error('Failed to load faculties from CSV:', error)
    }

    // Validate records
    const validRecords = data.filter(validateFaculty)

    return {
      data: { faculties: validRecords },
      invalidCount: data.length - validRecords.length
    }
  },

  async seed(db: DB, options: SeedOptions): Promise<SeedResult> {
    const startTime = Date.now()

    // Get prepared data
    const { data, invalidCount = 0 } = await facultySeed.prepareData(
      db,
      options
    )
    const validRecords = data.faculties

    let inserted = 0
    let skipped = 0
    const errors: SeedResult['errors'] = []

    // Set total for progress tracking
    if (options.progress) {
      options.progress.setTotal(validRecords.length)
    }

    // Pre-load existing faculties for conflict detection
    const existingFaculties = await db.select().from(faculty)
    const existingMap = new Map<string, (typeof existingFaculties)[0]>()
    for (const existing of existingFaculties) {
      const key = `${existing.institutionId}|${existing.name}`
      existingMap.set(key, existing)
    }

    // Separate records into inserts and updates
    const toInsert: FacultyRecord[] = []
    const toUpdate: Array<{ id: string; data: FacultyRecord }> = []

    for (const fac of validRecords) {
      const key = `${fac.institutionId}|${fac.name}`
      const existing = existingMap.get(key)

      if (existing) {
        toUpdate.push({ id: existing.id, data: fac })
      } else {
        toInsert.push(fac)
      }
    }

    // Batch insert new records
    if (toInsert.length > 0) {
      const insertBatches = chunk(toInsert, DEFAULT_BATCH_SIZE)
      for (const batch of insertBatches) {
        try {
          await db.insert(faculty).values(batch)
          inserted += batch.length
          if (options.progress) {
            options.progress.increment(
              `${inserted}/${validRecords.length}`,
              batch.length
            )
          }
        } catch (err) {
          // If batch fails, try individual inserts
          for (const fac of batch) {
            try {
              await db.insert(faculty).values(fac)
              inserted++
              if (options.progress) {
                options.progress.increment(`${inserted}/${validRecords.length}`)
              }
            } catch (individualErr) {
              skipped++
              errors.push({
                record: fac,
                error: individualErr as Error,
                phase: 'execution'
              })
            }
          }
        }
      }
    }

    // Batch update existing records
    if (toUpdate.length > 0) {
      const updateBatches = chunk(toUpdate, DEFAULT_BATCH_SIZE)
      for (const batch of updateBatches) {
        for (const { id, data } of batch) {
          try {
            await db
              .update(faculty)
              .set({
                description: data.description,
                website: data.website
              })
              .where(eq(faculty.id, id))
            inserted++
            if (options.progress) {
              options.progress.increment(`${inserted}/${validRecords.length}`)
            }
          } catch (err) {
            skipped++
            errors.push({
              record: data,
              error: err as Error,
              phase: 'execution'
            })
          }
        }
      }
    }

    if (options.progress) {
      options.progress.complete()
    }

    return {
      tableName: 'faculty',
      recordsInserted: inserted,
      recordsSkipped: skipped,
      errors,
      duration: Date.now() - startTime
    }
  },

  async clear(db: DB): Promise<void> {
    await db.delete(faculty)
  }
}

export default facultySeed
