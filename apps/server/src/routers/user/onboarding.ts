import { ORPCError } from '@orpc/server'
import { user as userTable, verification as verificationTable } from '@rov/db'
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

      // 2. Check if university email is already taken
      const existingUser = await db.query.user.findFirst({
        where: eq(userTable.universityEmail, input.universityEmail)
      })

      if (existingUser && existingUser.id !== context.session.user.id) {
        throw new ORPCError('UNIVERSITY_EMAIL_TAKEN', {
          message: 'This university email is already registered'
        })
      }

      // 3. Update user record with onboarding data
      await db
        .update(userTable)
        .set({
          name: input.displayName,
          image: input.profileImageUrl || undefined,
          universityEmail: input.universityEmail,
          universityId: input.universityId,
          major: input.major,
          yearOfStudy: input.yearOfStudy,
          interests: input.interests
        })
        .where(eq(userTable.id, context.session.user.id))

      // 4. Generate 6-digit OTP
      const otp = generateOTP()
      const hashedOTP = hashOTP(otp)

      // 5. Delete any existing verification records for this user
      await db
        .delete(verificationTable)
        .where(eq(verificationTable.identifier, context.session.user.id))

      // 6. Store in verification table
      await db.insert(verificationTable).values({
        id: nanoid(),
        identifier: context.session.user.id,
        value: hashedOTP,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      })

      // 7. Send OTP email via Resend
      await sendOTPEmail({
        to: input.universityEmail,
        displayName: input.displayName,
        otp
      })

      // 8. Emit analytics event to PostHog
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

      // 6. Emit analytics event to PostHog
      const user = await db.query.user.findFirst({
        where: eq(userTable.id, context.session.user.id),
        columns: { universityEmail: true, universityId: true }
      })

      emitEvent('user.verified', context.session.user.id, {
        universityEmail: user?.universityEmail,
        universityId: user?.universityId
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

        // 4. Get user's university email
        const user = await db.query.user.findFirst({
          where: eq(userTable.id, context.session.user.id),
          columns: { universityEmail: true, name: true }
        })

        if (!user?.universityEmail) {
          throw new ORPCError('USER_NOT_FOUND', {
            message: 'University email not found'
          })
        }

        // 5. Send OTP email
        await sendOTPEmail({
          to: user.universityEmail,
          displayName: user.name,
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
          isVerified: true,
          universityEmail: true
        }
      })

      return {
        isVerified: user?.isVerified ?? false,
        hasUniversityEmail: !!user?.universityEmail,
        needsOnboarding: !(user?.universityEmail && user?.isVerified)
      }
    }
  )
}
