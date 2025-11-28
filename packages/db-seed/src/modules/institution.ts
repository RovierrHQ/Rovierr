/** biome-ignore-all lint: ok */
import type { DB } from '@rov/db'
import { institution } from '@rov/db/schema'
import { file } from 'bun'
import { parse } from 'csv-parse/sync'
import { nanoid } from 'nanoid'
import type { SeedModule, SeedOptions, SeedResult } from '../types'

interface InstitutionCSVRow {
  name: string
  slug: string
  type: 'university' | 'high_school' | 'bootcamp' | 'coaching_center' | 'other'
  country: string
  city: string
  address?: string
  website?: string
  validEmailDomains: string
  logo?: string
}

interface InstitutionRecord {
  id: string
  name: string
  slug: string
  type: 'university' | 'high_school' | 'bootcamp' | 'coaching_center' | 'other'
  country: string
  city: string
  address?: string
  website?: string
  validEmailDomains: string[]
  logo?: string
}

/**
 * Load institutions from CSV file
 */
async function loadInstitutionsFromCSV(): Promise<InstitutionRecord[]> {
  const csvPath = `${import.meta.dir}/../data/institutions.csv`
  const csvFile = file(csvPath)
  const csvContent = await csvFile.text()

  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as InstitutionCSVRow[]

  return records.map((row) => ({
    id: nanoid(),
    name: row.name,
    slug: row.slug,
    type: row.type,
    country: row.country,
    city: row.city,
    address: row.address || undefined,
    website: row.website || undefined,
    validEmailDomains: row.validEmailDomains
      .split('|')
      .map((d) => d.trim())
      .filter(Boolean),
    logo: row.logo || undefined
  }))
}

/**
 * Load institutions from web scraper (placeholder)
 */
function loadInstitutionsFromScraper(): Promise<InstitutionRecord[]> {
  // TODO: Implement web scraper integration
  // This will be implemented by importing from ../web-scraper/scrapers/institution-scraper.ts
  // For now, return empty array
  return Promise.resolve([])
}

/**
 * Validate institution record
 */
function validateInstitution(record: InstitutionRecord): boolean {
  return !!(
    record.name &&
    record.slug &&
    record.type &&
    record.country &&
    record.city &&
    record.validEmailDomains &&
    record.validEmailDomains.length > 0
  )
}

/**
 * Institution seed module
 */
export const institutionSeed: SeedModule = {
  name: 'institution',
  dependencies: [], // No dependencies

  async seed(db: DB, options: SeedOptions): Promise<SeedResult> {
    const startTime = Date.now()
    let data: InstitutionRecord[] = []

    // Load from CSV
    try {
      const csvData = await loadInstitutionsFromCSV()
      data = [...data, ...csvData]
    } catch {
      // Failed to load CSV, continue with empty data
    }

    // Load from scraper if enabled
    if (options.useScraper) {
      try {
        const scrapedData = await loadInstitutionsFromScraper()
        data = [...data, ...scrapedData]
      } catch {
        // Failed to load from scraper, continue with CSV data
      }
    }

    // Remove duplicates by slug
    const uniqueData = Array.from(
      new Map(data.map((inst) => [inst.slug, inst])).values()
    )

    // Validate records
    const validRecords = uniqueData.filter(validateInstitution)
    const invalidCount = uniqueData.length - validRecords.length

    if (invalidCount > 0) {
      // Skip invalid records
    }

    let inserted = 0
    let skipped = 0
    const errors: SeedResult['errors'] = []

    // Insert records
    for (const inst of validRecords) {
      try {
        await db
          .insert(institution)
          .values(inst)
          .onConflictDoUpdate({
            target: institution.slug,
            set: {
              name: inst.name,
              type: inst.type,
              country: inst.country,
              city: inst.city,
              address: inst.address,
              website: inst.website,
              validEmailDomains: inst.validEmailDomains,
              logo: inst.logo
            }
          })
        inserted++
      } catch (err) {
        skipped++
        errors.push({
          record: inst,
          error: err as Error,
          phase: 'execution'
        })
      }
    }

    return {
      tableName: 'institution',
      recordsInserted: inserted,
      recordsSkipped: skipped,
      errors,
      duration: Date.now() - startTime
    }
  },

  async clear(db: DB): Promise<void> {
    await db.delete(institution)
  }
}

export default institutionSeed
