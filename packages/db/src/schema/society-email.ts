import { relations } from 'drizzle-orm'
import { index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { primaryId, timestamps } from '../helper'
import { organization, user } from './auth'

export const societyEmail = pgTable(
  'society_email',
  {
    id: primaryId,
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    senderId: text('sender_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    subject: text('subject').notNull(),
    bodyHtml: text('body_html').notNull(),
    bodyText: text('body_text').notNull(),
    recipientCount: integer('recipient_count').notNull(),
    successCount: integer('success_count').default(0).notNull(),
    failureCount: integer('failure_count').default(0).notNull(),
    status: text('status', {
      enum: ['completed', 'failed']
    }).notNull(),
    sentAt: timestamp('sent_at', { withTimezone: true, mode: 'string' }),
    ...timestamps
  },
  (table) => [
    index('society_email_organization_id_idx').on(table.organizationId),
    index('society_email_sender_id_idx').on(table.senderId),
    index('society_email_sent_at_idx').on(table.sentAt)
  ]
)

export const societyEmailRelations = relations(societyEmail, ({ one }) => ({
  organization: one(organization, {
    fields: [societyEmail.organizationId],
    references: [organization.id]
  }),
  sender: one(user, {
    fields: [societyEmail.senderId],
    references: [user.id]
  })
}))
