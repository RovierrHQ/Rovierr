/** biome-ignore-all lint: ok */
import type { DB } from '@rov/db'
import { institution, program } from '@rov/db/schema'
import { file } from 'bun'
import { parse } from 'csv-parse/sync'
import { nanoid } from 'nanoid'
import type { SeedModule, SeedOptions, SeedResult } from '../types'

interface ProgramCSVRow {
  institutionSlug: string
  code: string
  name: string
  description?: string
  degreeLevel:
    | 'higher_secondary'
    | 'secondary'
    | 'primary'
    | 'undergraduate'
    | 'postgraduate'
    | 'diploma'
    | 'certificate'
    | 'other'
  isVerified: string
}

interface ProgramRecord {
  id: string
  institutionId: string
  code: string
  name: string
  description?: string
  degreeLevel:
    | 'higher_secondary'
    | 'secondary'
    | 'primary'
    | 'undergraduate'
    | 'postgraduate'
    | 'diploma'
    | 'certificate'
    | 'other'
  isVerified: boolean
}

/**
 * Load programs from CSV file
 */
async function loadProgramsFromCSV(db: DB): Promise<ProgramRecord[]> {
  const csvPath = `${import.meta.dir}/../data/cuhk-programs.csv`
  const csvFile = file(csvPath)
  const csvContent = await csvFile.text()

  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as ProgramCSVRow[]

  // Get all institutions to map slugs to IDs
  const institutions = await db.select().from(institution)
  const institutionMap = new Map(
    institutions.map((inst) => [inst.slug, inst.id])
  )

  const programRecords: ProgramRecord[] = []

  for (const row of records) {
    const institutionId = institutionMap.get(row.institutionSlug)
    if (!institutionId) {
      console.warn(`Institution not found for slug: ${row.institutionSlug}`)
      continue
    }

    programRecords.push({
      id: nanoid(),
      institutionId,
      code: row.code,
      name: row.name,
      description: row.description || undefined,
      degreeLevel: row.degreeLevel,
      isVerified: row.isVerified === 'true'
    })
  }

  return programRecords
}

/**
 * Validate program record
 */
function validateProgram(record: ProgramRecord): boolean {
  return !!(record.name && record.institutionId && record.degreeLevel)
}

/**
 * Program seed module
 */
export const programSeed: SeedModule = {
  name: 'program',
  dependencies: ['institution'],

  async seed(db: DB, options: SeedOptions): Promise<SeedResult> {
    const startTime = Date.now()
    let data: ProgramRecord[] = []

    // Load from CSV
    try {
      const csvData = await loadProgramsFromCSV(db)
      data = [...data, ...csvData]
    } catch (error) {
      console.error('Failed to load programs from CSV:', error)
    }

    // Validate records
    const validRecords = data.filter(validateProgram)
    const invalidCount = data.length - validRecords.length

    if (invalidCount > 0) {
      console.warn(`Skipped ${invalidCount} invalid program records`)
    }

    let inserted = 0
    let skipped = 0
    const errors: SeedResult['errors'] = []

    // Set total for progress tracking
    if (options.progress) {
      options.progress.setTotal(validRecords.length)
    }

    // Insert records
    for (const prog of validRecords) {
      try {
        await db
          .insert(program)
          .values({
            id: prog.id,
            institutionId: prog.institutionId,
            code: prog.code,
            name: prog.name,
            description: prog.description,
            degreeLevel: prog.degreeLevel,
            isVerified: prog.isVerified
          })
          .onConflictDoUpdate({
            target: [program.institutionId, program.code],
            set: {
              name: prog.name,
              description: prog.description,
              degreeLevel: prog.degreeLevel,
              isVerified: prog.isVerified
            }
          })

        inserted++
        if (options.progress) {
          options.progress.increment(`${inserted}/${validRecords.length}`)
        }
      } catch (err) {
        skipped++
        errors.push({
          record: prog,
          error: err as Error,
          phase: 'execution'
        })
      }
    }

    if (options.progress) {
      options.progress.complete()
    }

    return {
      tableName: 'program',
      recordsInserted: inserted,
      recordsSkipped: skipped,
      errors,
      duration: Date.now() - startTime
    }
  },

  async clear(db: DB): Promise<void> {
    await db.delete(program)
  }
}

export default programSeed
