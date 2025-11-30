/**
 * Payment Verification Service
 * Handles manual payment verification for join requests
 */

import { type DB, joinRequests as joinRequestsTable } from '@rov/db'
import { eq } from 'drizzle-orm'

export class PaymentVerificationService {
  private db: DB

  constructor(db: DB) {
    this.db = db
  }

  /**
   * Mark payment as verified
   */
  async markPaymentAsVerified(
    requestId: string,
    verifierId: string,
    notes?: string
  ): Promise<void> {
    const request = await this.db
      .select()
      .from(joinRequestsTable)
      .where(eq(joinRequestsTable.id, requestId))
      .limit(1)

    if (!request[0]) {
      throw new Error('Join request not found')
    }

    // Update payment status
    await this.db
      .update(joinRequestsTable)
      .set({
        paymentStatus: 'verified',
        paymentVerifiedBy: verifierId,
        paymentVerifiedAt: new Date(),
        paymentNotes: notes || null,
        status: 'payment_completed'
      })
      .where(eq(joinRequestsTable.id, requestId))

    // Auto-approval logic will be handled by the router/controller layer
  }

  /**
   * Mark payment as not verified
   */
  async markPaymentAsNotVerified(
    requestId: string,
    verifierId: string,
    reason: string
  ): Promise<void> {
    const request = await this.db
      .select()
      .from(joinRequestsTable)
      .where(eq(joinRequestsTable.id, requestId))
      .limit(1)

    if (!request[0]) {
      throw new Error('Join request not found')
    }

    // Update payment status
    await this.db
      .update(joinRequestsTable)
      .set({
        paymentStatus: 'not_verified',
        paymentVerifiedBy: verifierId,
        paymentVerifiedAt: new Date(),
        paymentNotes: reason
      })
      .where(eq(joinRequestsTable.id, requestId))
  }

  /**
   * Upload payment proof
   */
  async uploadPaymentProof(requestId: string, proofUrl: string): Promise<void> {
    const request = await this.db
      .select()
      .from(joinRequestsTable)
      .where(eq(joinRequestsTable.id, requestId))
      .limit(1)

    if (!request[0]) {
      throw new Error('Join request not found')
    }

    // Update payment proof URL
    await this.db
      .update(joinRequestsTable)
      .set({
        paymentProofUrl: proofUrl
      })
      .where(eq(joinRequestsTable.id, requestId))
  }

  /**
   * Get payment instructions from form
   * This would typically fetch payment details from the form configuration
   */
  getPaymentInstructions(_formId: string): {
    amount: string
    currency: string
    instructions: string
  } {
    // This is a placeholder - actual implementation would fetch from forms table
    // For now, return basic structure
    return {
      amount: '0',
      currency: 'HKD',
      instructions: 'Payment instructions will be provided by the society'
    }
  }
}
