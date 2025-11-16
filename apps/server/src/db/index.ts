import { createDB } from '@rov/db'
import { env } from '../lib/env'

export const db = createDB(env.DATABASE_URL || '')
