import { neon, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import ws from 'ws'
import { env } from '../lib/env'

neonConfig.webSocketConstructor = ws
neonConfig.poolQueryViaFetch = true

const sql = neon(env.DATABASE_URL || '')
export const db = drizzle(sql)
