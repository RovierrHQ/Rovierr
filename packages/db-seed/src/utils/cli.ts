import { Command } from 'commander'
import type { SeedOptions } from '../types'

export class CLIParser {
  private program: Command

  constructor() {
    this.program = new Command()
    this.setupCommands()
  }

  private setupCommands() {
    this.program
      .name('db-seed')
      .description('Database seeding utility for Rovierr')
      .version('1.0.0')

    this.program
      .option('--only <tables...>', 'Seed only specified tables')
      .option('--exclude <tables...>', 'Exclude specified tables from seeding')
      .option('--clear', 'Truncate tables before seeding')
      .option('--dry-run', 'Simulate seeding without database modifications')
      .option('--verbose', 'Output detailed logging information')
      .option('--no-transaction', 'Execute seeds without transaction wrapping')
      .option('--force', 'Skip confirmation prompts')
      .option('--use-scraper', 'Use web scraper if available')
  }

  parse(args: string[]): SeedOptions {
    this.program.parse(args)
    const options = this.program.opts()

    return {
      only: options.only,
      exclude: options.exclude,
      clear: options.clear,
      dryRun: options.dryRun,
      verbose: options.verbose,
      noTransaction: !options.transaction,
      force: options.force,
      useScraper: options.useScraper
    }
  }

  showHelp(): void {
    this.program.help()
  }

  listAvailableSeeds(seeds: string[]): void {
    console.log('\nAvailable seed modules:')
    for (const seed of seeds) {
      console.log(`  - ${seed}`)
    }
    console.log('')
  }
}

export function parseCliArgs(args: string[]): SeedOptions {
  const parser = new CLIParser()
  return parser.parse(args)
}
