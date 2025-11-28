/** biome-ignore-all lint: ok */
import { readdir } from 'node:fs/promises'
import type { RegistryEntry, SeedModule } from './types'
import { DependencyResolver } from './utils/dependency'

export class SeedRegistry {
  private modules: Map<string, SeedModule> = new Map()
  private entries: Map<string, RegistryEntry> = new Map()

  /**
   * Automatically discover and register seed modules from the modules directory
   */
  async discoverModules(modulesPath: string): Promise<void> {
    try {
      const files = await readdir(modulesPath)

      for (const fileName of files) {
        if (fileName.endsWith('.ts') || fileName.endsWith('.js')) {
          const modulePath = `${modulesPath}/${fileName}`
          await this.registerModuleFromPath(modulePath)
        }
      }
    } catch (error) {
      console.warn(`Failed to discover modules: ${error}`)
    }
  }

  /**
   * Register a module from a file path
   */
  private async registerModuleFromPath(path: string): Promise<void> {
    try {
      const module = await import(path)
      const seedModule = module.default || module

      if (this.isValidSeedModule(seedModule)) {
        this.registerModule(seedModule)
      }
    } catch (error) {
      console.warn(`Failed to load module from ${path}: ${error}`)
    }
  }

  /**
   * Manually register a seed module
   */
  registerModule(module: SeedModule): void {
    // Validate the module structure
    if (
      !module ||
      typeof module !== 'object' ||
      typeof module.name !== 'string' ||
      typeof module.seed !== 'function'
    ) {
      throw new Error(
        'Invalid seed module. Must have name (string) and seed (function).'
      )
    }

    this.modules.set(module.name, module)
    this.entries.set(module.name, {
      module,
      order: 0,
      status: 'pending'
    })
  }

  /**
   * Validate that a module conforms to the SeedModule interface
   */
  private isValidSeedModule(module: unknown): module is SeedModule {
    return (
      module !== null &&
      module !== undefined &&
      typeof module === 'object' &&
      'name' in module &&
      typeof module.name === 'string' &&
      'seed' in module &&
      typeof module.seed === 'function'
    )
  }

  /**
   * Get all registered modules
   */
  getModules(): SeedModule[] {
    return Array.from(this.modules.values())
  }

  /**
   * Get a specific module by name
   */
  getModule(name: string): SeedModule | undefined {
    return this.modules.get(name)
  }

  /**
   * Get module names
   */
  getModuleNames(): string[] {
    return Array.from(this.modules.keys())
  }

  /**
   * Build execution order based on dependencies
   */
  buildExecutionOrder(moduleNames?: string[]): SeedModule[] {
    const resolver = new DependencyResolver(this.getModules())

    // Validate dependencies
    const missing = resolver.validateDependencies()
    if (missing.length > 0) {
      throw new Error(`Missing dependencies detected:\n${missing.join('\n')}`)
    }

    // Detect circular dependencies
    const cycles = resolver.detectCircularDependencies()
    if (cycles.length > 0) {
      throw new Error(
        `Circular dependencies detected:\n${cycles.map((c) => c.join(' -> ')).join('\n')}`
      )
    }

    // Resolve execution order
    const orderedNames = resolver.resolve(moduleNames)

    // Update order in entries
    orderedNames.forEach((name, index) => {
      const entry = this.entries.get(name)
      if (entry) {
        entry.order = index
      }
    })

    // Return modules in execution order
    return orderedNames
      .map((name) => this.modules.get(name))
      .filter((m): m is SeedModule => m !== undefined)
  }

  /**
   * Update module status
   */
  updateStatus(
    name: string,
    status: RegistryEntry['status'],
    result?: RegistryEntry['result']
  ): void {
    const entry = this.entries.get(name)
    if (entry) {
      entry.status = status
      if (result) {
        entry.result = result
      }
    }
  }

  /**
   * Get entry for a module
   */
  getEntry(name: string): RegistryEntry | undefined {
    return this.entries.get(name)
  }

  /**
   * Get all entries
   */
  getEntries(): RegistryEntry[] {
    return Array.from(this.entries.values())
  }
}
