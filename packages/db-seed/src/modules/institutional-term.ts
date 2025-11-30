/** biome-ignore-all lint: ok */
import type { DB } from '@rov/db'
import { institutionalTerm } from '@rov/db/schema'
import { file } from 'bun'
import { parse } from 'csv-parse/sync'
import { nanoid } from 'nanoid'
import type {
  PrepareDataResult,
  SeedModule,
  SeedOptions,
  SeedResult
} from '../types'

interface InstitutionalTermCSVRow {
  institution_slug: string
  term_name: string
  academic_year: string
  start_date: string
  end_date: string
  term_type: string
}

interface InstitutionalTermRecord {
  id: string
  institutionId: string
  termName: string
  academicYear: string
  startDate: string
  endDate: string
  institutionSlug?: string
}

/**
 * Load institutional terms from CSV file
 */
async function loadTermsFromCSV(): Promise<InstitutionalTermRecord[]> {
  const csvPath = `${import.meta.dir}/../data/institutional-terms.csv`
  const csvFile = file(csvPath)
  const csvContent = await csvFile.text()

  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as InstitutionalTermCSVRow[]

  return records.map((row) => ({
    id: nanoid(),
    institutionId: '', // Will be resolved from slug
    institutionSlug: row.institution_slug,
    termName: row.term_name,
    academicYear: row.academic_year,
    startDate: row.start_date,
    endDate: row.end_date
  }))
}

/**
 * Validate institutional term record
 */
function validateTerm(record: InstitutionalTermRecord): boolean {
  return !!(
    record.institutionId &&
    record.termName &&
    record.academicYear &&
    record.startDate &&
    record.endDate
  )
}

/**
 * Institutional Term seed module
 */
export const institutionalTermSeed: SeedModule<{
  terms: InstitutionalTermRecord[]
}> = {
  name: 'institutional-term',
  dependencies: ['institution'],

  async prepareData(db: DB, options: SeedOptions) {
    // Load from CSV
    const csvData = await loadTermsFromCSV()

    // Resolve institution IDs from slugs
    const { institution } = await import('@rov/db/schema')
    const { eq } = await import('drizzle-orm')

    for (const term of csvData) {
      if (term.institutionSlug) {
        const inst = await db.query.institution.findFirst({
          where: eq(institution.slug, term.institutionSlug)
        })
        if (inst) {
          term.institutionId = inst.id
        }
      }
    }

    // Validate records
    const validRecords = csvData.filter(validateTerm)

    return {
      data: { terms: validRecords },
      invalidCount: csvData.length - validRecords.length
    }
  },

  async seed(db: DB, options: SeedOptions): Promise<SeedResult> {
    const startTime = Date.now()

    // Get prepared data
    const { data, invalidCount = 0 } = await institutionalTermSeed.prepareData(
      db,
      options
    )
    const validRecords = data.terms

    const { and, eq } = await import('drizzle-orm')

    let inserted = 0
    let skipped = 0
    const errors: SeedResult['errors'] = []

    if (options.progress) {
      options.progress.setTotal(validRecords.length)
    }

    // Insert records
    for (const term of validRecords) {
      try {
        // Check if term already exists
        const existingTerm = await db.query.institutionalTerm.findFirst({
          where: and(
            eq(institutionalTerm.institutionId, term.institutionId),
            eq(institutionalTerm.termName, term.termName),
            eq(institutionalTerm.academicYear, term.academicYear)
          )
        })

        if (existingTerm) {
          skipped++
          if (options.progress) {
            options.progress.increment(
              `${inserted}/${validRecords.length} (${skipped} skipped)`
            )
          }
          continue
        }

        // Remove institutionSlug before inserting
        const { institutionSlug, ...termData } = term
        await db.insert(institutionalTerm).values(termData)
        inserted++

        if (options.progress) {
          options.progress.increment(`${inserted}/${validRecords.length}`)
        }
      } catch (err) {
        skipped++
        errors.push({
          record: term,
          error: err as Error,
          phase: 'execution'
        })
      }
    }

    if (options.progress) {
      options.progress.complete()
    }

    return {
      tableName: 'institutional_term',
      recordsInserted: inserted,
      recordsSkipped: skipped + invalidCount,
      errors,
      duration: Date.now() - startTime
    }
  },

  async clear(db: DB): Promise<void> {
    await db.delete(institutionalTerm)
  }
}

export default institutionalTermSeed
