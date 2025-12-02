/**
 * Society service
 * Handles society CRUD operations, onboarding state, and profile completion
 */

import { type DB, organization as organizationTable } from '@rov/db'
import type { updateSocietyFieldsSchema } from '@rov/orpc-contracts'
import type { InferSelectModel } from 'drizzle-orm'
import { eq } from 'drizzle-orm'
import type { z } from 'zod'
import { sanitizeInput } from './validation'

type UpdateSocietyFieldsInput = z.infer<typeof updateSocietyFieldsSchema>
type Society = InferSelectModel<typeof organizationTable>

export class SocietyService {
  private db: DB

  constructor(db: DB) {
    this.db = db
  }

  /**
   * Update society-specific fields only (excludes name/slug/logo which are handled by Better-Auth)
   * This method is used by the ORPC updateFields endpoint
   */
  async updateFields(
    societyId: string,
    input: UpdateSocietyFieldsInput
  ): Promise<Society> {
    const updateData: Record<string, unknown> = {}

    // Sanitize and update text fields
    if (input.description !== undefined) {
      updateData.description = sanitizeInput(input.description)
    }

    if (input.tags !== undefined) {
      updateData.tags = input.tags
    }

    if (input.type !== undefined) {
      updateData.type = input.type
    }

    if (input.visibility !== undefined) {
      updateData.visibility = input.visibility
    }

    if (input.institutionId !== undefined) {
      updateData.institutionId = input.institutionId
    }

    if (input.logo !== undefined) {
      updateData.logo = input.logo
    }

    if (input.banner !== undefined) {
      updateData.banner = input.banner
    }

    // Update social links
    if (input.instagram !== undefined) {
      updateData.instagram = input.instagram
        ? sanitizeInput(input.instagram)
        : null
    }
    if (input.facebook !== undefined) {
      updateData.facebook = input.facebook
        ? sanitizeInput(input.facebook)
        : null
    }
    if (input.twitter !== undefined) {
      updateData.twitter = input.twitter ? sanitizeInput(input.twitter) : null
    }
    if (input.linkedin !== undefined) {
      updateData.linkedin = input.linkedin
        ? sanitizeInput(input.linkedin)
        : null
    }
    if (input.whatsapp !== undefined) {
      updateData.whatsapp = input.whatsapp
        ? sanitizeInput(input.whatsapp)
        : null
    }
    if (input.telegram !== undefined) {
      updateData.telegram = input.telegram
        ? sanitizeInput(input.telegram)
        : null
    }
    if (input.website !== undefined) {
      updateData.website = input.website ? sanitizeInput(input.website) : null
    }

    // Update additional details
    if (input.foundingYear !== undefined) {
      updateData.foundingYear = input.foundingYear
    }

    if (input.meetingSchedule !== undefined) {
      updateData.meetingSchedule = input.meetingSchedule
        ? sanitizeInput(input.meetingSchedule)
        : null
    }

    if (input.membershipRequirements !== undefined) {
      updateData.membershipRequirements = input.membershipRequirements
        ? sanitizeInput(input.membershipRequirements)
        : null
    }

    if (input.goals !== undefined) {
      updateData.goals = input.goals ? sanitizeInput(input.goals) : null
    }

    if (input.primaryColor !== undefined) {
      updateData.primaryColor = input.primaryColor
    }

    // Perform update
    await this.db
      .update(organizationTable)
      .set(updateData)
      .where(eq(organizationTable.id, societyId))

    // Fetch updated society
    const society = await this.getById(societyId)

    if (!society) {
      throw new Error('Society not found after update')
    }

    // Recalculate profile completion
    const completion = this.calculateCompletion(society)
    await this.db
      .update(organizationTable)
      .set({ profileCompletionPercentage: completion })
      .where(eq(organizationTable.id, societyId))

    return { ...society, profileCompletionPercentage: completion }
  }

  /**
   * Get society by ID
   */
  async getById(id: string): Promise<Society | null> {
    const result = await this.db
      .select()
      .from(organizationTable)
      .where(eq(organizationTable.id, id))
      .limit(1)

    return result[0] || null
  }

  /**
   * Get society by slug
   */
  async getBySlug(slug: string): Promise<Society | null> {
    const result = await this.db
      .select()
      .from(organizationTable)
      .where(eq(organizationTable.slug, slug))
      .limit(1)

    return result[0] || null
  }

  /**
   * Calculate profile completion percentage
   * Formula from requirements:
   * - Basic info (name, description) - 30%
   * - Visual branding (logo, banner) - 20%
   * - Social links (at least 2 links) - 20%
   * - Additional details (at least 2 fields) - 20%
   * - Member count (at least 3 members) - 10%
   */
  calculateCompletion(society: Society): number {
    let completion = 0

    // Basic info (30%) - name and description are required, so always 30%
    if (society.name && society.description) {
      completion += 30
    }

    // Visual branding (20%) - logo OR banner
    const hasLogo = !!society.logo
    const hasBanner = !!society.banner
    if (hasLogo && hasBanner) {
      completion += 20
    } else if (hasLogo || hasBanner) {
      completion += 10
    }

    // Social links (20%) - at least 2 links
    const socialLinks = [
      society.instagram,
      society.facebook,
      society.twitter,
      society.linkedin,
      society.whatsapp,
      society.telegram,
      society.website
    ].filter(Boolean)

    if (socialLinks.length >= 2) {
      completion += 20
    } else if (socialLinks.length === 1) {
      completion += 10
    }

    // Additional details (20%) - at least 2 fields
    const additionalDetails = [
      society.foundingYear,
      society.meetingSchedule,
      society.membershipRequirements,
      society.goals
    ].filter(Boolean)

    if (additionalDetails.length >= 2) {
      completion += 20
    } else if (additionalDetails.length === 1) {
      completion += 10
    }

    // Member count (10%) - at least 3 members
    // Note: This requires a separate query to count members
    // For now, we'll skip this part and it can be added later

    return completion
  }

  /**
   * Mark onboarding as complete
   */
  async markOnboardingComplete(societyId: string): Promise<void> {
    await this.db
      .update(organizationTable)
      .set({ onboardingCompleted: true })
      .where(eq(organizationTable.id, societyId))
  }
}
