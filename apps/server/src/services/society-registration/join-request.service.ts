/**
 * Join Request Service
 * Handles join request creation, approval, rejection, and management
 */

import {
  type DB,
  formResponses as formResponsesTable,
  joinRequests as joinRequestsTable,
  member as memberTable,
  organization,
  user as userTable
} from '@rov/db'
import type {
  CreateJoinRequestInput,
  ListJoinRequestsInput
} from '@rov/orpc-contracts'
import type { InferSelectModel } from 'drizzle-orm'
import { and, count, desc, eq, gte, inArray, lte, or } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { env } from '@/lib/env'
import { sendRejectionEmail, sendWelcomeEmail } from '@/services/email/sender'

type JoinRequest = InferSelectModel<typeof joinRequestsTable>

interface BulkOperationResult {
  successful: number
  failed: number
  errors: Array<{ requestId: string; error: string }>
}

export class JoinRequestService {
  private db: DB

  constructor(db: DB) {
    this.db = db
  }

  /**
   * Create a join request
   */
  async createJoinRequest(input: CreateJoinRequestInput): Promise<JoinRequest> {
    // Check if user already has a pending request
    const existingRequest = await this.db
      .select()
      .from(joinRequestsTable)
      .where(
        and(
          eq(joinRequestsTable.societyId, input.societyId),
          eq(joinRequestsTable.userId, input.userId),
          or(
            eq(joinRequestsTable.status, 'pending'),
            eq(joinRequestsTable.status, 'payment_pending')
          )
        )
      )
      .limit(1)

    if (existingRequest[0]) {
      throw new Error('You already have a pending join request')
    }

    // Check if user is already a member
    const existingMember = await this.db
      .select()
      .from(memberTable)
      .where(
        and(
          eq(memberTable.organizationId, input.societyId),
          eq(memberTable.userId, input.userId)
        )
      )
      .limit(1)

    if (existingMember[0]) {
      throw new Error('You are already a member of this society')
    }

    // Determine initial status based on payment
    const initialStatus = input.paymentAmount ? 'payment_pending' : 'pending'
    const paymentStatus = input.paymentAmount ? 'pending' : 'not_required'

    const result = await this.db
      .insert(joinRequestsTable)
      .values({
        societyId: input.societyId,
        userId: input.userId,
        formResponseId: input.formResponseId ?? null,
        status: initialStatus,
        paymentStatus,
        paymentAmount: input.paymentAmount ?? null
      })
      .returning()

    return result[0]
  }

  /**
   * Get a single join request
   */
  async getJoinRequest(requestId: string): Promise<JoinRequest | null> {
    const result = await this.db
      .select()
      .from(joinRequestsTable)
      .where(eq(joinRequestsTable.id, requestId))
      .limit(1)

    return result[0] || null
  }

  /**
   * List join requests with filters
   */
  async listJoinRequests(input: ListJoinRequestsInput): Promise<{
    requests: Array<JoinRequest & { user: { name: string; email: string } }>
    total: number
    hasMore: boolean
  }> {
    const conditions = [eq(joinRequestsTable.societyId, input.societyId)]

    // Status filter
    if (input.status && input.status.length > 0) {
      conditions.push(inArray(joinRequestsTable.status, input.status))
    }

    // Payment status filter
    if (input.paymentStatus && input.paymentStatus.length > 0) {
      conditions.push(
        inArray(joinRequestsTable.paymentStatus, input.paymentStatus)
      )
    }

    // Date range filter
    if (input.dateFrom) {
      conditions.push(gte(joinRequestsTable.submittedAt, input.dateFrom))
    }
    if (input.dateTo) {
      conditions.push(lte(joinRequestsTable.submittedAt, input.dateTo))
    }

    // Build where clause - handle single condition case
    const whereClause =
      conditions.length === 1 ? conditions[0] : and(...conditions)

    // Get total count
    const totalResult = await this.db
      .select({ count: count() })
      .from(joinRequestsTable)
      .where(whereClause)

    const total = totalResult[0]?.count || 0

    // Get paginated results with user info
    const requests = await this.db
      .select({
        joinRequest: joinRequestsTable,
        user: {
          name: userTable.name,
          email: userTable.email
        }
      })
      .from(joinRequestsTable)
      .innerJoin(userTable, eq(joinRequestsTable.userId, userTable.id))
      .where(whereClause)
      .orderBy(desc(joinRequestsTable.submittedAt))
      .limit(input.limit)
      .offset(input.offset)

    const formattedRequests = requests.map((r) => ({
      ...r.joinRequest,
      user: r.user
    }))

    return {
      requests: formattedRequests,
      total,
      hasMore: input.offset + input.limit < total
    }
  }

