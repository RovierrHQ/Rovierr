/**
 * Migration utilities for ORPC to Elysia migration
 *
 * This file contains helper functions and utilities to assist with the migration process
 */

import type { Elysia } from 'elysia'

/**
 * Migration checklist for each router
 */
export interface MigrationChecklist {
  routerName: string
  orpcContractPath: string
  elysiaRouterPath: string
  hasSchemas: boolean
  hasErrors: boolean
  hasService: boolean
  isCompleted: boolean
  endpoints: {
    method: string
    path: string
    migrated: boolean
  }[]
}

/**
 * Validates that an Elysia router has been properly configured
 */
export function validateElysiaRouter(router: Elysia, routerName: string): void {
  if (!router) {
    throw new Error(`Router ${routerName} is not defined`)
  }

  // Check if router has a name
  if (!router.config?.name) {
    console.warn(`Router ${routerName} does not have a name configured`)
  }
}

/**
 * Helper to create consistent error responses
 */
export function createErrorResponse(error: Error, statusCode = 500) {
  return {
    error: error.constructor.name,
    message: error.message,
    statusCode
  }
}

/**
 * Migration progress tracker
 */
export class MigrationTracker {
  private static instance: MigrationTracker
  private completedRouters: Set<string> = new Set()
  private totalRouters = 19 // Based on our router count

  static getInstance(): MigrationTracker {
    if (!MigrationTracker.instance) {
      MigrationTracker.instance = new MigrationTracker()
    }
    return MigrationTracker.instance
  }

  markRouterCompleted(routerName: string): void {
    this.completedRouters.add(routerName)
    console.log(`✅ Router ${routerName} migration completed`)
    console.log(
      `Progress: ${this.completedRouters.size}/${this.totalRouters} routers migrated`
    )
  }

  getProgress(): { completed: number; total: number; percentage: number } {
    const completed = this.completedRouters.size
    const percentage = Math.round((completed / this.totalRouters) * 100)
    return { completed, total: this.totalRouters, percentage }
  }

  isCompleted(): boolean {
    return this.completedRouters.size === this.totalRouters
  }

  getCompletedRouters(): string[] {
    return Array.from(this.completedRouters)
  }
}

/**
 * Router migration template
 */
export const ROUTER_TEMPLATE = `import { betterAuth } from '@api/middleware/auth'
import Elysia from 'elysia'
import z from 'zod'

// Import schemas
// import { ... } from './schemas'

// Import errors if needed
// import { ... } from './errors'

export const {{routerName}} = new Elysia({ name: '{{routerName}}' })
  .use(betterAuth)
  .group('/{{routerPath}}', { auth: true }, (app) =>
    app
      // Add routes here
  )
`

/**
 * Schema file template
 */
export const SCHEMA_TEMPLATE = `import { z } from 'zod'

// Schemas extracted from ORPC contracts
// TODO: Copy schemas from packages/orpc-contracts/src/{{domain}}/

// Example schema:
// export const create{{Entity}}Schema = z.object({
//   // Add fields here
// })

// export const {{entity}}Schema = z.object({
//   // Add fields here
// })
`

/**
 * Error file template
 */
export const ERROR_TEMPLATE = `// Custom error classes for {{routerName}} router

export class {{ROUTER_NAME}}_NOT_FOUND extends Error {
  constructor(message = '{{Entity}} not found') {
    super(message)
  }
}

export class INVALID_{{ROUTER_NAME}}_DATA extends Error {
  constructor(message = 'Invalid {{entity}} data') {
    super(message)
  }
}

// Add more error classes as needed
`
