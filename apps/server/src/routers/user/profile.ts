import { ORPCError } from '@orpc/server'
import {
  instituitionEnrollment as institutionEnrollmentTable,
  institution as institutionTable,
  programEnrollment as programEnrollmentTable,
  program as programTable,
  user as userTable,
  verification as verificationTable
} from '@rov/db'
import { and, eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { db } from '@/db'
import { protectedProcedure } from '@/lib/orpc'
import { generateOTP, hashOTP, validateUniversityEmail } from '@/lib/utils'
import { sendOTPEmail } from '@/services/email/sender'
import { idParserClient } from '@/services/id-parser/client'
import { deleteImageFromS3, uploadImageToS3 } from '@/services/s3'

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
        where: eq(userTable.id, context.session.user.id),
        columns: {
          id: true,
          name: true,
          username: true,
          email: true,
          image: true,
          bannerImage: true,
          bio: true,
          website: true,
          phoneNumber: true,
          phoneNumberVerified: true,
          whatsapp: true,
          telegram: true,
          instagram: true,
          facebook: true,
          twitter: true,
          linkedin: true,
          createdAt: true
        }
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

      return {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        image: user.image,
        bannerImage: user.bannerImage,
        bio: user.bio,
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

      await db
        .update(userTable)
        .set(updateData)
        .where(eq(userTable.id, context.session.user.id))

      // Fetch updated user data
      const updatedUser = await db.query.user.findFirst({
        where: eq(userTable.id, context.session.user.id),
        columns: {
          id: true,
          name: true,
          username: true,
          bio: true,
          website: true,
          whatsapp: true,
          telegram: true,
          instagram: true,
          facebook: true,
          twitter: true,
          linkedin: true
        }
      })

      if (!updatedUser) {
        throw new ORPCError('UNAUTHORIZED', {
          message: 'User not found'
        })
      }

      return {
        success: true,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          username: updatedUser.username,
          bio: updatedUser.bio,
          website: updatedUser.website,
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

  public: protectedProcedure.user.profile.public.handler(async ({ input }) => {
    // Get user by username
    const user = await db.query.user.findFirst({
      where: eq(userTable.username, input.username),
      columns: {
        id: true,
        name: true,
        username: true,
        image: true,
        bannerImage: true,
        bio: true,
        website: true,
        whatsapp: true,
        telegram: true,
        instagram: true,
        facebook: true,
        twitter: true,
        linkedin: true,
        createdAt: true
      }
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

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      image: user.image,
      bannerImage: user.bannerImage,
      bio: user.bio,
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
    uploadIdCard:
      protectedProcedure.user.profile.verifyStudent.uploadIdCard.handler(
        async ({ input }) => {
          try {
            // Convert base64 to Buffer
            const base64Data = input.imageBase64.replace(BASE64_IMAGE_REGEX, '')
            const buffer = Buffer.from(base64Data, 'base64')

            // Parse ID using ID parser service
            const result = await idParserClient.parse(buffer, 'id-card.jpg')

            return {
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

    sendVerificationOTP:
      protectedProcedure.user.profile.verifyStudent.sendVerificationOTP.handler(
        async ({ input, context }) => {
          // Find institution by ID
          const institution = await db.query.institution.findFirst({
            where: eq(institutionTable.id, input.universityId)
          })

          if (!institution) {
            throw new ORPCError('INVALID_EMAIL_DOMAIN', {
              message: 'Institution not found'
            })
          }

          // Validate email domain
          const isValidDomain = await validateUniversityEmail(
            input.email,
            input.universityId
          )

          if (!isValidDomain) {
            throw new ORPCError('INVALID_EMAIL_DOMAIN', {
              message: `Email domain does not match ${institution.name} requirements`
            })
          }

          // Get user info
          const user = await db.query.user.findFirst({
            where: eq(userTable.id, context.session.user.id),
            columns: { name: true }
          })

          // Generate OTP
          const otp = generateOTP()
          const hashedOTP = hashOTP(otp)

          // Delete existing verification records
          await db
            .delete(verificationTable)
            .where(eq(verificationTable.identifier, context.session.user.id))

          // Store verification record
          await db.insert(verificationTable).values({
            id: nanoid(),
            identifier: context.session.user.id,
            value: hashedOTP,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
          })

          // Send OTP email
          try {
            await sendOTPEmail({
              to: input.email,
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

        if (enrollment) {
          // Update student status verified
          await db
            .update(institutionEnrollmentTable)
            .set({ studentStatusVerified: true })
            .where(eq(institutionEnrollmentTable.id, enrollment.id))
        }

        // Delete verification record (single-use)
        await db
          .delete(verificationTable)
          .where(eq(verificationTable.id, verification.id))

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
    )
  }
}
