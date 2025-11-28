/** biome-ignore-all lint: ok for db-seed */
export class SeedError extends Error {
  constructor(
    public module: string,
    public phase: 'validation' | 'execution' | 'cleanup',
    message: string,
    public cause?: Error
  ) {
    super(message)
    this.name = 'SeedError'
  }
}

export class DependencyError extends SeedError {
  constructor(
    module: string,
    public missingDependencies: string[]
  ) {
    super(
      module,
      'validation',
      `Missing dependencies: ${missingDependencies.join(', ')}`
    )
    this.name = 'DependencyError'
  }
}

export class ValidationError extends SeedError {
  constructor(
    module: string,
    public invalidRecords: unknown[]
  ) {
    super(
      module,
      'validation',
      `${invalidRecords.length} records failed validation`
    )
    this.name = 'ValidationError'
  }
}

export class CircularDependencyError extends SeedError {
  constructor(
    module: string,
    public cycle: string[]
  ) {
    super(
      module,
      'validation',
      `Circular dependency detected: ${cycle.join(' -> ')}`
    )
    this.name = 'CircularDependencyError'
  }
}
