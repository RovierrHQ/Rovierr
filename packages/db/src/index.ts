import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

export const createDB = (databaseUrl: string) => {
  // use your own db, either neon or d1 planetscale etc
  const sql = neon(databaseUrl)
  return drizzle(sql, { schema })
}

export type DB = ReturnType<typeof createDB>

// Re-export drizzle-orm utilities
export {
  and,
  asc,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  or,
  type SQL,
  sql
} from 'drizzle-orm'
// Re-export schema for convenience - this makes tables and relations available
export * from './schema'
