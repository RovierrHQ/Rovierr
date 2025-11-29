import { ORPCError } from '@orpc/server'
import {
  member as memberTable,
  type organization as organizationTable
} from '@rov/db'
import type { InferSelectModel } from 'drizzle-orm'
import { and, eq, sql } from 'drizzle-orm'
import { db } from '@/db'
import { protectedProcedure } from '@/lib/orpc'
import { SocietyService } from '@/services/society'

const societyService = new SocietyService(db)

type Society = InferSelectModel<typeof organizationTable>

/**
 * Check if user is president of a society
 */
async function isPresident(
  userId: string,
  societyId: string
): Promise<boolean> {
  const membership = await db.query.member.findFirst({
    where: and(
      eq(memberTable.organizationId, societyId),
      eq(memberTable.userId, userId)
    )
  })

  return membership?.role === 'owner' // better-auth uses 'owner' for the creator/president
}

/**
 * Transform society database model to API response format
 * Matches the societySchema from ORPC contracts
 */
async function transformSociety(soc: Society) {
  // Get member count
  const [memberCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(memberTable)
    .where(eq(memberTable.organizationId, soc.id))

  // Parse metadata if it's a string
  let metadata: Record<string, unknown> | null = null
  if (soc.metadata) {
    try {
      metadata =
        typeof soc.metadata === 'string'
          ? (JSON.parse(soc.metadata) as Record<string, unknown>)
          : (soc.metadata as Record<string, unknown>)
    } catch {
      metadata = null
    }
  }

  return {
    id: soc.id,
    name: soc.name,
    slug: soc.slug,
    logo: soc.logo,
    metadata,
    description: soc.description,
    banner: soc.banner,
    institutionId: soc.institutionId,
    type: soc.type,
    visibility: soc.visibility,
    isVerified: soc.isVerified ?? false,
    tags: soc.tags,
    instagram: soc.instagram,
    facebook: soc.facebook,
    twitter: soc.twitter,
    linkedin: soc.linkedin,
    whatsapp: soc.whatsapp,
    telegram: soc.telegram,
    website: soc.website,
    foundingYear: soc.foundingYear,
    meetingSchedule: soc.meetingSchedule,
    membershipRequirements: soc.membershipRequirements,
    goals: soc.goals,
    primaryColor: soc.primaryColor,
    onboardingCompleted: soc.onboardingCompleted ?? false,
    profileCompletionPercentage: soc.profileCompletionPercentage ?? 0,
    createdAt: soc.createdAt,
    updatedAt: soc.updatedAt,
    memberCount: Number(memberCount?.count ?? 1)
  }
}

export const society = {
  /**
   * Get society by ID (enriched with society fields)
   */
  getById: protectedProcedure.society.getById.handler(async ({ input }) => {
    const soc = await societyService.getById(input.id)

    if (!soc) {
      return null
    }

    return await transformSociety(soc)
  }),

  /**
   * Get society by slug (enriched with society fields)
   */
  getBySlug: protectedProcedure.society.getBySlug.handler(async ({ input }) => {
    const soc = await societyService.getBySlug(input.slug)

    if (!soc) {
      return null
    }

    return await transformSociety(soc)
  }),

  /**
   * Update society-specific fields (social links, branding, additional details)
   * Note: name/slug/logo are updated via Better-Auth
   */
  updateFields: protectedProcedure.society.updateFields.handler(
    async ({ input, context }) => {
      const userId = context.session.user.id
      const { organizationId, data } = input

      try {
        // Check if society exists
        const existing = await societyService.getById(organizationId)
        if (!existing) {
          throw new ORPCError('NOT_FOUND', {
            message: 'Society not found'
          })
        }

        // Check if user is president
        const hasPermission = await isPresident(userId, organizationId)
        if (!hasPermission) {
          throw new ORPCError('FORBIDDEN', {
            message: 'You do not have permission to update this society'
          })
        }

        // Update society fields
        const soc = await societyService.updateFields(organizationId, data)

        return await transformSociety(soc)
      } catch (error) {
        if (error instanceof ORPCError) {
          throw error
        }

        throw new ORPCError('VALIDATION_ERROR', {
          message:
            error instanceof Error ? error.message : 'Failed to update society'
        })
      }
    }
  ),

  /**
   * Upload banner image for society
   * Note: Logo upload is handled by Better-Auth
   */
  uploadBanner: protectedProcedure.society.uploadBanner.handler(
    async ({ input, context }) => {
      const userId = context.session.user.id
      const { organizationId } = input

      try {
        // Check if user is president
        const hasPermission = await isPresident(userId, organizationId)
        if (!hasPermission) {
          throw new ORPCError('FORBIDDEN', {
            message:
              'You do not have permission to upload banner for this society'
          })
        }

        // Note: File upload is handled via FormData in the actual HTTP request
        // This is a placeholder that would be implemented with proper file handling
        // For now, we'll throw an error indicating this needs to be implemented
        throw new ORPCError('UPLOAD_FAILED', {
          message: 'Banner upload not yet implemented - use multipart/form-data'
        })
      } catch (error) {
        if (error instanceof ORPCError) {
          throw error
        }

        throw new ORPCError('UPLOAD_FAILED', {
          message:
            error instanceof Error ? error.message : 'Failed to upload banner'
        })
      }
    }
  ),

  /**
   * Mark society onboarding as complete
   */
  completeOnboarding: protectedProcedure.society.completeOnboarding.handler(
    async ({ input, context }) => {
      const userId = context.session.user.id
      const { organizationId } = input

      try {
        // Check if society exists
        const existing = await societyService.getById(organizationId)
        if (!existing) {
          throw new ORPCError('NOT_FOUND', {
            message: 'Society not found'
          })
        }

        // Check if user is president
        const hasPermission = await isPresident(userId, organizationId)
        if (!hasPermission) {
          throw new ORPCError('FORBIDDEN', {
            message: 'You do not have permission to update this society'
          })
        }

        // Mark onboarding as complete
        await societyService.markOnboardingComplete(organizationId)

        return { success: true }
      } catch (error) {
        if (error instanceof ORPCError) {
          throw error
        }

        throw new Error(
          error instanceof Error
            ? error.message
            : 'Failed to complete onboarding'
        )
      }
    }
  )
}
