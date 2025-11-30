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
import { chunk, DEFAULT_BATCH_SIZE } from '../utils/batch'

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

    // Pre-load existing terms for conflict detection
    const existingTerms = await db.select().from(institutionalTerm)
    const existingSet = new Set<string>()
    for (const existing of existingTerms) {
      const key = `${existing.institutionId}|${existing.termName}|${existing.academicYear}`
      existingSet.add(key)
    }

    // Filter out records that already exist
    const toInsert: InstitutionalTermRecord[] = []
    for (const term of validRecords) {
      const key = `${term.institutionId}|${term.termName}|${term.academicYear}`
      if (existingSet.has(key)) {
        skipped++
      } else {
        // Remove institutionSlug before inserting
        const { institutionSlug, ...termData } = term
        toInsert.push(termData as InstitutionalTermRecord)
      }
    }

    // Batch insert new records
    if (toInsert.length > 0) {
      const insertBatches = chunk(toInsert, DEFAULT_BATCH_SIZE)
      for (const batch of insertBatches) {
        try {
          await db.insert(institutionalTerm).values(batch)
          inserted += batch.length
          if (options.progress) {
            options.progress.increment(
              `${inserted}/${validRecords.length} (${skipped} skipped)`,
              batch.length
            )
          }
        } catch (err) {
          // If batch fails, try individual inserts
          for (const term of batch) {
            try {
              await db.insert(institutionalTerm).values(term)
              inserted++
              if (options.progress) {
                options.progress.increment(
                  `${inserted}/${validRecords.length} (${skipped} skipped)`
                )
              }
            } catch (individualErr) {
              skipped++
              errors.push({
                record: term,
                error: individualErr as Error,
                phase: 'execution'
              })
            }
          }
        }
      }
    } else if (options.progress && skipped > 0) {
      // If all records were skipped, still update progress
      options.progress.increment(
        `${inserted}/${validRecords.length} (${skipped} skipped)`,
        skipped
      )
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
