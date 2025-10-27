import { sql } from 'drizzle-orm'
import { text, timestamp } from 'drizzle-orm/pg-core'
import { nanoid } from 'nanoid'

export const timestamps = {
  createdAt: timestamp({ withTimezone: true, mode: 'string' })
    .default(sql`(now() AT TIME ZONE 'utc'::text)`)
    .notNull(),
  updatedAt: timestamp({ withTimezone: true, mode: 'string' })
    .default(sql`(now() AT TIME ZONE 'utc'::text)`)
    .notNull()
    .$onUpdate(() => sql`(now() AT TIME ZONE 'utc'::text)`)
}

export const primaryId = text('id')
  .primaryKey()
  .$default(() => nanoid())
