#!/usr/bin/env bun
import { createDB } from '@rov/db'
import { SeedRegistry } from './registry'
import { SeedRunner } from './runner'
import { CLIParser, parseCliArgs } from './utils/cli'
import { getLogger } from './utils/logger'

async function main() {
  const logger = getLogger()

  try {
    // Parse CLI arguments
    const options = parseCliArgs(process.argv)
    logger.setVerbose(options.verbose ?? false)

    // Get database URL from environment
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      logger.error('DATABASE_URL environment variable is not set')
      process.exit(1)
    }

    // Create database connection
    const db = createDB(databaseUrl)

    // Initialize registry
    const registry = new SeedRegistry()

    // Discover seed modules
    const modulesPath = `${import.meta.dir}/modules`
    await registry.discoverModules(modulesPath)

    const availableModules = registry.getModuleNames()

    if (availableModules.length === 0) {
      logger.warn('No seed modules found')
      process.exit(0)
    }

    logger.debug(`Discovered ${availableModules.length} seed modules`)

    // Determine which modules to run
    let modulesToRun = availableModules

    if (options.only && options.only.length > 0) {
      // Validate requested modules exist
      const invalid = options.only.filter((m) => !availableModules.includes(m))
      if (invalid.length > 0) {
        logger.error(`Invalid module names: ${invalid.join(', ')}`)
        logger.info('Available modules:')
        const parser = new CLIParser()
        parser.listAvailableSeeds(availableModules)
        process.exit(1)
      }
      modulesToRun = options.only
    }

    if (options.exclude && options.exclude.length > 0) {
      modulesToRun = modulesToRun.filter((m) => !options.exclude?.includes(m))
    }

    if (modulesToRun.length === 0) {
      logger.warn('No modules to seed after applying filters')
      process.exit(0)
    }

    // Build execution order
    logger.debug('Building execution order...')
    const orderedModules = registry.buildExecutionOrder(modulesToRun)

    logger.info(
      `Will seed ${orderedModules.length} modules: ${orderedModules.map((m) => m.name).join(', ')}`
    )

    // Confirm destructive operations
    if (options.clear && !options.force && !options.dryRun) {
      logger.warn(
        'WARNING: --clear flag will delete all existing data in target tables'
      )
      logger.info('Press Ctrl+C to cancel, or wait 5 seconds to continue...')
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }

    // Run seeds
    const runner = new SeedRunner(db)
    const summary = await runner.run(orderedModules, options)

    // Exit with error code if any seeds failed
    if (summary.failedSeeds.length > 0) {
      process.exit(1)
    }

    logger.success('Seeding completed successfully!')
  } catch (error) {
    logger.error('Fatal error during seeding', error as Error)
    process.exit(1)
  }
}

// Run main function
main()