  /**
   * Approve a join request and create membership
   */
  async approveJoinRequest(
    requestId: string,
    approverId: string
  ): Promise<string> {
    const request = await this.getJoinRequest(requestId)

    if (!request) {
      throw new Error('Join request not found')
    }

    if (request.status === 'approved') {
      throw new Error('Join request is already approved')
    }

    if (request.status === 'rejected') {
      throw new Error('Cannot approve a rejected join request')
    }

    // Create membership using better-auth
    const memberResult = await auth.api.addMember({
      body: {
        userId: request.userId,
        role: 'member',
        organizationId: request.societyId
      }
    })

    if (!memberResult) {
      throw new Error('Failed to add member to organization')
    }

    // Update join request status
    await this.db
      .update(joinRequestsTable)
      .set({
        status: 'approved',
        reviewedBy: approverId,
        reviewedAt: new Date()
      })
      .where(eq(joinRequestsTable.id, requestId))

    // Update form response status
    await this.db
      .update(formResponsesTable)
      .set({ status: 'approved' })
      .where(eq(formResponsesTable.id, request.formResponseId ?? ''))

    // Send welcome email
    try {
      const user = await this.db.query.user.findFirst({
        where: eq(userTable.id, request.userId)
      })

      const society = await this.db.query.organization.findFirst({
        where: eq(organization.id, request.societyId)
      })

      if (user && society) {
        const societyLink = `${env.WEB_URL || 'http://localhost:3000'}/spaces/societies/${society.slug || society.id}`

        await sendWelcomeEmail({
          to: user.email,
          userName: user.name,
          societyName: society.name,
          societyLink
        })
      }
    } catch (_error) {
      // Silently fail email sending - approval succeeded
    }

    return memberResult.id
  }

  /**
   * Reject a join request
   */
  async rejectJoinRequest(
    requestId: string,
    approverId: string,
    reason?: string
  ): Promise<void> {
    const request = await this.getJoinRequest(requestId)

    if (!request) {
      throw new Error('Join request not found')
    }

    if (request.status === 'approved') {
      throw new Error('Cannot reject an approved join request')
    }

    // Update join request status
    await this.db
      .update(joinRequestsTable)
      .set({
        status: 'rejected',
        reviewedBy: approverId,
        reviewedAt: new Date(),
        rejectionReason: reason || null
      })
      .where(eq(joinRequestsTable.id, requestId))

    // Update form response status
    await this.db
      .update(formResponsesTable)
      .set({ status: 'rejected' })
      .where(eq(formResponsesTable.id, request.formResponseId ?? ''))

    // Send rejection email
    try {
      const user = await this.db.query.user.findFirst({
        where: eq(userTable.id, request.userId)
      })

      const society = await this.db.query.organization.findFirst({
        where: eq(organization.id, request.societyId)
      })

      if (user && society) {
        await sendRejectionEmail({
          to: user.email,
          userName: user.name,
          societyName: society.name,
          reason
        })
      }
    } catch (_error) {
      // Silently fail email sending
    }
  }

  /**
   * Bulk approve join requests
   */
  async bulkApproveRequests(
    requestIds: string[],
    approverId: string
  ): Promise<BulkOperationResult> {
    const result: BulkOperationResult = {
      successful: 0,
      failed: 0,
      errors: []
    }

    const results = await Promise.allSettled(
      requestIds.map((requestId) =>
        this.approveJoinRequest(requestId, approverId)
      )
    )

    for (let i = 0; i < results.length; i++) {
      const settledResult = results[i]
      if (settledResult.status === 'fulfilled') {
        result.successful++
      } else {
        result.failed++
        result.errors.push({
          requestId: requestIds[i],
          error: settledResult.reason?.message || 'Unknown error'
        })
      }
    }

    return result
  }

  /**
   * Bulk reject join requests
   */
  async bulkRejectRequests(
    requestIds: string[],
    approverId: string,
    reason?: string
  ): Promise<BulkOperationResult> {
    const result: BulkOperationResult = {
      successful: 0,
      failed: 0,
      errors: []
    }

    const results = await Promise.allSettled(
      requestIds.map((requestId) =>
        this.rejectJoinRequest(requestId, approverId, reason)
      )
    )

    for (let i = 0; i < results.length; i++) {
      const settledResult = results[i]
      if (settledResult.status === 'fulfilled') {
        result.successful++
      } else {
        result.failed++
        result.errors.push({
          requestId: requestIds[i],
          error: settledResult.reason?.message || 'Unknown error'
        })
      }
    }

    return result
  }

  /**
   * Get user's join request status for a society
   */
  async getUserJoinRequestStatus(
    userId: string,
    societyId: string
  ): Promise<{
    hasRequest: boolean
    status:
      | 'pending'
      | 'approved'
      | 'rejected'
      | 'payment_pending'
      | 'payment_completed'
      | null
    requestId: string | null
    submittedAt: Date | null
    rejectionReason: string | null
  }> {
    const result = await this.db
      .select()
      .from(joinRequestsTable)
      .where(
        and(
          eq(joinRequestsTable.userId, userId),
          eq(joinRequestsTable.societyId, societyId)
        )
      )
      .orderBy(desc(joinRequestsTable.submittedAt))
      .limit(1)

    if (!result[0]) {
      return {
        hasRequest: false,
        status: null,
        requestId: null,
        submittedAt: null,
        rejectionReason: null
      }
    }

    return {
      hasRequest: true,
      status: result[0].status,
      requestId: result[0].id,
      submittedAt: result[0].submittedAt,
      rejectionReason: result[0].rejectionReason
    }
  }
}
