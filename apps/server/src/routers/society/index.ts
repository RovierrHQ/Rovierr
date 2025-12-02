import { ORPCError } from '@orpc/server'
import {
  member as memberTable,
  type organization as organizationTable
} from '@rov/db'
import type { InferSelectModel } from 'drizzle-orm'
import { eq, sql } from 'drizzle-orm'
import { db } from '@/db'
import { auth } from '@/lib/auth'
import { protectedProcedure } from '@/lib/orpc'
import {
  deleteImageFromS3,
  getPresignedUrlFromFullUrl,
  isS3Url,
  uploadImageToS3
} from '@/services/s3'
import { SocietyService } from '@/services/society'

const societyService = new SocietyService(db)

type Society = InferSelectModel<typeof organizationTable>

// Regex for base64 image data URL prefix
const BASE64_IMAGE_REGEX = /^data:image\/\w+;base64,/

/**
 * Check if user is president of a society
 */
async function isPresident(
  societyId: string,
  headers: Headers
): Promise<boolean> {
  const membership = await auth.api.hasPermission({
    headers,
    body: {
      permissions: {
        organization: ['update']
      },
      organizationId: societyId
    }
  })

  return membership?.success ?? false
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

  // Generate presigned URLs for S3 images
  const logoUrl =
    soc.logo && isS3Url(soc.logo)
      ? await getPresignedUrlFromFullUrl(soc.logo).catch(() => soc.logo)
      : soc.logo

  const bannerUrl =
    soc.banner && isS3Url(soc.banner)
      ? await getPresignedUrlFromFullUrl(soc.banner).catch(() => soc.banner)
      : soc.banner

  return {
    id: soc.id,
    name: soc.name,
    slug: soc.slug,
    logo: logoUrl,
    metadata,
    description: soc.description,
    banner: bannerUrl,
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
        const hasPermission = await isPresident(organizationId, context.headers)
        if (!hasPermission) {
          throw new ORPCError('FORBIDDEN', {
            message: 'You do not have permission to update this society'
          })
        }

        // Process logo and banner images if they're base64 data URLs
        const processedData = { ...data }

        // Process logo image
        if (data.logo !== undefined) {
          if (data.logo === '' || data.logo === null) {
            // Delete existing logo from S3 if removing
            if (
              existing.logo &&
              BASE64_IMAGE_REGEX.test(existing.logo) === false &&
              isS3Url(existing.logo)
            ) {
              await deleteImageFromS3(existing.logo)
            }
            processedData.logo = ''
          } else if (BASE64_IMAGE_REGEX.test(data.logo)) {
            // Upload new logo to S3
            // Delete old logo if it exists and is an S3 URL
            if (
              existing.logo &&
              BASE64_IMAGE_REGEX.test(existing.logo) === false &&
              isS3Url(existing.logo)
            ) {
              await deleteImageFromS3(existing.logo)
            }
            const s3Url = await uploadImageToS3(
              data.logo,
              'profile-pictures',
              organizationId
            )
            processedData.logo = s3Url
          }
          // If it's already a URL, use as-is
        }

        // Process banner image
        if (data.banner !== undefined) {
          if (data.banner === '' || data.banner === null) {
            // Delete existing banner from S3 if removing
            if (
              existing.banner &&
              BASE64_IMAGE_REGEX.test(existing.banner) === false &&
              isS3Url(existing.banner)
            ) {
              await deleteImageFromS3(existing.banner)
            }
            processedData.banner = ''
          } else if (BASE64_IMAGE_REGEX.test(data.banner)) {
            // Upload new banner to S3
            // Delete old banner if it exists and is an S3 URL
            if (
              existing.banner &&
              BASE64_IMAGE_REGEX.test(existing.banner) === false &&
              isS3Url(existing.banner)
            ) {
              await deleteImageFromS3(existing.banner)
            }
            const s3Url = await uploadImageToS3(
              data.banner,
              'banners',
              organizationId
            )
            processedData.banner = s3Url
          }
          // If it's already a URL, use as-is
        }

        // Update society fields
        const soc = await societyService.updateFields(
          organizationId,
          processedData
        )

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
      const { organizationId } = input

      try {
        // Check if user is president
        const hasPermission = await isPresident(organizationId, context.headers)
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
        const hasPermission = await isPresident(organizationId, context.headers)
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
