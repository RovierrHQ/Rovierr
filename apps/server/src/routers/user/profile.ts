import { db } from '@api/db'
import { NOT_FOUND, UNAUTHORIZED } from '@api/lib/common-errors'
import { betterAuth } from '@api/middleware/auth'
import {
  deleteImageFromS3,
  getPresignedUrlFromFullUrl,
  isS3Url,
  uploadImageToS3
} from '@api/services/s3'
import {
  instituitionEnrollment as institutionEnrollmentTable,
  institution as institutionTable,
  programEnrollment as programEnrollmentTable,
  program as programTable,
  user as userTable
} from '@rov/db'
import { and, eq } from 'drizzle-orm'
import Elysia from 'elysia'
import { z } from 'zod'
import { INVALID_INPUT, USERNAME_TAKEN } from './errors'
import {
  academicResponseSchema,
  activityQuerySchema,
  activityResponseSchema,
  profileDetailsSchema,
  profileUpdateResponseSchema,
  profileUpdateSchema,
  publicProfileSchema
} from './schemas'

// Regex for base64 image data URL prefix
const BASE64_IMAGE_REGEX = /^data:image\/\w+;base64,/

export const profile = new Elysia({ name: 'user-profile' })
  .use(betterAuth)
  .group('/profile', { auth: true, detail: { tags: ['User'] } }, (app) =>
    app
      // GET /profile/details - Get full profile details
      .get(
        '/details',
        async ({ user }) => {
          // Get user data
          const userData = await db.query.user.findFirst({
            where: eq(userTable.id, user.id)
          })

          if (!userData) {
            throw new UNAUTHORIZED('User not found')
          }

          // Get institution enrollment info
          const [enrollmentData] = await db
            .select({
              currentUniversity: {
                id: institutionTable.id,
                name: institutionTable.name,
                logo: institutionTable.logo,
                city: institutionTable.city,
                country: institutionTable.country
              },
              studentStatusVerified:
                institutionEnrollmentTable.studentStatusVerified
            })
            .from(institutionEnrollmentTable)
            .leftJoin(
              institutionTable,
              eq(institutionTable.id, institutionEnrollmentTable.institutionId)
            )
            .where(eq(institutionEnrollmentTable.userId, user.id))
            .limit(1)

          return {
            id: userData.id,
            name: userData.name,
            username: userData.username,
            email: userData.email,
            image: userData.image,
            bannerImage: userData.bannerImage,
            bio: userData.bio,
            summary: userData.summary,
            website: userData.website,
            phoneNumber: userData.phoneNumber,
            phoneNumberVerified: userData.phoneNumberVerified ?? false,
            socialLinks: {
              whatsapp: userData.whatsapp,
              telegram: userData.telegram,
              instagram: userData.instagram,
              facebook: userData.facebook,
              twitter: userData.twitter,
              linkedin: userData.linkedin
            },
            currentUniversity: enrollmentData?.currentUniversity ?? null,
            studentStatusVerified: Boolean(
              enrollmentData?.studentStatusVerified ?? false
            ),
            createdAt: new Date(userData.createdAt).toISOString(),
            major: null,
            yearOfStudy: null
          }
        },
        {
          response: profileDetailsSchema,
          detail: {
            description: 'Gets the full profile details for the user.',
            summary: 'Get Profile Details'
          }
        }
      )

      // PUT /profile/update - Update user profile
      .put(
        '/update',
        async ({ body, user }) => {
          // Check if username is taken (if username is being updated)
          if (body.username) {
            const existingUser = await db.query.user.findFirst({
              where: and(
                eq(userTable.username, body.username),
                // Exclude current user
                eq(userTable.id, user.id)
              )
            })

            // If found and it's not the current user, username is taken
            if (existingUser && existingUser.id !== user.id) {
              throw new USERNAME_TAKEN('Username is already taken')
            }
          }

          // Validate URLs if provided
          if (body.website && body.website !== '') {
            try {
              new URL(body.website)
            } catch {
              throw new INVALID_INPUT('Invalid website URL')
            }
          }

          // Get current user to check for existing images
          const currentUser = await db.query.user.findFirst({
            where: eq(userTable.id, user.id),
            columns: { image: true, bannerImage: true }
          })

          // Initialize update data object
          const updateData: Record<string, string | null> = {}

          // Handle image uploads to S3
          if (body.image !== undefined) {
            if (body.image === '' || body.image === null) {
              // Delete existing image from S3 if removing
              if (
                currentUser?.image &&
                BASE64_IMAGE_REGEX.test(currentUser.image) === false
              ) {
                await deleteImageFromS3(currentUser.image)
              }
              updateData.image = null
            } else if (BASE64_IMAGE_REGEX.test(body.image)) {
              // Upload new image to S3
              // Delete old image if it exists and is an S3 URL
              if (
                currentUser?.image &&
                BASE64_IMAGE_REGEX.test(currentUser.image) === false
              ) {
                await deleteImageFromS3(currentUser.image)
              }
              const s3Url = await uploadImageToS3(
                body.image,
                'profile-pictures',
                user.id
              )
              updateData.image = s3Url
            } else {
              // Already a URL, use as-is
              updateData.image = body.image
            }
          }

          if (body.bannerImage !== undefined) {
            if (body.bannerImage === '' || body.bannerImage === null) {
              // Delete existing banner from S3 if removing
              if (
                currentUser?.bannerImage &&
                BASE64_IMAGE_REGEX.test(currentUser.bannerImage) === false
              ) {
                await deleteImageFromS3(currentUser.bannerImage)
              }
              updateData.bannerImage = null
            } else if (BASE64_IMAGE_REGEX.test(body.bannerImage)) {
              // Upload new banner to S3
              // Delete old banner if it exists and is an S3 URL
              if (
                currentUser?.bannerImage &&
                BASE64_IMAGE_REGEX.test(currentUser.bannerImage) === false
              ) {
                await deleteImageFromS3(currentUser.bannerImage)
              }
              const s3Url = await uploadImageToS3(
                body.bannerImage,
                'banners',
                user.id
              )
              updateData.bannerImage = s3Url
            } else {
              // Already a URL, use as-is
              updateData.bannerImage = body.bannerImage
            }
          }

          if (body.name !== undefined) updateData.name = body.name
          if (body.username !== undefined) updateData.username = body.username
          if (body.bio !== undefined) updateData.bio = body.bio || null
          if (body.summary !== undefined)
            updateData.summary = body.summary || null
          if (body.website !== undefined)
            updateData.website = body.website || null
          if (body.whatsapp !== undefined)
            updateData.whatsapp = body.whatsapp || null
          if (body.telegram !== undefined)
            updateData.telegram = body.telegram || null
          if (body.instagram !== undefined)
            updateData.instagram = body.instagram || null
          if (body.facebook !== undefined)
            updateData.facebook = body.facebook || null
          if (body.twitter !== undefined)
            updateData.twitter = body.twitter || null
          if (body.linkedin !== undefined)
            updateData.linkedin = body.linkedin || null

          const [updatedUser] = await db
            .update(userTable)
            .set(updateData)
            .where(eq(userTable.id, user.id))
            .returning()

          if (!updatedUser) {
            throw new UNAUTHORIZED('User not found')
          }

          // Generate presigned URLs for S3 images if they exist
          const imageUrl =
            updatedUser.image && isS3Url(updatedUser.image)
              ? await getPresignedUrlFromFullUrl(updatedUser.image).catch(
                  () => updatedUser.image
                )
              : updatedUser.image

          const bannerImageUrl =
            updatedUser.bannerImage && isS3Url(updatedUser.bannerImage)
              ? await getPresignedUrlFromFullUrl(updatedUser.bannerImage).catch(
                  () => updatedUser.bannerImage
                )
              : updatedUser.bannerImage

          return {
            success: true,
            user: {
              id: updatedUser.id,
              name: updatedUser.name,
              username: updatedUser.username,
              bio: updatedUser.bio,
              summary: updatedUser.summary,
              website: updatedUser.website,
              image: imageUrl,
              bannerImage: bannerImageUrl,
              socialLinks: {
                whatsapp: updatedUser.whatsapp,
                telegram: updatedUser.telegram,
                instagram: updatedUser.instagram,
                facebook: updatedUser.facebook,
                twitter: updatedUser.twitter,
                linkedin: updatedUser.linkedin
              }
            }
          }
        },
        {
          body: profileUpdateSchema,
          response: profileUpdateResponseSchema,
          detail: {
            description: 'Updates the user profile.',
            summary: 'Update Profile'
          }
        }
      )

      // GET /profile/academic - Get academic enrollments
      .get(
        '/academic',
        async ({ user }) => {
          const enrollments = await db
            .select({
              id: programEnrollmentTable.id,
              program: {
                id: programTable.id,
                name: programTable.name,
                code: programTable.code,
                degreeLevel: programTable.degreeLevel
              },
              university: {
                id: institutionTable.id,
                name: institutionTable.name,
                logo: institutionTable.logo
              },
              startedOn: programEnrollmentTable.startedOn,
              graduatedOn: programEnrollmentTable.graduatedOn,
              type: programEnrollmentTable.type,
              studentStatusVerified:
                institutionEnrollmentTable.studentStatusVerified
            })
            .from(programEnrollmentTable)
            .innerJoin(
              programTable,
              eq(programTable.id, programEnrollmentTable.programId)
            )
            .innerJoin(
              institutionTable,
              eq(institutionTable.id, programTable.institutionId)
            )
            .leftJoin(
              institutionEnrollmentTable,
              and(
                eq(institutionEnrollmentTable.userId, user.id),
                eq(
                  institutionEnrollmentTable.institutionId,
                  institutionTable.id
                )
              )
            )
            .where(eq(programEnrollmentTable.userId, user.id))

          return {
            enrollments: enrollments.map((enrollment) => ({
              id: enrollment.id,
              program: {
                id: enrollment.program.id,
                name: enrollment.program.name,
                code: enrollment.program.code ?? '',
                degreeLevel: enrollment.program.degreeLevel
              },
              university: {
                id: enrollment.university.id,
                name: enrollment.university.name,
                logo: enrollment.university.logo
              },
              studentStatusVerified: Boolean(
                enrollment.studentStatusVerified ?? false
              ),
              startedOn: enrollment.startedOn
                ? new Date(enrollment.startedOn).toISOString()
                : null,
              graduatedOn: enrollment.graduatedOn
                ? new Date(enrollment.graduatedOn).toISOString()
                : null,
              isPrimary: enrollment.type === 'major'
            }))
          }
        },
        {
          response: academicResponseSchema,
          detail: {
            description: 'Gets the academic enrollments for the user.',
            summary: 'Get Academic Enrollments'
          }
        }
      )

      // GET /profile/activity - Get user activity feed
      .get(
        '/activity',
        ({ query }) => {
          // TODO: Implement activity feed when activity tracking is added
          // For now, return empty array as placeholder
          const limit = query.limit ?? 50
          const offset = query.offset ?? 0

          // Placeholder implementation
          const activities: Array<{
            id: string
            type: 'post' | 'comment' | 'join' | 'event' | 'achievement'
            title: string
            description: string | null
            timestamp: string
            metadata: Record<string, unknown>
          }> = []
          const total = 0

          return {
            activities,
            total,
            hasMore: offset + limit < total
          }
        },
        {
          query: activityQuerySchema,
          response: activityResponseSchema,
          detail: {
            description: 'Gets the activity feed for the user.',
            summary: 'Get Activity Feed'
          }
        }
      )
  )

  // Public routes (no auth required)
  .group('/profile', { detail: { tags: ['User'] } }, (app) =>
    app
      // GET /profile/public/:username - Get public profile by username
      .get(
        '/public/:username',
        async ({ params }) => {
          // Get user by username
          const user = await db.query.user.findFirst({
            where: eq(userTable.username, params.username)
          })

          if (!user?.username) {
            throw new NOT_FOUND('User not found')
          }

          // Get institution enrollment info
          const [enrollmentData] = await db
            .select({
              currentUniversity: {
                id: institutionTable.id,
                name: institutionTable.name,
                logo: institutionTable.logo,
                city: institutionTable.city,
                country: institutionTable.country
              },
              studentStatusVerified:
                institutionEnrollmentTable.studentStatusVerified
            })
            .from(institutionEnrollmentTable)
            .leftJoin(
              institutionTable,
              eq(institutionTable.id, institutionEnrollmentTable.institutionId)
            )
            .where(eq(institutionEnrollmentTable.userId, user.id))
            .limit(1)

          // Generate presigned URLs for S3 images
          const imageUrl =
            user.image && isS3Url(user.image)
              ? await getPresignedUrlFromFullUrl(user.image).catch(
                  () => user.image
                )
              : user.image

          const bannerImageUrl =
            user.bannerImage && isS3Url(user.bannerImage)
              ? await getPresignedUrlFromFullUrl(user.bannerImage).catch(
                  () => user.bannerImage
                )
              : user.bannerImage

          return {
            id: user.id,
            name: user.name,
            username: user.username,
            image: imageUrl,
            bannerImage: bannerImageUrl,
            bio: user.bio,
            summary: user.summary,
            website: user.website,
            socialLinks: {
              whatsapp: user.whatsapp,
              telegram: user.telegram,
              instagram: user.instagram,
              facebook: user.facebook,
              twitter: user.twitter,
              linkedin: user.linkedin
            },
            currentUniversity: enrollmentData?.currentUniversity ?? null,
            studentStatusVerified: Boolean(
              enrollmentData?.studentStatusVerified ?? false
            ),
            createdAt: new Date(user.createdAt).toISOString(),
            major: null,
            yearOfStudy: null
          }
        },
        {
          params: z.object({ username: z.string() }),
          response: publicProfileSchema,
          detail: {
            description: 'Gets the public profile for a user by username.',
            summary: 'Get Public Profile'
          }
        }
      )
  )
