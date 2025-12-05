/**
 * Cover Letter Service
 * Handles cover letter CRUD operations
 */

import type { DB } from '@rov/db'
import { coverLetter } from '@rov/db/schema'
import { and, eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export class CoverLetterService {
  private db: DB

  constructor(db: DB) {
    this.db = db
  }

  /**
   * Create a new cover letter
   */
  async createCoverLetter(
    userId: string,
    resumeId: string,
    content: string,
    applicationId?: string
  ) {
    const [result] = await this.db
      .insert(coverLetter)
      .values({
        id: nanoid(),
        userId,
        resumeId,
        content,
        applicationId: applicationId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .returning()

    return {
      ...result,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt
    }
  }

  /**
   * Get cover letter by ID and verify ownership
   */
  async getCoverLetter(id: string, userId: string) {
    const [result] = await this.db
      .select()
      .from(coverLetter)
      .where(and(eq(coverLetter.id, id), eq(coverLetter.userId, userId)))
      .limit(1)

    if (!result) {
      return null
    }

    return {
      ...result,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt
    }
  }

  /**
   * Update cover letter content
   */
  async updateCoverLetter(id: string, content: string, userId: string) {
    // Verify ownership
    const existing = await this.getCoverLetter(id, userId)

    if (!existing) {
      throw new Error('Cover letter not found')
    }

    const [result] = await this.db
      .update(coverLetter)
      .set({
        content,
        updatedAt: new Date().toISOString()
      })
      .where(eq(coverLetter.id, id))
      .returning()

    return {
      ...result,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt
    }
  }

  /**
   * Delete cover letter
   */
  async deleteCoverLetter(id: string, userId: string) {
    // Verify ownership
    const existing = await this.getCoverLetter(id, userId)

    if (!existing) {
      throw new Error('Cover letter not found')
    }

    await this.db.delete(coverLetter).where(eq(coverLetter.id, id))

    return { success: true }
  }
}
