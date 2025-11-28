import { CircularDependencyError } from '../errors'
import type { DependencyGraph, SeedModule } from '../types'

export class DependencyResolver {
  private graph: DependencyGraph = new Map()

  constructor(modules: SeedModule[]) {
    this.buildGraph(modules)
  }

  private buildGraph(modules: SeedModule[]): void {
    // Initialize nodes
    for (const module of modules) {
      this.graph.set(module.name, {
        name: module.name,
        dependencies: module.dependencies || [],
        dependents: []
      })
    }

    // Build dependent relationships
    for (const module of modules) {
      const deps = module.dependencies || []
      for (const dep of deps) {
        const depNode = this.graph.get(dep)
        if (depNode) {
          depNode.dependents.push(module.name)
        }
      }
    }
  }

  /**
   * Performs topological sort to determine execution order
   * Returns modules in order where dependencies come before dependents
   */
  resolve(moduleNames?: string[]): string[] {
    const targetModules = moduleNames || Array.from(this.graph.keys())
    const visited = new Set<string>()
    const visiting = new Set<string>()
    const order: string[] = []

    const visit = (name: string, path: string[] = []): void => {
      if (visited.has(name)) return

      if (visiting.has(name)) {
        // Circular dependency detected
        const cycle = [...path, name]
        throw new CircularDependencyError(name, cycle)
      }

      const node = this.graph.get(name)
      if (!node) {
        throw new Error(`Module "${name}" not found in dependency graph`)
      }

      visiting.add(name)
      path.push(name)

      // Visit dependencies first
      for (const dep of node.dependencies) {
        visit(dep, [...path])
      }

      visiting.delete(name)
      visited.add(name)
      order.push(name)
    }

    // If specific modules requested, include their dependencies
    if (moduleNames) {
      const modulesWithDeps = this.getModulesWithDependencies(moduleNames)
      for (const name of modulesWithDeps) {
        visit(name)
      }
    } else {
      // Visit all modules
      for (const name of targetModules) {
        visit(name)
      }
    }

    return order
  }

  /**
   * Gets all modules including their transitive dependencies
   */
  private getModulesWithDependencies(moduleNames: string[]): string[] {
    const result = new Set<string>()

    const addWithDeps = (name: string): void => {
      if (result.has(name)) return

      const node = this.graph.get(name)
      if (!node) return

      result.add(name)
      for (const dep of node.dependencies) {
        addWithDeps(dep)
      }
    }

    for (const name of moduleNames) {
      addWithDeps(name)
    }

    return Array.from(result)
  }

  /**
   * Validates that all dependencies exist
   */
  validateDependencies(): string[] {
    const missing: string[] = []

    for (const [name, node] of this.graph.entries()) {
      for (const dep of node.dependencies) {
        if (!this.graph.has(dep)) {
          missing.push(`${name} -> ${dep}`)
        }
      }
    }

    return missing
  }

  /**
   * Detects circular dependencies
   */
  detectCircularDependencies(): string[][] {
    const cycles: string[][] = []
    const visited = new Set<string>()
    const visiting = new Set<string>()

    const visit = (name: string, path: string[] = []): void => {
      if (visited.has(name)) return

      if (visiting.has(name)) {
        const cycleStart = path.indexOf(name)
        cycles.push([...path.slice(cycleStart), name])
        return
      }

      const node = this.graph.get(name)
      if (!node) return

      visiting.add(name)
      path.push(name)

      for (const dep of node.dependencies) {
        visit(dep, [...path])
      }

      visiting.delete(name)
      visited.add(name)
    }

    for (const name of this.graph.keys()) {
      visit(name)
    }

    return cycles
  }
}
