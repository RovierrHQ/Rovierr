/**
 * Application Service
 * Handles job application CRUD operations, filtering, and statistics
 */

import { type DB, jobApplication } from '@rov/db'
import type {
  ApplicationStatistics,
  CreateApplicationInput,
  ListApplicationsQuery,
  UpdateApplicationInput,
  UpdateStatusInput
} from '@rov/orpc-contracts'
import { and, count, desc, eq, ilike, or } from 'drizzle-orm'

export class ApplicationService {
  private db: DB

  constructor(db: DB) {
    this.db = db
  }

  // ============================================================================
  // Application CRUD Operations
  // ============================================================================

  /**
   * Create a new job application
   */
  async createApplication(input: CreateApplicationInput, userId: string) {
    const [newApplication] = await this.db
      .insert(jobApplication)
      .values({
        ...input,
        userId,
        status: 'applied'
      })
      .returning()

    return newApplication
  }

  /**
   * List applications with filtering and pagination
   */
  async listApplications(query: ListApplicationsQuery, userId: string) {
    const { status, search, sortBy, limit, offset } = query

    // Build where conditions
    const conditions = [eq(jobApplication.userId, userId)]

    if (status) {
      conditions.push(eq(jobApplication.status, status))
    }

    if (search) {
      const searchCondition = or(
        ilike(jobApplication.companyName, `%${search}%`),
        ilike(jobApplication.positionTitle, `%${search}%`)
      )
      if (searchCondition) {
        conditions.push(searchCondition)
      }
    }

    // Determine order by clause based on sortBy
    const getOrderBy = () => {
      if (sortBy === 'company') {
        return [jobApplication.companyName]
      }
      if (sortBy === 'status') {
        return [jobApplication.status, desc(jobApplication.applicationDate)]
      }
      // Default: recent
      return [desc(jobApplication.applicationDate)]
    }

    // Execute query
    const applications = await this.db
      .select()
      .from(jobApplication)
      .where(and(...conditions))
      .orderBy(...getOrderBy())
      .limit(limit)
      .offset(offset)

    // Get total count for pagination
    const [{ total }] = await this.db
      .select({ total: count() })
      .from(jobApplication)
      .where(and(...conditions))

    return {
      applications,
      total: Number(total),
      hasMore: offset + applications.length < Number(total)
    }
  }

  /**
   * Get a single application by ID
   */
  async getApplication(applicationId: string, userId: string) {
    const [application] = await this.db
      .select()
      .from(jobApplication)
      .where(
        and(
          eq(jobApplication.id, applicationId),
          eq(jobApplication.userId, userId)
        )
      )
      .limit(1)

    if (!application) {
      throw new Error('Application not found')
    }

    return application
  }

  /**
   * Update an application
   */
  async updateApplication(input: UpdateApplicationInput, userId: string) {
    const { id, ...updates } = input

    // Verify ownership
    await this.checkOwnership(id, userId)

    const [updatedApplication] = await this.db
      .update(jobApplication)
      .set(updates)
      .where(eq(jobApplication.id, id))
      .returning()

    if (!updatedApplication) {
      throw new Error('Application not found')
    }

    return updatedApplication
  }

  /**
   * Delete an application
   */
  async deleteApplication(applicationId: string, userId: string) {
    // Verify ownership
    await this.checkOwnership(applicationId, userId)

    const [deletedApplication] = await this.db
      .delete(jobApplication)
      .where(eq(jobApplication.id, applicationId))
      .returning()

    if (!deletedApplication) {
      throw new Error('Application not found')
    }

    return { success: true }
  }

  /**
   * Update application status
   */
  async updateStatus(input: UpdateStatusInput, userId: string) {
    const { id, status } = input

    // Verify ownership
    await this.checkOwnership(id, userId)

    const [updatedApplication] = await this.db
      .update(jobApplication)
      .set({ status })
      .where(eq(jobApplication.id, id))
      .returning()

    if (!updatedApplication) {
      throw new Error('Application not found')
    }

    return updatedApplication
  }

  // ============================================================================
  // Statistics
  // ============================================================================

  /**
   * Get application statistics for a user
   */
  async getStatistics(userId: string): Promise<ApplicationStatistics> {
    // Get total count
    const [{ total }] = await this.db
      .select({ total: count() })
      .from(jobApplication)
      .where(eq(jobApplication.userId, userId))

    // Get counts by status
    const statusCounts = await this.db
      .select({
        status: jobApplication.status,
        count: count()
      })
      .from(jobApplication)
      .where(eq(jobApplication.userId, userId))
      .groupBy(jobApplication.status)

    // Build byStatus object
    const byStatus: Record<string, number> = {
      applied: 0,
      interview_scheduled: 0,
      interview_completed: 0,
      offer_received: 0,
      rejected: 0,
      withdrawn: 0
    }

    for (const { status, count: statusCount } of statusCounts) {
      byStatus[status] = Number(statusCount)
    }

    // Calculate derived statistics
    const upcomingInterviews = byStatus.interview_scheduled || 0
    const pendingResponses = byStatus.applied || 0

    return {
      total: Number(total),
      byStatus,
      upcomingInterviews,
      pendingResponses
    }
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Check if user owns the application
   */
  private async checkOwnership(
    applicationId: string,
    userId: string
  ): Promise<void> {
    const [application] = await this.db
      .select({ userId: jobApplication.userId })
      .from(jobApplication)
      .where(eq(jobApplication.id, applicationId))
      .limit(1)

    if (!application) {
      throw new Error('Application not found')
    }

    if (application.userId !== userId) {
      throw new Error('You do not have permission to access this application')
    }
  }
}
