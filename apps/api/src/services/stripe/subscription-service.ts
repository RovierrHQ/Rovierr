/**
 * Stripe Subscription Service
 *
 * Provides utilities for checking user subscription status
 * Supports both DB-backed and Stripe-query approaches
 */

import { db } from '@api/lib/db'
import { stripe } from '@api/lib/stripe'
import { subscription as subscriptionTable } from '@rov/db'
import { eq } from 'drizzle-orm'

export type SubscriptionStatus = 'active' | 'inactive' | 'expired' | 'refunded'

export type UserSubscription = {
  isActive: boolean
  tier?: string
  productId?: string
  status: SubscriptionStatus
  expiresAt?: string | null
}

/**
 * Check subscription from database (fast, cached)
 * Use this for frequent checks (e.g., feature gates)
 * Automatically checks expiry dates
 */
export async function getUserSubscriptionFromDB(
  userId: string
): Promise<UserSubscription | null> {
  const subscription = await db.query.subscription.findFirst({
    where: eq(subscriptionTable.userId, userId)
  })

  if (!subscription) {
    return null
  }

  // Check if subscription has expired
  let isActive = subscription.status === 'active'
  let status = subscription.status as SubscriptionStatus

  if (subscription.expiresAt) {
    const expiresAt = new Date(subscription.expiresAt)
    const now = new Date()

    if (now > expiresAt && isActive) {
      // Subscription expired, update status
      isActive = false
      status = 'expired'

      // Optionally update DB (or let webhook handle it)
      await db
        .update(subscriptionTable)
        .set({ status: 'expired' })
        .where(eq(subscriptionTable.id, subscription.id))
    }
  }

  return {
    isActive,
    tier: subscription.type === 'lifetime' ? 'lifetime' : 'subscription',
    productId: subscription.stripeProductId,
    status,
    expiresAt: subscription.expiresAt || null
  }
}

/**
 * Check subscription directly from Stripe (always up-to-date)
 * Use this for critical checks or when DB might be out of sync
 * Verifies with Stripe and updates DB cache
 */
export async function getUserSubscriptionFromStripe(
  userId: string
): Promise<UserSubscription | null> {
  // Get customer ID from DB
  const subscription = await db.query.subscription.findFirst({
    where: eq(subscriptionTable.userId, userId)
  })

  if (!subscription?.stripeCustomerId) {
    return null
  }

  try {
    // Check for active subscriptions (recurring)
    const subscriptions = await stripe.subscriptions.list({
      customer: subscription.stripeCustomerId,
      status: 'active',
      limit: 1
    })

    if (subscriptions.data.length > 0) {
      const sub = subscriptions.data[0]
      const expiresAt =
        'current_period_end' in sub &&
        typeof sub.current_period_end === 'number'
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null

      // Update DB cache
      await db
        .update(subscriptionTable)
        .set({
          status: 'active',
          type: 'subscription',
          stripeSubscriptionId: sub.id,
          currentPeriodEnd: expiresAt,
          lastVerifiedAt: new Date().toISOString()
        })
        .where(eq(subscriptionTable.id, subscription.id))

      return {
        isActive: true,
        tier: 'subscription',
        productId: sub.items.data[0]?.price.product as string,
        status: 'active',
        expiresAt
      }
    }

    // Check for one-time payments (lifetime deals - 4 years)
    const paymentIntents = await stripe.paymentIntents.list({
      customer: subscription.stripeCustomerId,
      limit: 100
    })

    const successfulPayments = paymentIntents.data.filter(
      (pi) =>
        pi.status === 'succeeded' &&
        pi.metadata?.productId === 'prod_TgIxTUU0Hrdq3a'
    )

    if (successfulPayments.length > 0) {
      const payment = successfulPayments[0]
      const purchasedAt = new Date(payment.created * 1000)
      const expiresAt = new Date(purchasedAt)
      expiresAt.setFullYear(expiresAt.getFullYear() + 4) // 4 years

      const now = new Date()
      const isActive = now < expiresAt

      // Update DB cache
      await db
        .update(subscriptionTable)
        .set({
          status: isActive ? 'active' : 'expired',
          type: 'lifetime',
          expiresAt: expiresAt.toISOString(),
          lastVerifiedAt: new Date().toISOString()
        })
        .where(eq(subscriptionTable.id, subscription.id))

      return {
        isActive,
        tier: 'lifetime',
        productId: 'prod_TgIxTUU0Hrdq3a',
        status: isActive ? 'active' : 'expired',
        expiresAt: expiresAt.toISOString()
      }
    }

    // No active subscription found
    return {
      isActive: false,
      status: 'inactive'
    }
  } catch (error) {
    console.error('Error checking Stripe subscription:', error)
    // Fallback to DB if Stripe query fails
    return getUserSubscriptionFromDB(userId)
  }
}

/**
 * Hybrid - Check DB first, verify with Stripe if needed
 * Updates DB in place when mismatch is detected
 * Webhook is primary source of truth for sync
 */
export async function getUserSubscriptionHybrid(
  userId: string,
  forceVerify = false
): Promise<UserSubscription | null> {
  const dbSubscription = await getUserSubscriptionFromDB(userId)

  // If no DB record, check Stripe directly (will create/update DB)
  if (!dbSubscription) {
    return getUserSubscriptionFromStripe(userId)
  }

  // If force verify or subscription hasn't been verified recently
  const shouldVerify =
    forceVerify ||
    !dbSubscription.expiresAt ||
    (dbSubscription.expiresAt &&
      new Date(dbSubscription.expiresAt) <
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) // 7 days

  if (shouldVerify) {
    // getUserSubscriptionFromStripe updates DB in place
    const stripeSubscription = await getUserSubscriptionFromStripe(userId)
    return stripeSubscription || dbSubscription
  }

  // Return cached DB result (webhook keeps it in sync)
  return dbSubscription
}

/**
 * Check if user has access to premium features
 * If user has active lifetime deal (4 years), they have access
 * If user has active subscription, they have access
 * Lifetime deal users don't need a subscription
 */
export async function hasSubscriptionAccess(userId: string): Promise<boolean> {
  const subscription = await getUserSubscriptionHybrid(userId)

  if (!subscription) {
    return false
  }

  // Check if subscription is active and not expired
  if (!subscription.isActive) {
    return false
  }

  // If user has lifetime deal, they have access (no subscription needed)
  if (subscription.tier === 'lifetime') {
    return true
  }

  // If user has active subscription, they have access
  return subscription.status === 'active'
}

/**
 * Check if user needs to subscribe
 * Returns true if user doesn't have an active lifetime deal or subscription
 */
export async function needsSubscription(userId: string): Promise<boolean> {
  const subscription = await getUserSubscriptionHybrid(userId)

  // No subscription at all
  if (!subscription) {
    return true
  }

  // Has active lifetime deal - doesn't need subscription
  if (subscription.tier === 'lifetime' && subscription.isActive) {
    return false
  }

  // Has active subscription - doesn't need another
  if (subscription.isActive && subscription.status === 'active') {
    return false
  }

  // Subscription expired or inactive - needs to subscribe
  return true
}
