import { createDB } from '@rov/db'
import { env } from './env'

export const db = createDB(env.DATABASE_URL)
