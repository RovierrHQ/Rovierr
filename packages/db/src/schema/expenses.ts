import { relations } from 'drizzle-orm'
import {
  boolean,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp
} from 'drizzle-orm/pg-core'
import { primaryId, timestamps } from '../helper'
import { organization, user } from './auth'

/** ========================
 *  LEDGER ACCOUNTS
 *  ======================== */
export const ledgerAccounts = pgTable('ledger_accounts', {
  id: primaryId,
  // Personal accounts (ownerUserId) or club accounts (ownerClubId)
  ownerUserId: text('owner_user_id').references(() => user.id, {
    onDelete: 'cascade'
  }),
  ownerClubId: text('owner_club_id').references(() => organization.id, {
    onDelete: 'cascade'
  }),
  name: text('name').notNull(),
  type: text('type', {
    enum: ['asset', 'liability', 'equity', 'income', 'expense']
  }).notNull(),
  currency: text('currency').default('HKD').notNull(),
  archivedAt: timestamp('archived_at', { withTimezone: true, mode: 'string' }),
  ...timestamps
})

/** ========================
 *  CATEGORIES
 *  ======================== */
export const categories = pgTable('categories', {
  id: primaryId,
  clubId: text('club_id').references(() => organization.id, {
    onDelete: 'cascade'
  }),
  createdByUserId: text('created_by_user_id').references(() => user.id, {
    onDelete: 'cascade'
  }),
  name: text('name').notNull(),
  icon: text('icon'),
  ...timestamps
})

/** ========================
 *  EVENTS / PROJECTS / ACTIVITIES
 *  ======================== */
export const events = pgTable('events', {
  id: primaryId,
  clubId: text('club_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  startDate: timestamp('start_date', { withTimezone: true, mode: 'string' }),
  endDate: timestamp('end_date', { withTimezone: true, mode: 'string' }),
  ...timestamps
})

/** ========================
 *  TRANSACTIONS (JOURNAL)
 *  ======================== */
export const transactions = pgTable('transactions', {
  id: primaryId,
  createdByUserId: text('created_by_user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  clubId: text('club_id').references(() => organization.id, {
    onDelete: 'cascade'
  }),
  type: text('type', {
    enum: [
      'personal_expense',
      'club_expense',
      'reimbursement',
      'borrow',
      'lend',
      'transfer',
      'event_payment'
    ]
  }).notNull(),
  description: text('description'),
  notes: text('notes'),
  eventId: text('event_id').references(() => events.id, {
    onDelete: 'set null'
  }),
  categoryId: text('category_id').references(() => categories.id, {
    onDelete: 'set null'
  }),
  totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').default('HKD').notNull(),
  isSplit: boolean('is_split').default(false).notNull(),
  reimbursementStatus: text('reimbursement_status', {
    enum: ['none', 'pending', 'approved', 'paid']
  })
    .default('none')
    .notNull(),
  metadata: jsonb('metadata').default({}),
  ...timestamps
})

/** ========================
 *  TRANSACTION ENTRIES (DOUBLE ENTRY LINES)
 *  ======================== */
export const transactionEntries = pgTable('transaction_entries', {
  id: primaryId,
  transactionId: text('transaction_id')
    .notNull()
    .references(() => transactions.id, { onDelete: 'cascade' }),
  accountId: text('account_id')
    .notNull()
    .references(() => ledgerAccounts.id, { onDelete: 'cascade' }),
  // debit: positive; credit: negative
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  memo: text('memo'),
  ...timestamps
})

/** ========================
 *  TRANSACTION SPLITS (SPLIT PARTICIPANTS)
 *  ======================== */
export const transactionSplits = pgTable('transaction_splits', {
  id: primaryId,
  transactionId: text('transaction_id')
    .notNull()
    .references(() => transactions.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accountId: text('account_id').references(() => ledgerAccounts.id, {
    onDelete: 'set null'
  }),
  shareAmount: numeric('share_amount', { precision: 12, scale: 2 }).notNull(),
  percentage: numeric('percentage', { precision: 5, scale: 2 }),
  ...timestamps
})

/** ========================
 *  ATTACHMENTS (RECEIPTS)
 *  ======================== */
export const attachments = pgTable('attachments', {
  id: primaryId,
  transactionId: text('transaction_id')
    .notNull()
    .references(() => transactions.id, { onDelete: 'cascade' }),
  fileUrl: text('file_url').notNull(),
  uploadedBy: text('uploaded_by').references(() => user.id, {
    onDelete: 'set null'
  }),
  ...timestamps
})

// Relations
export const ledgerAccountsRelations = relations(
  ledgerAccounts,
  ({ one, many }) => ({
    ownerUser: one(user, {
      fields: [ledgerAccounts.ownerUserId],
      references: [user.id]
    }),
    ownerClub: one(organization, {
      fields: [ledgerAccounts.ownerClubId],
      references: [organization.id]
    }),
    transactionEntries: many(transactionEntries),
    transactionSplits: many(transactionSplits)
  })
)

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  club: one(organization, {
    fields: [categories.clubId],
    references: [organization.id]
  }),
  createdBy: one(user, {
    fields: [categories.createdByUserId],
    references: [user.id]
  }),
  transactions: many(transactions)
}))

export const eventsRelations = relations(events, ({ one, many }) => ({
  club: one(organization, {
    fields: [events.clubId],
    references: [organization.id]
  }),
  transactions: many(transactions)
}))

export const transactionsRelations = relations(
  transactions,
  ({ one, many }) => ({
    createdBy: one(user, {
      fields: [transactions.createdByUserId],
      references: [user.id]
    }),
    club: one(organization, {
      fields: [transactions.clubId],
      references: [organization.id]
    }),
    event: one(events, {
      fields: [transactions.eventId],
      references: [events.id]
    }),
    category: one(categories, {
      fields: [transactions.categoryId],
      references: [categories.id]
    }),
    entries: many(transactionEntries),
    splits: many(transactionSplits),
    attachments: many(attachments)
  })
)

export const transactionEntriesRelations = relations(
  transactionEntries,
  ({ one }) => ({
    transaction: one(transactions, {
      fields: [transactionEntries.transactionId],
      references: [transactions.id]
    }),
    account: one(ledgerAccounts, {
      fields: [transactionEntries.accountId],
      references: [ledgerAccounts.id]
    })
  })
)

export const transactionSplitsRelations = relations(
  transactionSplits,
  ({ one }) => ({
    transaction: one(transactions, {
      fields: [transactionSplits.transactionId],
      references: [transactions.id]
    }),
    user: one(user, {
      fields: [transactionSplits.userId],
      references: [user.id]
    }),
    account: one(ledgerAccounts, {
      fields: [transactionSplits.accountId],
      references: [ledgerAccounts.id]
    })
  })
)

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  transaction: one(transactions, {
    fields: [attachments.transactionId],
    references: [transactions.id]
  }),
  uploadedByUser: one(user, {
    fields: [attachments.uploadedBy],
    references: [user.id]
  })
}))
