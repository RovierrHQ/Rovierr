import { neon, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import ws from 'ws'
import * as schema from './schema'

neonConfig.webSocketConstructor = ws
neonConfig.poolQueryViaFetch = true

/**
 * Create a Drizzle database instance
 * @param url - Database connection URL
 * @returns Drizzle database instance
 */
export const createDB = (url: string) => {
  const sql = neon(url)
  return drizzle(sql, { schema })
}

// Export types
export type DB = ReturnType<typeof createDB>

export * from './helper'
// Re-export schema and helpers
export * from './schema'
