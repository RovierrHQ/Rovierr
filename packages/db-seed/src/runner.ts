/** biome-ignore-all lint: ok */
import type { DB } from '@rov/db'
import { SeedError } from './errors'
import type { SeedModule, SeedOptions, SeedResult, SeedSummary } from './types'
import { getLogger } from './utils/logger'
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
          for (const module of modules) {
            try {
              this.logger.debug(`Processing module: ${module.name}`)

              // Clear table if requested
              if (options.clear && module.clear && !options.dryRun) {
                this.logger.debug(`Clearing table: ${module.name}`)
                await module.clear(db)
              }

              // Run seed
              const result = await this.runSingle(module, options, db)
              results.push(result)

              if (result.errors.length === 0) {
                successfulSeeds.push(module.name)
                this.logger.success(
                  `${module.name}: ${result.recordsInserted} records inserted`
                )
              } else {
                failedSeeds.push(module.name)
                this.logger.warn(
                  `${module.name}: ${result.recordsInserted} inserted, ${result.errors.length} errors`
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

    if (options.dryRun) {
      this.logger.debug(`[DRY RUN] Would seed: ${module.name}`)
      return {
        tableName: module.name,
        recordsInserted: 0,
        recordsSkipped: 0,
        errors: [],
        duration: 0
      }
    }

    try {
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
      this.logger.warn('DRY RUN - No changes were made')
    }

    this.logger.info(`Total records: ${summary.totalRecords}`)
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
