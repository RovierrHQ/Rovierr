import { db } from '@api/db'
import {
  FORBIDDEN,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  UNAUTHORIZED
} from '@api/lib/common-errors'
import { generateOTP, hashOTP, validateUniversityEmail } from '@api/lib/utils'
import { betterAuth } from '@api/middleware/auth'
import { sendOTPEmail } from '@api/services/email/sender'
import { idParserClient } from '@api/services/id-parser/client'
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
  studentIdCard as studentIdCardTable,
  user as userTable,
  verification as verificationTable
} from '@rov/db'
import { and, desc, eq } from 'drizzle-orm'
import Elysia from 'elysia'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import {
  EMAIL_ALREADY_TAKEN,
  EMAIL_SEND_FAILED,
  INVALID_EMAIL_DOMAIN,
  INVALID_INPUT,
  PARSING_FAILED,
  TOKEN_EXPIRED,
  TOKEN_INVALID,
  USER_NOT_FOUND,
  USERNAME_TAKEN
} from './errors'
import {
  academicResponseSchema,
  activityQuerySchema,
  activityResponseSchema,
  listIdCardsResponseSchema,
  profileDetailsSchema,
  profileInfoSchema,
  profileUpdateResponseSchema,
  profileUpdateSchema,
  publicProfileSchema,
  sendVerificationOTPSchema,
  successResponseSchema,
  uploadIdCardResponseSchema,
  uploadIdCardSchema,
  verificationStatusSchema,
  verifyOTPResponseSchema,
  verifyOTPSchema
} from './schemas'

// Regex for base64 image data URL prefix
const BASE64_IMAGE_REGEX = /^data:image\/\w+;base64,/

