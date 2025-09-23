import { boolean, json, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { timestamps } from '../helper'
import { user } from './auth'

export const app_quera = pgTable('app_quera', {
  id: text('id').primaryKey(),
  questions: json('questions').notNull(),
  title: text('title').notNull().default(''),
  answers: json('answers').notNull(),
  settings: json('settings').notNull(),
  createdBy: text('created_by').notNull(),
  published: boolean('published').notNull().default(false),
  publishedAt: timestamp('published_at'),
  ...timestamps
})

export const app_quera_users = pgTable('app_quera_users', {
  id: text('id').primaryKey(),
  appQueraId: text('app_quera_id')
    .notNull()
    .references(() => app_quera.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  ...timestamps
})
