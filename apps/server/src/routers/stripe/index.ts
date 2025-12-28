import { db } from '@api/db'
import { env } from '@api/lib/env'
import { stripe } from '@api/lib/stripe'
import { betterAuth } from '@api/middleware/auth'
import { subscription as subscriptionTable, user as userTable } from '@rov/db'
import { eq } from 'drizzle-orm'
import Elysia from 'elysia'
import type Stripe from 'stripe'
import { z } from 'zod'

export const stripeRouter = new Elysia({ name: 'stripe' })
  // Public routes (no auth required)
  .group('/stripe', { detail: { tags: ['Stripe'], hide: true } }, (app) =>
    app
      // GET /stripe/publishable-key - Get publishable key
      .get(
        '/publishableKey',
        () => {
          return {
            publishableKey: env.STRIPE_PUBLISHABLE_KEY
          }
        },
        {
          response: z.object({
            publishableKey: z.string()
          })
        }
      )
      // POST /stripe/webhook - Handle Stripe webhook events
      .onParse(async ({ request, headers }) => {
        // Intercept body parsing to get raw body for Stripe signature verification
        // Elysia automatically parses JSON, but Stripe needs the raw body
        if (headers['content-type']?.includes('application/json')) {
          if (!request.body) {
            throw new Error('Request body is missing')
          }
          const arrayBuffer = await Bun.readableStreamToArrayBuffer(
            request.body
          )
          const rawBody = Buffer.from(arrayBuffer)
          return rawBody
        }
      })
      .post(
        '/webhook',
        async ({ body, headers }) => {
          try {
            console.log('Webhook received - checking signature...')
            const signature = headers['stripe-signature']

            if (!signature) {
              console.error('Missing stripe-signature header')
              throw new Error('Missing stripe-signature header')
            }

            console.log('Signature header:', `${signature.substring(0, 50)}...`)

            // body is now the raw Buffer from onParse
            const rawBody = body as Buffer
            console.log('Raw body received, length:', rawBody.length)

            // Verify webhook signature
            let event: Stripe.Event
            try {
              event = await stripe.webhooks.constructEventAsync(
                rawBody,
                signature,
                env.STRIPE_WEBHOOK_SECRET
              )
              console.log(
                `Webhook signature verified. Event type: ${event.type}, ID: ${event.id}`
              )
            } catch (err) {
              console.error('Webhook signature verification failed')
              console.error('Error details:', err)
              console.error('Signature:', signature)
              console.error('Webhook secret:', env.STRIPE_WEBHOOK_SECRET)
              console.error('Raw body length:', rawBody.length)
              console.error(
                'Make sure STRIPE_WEBHOOK_SECRET matches the secret from: stripe listen --forward-to localhost:3000/stripe/webhook'
              )
              throw new Error('Invalid signature')
            }

            // Handle different event types
            console.log(`Processing webhook event: ${event.type}`)
            switch (event.type) {
              case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent

                // Get userId from PaymentIntent metadata (more reliable)
                let userId = paymentIntent.metadata?.userId

                // Fallback to customer metadata if not in PaymentIntent
                if (
                  !userId &&
                  paymentIntent.customer &&
                  typeof paymentIntent.customer === 'string'
                ) {
                  const customer = await stripe.customers.retrieve(
                    paymentIntent.customer
                  )

                  if (!customer.deleted && 'metadata' in customer) {
                    userId = customer.metadata?.userId
                  }
                }

                if (!userId) {
                  console.error(
                    'PaymentIntent missing userId in metadata',
                    paymentIntent.id
                  )
                  return { received: true }
                }

                if (
                  !paymentIntent.customer ||
                  typeof paymentIntent.customer !== 'string'
                ) {
                  console.error('PaymentIntent missing customer ID')
                  return { received: true }
                }

                // Check if subscription already exists
                const existingSubscription =
                  await db.query.subscription.findFirst({
                    where: eq(subscriptionTable.userId, userId)
                  })

                // Calculate expiry date: 4 years from purchase for lifetime deal
                const purchasedAt = new Date()
                const expiresAt = new Date(purchasedAt)
                expiresAt.setFullYear(expiresAt.getFullYear() + 4)

                if (existingSubscription) {
                  // Update existing subscription (sync with Stripe)
                  await db
                    .update(subscriptionTable)
                    .set({
                      stripePaymentIntentId: paymentIntent.id,
                      stripeProductId: 'prod_TgIxTUU0Hrdq3a',
                      type: 'lifetime',
                      amount: paymentIntent.amount,
                      currency: paymentIntent.currency,
                      status: 'active',
                      purchasedAt: purchasedAt.toISOString(),
                      expiresAt: expiresAt.toISOString(),
                      lastVerifiedAt: new Date().toISOString(),
                      cancelledAt: null // Clear cancellation if re-activated
                    })
                    .where(eq(subscriptionTable.id, existingSubscription.id))

                  console.log(
                    `Subscription updated for user ${userId} (webhook sync)`
                  )
                } else {
                  // Create new subscription record
                  await db.insert(subscriptionTable).values({
                    userId,
                    stripeCustomerId: paymentIntent.customer,
                    stripePaymentIntentId: paymentIntent.id,
                    stripeProductId: 'prod_TgIxTUU0Hrdq3a',
                    type: 'lifetime', // 4-year lifetime deal
                    amount: paymentIntent.amount,
                    currency: paymentIntent.currency,
                    status: 'active',
                    purchasedAt: purchasedAt.toISOString(),
                    expiresAt: expiresAt.toISOString(),
                    lastVerifiedAt: new Date().toISOString()
                  })

                  console.log(`Subscription created for user ${userId}`)
                }
                break
              }

              case 'charge.refunded': {
                const charge = event.data.object as Stripe.Charge

                if (
                  !charge.payment_intent ||
                  typeof charge.payment_intent !== 'string'
                ) {
                  return { received: true }
                }

                // Find subscription by payment intent ID
                const subscription = await db.query.subscription.findFirst({
                  where: eq(
                    subscriptionTable.stripePaymentIntentId,
                    charge.payment_intent
                  )
                })

                if (subscription) {
                  await db
                    .update(subscriptionTable)
                    .set({
                      status: 'refunded',
                      cancelledAt: new Date().toISOString(),
                      lastVerifiedAt: new Date().toISOString()
                    })
                    .where(eq(subscriptionTable.id, subscription.id))

                  console.log(
                    `Subscription ${subscription.id} marked as refunded`
                  )
                }
                break
              }

              case 'customer.subscription.updated':
              case 'customer.subscription.deleted': {
                // Handle subscription updates (for future recurring subscriptions)
                const stripeSubscription = event.data.object

                if (
                  !stripeSubscription.customer ||
                  typeof stripeSubscription.customer !== 'string'
                ) {
                  return { received: true }
                }

                // Find subscription by customer ID
                const subscription = await db.query.subscription.findFirst({
                  where: eq(
                    subscriptionTable.stripeCustomerId,
                    stripeSubscription.customer
                  )
                })

                if (subscription) {
                  const status =
                    stripeSubscription.status === 'active'
                      ? 'active'
                      : stripeSubscription.status === 'past_due'
                        ? 'past_due'
                        : 'cancelled'

                  // Access subscription period dates using bracket notation for type safety
                  const currentPeriodStart =
                    'current_period_start' in stripeSubscription &&
                    typeof stripeSubscription.current_period_start === 'number'
                      ? new Date(
                          stripeSubscription.current_period_start * 1000
                        ).toISOString()
                      : null
                  const currentPeriodEnd =
                    'current_period_end' in stripeSubscription &&
                    typeof stripeSubscription.current_period_end === 'number'
                      ? new Date(
                          stripeSubscription.current_period_end * 1000
                        ).toISOString()
                      : null

                  await db
                    .update(subscriptionTable)
                    .set({
                      status,
                      type: 'subscription',
                      stripeSubscriptionId: stripeSubscription.id,
                      currentPeriodStart,
                      currentPeriodEnd,
                      expiresAt: currentPeriodEnd,
                      lastVerifiedAt: new Date().toISOString()
                    })
                    .where(eq(subscriptionTable.id, subscription.id))

                  console.log(
                    `Subscription ${subscription.id} updated: ${status}`
                  )
                }
                break
              }

              case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent
                console.log(
                  `Payment failed for PaymentIntent ${paymentIntent.id}`
                )
                // You might want to log this or notify the user
                break
              }

              default:
                console.log(`Unhandled event type: ${event.type}`)
            }

            return { received: true }
          } catch (error) {
            console.error('Webhook error:', error)
            throw error
          }
        },
        {
          // No body schema - we need raw body for signature verification
          response: z.object({
            received: z.boolean()
          })
        }
      )
  )
  // Authenticated routes
  .use(betterAuth)
  .group('/stripe', { auth: true, detail: { tags: ['Stripe'] } }, (app) =>
    app
      // POST /stripe/payment-sheet - Create payment sheet parameters
      .post(
        '/payment-sheet',
        async ({ user, body }) => {
          try {
            // Get user data to retrieve email
            const userData = await db.query.user.findFirst({
              where: eq(userTable.id, user.id)
            })

            if (!userData?.email) {
              throw new Error('User not found or email missing')
            }

            // Get or create Stripe Customer
            let customer: Stripe.Customer
            const existingCustomers = await stripe.customers.list({
              email: userData.email,
              limit: 1
            })

            if (existingCustomers.data.length > 0) {
              customer = existingCustomers.data[0]
            } else {
              customer = await stripe.customers.create({
                email: userData.email,
                name: userData.name,
                metadata: {
                  userId: user.id
                }
              })
            }

            // Create Ephemeral Key for customer (required for mobile Payment Element)
            // Note: apiVersion must be passed in a separate options hash
            const ephemeralKey = await stripe.ephemeralKeys.create(
              { customer: customer.id },
              { apiVersion: '2025-12-15.clover' }
            )

            if (!ephemeralKey.secret) {
              throw new Error('Failed to create ephemeral key')
            }

            // Create CustomerSession (optional, for enhanced features)
            const customerSession = await stripe.customerSessions.create({
              customer: customer.id,
              components: {
                mobile_payment_element: {
                  enabled: true,
                  features: {
                    payment_method_save: 'enabled',
                    payment_method_redisplay: 'enabled',
                    payment_method_remove: 'enabled'
                  }
                }
              }
            })

            // Create PaymentIntent with metadata for webhook tracking
            const paymentIntent = await stripe.paymentIntents.create({
              amount: body.amount,
              currency: body.currency,
              customer: customer.id,
              automatic_payment_methods: {
                enabled: true
              },
              metadata: {
                userId: user.id,
                productId: 'prod_TgIxTUU0Hrdq3a'
              }
            })

            return {
              paymentIntent: paymentIntent.client_secret,
              customerEphemeralKeySecret: ephemeralKey.secret,
              customerSessionClientSecret: customerSession.client_secret,
              customer: customer.id,
              publishableKey: env.STRIPE_PUBLISHABLE_KEY
            }
          } catch (error) {
            console.error('Error creating payment sheet:', error)
            // Re-throw the error so Elysia can handle it properly
            throw error
          }
        },
        {
          body: z.object({
            amount: z.number().int().positive().describe('Amount in cents'),
            currency: z
              .string()
              .length(3)
              .default('usd')
              .describe('Currency code (e.g., usd, eur)')
          }),
          response: z.object({
            paymentIntent: z.string().nullable(),
            customerEphemeralKeySecret: z.string(),
            customerSessionClientSecret: z.string(),
            customer: z.string(),
            publishableKey: z.string()
          })
        }
      )
  )