export const profile = new Elysia({ name: 'user-profile' })
  .use(betterAuth)
  .group('/profile', { auth: true }, (app) =>
    app
      // GET /profile/info - Get basic profile info
      .get(
        '/info',
        async ({ user }) => {
          const [userData] = await db
            .select({
              currentUniversity: {
                id: institutionTable.id,
                name: institutionTable.name,
                logo: institutionTable.logo,
                slug: institutionTable.slug,
                country: institutionTable.country,
                city: institutionTable.city
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

          if (!userData?.currentUniversity?.id) {
            return {
              studentStatusVerified: false
            }
          }

          return {
            currentUniversity: userData.currentUniversity,
            studentStatusVerified: Boolean(
              userData.studentStatusVerified ?? false
            )
          }
        },
        {
          response: profileInfoSchema,
          detail: {
            description: 'Gets the profile info for the user.',
            summary: 'Get Profile Info',
            tags: ['User']
          }
        }
      )

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

          // Generate presigned URLs for S3 images
          const imageUrl =
            userData.image && isS3Url(userData.image)
              ? await getPresignedUrlFromFullUrl(userData.image).catch(
                  () => userData.image
                )
              : userData.image

          const bannerImageUrl =
            userData.bannerImage && isS3Url(userData.bannerImage)
              ? await getPresignedUrlFromFullUrl(userData.bannerImage).catch(
                  () => userData.bannerImage
                )
              : userData.bannerImage

          return {
            id: userData.id,
            name: userData.name,
            username: userData.username,
            email: userData.email,
            image: imageUrl,
            bannerImage: bannerImageUrl,
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
            createdAt: new Date(userData.createdAt),
            major: null,
            yearOfStudy: null
          }
        },
        {
          response: profileDetailsSchema,
          detail: {
            description: 'Gets the full profile details for the user.',
            summary: 'Get Profile Details',
            tags: ['User']
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
            summary: 'Update Profile',
            tags: ['User']
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
                ? new Date(enrollment.startedOn)
                : null,
              graduatedOn: enrollment.graduatedOn
                ? new Date(enrollment.graduatedOn)
                : null,
              isPrimary: enrollment.type === 'major'
            }))
          }
        },
        {
          response: academicResponseSchema,
          detail: {
            description: 'Gets the academic enrollments for the user.',
            summary: 'Get Academic Enrollments',
            tags: ['User']
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
            timestamp: Date
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
            summary: 'Get Activity Feed',
            tags: ['User']
          }
        }
      )
  )

  // Public routes (no auth required)
  .group('/profile', (app) =>
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
            createdAt: new Date(user.createdAt),
            major: null,
            yearOfStudy: null
          }
        },
        {
          params: z.object({ username: z.string() }),
          response: publicProfileSchema,
          detail: {
            description: 'Gets the public profile for a user by username.',
            summary: 'Get Public Profile',
            tags: ['User']
          }
        }
      )
  )

  // Student verification routes (auth required)
  .group('/profile/verify-student', { auth: true }, (app) =>
    app
      // GET /profile/verify-student/id-cards - List student ID cards
      .get(
        '/id-cards',
        async ({ user }) => {
          // Get all student ID cards with enrollment verification status in a single query
          const idCardsWithEnrollments = await db
            .select({
              id: studentIdCardTable.id,
              imageUrl: studentIdCardTable.imageUrl,
              parsingResult: studentIdCardTable.parsingResult,
              createdAt: studentIdCardTable.createdAt,
              enrollmentVerified:
                institutionEnrollmentTable.studentStatusVerified
            })
            .from(studentIdCardTable)
            .leftJoin(
              institutionEnrollmentTable,
              and(
                eq(
                  institutionEnrollmentTable.studentIdCardId,
                  studentIdCardTable.id
                ),
                eq(institutionEnrollmentTable.userId, user.id)
              )
            )
            .where(eq(studentIdCardTable.userId, user.id))
            .orderBy(desc(studentIdCardTable.createdAt))

          // Deduplicate and check if any enrollment is verified for each ID card
          const idCardMap = new Map<
            string,
            {
              id: string
              imageUrl: string
              parsingResult: unknown
              createdAt: string
              isVerified: boolean
            }
          >()

          for (const row of idCardsWithEnrollments) {
            const existing = idCardMap.get(row.id)
            const isVerified =
              row.enrollmentVerified === true || (existing?.isVerified ?? false)

            if (!existing) {
              idCardMap.set(row.id, {
                id: row.id,
                imageUrl: row.imageUrl,
                parsingResult: row.parsingResult,
                createdAt: row.createdAt,
                isVerified
              })
            } else if (isVerified && !existing.isVerified) {
              existing.isVerified = true
            }
          }

          // Generate presigned URLs for all ID card images
          const idCardsWithPresignedUrls = await Promise.all(
            Array.from(idCardMap.values()).map(async (card) => {
              const parsingResult = card.parsingResult as {
                university: string | null
                student_id: string | null
                expiry_date: string | null
                raw_text: string[]
              } | null

              const imageUrl = isS3Url(card.imageUrl)
                ? await getPresignedUrlFromFullUrl(card.imageUrl).catch(
                    () => card.imageUrl
                  )
                : card.imageUrl

              return {
                id: card.id,
                imageUrl,
                university: parsingResult?.university ?? null,
                studentId: parsingResult?.student_id ?? null,
                expiryDate: parsingResult?.expiry_date ?? null,
                createdAt: new Date(card.createdAt),
                isVerified: card.isVerified
              }
            })
          )

          return {
            idCards: idCardsWithPresignedUrls
          }
        },
        {
          response: listIdCardsResponseSchema,
          detail: {
            description: 'Lists all student ID cards for the user.',
            summary: 'List Student ID Cards',
            tags: ['User', 'Verification']
          }
        }
      )

      // POST /profile/verify-student/upload-id-card - Upload student ID card
      .post(
        '/upload-id-card',
        async ({ body, user }) => {
          try {
            // Convert base64 to Buffer
            const base64Data = body.imageBase64.replace(BASE64_IMAGE_REGEX, '')
            const buffer = Buffer.from(base64Data, 'base64')

            // Upload image to S3
            const imageUrl = await uploadImageToS3(
              body.imageBase64,
              'id-cards',
              user.id
            )

            // Parse ID using ID parser service
            const result = await idParserClient.parse(buffer, 'id-card.jpg')

            const parsingResult = {
              university: result.university,
              student_id: result.student_id,
              expiry_date: result.expiry_date,
              raw_text: result.raw_text
            }

            // Create student ID card entry
            const [studentIdCard] = await db
              .insert(studentIdCardTable)
              .values({
                id: nanoid(),
                userId: user.id,
                imageUrl,
                parsingResult
              })
              .returning()

            if (!studentIdCard) {
              throw new INTERNAL_SERVER_ERROR(
                'Failed to create student ID card'
              )
            }

            return {
              id: studentIdCard.id,
              university: result.university,
              studentId: result.student_id,
              expiryDate: result.expiry_date,
              rawText: result.raw_text
            }
          } catch (error) {
            throw new PARSING_FAILED(
              error instanceof Error
                ? error.message
                : 'Failed to parse student ID'
            )
          }
        },
        {
          body: uploadIdCardSchema,
          response: uploadIdCardResponseSchema,
          detail: {
            description: 'Uploads and parses a student ID card.',
            summary: 'Upload Student ID Card',
            tags: ['User', 'Verification']
          }
        }
      )

      // DELETE /profile/verify-student/id-card/:id - Delete student ID card
      .delete(
        '/id-card/:id',
        async ({ params, user }) => {
          // Check if ID card exists and belongs to user
          const idCard = await db.query.studentIdCard.findFirst({
            where: and(
              eq(studentIdCardTable.id, params.id),
              eq(studentIdCardTable.userId, user.id)
            ),
            columns: { id: true, imageUrl: true }
          })

          if (!idCard) {
            throw new NOT_FOUND('Student ID card not found')
          }

          // Check if ID card is associated with a verified enrollment
          const enrollment = await db.query.instituitionEnrollment.findFirst({
            where: and(
              eq(institutionEnrollmentTable.studentIdCardId, params.id),
              eq(institutionEnrollmentTable.userId, user.id)
            ),
            columns: { studentStatusVerified: true }
          })

          if (enrollment?.studentStatusVerified) {
            throw new FORBIDDEN(
              'Cannot delete student ID card associated with verified enrollment'
            )
          }

          // Delete image from S3
          await deleteImageFromS3(idCard.imageUrl)

          // Delete student ID card record
          await db
            .delete(studentIdCardTable)
            .where(eq(studentIdCardTable.id, params.id))

          return { success: true }
        },
        {
          params: z.object({ id: z.string() }),
          response: successResponseSchema,
          detail: {
            description: 'Deletes a student ID card.',
            summary: 'Delete Student ID Card',
            tags: ['User', 'Verification']
          }
        }
      )

      // POST /profile/verify-student/send-otp - Send verification OTP
      .post(
        '/send-otp',
        async ({ body, user }) => {
          console.log('[sendVerificationOTP] Starting with input:', {
            email: body.email,
            universityId: body.universityId,
            userId: user.id
          })

          // Find institution by ID
          const institution = await db.query.institution.findFirst({
            where: eq(institutionTable.id, body.universityId)
          })

          console.log('[sendVerificationOTP] Institution found:', {
            id: institution?.id,
            name: institution?.name,
            validEmailDomains: institution?.validEmailDomains
          })

          if (!institution) {
            console.error('[sendVerificationOTP] Institution not found')
            throw new INVALID_EMAIL_DOMAIN('Institution not found')
          }

          // Validate email domain
          console.log('[sendVerificationOTP] Validating email domain...')
          const isValidDomain = await validateUniversityEmail(
            body.email,
            body.universityId
          )
          console.log(
            '[sendVerificationOTP] Email domain validation result:',
            isValidDomain
          )

          if (!isValidDomain) {
            console.error('[sendVerificationOTP] Invalid email domain')
            throw new INVALID_EMAIL_DOMAIN(
              `Email domain does not match ${institution.name} requirements`
            )
          }

          // Get user info
          console.log('[sendVerificationOTP] Fetching user info...')
          const userData = await db.query.user.findFirst({
            where: eq(userTable.id, user.id),
            columns: { name: true }
          })
          console.log('[sendVerificationOTP] User found:', {
            name: userData?.name
          })

          // Check if email is already used by ANY user
          console.log(
            '[sendVerificationOTP] Checking if email is already taken...'
          )
          const existingEmailEnrollment =
            await db.query.instituitionEnrollment.findFirst({
              where: eq(institutionEnrollmentTable.email, body.email),
              columns: { id: true, userId: true }
            })

          if (
            existingEmailEnrollment &&
            existingEmailEnrollment.userId !== user.id
          ) {
            console.error(
              '[sendVerificationOTP] Email already taken by another user'
            )
            throw new EMAIL_ALREADY_TAKEN(
              'This university email is already registered to another account'
            )
          }

          // Check for enrollment for the SPECIFIC university
          console.log(
            '[sendVerificationOTP] Checking for existing enrollment...'
          )
          const enrollmentForUniversity =
            await db.query.instituitionEnrollment.findFirst({
              where: and(
                eq(institutionEnrollmentTable.userId, user.id),
                eq(institutionEnrollmentTable.institutionId, body.universityId)
              ),
              columns: { id: true }
            })
          console.log('[sendVerificationOTP] Existing enrollment:', {
            exists: !!enrollmentForUniversity,
            id: enrollmentForUniversity?.id
          })

          // currently we dont allow multiple enrollments for the same university
          if (enrollmentForUniversity) {
            console.log('[sendVerificationOTP] Updating existing enrollment...')
            try {
              // Update existing enrollment for this university
              await db
                .update(institutionEnrollmentTable)
                .set({
                  email: body.email,
                  studentId: body.email.split('@')[0],
                  verificationStep: 'otp'
                })
                .where(
                  eq(institutionEnrollmentTable.id, enrollmentForUniversity.id)
                )
              console.log('[sendVerificationOTP] Enrollment updated')
            } catch (updateError) {
              console.error(
                '[sendVerificationOTP] Error updating enrollment:',
                updateError
              )
              throw updateError
            }
          } else {
            console.log('[sendVerificationOTP] Creating new enrollment...')
            try {
              // Create new enrollment for this university
              const result = await db
                .insert(institutionEnrollmentTable)
                .values({
                  userId: user.id,
                  institutionId: body.universityId,
                  email: body.email,
                  studentId: body.email.split('@')[0],
                  verificationStep: 'otp'
                })
              console.log(
                '[sendVerificationOTP] New enrollment created:',
                result
              )
            } catch (insertError) {
              console.error(
                '[sendVerificationOTP] Error creating enrollment:',
                insertError
              )
              console.error('[sendVerificationOTP] Insert values were:', {
                userId: user.id,
                institutionId: body.universityId,
                email: body.email,
                studentId: body.email.split('@')[0],
                verificationStep: 'otp'
              })
              throw insertError
            }
          }

          // Generate OTP
          console.log('[sendVerificationOTP] Generating OTP...')
          const otp = generateOTP()
          const hashedOTP = hashOTP(otp)
          console.log('[sendVerificationOTP] OTP generated and hashed')

          // Delete existing verification records
          console.log(
            '[sendVerificationOTP] Deleting existing verification records...'
          )
          await db
            .delete(verificationTable)
            .where(eq(verificationTable.identifier, user.id))
          console.log('[sendVerificationOTP] Old verification records deleted')

          // Store verification record
          console.log(
            '[sendVerificationOTP] Storing new verification record...'
          )
          await db.insert(verificationTable).values({
            id: nanoid(),
            identifier: user.id,
            value: hashedOTP,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
          })
          console.log('[sendVerificationOTP] Verification record stored')

          // Send OTP email
          console.log('[sendVerificationOTP] Sending OTP email to:', body.email)
          try {
            await sendOTPEmail({
              to: body.email,
              displayName: userData?.name ?? 'User',
              otp
            })
            console.log('[sendVerificationOTP] OTP email sent successfully')
          } catch (emailError) {
            console.error(
              '[sendVerificationOTP] Failed to send OTP email:',
              emailError
            )
            throw new EMAIL_SEND_FAILED('Failed to send verification email')
          }

          return { success: true }
        },
        {
          body: sendVerificationOTPSchema,
          response: successResponseSchema,
          detail: {
            description: 'Sends a verification OTP to the university email.',
            summary: 'Send Verification OTP',
            tags: ['User', 'Verification']
          }
        }
      )

      // POST /profile/verify-student/verify-otp - Verify OTP
      .post(
        '/verify-otp',
        async ({ body, user }) => {
          // Hash the provided OTP
          const hashedOTP = hashOTP(body.otp)

          // Find verification record
          const verification = await db.query.verification.findFirst({
            where: and(
              eq(verificationTable.identifier, user.id),
              eq(verificationTable.value, hashedOTP)
            )
          })

          if (!verification) {
            throw new TOKEN_INVALID('Invalid OTP code')
          }

          // Check expiration
          if (verification.expiresAt < new Date()) {
            await db
              .delete(verificationTable)
              .where(eq(verificationTable.id, verification.id))

            throw new TOKEN_EXPIRED(
              'OTP has expired. Please request a new one.'
            )
          }

          // Get user's institution enrollment
          const enrollment = await db.query.instituitionEnrollment.findFirst({
            where: eq(institutionEnrollmentTable.userId, user.id)
          })

          if (!enrollment) {
            throw new USER_NOT_FOUND('Institution enrollment not found')
          }

          // Run updates in parallel
          await Promise.all([
            // Update user as verified
            db
              .update(userTable)
              .set({ isVerified: true })
              .where(eq(userTable.id, user.id)),
            // Update enrollment: set student status verified, email verified, and clear verification step
            db
              .update(institutionEnrollmentTable)
              .set({
                studentStatusVerified: true,
                emailVerified: true,
                verificationStep: null
              })
              .where(eq(institutionEnrollmentTable.id, enrollment.id)),
            // Delete verification record (single-use)
            db
              .delete(verificationTable)
              .where(eq(verificationTable.id, verification.id))
          ])

          return { success: true, verified: true }
        },
        {
          body: verifyOTPSchema,
          response: verifyOTPResponseSchema,
          detail: {
            description: 'Verifies the OTP code.',
            summary: 'Verify OTP',
            tags: ['User', 'Verification']
          }
        }
      )

      // POST /profile/verify-student/resend-otp - Resend OTP
      .post(
        '/resend-otp',
        async ({ user }) => {
          // Get user's institution enrollment email
          const enrollment = await db.query.instituitionEnrollment.findFirst({
            where: eq(institutionEnrollmentTable.userId, user.id),
            columns: { email: true }
          })

          if (!enrollment?.email) {
            throw new USER_NOT_FOUND('Institution email not found')
          }

          // Get user name
          const userData = await db.query.user.findFirst({
            where: eq(userTable.id, user.id),
            columns: { name: true }
          })

          // Generate new OTP
          const otp = generateOTP()
          const hashedOTP = hashOTP(otp)

          // Delete old verification records
          await db
            .delete(verificationTable)
            .where(eq(verificationTable.identifier, user.id))

          // Store new verification record
          await db.insert(verificationTable).values({
            id: nanoid(),
            identifier: user.id,
            value: hashedOTP,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
          })

          // Send OTP email
          try {
            await sendOTPEmail({
              to: enrollment.email,
              displayName: userData?.name ?? 'User',
              otp
            })
          } catch {
            throw new EMAIL_SEND_FAILED('Failed to send verification email')
          }

          return { success: true }
        },
        {
          response: successResponseSchema,
          detail: {
            description: 'Resends the verification OTP.',
            summary: 'Resend OTP',
            tags: ['User', 'Verification']
          }
        }
      )

      // GET /profile/verify-student/status - Get verification status
      .get(
        '/status',
        async ({ user }) => {
          const userData = await db.query.user.findFirst({
            where: eq(userTable.id, user.id),
            columns: { isVerified: true }
          })

          const enrollment = await db.query.instituitionEnrollment.findFirst({
            where: eq(institutionEnrollmentTable.userId, user.id),
            columns: {
              email: true,
              emailVerified: true,
              studentStatusVerified: true,
              verificationStep: true,
              studentIdCardId: true
            }
          })

          // Get student ID card data if enrollment has one
          let parsedData: {
            university: string | null
            studentId: string | null
          } | null = null
          if (enrollment?.studentIdCardId) {
            const studentIdCard = await db.query.studentIdCard.findFirst({
              where: eq(studentIdCardTable.id, enrollment.studentIdCardId),
              columns: { parsingResult: true }
            })

            const parsingResult = studentIdCard?.parsingResult as
              | {
                  university: string | null
                  student_id: string | null
                }
              | undefined

            if (parsingResult) {
              parsedData = {
                university: parsingResult.university,
                studentId: parsingResult.student_id
              }
            }
          }

          return {
            isVerified: userData?.isVerified ?? false,
            hasUniversityEmail: !!enrollment?.email,
            emailVerified: enrollment?.emailVerified ?? false,
            studentStatusVerified: enrollment?.studentStatusVerified ?? false,
            verificationStep: enrollment?.verificationStep ?? null,
            hasIdCard: !!enrollment?.studentIdCardId,
            parsedData
          }
        },
        {
          response: verificationStatusSchema,
          detail: {
            description: 'Gets the verification status for the user.',
            summary: 'Get Verification Status',
            tags: ['User', 'Verification']
          }
        }
      )
  )
