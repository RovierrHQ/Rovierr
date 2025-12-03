import { ORPCError } from '@orpc/server'
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
import { nanoid } from 'nanoid'
import { db } from '@/db'
import { protectedProcedure, publicProcedure } from '@/lib/orpc'
import { generateOTP, hashOTP, validateUniversityEmail } from '@/lib/utils'
import { sendOTPEmail } from '@/services/email/sender'
import { idParserClient } from '@/services/id-parser/client'
import {
  deleteImageFromS3,
  getPresignedUrlFromFullUrl,
  isS3Url,
  uploadImageToS3
} from '@/services/s3'

// Regex for base64 image data URL prefix
const BASE64_IMAGE_REGEX = /^data:image\/\w+;base64,/

export const profile = {
  info: protectedProcedure.user.profile.info.handler(async ({ context }) => {
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
        studentStatusVerified: institutionEnrollmentTable.studentStatusVerified
      })
      .from(institutionEnrollmentTable)
      .leftJoin(
        institutionTable,
        eq(institutionTable.id, institutionEnrollmentTable.institutionId)
      )
      .where(eq(institutionEnrollmentTable.userId, context.session.user.id))
      .limit(1)

    if (!userData?.currentUniversity?.id) {
      return {
        studentStatusVerified: false
      }
    }

    return {
      currentUniversity: userData.currentUniversity,
      studentStatusVerified: Boolean(userData.studentStatusVerified ?? false)
    }
  }),

  details: protectedProcedure.user.profile.details.handler(
    async ({ context }) => {
      // Get user data
      const user = await db.query.user.findFirst({
        where: eq(userTable.id, context.session.user.id)
      })

      if (!user) {
        throw new ORPCError('UNAUTHORIZED', {
          message: 'User not found'
        })
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
        .where(eq(institutionEnrollmentTable.userId, context.session.user.id))
        .limit(1)

      // Generate presigned URLs for S3 images
      const imageUrl =
        user.image && isS3Url(user.image)
          ? await getPresignedUrlFromFullUrl(user.image).catch(() => user.image)
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
        email: user.email,
        image: imageUrl,
        bannerImage: bannerImageUrl,
        bio: user.bio,
        summary: user.summary,
        website: user.website,
        phoneNumber: user.phoneNumber,
        phoneNumberVerified: user.phoneNumberVerified ?? false,
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
    }
  ),

  update: protectedProcedure.user.profile.update.handler(
    async ({ input, context }) => {
      // Check if username is taken (if username is being updated)
      if (input.username) {
        const existingUser = await db.query.user.findFirst({
          where: and(
            eq(userTable.username, input.username),
            // Exclude current user
            eq(userTable.id, context.session.user.id)
          )
        })

        // If found and it's not the current user, username is taken
        if (existingUser && existingUser.id !== context.session.user.id) {
          throw new ORPCError('USERNAME_TAKEN', {
            message: 'Username is already taken'
          })
        }
      }

      // Validate URLs if provided
      if (input.website && input.website !== '') {
        try {
          new URL(input.website)
        } catch {
          throw new ORPCError('INVALID_INPUT', {
            message: 'Invalid website URL'
          })
        }
      }

      // Get current user to check for existing images
      const currentUser = await db.query.user.findFirst({
        where: eq(userTable.id, context.session.user.id),
        columns: { image: true, bannerImage: true }
      })

      // Initialize update data object
      const updateData: Record<string, string | null> = {}

      // Handle image uploads to S3
      if (input.image !== undefined) {
        if (input.image === '' || input.image === null) {
          // Delete existing image from S3 if removing
          if (
            currentUser?.image &&
            BASE64_IMAGE_REGEX.test(currentUser.image) === false
          ) {
            await deleteImageFromS3(currentUser.image)
          }
          updateData.image = null
        } else if (BASE64_IMAGE_REGEX.test(input.image)) {
          // Upload new image to S3
          // Delete old image if it exists and is an S3 URL
          if (
            currentUser?.image &&
            BASE64_IMAGE_REGEX.test(currentUser.image) === false
          ) {
            await deleteImageFromS3(currentUser.image)
          }
          const s3Url = await uploadImageToS3(
            input.image,
            'profile-pictures',
            context.session.user.id
          )
          updateData.image = s3Url
        } else {
          // Already a URL, use as-is
          updateData.image = input.image
        }
      }

      if (input.bannerImage !== undefined) {
        if (input.bannerImage === '' || input.bannerImage === null) {
          // Delete existing banner from S3 if removing
          if (
            currentUser?.bannerImage &&
            BASE64_IMAGE_REGEX.test(currentUser.bannerImage) === false
          ) {
            await deleteImageFromS3(currentUser.bannerImage)
          }
          updateData.bannerImage = null
        } else if (BASE64_IMAGE_REGEX.test(input.bannerImage)) {
          // Upload new banner to S3
          // Delete old banner if it exists and is an S3 URL
          if (
            currentUser?.bannerImage &&
            BASE64_IMAGE_REGEX.test(currentUser.bannerImage) === false
          ) {
            await deleteImageFromS3(currentUser.bannerImage)
          }
          const s3Url = await uploadImageToS3(
            input.bannerImage,
            'banners',
            context.session.user.id
          )
          updateData.bannerImage = s3Url
        } else {
          // Already a URL, use as-is
          updateData.bannerImage = input.bannerImage
        }
      }

      if (input.name !== undefined) updateData.name = input.name
      if (input.username !== undefined) updateData.username = input.username
      if (input.bio !== undefined) updateData.bio = input.bio || null
      if (input.summary !== undefined)
        updateData.summary = input.summary || null
      if (input.website !== undefined)
        updateData.website = input.website || null
      if (input.whatsapp !== undefined)
        updateData.whatsapp = input.whatsapp || null
      if (input.telegram !== undefined)
        updateData.telegram = input.telegram || null
      if (input.instagram !== undefined)
        updateData.instagram = input.instagram || null
      if (input.facebook !== undefined)
        updateData.facebook = input.facebook || null
      if (input.twitter !== undefined)
        updateData.twitter = input.twitter || null
      if (input.linkedin !== undefined)
        updateData.linkedin = input.linkedin || null

      const [updatedUser] = await db
        .update(userTable)
        .set(updateData)
        .where(eq(userTable.id, context.session.user.id))
        .returning()

      if (!updatedUser) {
        throw new ORPCError('UNAUTHORIZED', {
          message: 'User not found'
        })
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
    }
  ),

  academic: protectedProcedure.user.profile.academic.handler(
    async ({ context }) => {
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
            eq(institutionEnrollmentTable.userId, context.session.user.id),
            eq(institutionEnrollmentTable.institutionId, institutionTable.id)
          )
        )
        .where(eq(programEnrollmentTable.userId, context.session.user.id))

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
    }
  ),

  activity: protectedProcedure.user.profile.activity.handler(({ input }) => {
    // TODO: Implement activity feed when activity tracking is added
    // For now, return empty array as placeholder
    const limit = input.limit ?? 50
    const offset = input.offset ?? 0

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
  }),

  public: publicProcedure.user.profile.public.handler(async ({ input }) => {
    // Get user by username
    const user = await db.query.user.findFirst({
      where: eq(userTable.username, input.username)
    })

    if (!user?.username) {
      throw new ORPCError('NOT_FOUND', {
        message: 'User not found'
      })
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
        studentStatusVerified: institutionEnrollmentTable.studentStatusVerified
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
        ? await getPresignedUrlFromFullUrl(user.image).catch(() => user.image)
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
  }),

  verifyStudent: {
    listIdCards:
      protectedProcedure.user.profile.verifyStudent.listIdCards.handler(
        async ({ context }) => {
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
                eq(institutionEnrollmentTable.userId, context.session.user.id)
              )
            )
            .where(eq(studentIdCardTable.userId, context.session.user.id))
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
        }
      ),

    uploadIdCard:
      protectedProcedure.user.profile.verifyStudent.uploadIdCard.handler(
        async ({ input, context }) => {
          try {
            // Convert base64 to Buffer
            const base64Data = input.imageBase64.replace(BASE64_IMAGE_REGEX, '')
            const buffer = Buffer.from(base64Data, 'base64')

            // Upload image to S3
            const imageUrl = await uploadImageToS3(
              input.imageBase64,
              'id-cards',
              context.session.user.id
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
                userId: context.session.user.id,
                imageUrl,
                parsingResult
              })
              .returning()

            if (!studentIdCard) {
              throw new ORPCError('INTERNAL_SERVER_ERROR', {
                message: 'Failed to create student ID card'
              })
            }

            return {
              id: studentIdCard.id,
              university: result.university,
              studentId: result.student_id,
              expiryDate: result.expiry_date,
              rawText: result.raw_text
            }
          } catch (error) {
            throw new ORPCError('PARSING_FAILED', {
              message:
                error instanceof Error
                  ? error.message
                  : 'Failed to parse student ID'
            })
          }
        }
      ),

    deleteIdCard:
      protectedProcedure.user.profile.verifyStudent.deleteIdCard.handler(
        async ({ input, context }) => {
          // Check if ID card exists and belongs to user
          const idCard = await db.query.studentIdCard.findFirst({
            where: and(
              eq(studentIdCardTable.id, input.id),
              eq(studentIdCardTable.userId, context.session.user.id)
            ),
            columns: { id: true, imageUrl: true }
          })

          if (!idCard) {
            throw new ORPCError('NOT_FOUND', {
              message: 'Student ID card not found'
            })
          }

          // Check if ID card is associated with a verified enrollment
          const enrollment = await db.query.instituitionEnrollment.findFirst({
            where: and(
              eq(institutionEnrollmentTable.studentIdCardId, input.id),
              eq(institutionEnrollmentTable.userId, context.session.user.id)
            ),
            columns: { studentStatusVerified: true }
          })

          if (enrollment?.studentStatusVerified) {
            throw new ORPCError('FORBIDDEN', {
              message:
                'Cannot delete student ID card associated with verified enrollment'
            })
          }

          // Delete image from S3
          await deleteImageFromS3(idCard.imageUrl)

          // Delete student ID card record
          await db
            .delete(studentIdCardTable)
            .where(eq(studentIdCardTable.id, input.id))

          return { success: true }
        }
      ),

    sendVerificationOTP:
      protectedProcedure.user.profile.verifyStudent.sendVerificationOTP.handler(
        async ({ input, context }) => {
          console.log('[sendVerificationOTP] Starting with input:', {
            email: input.email,
            universityId: input.universityId,
            userId: context.session.user.id
          })

          // Find institution by ID
          const institution = await db.query.institution.findFirst({
            where: eq(institutionTable.id, input.universityId)
          })

          console.log('[sendVerificationOTP] Institution found:', {
            id: institution?.id,
            name: institution?.name,
            validEmailDomains: institution?.validEmailDomains
          })

          if (!institution) {
            console.error('[sendVerificationOTP] Institution not found')
            throw new ORPCError('INVALID_EMAIL_DOMAIN', {
              message: 'Institution not found'
            })
          }

          // Validate email domain
          console.log('[sendVerificationOTP] Validating email domain...')
          const isValidDomain = await validateUniversityEmail(
            input.email,
            input.universityId
          )
          console.log(
            '[sendVerificationOTP] Email domain validation result:',
            isValidDomain
          )

          if (!isValidDomain) {
            console.error('[sendVerificationOTP] Invalid email domain')
            throw new ORPCError('INVALID_EMAIL_DOMAIN', {
              message: `Email domain does not match ${institution.name} requirements`
            })
          }

          // Get user info
          console.log('[sendVerificationOTP] Fetching user info...')
          const user = await db.query.user.findFirst({
            where: eq(userTable.id, context.session.user.id),
            columns: { name: true }
          })
          console.log('[sendVerificationOTP] User found:', { name: user?.name })

          // Check if email is already used by ANY user
          console.log(
            '[sendVerificationOTP] Checking if email is already taken...'
          )
          const existingEmailEnrollment =
            await db.query.instituitionEnrollment.findFirst({
              where: eq(institutionEnrollmentTable.email, input.email),
              columns: { id: true, userId: true }
            })

          if (
            existingEmailEnrollment &&
            existingEmailEnrollment.userId !== context.session.user.id
          ) {
            console.error(
              '[sendVerificationOTP] Email already taken by another user'
            )
            throw new ORPCError('EMAIL_ALREADY_TAKEN', {
              message:
                'This university email is already registered to another account'
            })
          }

          // Check for enrollment for the SPECIFIC university
          console.log(
            '[sendVerificationOTP] Checking for existing enrollment...'
          )
          const enrollmentForUniversity =
            await db.query.instituitionEnrollment.findFirst({
              where: and(
                eq(institutionEnrollmentTable.userId, context.session.user.id),
                eq(institutionEnrollmentTable.institutionId, input.universityId)
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
                  email: input.email,
                  studentId: input.email.split('@')[0],
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
                  userId: context.session.user.id,
                  institutionId: input.universityId,
                  email: input.email,
                  studentId: input.email.split('@')[0],
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
                userId: context.session.user.id,
                institutionId: input.universityId,
                email: input.email,
                studentId: input.email.split('@')[0],
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
            .where(eq(verificationTable.identifier, context.session.user.id))
          console.log('[sendVerificationOTP] Old verification records deleted')

          // Store verification record
          console.log(
            '[sendVerificationOTP] Storing new verification record...'
          )
          await db.insert(verificationTable).values({
            id: nanoid(),
            identifier: context.session.user.id,
            value: hashedOTP,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
          })
          console.log('[sendVerificationOTP] Verification record stored')

          // Send OTP email
          console.log(
            '[sendVerificationOTP] Sending OTP email to:',
            input.email
          )
          try {
            await sendOTPEmail({
              to: input.email,
              displayName: user?.name ?? 'User',
              otp
            })
            console.log('[sendVerificationOTP] OTP email sent successfully')
          } catch (emailError) {
            console.error(
              '[sendVerificationOTP] Failed to send OTP email:',
              emailError
            )
            throw new ORPCError('EMAIL_SEND_FAILED', {
              message: 'Failed to send verification email'
            })
          }

          return { success: true }
        }
      ),

    verifyOTP: protectedProcedure.user.profile.verifyStudent.verifyOTP.handler(
      async ({ input, context }) => {
        // Hash the provided OTP
        const hashedOTP = hashOTP(input.otp)

        // Find verification record
        const verification = await db.query.verification.findFirst({
          where: and(
            eq(verificationTable.identifier, context.session.user.id),
            eq(verificationTable.value, hashedOTP)
          )
        })

        if (!verification) {
          throw new ORPCError('TOKEN_INVALID', {
            message: 'Invalid OTP code'
          })
        }

        // Check expiration
        if (verification.expiresAt < new Date()) {
          await db
            .delete(verificationTable)
            .where(eq(verificationTable.id, verification.id))

          throw new ORPCError('TOKEN_EXPIRED', {
            message: 'OTP has expired. Please request a new one.'
          })
        }

        // Get user's institution enrollment
        const enrollment = await db.query.instituitionEnrollment.findFirst({
          where: eq(institutionEnrollmentTable.userId, context.session.user.id)
        })

        if (!enrollment) {
          throw new ORPCError('USER_NOT_FOUND', {
            message: 'Institution enrollment not found'
          })
        }

        // Run updates in parallel
        await Promise.all([
          // Update user as verified
          db
            .update(userTable)
            .set({ isVerified: true })
            .where(eq(userTable.id, context.session.user.id)),
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
      }
    ),

    resendOTP: protectedProcedure.user.profile.verifyStudent.resendOTP.handler(
      async ({ context }) => {
        // Get user's institution enrollment email
        const enrollment = await db.query.instituitionEnrollment.findFirst({
          where: eq(institutionEnrollmentTable.userId, context.session.user.id),
          columns: { email: true }
        })

        if (!enrollment?.email) {
          throw new ORPCError('USER_NOT_FOUND', {
            message: 'Institution email not found'
          })
        }

        // Get user name
        const user = await db.query.user.findFirst({
          where: eq(userTable.id, context.session.user.id),
          columns: { name: true }
        })

        // Generate new OTP
        const otp = generateOTP()
        const hashedOTP = hashOTP(otp)

        // Delete old verification records
        await db
          .delete(verificationTable)
          .where(eq(verificationTable.identifier, context.session.user.id))

        // Store new verification record
        await db.insert(verificationTable).values({
          id: nanoid(),
          identifier: context.session.user.id,
          value: hashedOTP,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        })

        // Send OTP email
        try {
          await sendOTPEmail({
            to: enrollment.email,
            displayName: user?.name ?? 'User',
            otp
          })
        } catch {
          throw new ORPCError('EMAIL_SEND_FAILED', {
            message: 'Failed to send verification email'
          })
        }

        return { success: true }
      }
    ),

    getVerificationStatus:
      protectedProcedure.user.profile.verifyStudent.getVerificationStatus.handler(
        async ({ context }) => {
          const user = await db.query.user.findFirst({
            where: eq(userTable.id, context.session.user.id),
            columns: { isVerified: true }
          })

          const enrollment = await db.query.instituitionEnrollment.findFirst({
            where: eq(
              institutionEnrollmentTable.userId,
              context.session.user.id
            ),
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
            isVerified: user?.isVerified ?? false,
            hasUniversityEmail: !!enrollment?.email,
            emailVerified: enrollment?.emailVerified ?? false,
            studentStatusVerified: enrollment?.studentStatusVerified ?? false,
            verificationStep: enrollment?.verificationStep ?? null,
            hasIdCard: !!enrollment?.studentIdCardId,
            parsedData
          }
        }
      )
  }
}
