import { boolean, date, pgTable, primaryKey, text } from 'drizzle-orm/pg-core'
import { nanoid } from 'nanoid'
import { timestamps } from '../helper'
import { user } from './auth'

export const university = pgTable('university', {
  id: text('id')
    .primaryKey()
    .$default(() => nanoid()),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  logo: text('logo'),
  country: text('country').notNull(),
  city: text('city').notNull(),
  address: text('address').notNull(),
  ...timestamps
})

export const universityMember = pgTable(
  'university_member',
  {
    universityId: text('university_id').references(() => university.id),
    userId: text('user_id').references(() => user.id),
    studentStatusVerified: boolean('student_status_verified').default(false),
    startedOn: date('started_on'),
    graduatedOn: date('graduated_on'),
    ...timestamps
  },
  (table) => [
    primaryKey({
      name: 'university_member_pk',
      columns: [table.universityId, table.userId]
    })
  ]
)
