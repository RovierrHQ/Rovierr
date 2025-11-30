/**
 * Registration Analytics Service
 * Provides analytics and metrics for registration
 */

import { type DB, joinRequests as joinRequestsTable } from '@rov/db'
import { and, count, eq, gte, lte, sql } from 'drizzle-orm'

interface DateRange {
  dateFrom?: Date
  dateTo?: Date
}

interface RegistrationMetrics {
  totalApplications: number
  pendingCount: number
  approvedCount: number
  rejectedCount: number
  paymentPendingCount: number
  approvalRate: number
  rejectionRate: number
  averageTimeToApproval: number
}

interface TrendData {
  date: string
  count: number
}

export class RegistrationAnalyticsService {
  private db: DB

  constructor(db: DB) {
    this.db = db
  }

  /**
   * Get registration metrics for a society
   */
  async getRegistrationMetrics(
    societyId: string,
    dateRange?: DateRange
  ): Promise<RegistrationMetrics> {
    const conditions = [eq(joinRequestsTable.societyId, societyId)]

    if (dateRange?.dateFrom) {
      conditions.push(gte(joinRequestsTable.submittedAt, dateRange.dateFrom))
    }
    if (dateRange?.dateTo) {
      conditions.push(lte(joinRequestsTable.submittedAt, dateRange.dateTo))
    }

    // Get total count
    const totalResult = await this.db
      .select({ count: count() })
      .from(joinRequestsTable)
      .where(and(...conditions))

    const totalApplications = totalResult[0]?.count || 0

    // Get counts by status
    const statusCounts = await this.db
      .select({
        status: joinRequestsTable.status,
        count: count()
      })
      .from(joinRequestsTable)
      .where(and(...conditions))
      .groupBy(joinRequestsTable.status)

    const pendingCount =
      statusCounts.find((s) => s.status === 'pending')?.count || 0
    const approvedCount =
      statusCounts.find((s) => s.status === 'approved')?.count || 0
    const rejectedCount =
      statusCounts.find((s) => s.status === 'rejected')?.count || 0
    const paymentPendingCount =
      statusCounts.find((s) => s.status === 'payment_pending')?.count || 0

    // Calculate rates
    const approvalRate =
      totalApplications > 0 ? (approvedCount / totalApplications) * 100 : 0
    const rejectionRate =
      totalApplications > 0 ? (rejectedCount / totalApplications) * 100 : 0

    // Calculate average time to approval (in hours)
    const approvedRequests = await this.db
      .select({
        submittedAt: joinRequestsTable.submittedAt,
        reviewedAt: joinRequestsTable.reviewedAt
      })
      .from(joinRequestsTable)
      .where(
        and(
          ...conditions,
          eq(joinRequestsTable.status, 'approved'),
          sql`${joinRequestsTable.reviewedAt} IS NOT NULL`
        )
      )

    let averageTimeToApproval = 0
    if (approvedRequests.length > 0) {
      const totalHours = approvedRequests.reduce((sum, req) => {
        if (req.reviewedAt && req.submittedAt) {
          const diff =
            new Date(req.reviewedAt).getTime() -
            new Date(req.submittedAt).getTime()
          return sum + diff / (1000 * 60 * 60) // Convert to hours
        }
        return sum
      }, 0)
      averageTimeToApproval = totalHours / approvedRequests.length
    }

    return {
      totalApplications,
      pendingCount,
      approvedCount,
      rejectedCount,
      paymentPendingCount,
      approvalRate: Math.round(approvalRate * 100) / 100,
      rejectionRate: Math.round(rejectionRate * 100) / 100,
      averageTimeToApproval: Math.round(averageTimeToApproval * 100) / 100
    }
  }

  /**
   * Get application trends over time
   */
  async getApplicationTrends(
    societyId: string,
    dateRange: DateRange
  ): Promise<TrendData[]> {
    const conditions = [eq(joinRequestsTable.societyId, societyId)]

    if (dateRange.dateFrom) {
      conditions.push(gte(joinRequestsTable.submittedAt, dateRange.dateFrom))
    }
    if (dateRange.dateTo) {
      conditions.push(lte(joinRequestsTable.submittedAt, dateRange.dateTo))
    }

    // Group by date
    const trends = await this.db
      .select({
        date: sql<string>`DATE(${joinRequestsTable.submittedAt})`,
        count: count()
      })
      .from(joinRequestsTable)
      .where(and(...conditions))
      .groupBy(sql`DATE(${joinRequestsTable.submittedAt})`)
      .orderBy(sql`DATE(${joinRequestsTable.submittedAt})`)

    return trends.map((t) => ({
      date: t.date,
      count: t.count
    }))
  }

  /**
   * Get approval metrics
   */
  async getApprovalMetrics(societyId: string): Promise<{
    averageTimeToApproval: number
    fastestApproval: number
    slowestApproval: number
  }> {
    const approvedRequests = await this.db
      .select({
        submittedAt: joinRequestsTable.submittedAt,
        reviewedAt: joinRequestsTable.reviewedAt
      })
      .from(joinRequestsTable)
      .where(
        and(
          eq(joinRequestsTable.societyId, societyId),
          eq(joinRequestsTable.status, 'approved'),
          sql`${joinRequestsTable.reviewedAt} IS NOT NULL`
        )
      )

    if (approvedRequests.length === 0) {
      return {
        averageTimeToApproval: 0,
        fastestApproval: 0,
        slowestApproval: 0
      }
    }

    const times = approvedRequests
      .map((req) => {
        if (req.reviewedAt && req.submittedAt) {
          return (
            (new Date(req.reviewedAt).getTime() -
              new Date(req.submittedAt).getTime()) /
            (1000 * 60 * 60)
          ) // Hours
        }
        return 0
      })
      .filter((t) => t > 0)

    const averageTimeToApproval =
      times.reduce((sum, t) => sum + t, 0) / times.length
    const fastestApproval = Math.min(...times)
    const slowestApproval = Math.max(...times)

    return {
      averageTimeToApproval: Math.round(averageTimeToApproval * 100) / 100,
      fastestApproval: Math.round(fastestApproval * 100) / 100,
      slowestApproval: Math.round(slowestApproval * 100) / 100
    }
  }

  /**
   * Get form completion rate
   * This is a placeholder - actual implementation would analyze form progress data
   */
  getFormCompletionRate(_formId: string): number {
    // Placeholder implementation
    // Would need to analyze form_progress table to calculate actual completion rate
    return 85.5
  }
}
