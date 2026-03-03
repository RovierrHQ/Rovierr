import { relations } from 'drizzle-orm'
import { index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { primaryId, timestamps } from '../helper'
import { user } from './auth'

/**
 * Subscription table for tracking paid customers
 * One subscription per user - supports both lifetime deals (4 years) and recurring subscriptions
 */
export const subscription = pgTable(
  'subscription',
  {
    id: primaryId,
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' })
      .unique(), // One subscription per user

    // Stripe identifiers
    stripeCustomerId: text('stripe_customer_id').notNull(),
    stripePaymentIntentId: text('stripe_payment_intent_id'), // For one-time payments (lifetime deals)
    stripeSubscriptionId: text('stripe_subscription_id'), // For recurring subscriptions
    stripeProductId: text('stripe_product_id').notNull(),

    // Subscription type
    type: text('type', {
      enum: ['lifetime', 'subscription']
    })
      .notNull()
      .default('lifetime'), // 'lifetime' = 4-year deal, 'subscription' = recurring

    // Payment details
    amount: integer('amount').notNull(), // Amount in cents
    currency: text('currency').notNull().default('hkd'),

    // Status
    status: text('status', {
      enum: ['active', 'cancelled', 'refunded', 'expired', 'past_due']
    })
      .notNull()
      .default('active'),

    // Dates
    purchasedAt: timestamp('purchased_at', {
      withTimezone: true,
      mode: 'string'
    }).notNull(),

    // Expiry date - for lifetime deals this is 4 years from purchase
    // For subscriptions, this is the current period end
    expiresAt: timestamp('expires_at', {
      withTimezone: true,
      mode: 'string'
    }),

    // For subscriptions only - current billing period
    currentPeriodStart: timestamp('current_period_start', {
      withTimezone: true,
      mode: 'string'
    }),
    currentPeriodEnd: timestamp('current_period_end', {
      withTimezone: true,
      mode: 'string'
    }),

    // Track if subscription was cancelled/refunded
    cancelledAt: timestamp('cancelled_at', {
      withTimezone: true,
      mode: 'string'
    }),

    // Last time we verified with Stripe (for hybrid approach)
    lastVerifiedAt: timestamp('last_verified_at', {
      withTimezone: true,
      mode: 'string'
    }),

    // Metadata
    metadata: text('metadata'), // JSON string for additional data

    ...timestamps
  },
  (table) => [
    index('subscription_user_id_idx').on(table.userId),
    index('subscription_stripe_customer_id_idx').on(table.stripeCustomerId),
    // Note: paymentIntentId index removed since it's nullable and not always unique
    index('subscription_stripe_subscription_id_idx').on(
      table.stripeSubscriptionId
    ),
    index('subscription_status_idx').on(table.status),
    index('subscription_expires_at_idx').on(table.expiresAt)
  ]
)

export const subscriptionRelations = relations(subscription, ({ one }) => ({
  user: one(user, {
    fields: [subscription.userId],
    references: [user.id]
  })
}))
