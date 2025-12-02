import { relations } from 'drizzle-orm'
import {
  boolean,
  decimal,
  index,
  integer,
  pgTable,
  text,
  timestamp
} from 'drizzle-orm/pg-core'
import { primaryId, timestamps } from '../helper'
import { organization, user } from './auth'
import { formResponses, forms } from './form'

// ============================================================================
// Registration Settings Table
// ============================================================================
export const registrationSettings = pgTable(
  'registration_settings',
  {
    id: primaryId,
    societyId: text('society_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' })
      .unique(),

    // Basic Settings
    isEnabled: boolean('is_enabled').default(false).notNull(),
    approvalMode: text('approval_mode', { enum: ['auto', 'manual'] })
      .default('manual')
      .notNull(),
    formId: text('form_id').references(() => forms.id),

    // Capacity
    maxCapacity: integer('max_capacity'),

    // Registration Period
    startDate: timestamp('start_date', { withTimezone: true }),
    endDate: timestamp('end_date', { withTimezone: true }),

    // Customization
    welcomeMessage: text('welcome_message'),
    customBanner: text('custom_banner'),

    // Notifications
    notificationsEnabled: boolean('notifications_enabled').default(true),

    // State
    isPaused: boolean('is_paused').default(false).notNull(),

    ...timestamps
  },
  (table) => [
    index('registration_settings_society_id_idx').on(table.societyId),
    index('registration_settings_is_enabled_idx').on(table.isEnabled)
  ]
)

export const registrationSettingsRelations = relations(
  registrationSettings,
  ({ one }) => ({
    society: one(organization, {
      fields: [registrationSettings.societyId],
      references: [organization.id]
    }),
    form: one(forms, {
      fields: [registrationSettings.formId],
      references: [forms.id]
    })
  })
)

// ============================================================================
// Join Requests Table
// ============================================================================
export const joinRequests = pgTable(
  'join_requests',
  {
    id: primaryId,
    societyId: text('society_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    formResponseId: text('form_response_id')
      .references(() => formResponses.id, { onDelete: 'cascade' }),

    // Status
    status: text('status', {
      enum: [
        'pending',
        'payment_pending',
        'payment_completed',
        'approved',
        'rejected'
      ]
    })
      .default('pending')
      .notNull(),

    // Payment (Manual Verification)
    // Note: Payment is manually verified by presidents. Automated payment via Stripe Connect is future enhancement.
    paymentStatus: text('payment_status', {
      enum: ['not_required', 'pending', 'verified', 'not_verified']
    })
      .default('not_required')
      .notNull(),
    paymentAmount: decimal('payment_amount', { precision: 10, scale: 2 }),
    paymentProofUrl: text('payment_proof_url'), // URL to uploaded payment proof
    paymentVerifiedBy: text('payment_verified_by').references(() => user.id),
    paymentVerifiedAt: timestamp('payment_verified_at', { withTimezone: true }),
    paymentNotes: text('payment_notes'), // Notes from president about payment verification

    // Approval/Rejection
    reviewedBy: text('reviewed_by').references(() => user.id),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    rejectionReason: text('rejection_reason'),

    // Metadata
    submittedAt: timestamp('submitted_at', { withTimezone: true })
      .notNull()
      .defaultNow(),

    ...timestamps
  },
  (table) => [
    index('join_requests_society_id_idx').on(table.societyId),
    index('join_requests_user_id_idx').on(table.userId),
    index('join_requests_status_idx').on(table.status),
    index('join_requests_payment_status_idx').on(table.paymentStatus),
    index('join_requests_submitted_at_idx').on(table.submittedAt),
    // Composite index for common queries
    index('join_requests_society_status_idx').on(table.societyId, table.status)
  ]
)

export const joinRequestsRelations = relations(joinRequests, ({ one }) => ({
  society: one(organization, {
    fields: [joinRequests.societyId],
    references: [organization.id]
  }),
  user: one(user, {
    fields: [joinRequests.userId],
    references: [user.id]
  }),
  formResponse: one(formResponses, {
    fields: [joinRequests.formResponseId],
    references: [formResponses.id],
    relationName: 'joinRequestFormResponse'
  }),
  paymentVerifier: one(user, {
    fields: [joinRequests.paymentVerifiedBy],
    references: [user.id]
  }),
  reviewer: one(user, {
    fields: [joinRequests.reviewedBy],
    references: [user.id]
  })
}))
