import type { DB } from '@rov/db'

export interface ProgressTracker {
  updateProgress: (current: number, total: number, message?: string) => void
  setTotal: (total: number) => void
  increment: (message?: string) => void
  complete: () => void
}

export interface SeedOptions {
  only?: string[] // Seed only specified tables
  exclude?: string[] // Exclude specified tables
  clear?: boolean // Truncate before seeding
  dryRun?: boolean // Simulate without DB changes
  verbose?: boolean // Detailed logging
  noTransaction?: boolean // Disable transaction wrapping
  force?: boolean // Skip confirmations
  useScraper?: boolean // Use web scraper if available
  progress?: ProgressTracker // Progress tracking callback
  skipDependencyCheck?: boolean // Skip dependency validation and ordering
}

export interface SeedResult {
  tableName: string
  recordsInserted: number
  recordsSkipped: number
  errors: SeedError[]
  duration: number
}

export interface SeedSummary {
  totalRecords: number
  successfulSeeds: string[]
  failedSeeds: string[]
  duration: number
  errors: SeedError[]
}

export interface SeedError {
  record?: unknown
  error: Error
  phase: 'validation' | 'execution' | 'cleanup'
}

export type SeedFunction = (db: DB, options: SeedOptions) => Promise<SeedResult>

export type ClearFunction = (db: DB) => Promise<void>

export type ValidationFunction = (data: unknown[]) => ValidationResult

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export interface SeedModule {
  name: string // Table/module name
  dependencies?: string[] // Required parent seeds
  seed: SeedFunction // Seeding function
  clear?: ClearFunction // Optional cleanup function
  validate?: ValidationFunction // Optional validation
}

export interface RegistryEntry {
  module: SeedModule
  order: number // Execution order based on dependencies
  status: 'pending' | 'running' | 'completed' | 'failed'
  result?: SeedResult
}

export interface DependencyNode {
  name: string
  dependencies: string[]
  dependents: string[]
}

export type DependencyGraph = Map<string, DependencyNode>
