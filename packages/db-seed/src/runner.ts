/** biome-ignore-all lint: ok */
import type { DB } from '@rov/db'
import { SeedError } from './errors'
import type { SeedModule, SeedOptions, SeedResult, SeedSummary } from './types'
import { getLogger } from './utils/logger'
import { createProgressTracker } from './utils/progress'
import { executeWithTransactionControl } from './utils/transaction'

export class SeedRunner {
  private db: DB
  private logger = getLogger()

  constructor(db: DB) {
    this.db = db
  }

  /**
   * Run multiple seed modules in order
   */
  async run(modules: SeedModule[], options: SeedOptions): Promise<SeedSummary> {
    const startTime = Date.now()
    const results: SeedResult[] = []
    const successfulSeeds: string[] = []
    const failedSeeds: string[] = []

    this.logger.setVerbose(options.verbose ?? false)
    this.logger.info(`Starting seed operation for ${modules.length} modules`)

    if (options.dryRun) {
      this.logger.warn('DRY RUN MODE - No database changes will be made')
    }

    // Neon HTTP driver doesn't support transactions, so default to false
    const useTransaction = options.noTransaction === false

    try {
      await executeWithTransactionControl(
        this.db,
        useTransaction,
        async (db) => {
          for (let i = 0; i < modules.length; i++) {
            const module = modules[i]
            if (!module) continue

            try {
              this.logger.debug(
                `Processing module: ${module.name} (${i + 1}/${modules.length})`
              )

              // Clear table if requested
              if (options.clear && module.clear && !options.dryRun) {
                this.logger.debug(`Clearing table: ${module.name}`)
                await module.clear(db)
              }

              // Create progress tracker for this module
              const progressTracker = createProgressTracker(module.name)
              const optionsWithProgress = {
                ...options,
                progress: progressTracker
              }

              // Run seed
              const result = await this.runSingle(
                module,
                optionsWithProgress,
                db
              )
              results.push(result)

              if (result.errors.length === 0) {
                successfulSeeds.push(module.name)
                const action = options.dryRun
                  ? 'would insert'
                  : 'records inserted'
                this.logger.success(
                  `${module.name}: ${result.recordsInserted} ${action}`
                )
              } else {
                failedSeeds.push(module.name)
                const action = options.dryRun ? 'would insert' : 'inserted'
                this.logger.warn(
                  `${module.name}: ${result.recordsInserted} ${action}, ${result.errors.length} errors`
                )
              }
            } catch (error) {
              failedSeeds.push(module.name)
              this.logger.error(`Failed to seed ${module.name}`, error as Error)

              // In strict mode (with transaction), throw to rollback
              if (useTransaction) {
                throw error
              }
            }
          }
        }
      )
    } catch (error) {
      this.logger.error('Seed operation failed', error as Error)
      if (useTransaction) {
        this.logger.warn('Transaction rolled back')
      }
      throw error
    }

    const duration = Date.now() - startTime
    const totalRecords = results.reduce((sum, r) => sum + r.recordsInserted, 0)
    const allErrors = results.flatMap((r) => r.errors)

    const summary: SeedSummary = {
      totalRecords,
      successfulSeeds,
      failedSeeds,
      duration,
      errors: allErrors
    }

    this.displaySummary(summary, options)

    return summary
  }

  /**
   * Run a single seed module
   */
  async runSingle(
    module: SeedModule,
    options: SeedOptions,
    db?: DB
  ): Promise<SeedResult> {
    const database = db || this.db
    const startTime = Date.now()

    try {
      // Dry-run mode: use prepareData
      if (options.dryRun) {
        const prepared = await module.prepareData(database, options)

        // Calculate total records across all entities
        const totalRecords = Object.values(prepared.data).reduce(
          (sum, records) => sum + records.length,
          0
        )

        // Build detailed message showing each entity
        const entityCounts = Object.entries(prepared.data)
          .map(([entity, records]) => `${entity}: ${records.length}`)
          .join(', ')

        this.logger.debug(
          `[DRY RUN] Would insert ${totalRecords} records into ${module.name} (${entityCounts})`
        )
        return {
          tableName: module.name,
          recordsInserted: totalRecords,
          recordsSkipped: prepared.invalidCount || 0,
          errors: [],
          duration: Date.now() - startTime
        }
      }

      // Normal mode: run seed function
      const result = await module.seed(database, options)
      return result
    } catch (error) {
      throw new SeedError(
        module.name,
        'execution',
        `Failed to execute seed: ${(error as Error).message}`,
        error as Error
      )
    }
  }

  /**
   * Display summary of seed operation
   */
  private displaySummary(summary: SeedSummary, options: SeedOptions): void {
    this.logger.newLine()
    this.logger.info('='.repeat(50))
    this.logger.info('Seed Summary')
    this.logger.info('='.repeat(50))

    if (options.dryRun) {
      this.logger.warn('DRY RUN - No changes were made to the database')
    }

    const recordLabel = options.dryRun
      ? `Total records (would be inserted): ${summary.totalRecords}`
      : `Total records: ${summary.totalRecords}`
    this.logger.info(recordLabel)
    this.logger.info(`Duration: ${summary.duration}ms`)
    this.logger.info(`Successful: ${summary.successfulSeeds.length} modules`)

    if (summary.successfulSeeds.length > 0) {
      for (const name of summary.successfulSeeds) {
        this.logger.success(`  ✓ ${name}`)
      }
    }

    if (summary.failedSeeds.length > 0) {
      this.logger.warn(`Failed: ${summary.failedSeeds.length} modules`)
      for (const name of summary.failedSeeds) {
        this.logger.error(`  ✖ ${name}`)
      }
    }

    if (summary.errors.length > 0 && options.verbose) {
      this.logger.newLine()
      this.logger.error(`Total errors: ${summary.errors.length}`)
      for (const error of summary.errors.slice(0, 10)) {
        this.logger.debug(`  - ${error.phase}: ${error.error.message}`)
      }
      if (summary.errors.length > 10) {
        this.logger.debug(`  ... and ${summary.errors.length - 10} more errors`)
      }
    }

    this.logger.info('='.repeat(50))
    this.logger.newLine()
  }
}
