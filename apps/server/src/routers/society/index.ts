import { db } from '@api/db'
import { auth } from '@api/lib/auth'
import { betterAuth } from '@api/middleware/auth'
import {
  deleteImageFromS3,
  getPresignedUrlFromFullUrl,
  isS3Url,
  uploadImageToS3
} from '@api/services/s3'
import { SocietyService } from '@api/services/society'
import {
  institution as institutionTable,
  member as memberTable,
  type organization as organizationTable
} from '@rov/db'
import type { InferSelectModel } from 'drizzle-orm'
import { eq, sql } from 'drizzle-orm'
import { Elysia } from 'elysia'
import {
  SocietyForbiddenError,
  SocietyNotFoundError,
  SocietyValidationError,
  UploadFailedError
} from './errors'
import { societySchema, updateSocietyFieldsSchema } from './schemas'
import { societyEmailRouter } from './society-email'
import { societyRegistrationRouter } from './society-registration'

const societyService = new SocietyService(db)

type Society = InferSelectModel<typeof organizationTable>

// Regex for base64 image data URL prefix
const BASE64_IMAGE_REGEX = /^data:image\/\w+;base64,/

/**
 * Check if user is president of a society
 */
async function isPresident(
  societyId: string,
  headers: Record<string, string | undefined>
): Promise<boolean> {
  // Convert headers record to Headers object
  const headersObj = new Headers()
  for (const [key, value] of Object.entries(headers)) {
    if (value !== undefined) {
      headersObj.set(key, value)
    }
  }

  const membership = await auth.api.hasPermission({
    headers: headersObj,
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
 */
async function transformSociety(soc: Society) {
  // Get member count
  const [memberCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(memberTable)
    .where(eq(memberTable.organizationId, soc.id))

  // Get institution name if institutionId exists
  let institutionName: string | null = null
  if (soc.institutionId) {
    const institution = await db.query.institution.findFirst({
      where: eq(institutionTable.id, soc.institutionId),
      columns: { name: true }
    })
    institutionName = institution?.name ?? null
  }

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
    institutionName,
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

export const society = new Elysia({ prefix: '/society' })
  .use(betterAuth)
  .group('', { auth: true }, (app) =>
    app
      /**
       * Get society by ID (enriched with society fields)
       * GET /society/:id
       */
      .get(
        '/:id',
        async ({ params }) => {
          const soc = await societyService.getById(params.id)

          if (!soc) {
            return null
          }

          return await transformSociety(soc)
        },
        {
          response: societySchema.nullable(),
          detail: {
            tags: ['Societies'],
            summary: 'Get Society',
            description: 'Get society by ID with all fields'
          }
        }
      )

      /**
       * Get society by slug (enriched with society fields)
       * GET /society/slug/:slug
       */
      .get(
        '/slug/:slug',
        async ({ params }) => {
          const soc = await societyService.getBySlug(params.slug)

          if (!soc) {
            return null
          }

          return await transformSociety(soc)
        },
        {
          response: societySchema.nullable(),
          detail: {
            tags: ['Societies'],
            summary: 'Get Society by Slug',
            description: 'Get society by slug with all fields'
          }
        }
      )

      /**
       * Update society-specific fields
       * PATCH /society/:id/fields
       */
      .patch(
        '/:id/fields',
        async ({ params, body, headers, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          const organizationId = params.id

          try {
            // Check if society exists
            const existing = await societyService.getById(organizationId)
            if (!existing) {
              throw new SocietyNotFoundError()
            }

            // Check if user is president
            const hasPermission = await isPresident(organizationId, headers)
            if (!hasPermission) {
              throw new SocietyForbiddenError(
                'You do not have permission to update this society'
              )
            }

            // Process logo and banner images if they're base64 data URLs
            const processedData = { ...body }

            // Process logo image
            if (body.logo !== undefined) {
              if (body.logo === '' || body.logo === null) {
                // Delete existing logo from S3 if removing
                if (
                  existing.logo &&
                  BASE64_IMAGE_REGEX.test(existing.logo) === false &&
                  isS3Url(existing.logo)
                ) {
                  await deleteImageFromS3(existing.logo)
                }
                processedData.logo = ''
              } else if (BASE64_IMAGE_REGEX.test(body.logo)) {
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
                  body.logo,
                  'profile-pictures',
                  organizationId
                )
                processedData.logo = s3Url
              }
              // If it's already a URL, use as-is
            }

            // Process banner image
            if (body.banner !== undefined) {
              if (body.banner === '' || body.banner === null) {
                // Delete existing banner from S3 if removing
                if (
                  existing.banner &&
                  BASE64_IMAGE_REGEX.test(existing.banner) === false &&
                  isS3Url(existing.banner)
                ) {
                  await deleteImageFromS3(existing.banner)
                }
                processedData.banner = ''
              } else if (BASE64_IMAGE_REGEX.test(body.banner)) {
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
                  body.banner,
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
            if (
              error instanceof SocietyNotFoundError ||
              error instanceof SocietyForbiddenError
            ) {
              throw error
            }

            throw new SocietyValidationError(
              error instanceof Error
                ? error.message
                : 'Failed to update society'
            )
          }
        },
        {
          body: updateSocietyFieldsSchema,
          response: societySchema,
          detail: {
            tags: ['Societies'],
            summary: 'Update Society Fields',
            description:
              'Update society-specific fields (social links, branding, additional details)'
          }
        }
      )

      /**
       * Upload banner image for society
       * POST /society/:id/banner
       */
      .post(
        '/:id/banner',
        async ({ params, headers, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          const organizationId = params.id

          try {
            // Check if user is president
            const hasPermission = await isPresident(organizationId, headers)
            if (!hasPermission) {
              throw new SocietyForbiddenError(
                'You do not have permission to upload banner for this society'
              )
            }

            // Note: File upload is handled via FormData in the actual HTTP request
            // This is a placeholder that would be implemented with proper file handling
            throw new UploadFailedError(
              'Banner upload not yet implemented - use multipart/form-data'
            )
          } catch (error) {
            if (
              error instanceof SocietyForbiddenError ||
              error instanceof UploadFailedError
            ) {
              throw error
            }

            throw new UploadFailedError(
              error instanceof Error ? error.message : 'Failed to upload banner'
            )
          }
        },
        {
          detail: {
            tags: ['Societies'],
            summary: 'Upload Society Banner',
            description: 'Upload banner image for society'
          }
        }
      )

      /**
       * Mark society onboarding as complete
       * POST /society/:id/complete-onboarding
       */
      .post(
        '/:id/complete-onboarding',
        async ({ params, headers, user }) => {
          if (!user) {
            throw new Error('User not authenticated')
          }

          const organizationId = params.id

          try {
            // Check if society exists
            const existing = await societyService.getById(organizationId)
            if (!existing) {
              throw new SocietyNotFoundError()
            }

            // Check if user is president
            const hasPermission = await isPresident(organizationId, headers)
            if (!hasPermission) {
              throw new SocietyForbiddenError(
                'You do not have permission to update this society'
              )
            }

            // Mark onboarding as complete
            await societyService.markOnboardingComplete(organizationId)

            return { success: true }
          } catch (error) {
            if (
              error instanceof SocietyNotFoundError ||
              error instanceof SocietyForbiddenError
            ) {
              throw error
            }

            throw new Error(
              error instanceof Error
                ? error.message
                : 'Failed to complete onboarding'
            )
          }
        },
        {
          detail: {
            tags: ['Societies'],
            summary: 'Complete Onboarding',
            description: 'Mark society onboarding as complete'
          }
        }
      )
  )
  .use(societyEmailRouter)
  .use(societyRegistrationRouter)
