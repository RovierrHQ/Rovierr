import { ORPCError } from '@orpc/server'
import {
  instituitionEnrollment as institutionEnrollmentTable,
  user as userTable,
  verification as verificationTable
} from '@rov/db'
import { and, eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { db } from '@/db'
import { emitEvent } from '@/lib/events'
import { protectedProcedure } from '@/lib/orpc'
import { generateOTP, hashOTP, validateUniversityEmail } from '@/lib/utils'
import { sendOTPEmail } from '@/services/email/sender'

export const onboarding = {
  submit: protectedProcedure.user.onboarding.submit.handler(
    async ({ input, context }) => {
      // 1. Validate university email domain
      const isValidDomain = await validateUniversityEmail(
        input.universityEmail,
        input.universityId
      )

      if (!isValidDomain) {
        throw new ORPCError('INVALID_UNIVERSITY_DOMAIN', {
          message: 'Email domain does not match university requirements'
        })
      }

      // 2. Check if institution email is already taken
      const existingEnrollment =
        await db.query.instituitionEnrollment.findFirst({
          where: eq(institutionEnrollmentTable.email, input.universityEmail)
        })

      if (
        existingEnrollment &&
        existingEnrollment.userId !== context.session.user.id
      ) {
        throw new ORPCError('UNIVERSITY_EMAIL_TAKEN', {
          message: 'This university email is already registered'
        })
      }

      // 3. Update user record with onboarding data
      await db
        .update(userTable)
        .set({
          name: input.displayName,
          image: input.profileImageUrl,
          interests: input.interests
        })
        .where(eq(userTable.id, context.session.user.id))

      // 4. Create or update institution enrollment
      const existingUserEnrollment =
        await db.query.instituitionEnrollment.findFirst({
          where: eq(institutionEnrollmentTable.userId, context.session.user.id)
        })

      if (existingUserEnrollment) {
        await db
          .update(institutionEnrollmentTable)
          .set({
            institutionId: input.universityId,
            email: input.universityEmail,
            studentId: input.universityEmail.split('@')[0] // Use email prefix as student ID temporarily
          })
          .where(eq(institutionEnrollmentTable.id, existingUserEnrollment.id))
      } else {
        await db.insert(institutionEnrollmentTable).values({
          id: nanoid(),
          userId: context.session.user.id,
          institutionId: input.universityId,
          email: input.universityEmail,
          studentId: input.universityEmail.split('@')[0], // Use email prefix as student ID temporarily
          emailVerified: false,
          studentStatusVerified: false
        })
      }

      // 5. Generate 6-digit OTP
      const otp = generateOTP()
      const hashedOTP = hashOTP(otp)

      // 6. Delete any existing verification records for this user
      await db
        .delete(verificationTable)
        .where(eq(verificationTable.identifier, context.session.user.id))

      // 7. Store in verification table
      await db.insert(verificationTable).values({
        id: nanoid(),
        identifier: context.session.user.id,
        value: hashedOTP,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      })

      // 8. Send OTP email via Resend
      await sendOTPEmail({
        to: input.universityEmail,
        displayName: input.displayName,
        otp
      })

      // 9. Emit analytics event to PostHog
      await emitEvent('user.onboarding_submitted', context.session.user.id, {
        universityEmail: input.universityEmail,
        universityId: input.universityId,
        major: input.major,
        yearOfStudy: input.yearOfStudy
      })

      return { success: true }
    }
  ),

  verifyEmail: protectedProcedure.user.onboarding.verifyEmail.handler(
    async ({ input, context }) => {
      // 1. Hash the provided OTP
      const hashedOTP = hashOTP(input.otp)

      // 2. Find verification record
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

      // 3. Check expiration
      if (verification.expiresAt < new Date()) {
        await db
          .delete(verificationTable)
          .where(eq(verificationTable.id, verification.id))

        throw new ORPCError('TOKEN_EXPIRED', {
          message: 'OTP has expired. Please request a new one.'
        })
      }

      // 4. Update user as verified
      await db
        .update(userTable)
        .set({
          isVerified: true
        })
        .where(eq(userTable.id, context.session.user.id))

      // 5. Delete verification record (single-use)
      await db
        .delete(verificationTable)
        .where(eq(verificationTable.id, verification.id))

      // 6. Update institution enrollment email verified status
      const enrollment = await db.query.instituitionEnrollment.findFirst({
        where: eq(institutionEnrollmentTable.userId, context.session.user.id)
      })

      if (enrollment) {
        await db
          .update(institutionEnrollmentTable)
          .set({ emailVerified: true })
          .where(eq(institutionEnrollmentTable.id, enrollment.id))
      }

      // 7. Emit analytics event to PostHog
      emitEvent('user.verified', context.session.user.id, {
        universityEmail: enrollment?.email,
        universityId: enrollment?.institutionId
      })

      return { success: true, verified: true }
    }
  ),

  resendVerification:
    protectedProcedure.user.onboarding.resendVerification.handler(
      async ({ context }) => {
        // 1. Delete old verification records for this user
        await db
          .delete(verificationTable)
          .where(eq(verificationTable.identifier, context.session.user.id))

        // 2. Generate new OTP
        const otp = generateOTP()
        const hashedOTP = hashOTP(otp)

        // 3. Store in verification table
        await db.insert(verificationTable).values({
          id: nanoid(),
          identifier: context.session.user.id,
          value: hashedOTP,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        })

        // 4. Get user's institution enrollment email
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

        // 5. Send OTP email
        await sendOTPEmail({
          to: enrollment.email,
          displayName: user?.name ?? 'User',
          otp
        })

        return { success: true }
      }
    ),

  getStatus: protectedProcedure.user.onboarding.getStatus.handler(
    async ({ context }) => {
      const user = await db.query.user.findFirst({
        where: eq(userTable.id, context.session.user.id),
        columns: {
          isVerified: true
        }
      })

      const enrollment = await db.query.instituitionEnrollment.findFirst({
        where: eq(institutionEnrollmentTable.userId, context.session.user.id),
        columns: {
          email: true,
          emailVerified: true
        }
      })

      return {
        isVerified: user?.isVerified ?? false,
        hasUniversityEmail: !!enrollment?.email,
        needsOnboarding: !(enrollment?.email && user?.isVerified)
      }
    }
  )
}
