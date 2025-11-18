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
  sendVerificationOTP:
    protectedProcedure.user.onboarding.sendVerificationOTP.handler(
      async ({ input, context }) => {
        // 1. Check if university email is already taken by another user
        const existingUser = await db.query.user.findFirst({
          where: eq(userTable.universityEmail, input.universityEmail)
        })

        if (existingUser && existingUser.id !== context.session.user.id) {
          throw new ORPCError('UNIVERSITY_EMAIL_TAKEN', {
            message: 'This university email is already registered'
          })
        }

        // 2. Validate university email domain with selected university
        const isValidDomain = await validateUniversityEmail(
          input.universityEmail,
          input.universityId
        )

        if (!isValidDomain) {
          throw new ORPCError('INVALID_UNIVERSITY_DOMAIN', {
            message: 'Email domain does not match university requirements'
          })
        }

        // 3. Update user with the provided university info
        await db
          .update(userTable)
          .set({
            universityEmail: input.universityEmail,
            universityId: input.universityId
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
          expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        })

        // 7. Get user display name for email template
        const user = await db.query.user.findFirst({
          where: eq(userTable.id, context.session.user.id),
          columns: { name: true }
        })

        // 8. Send OTP email
        await sendOTPEmail({
          to: input.universityEmail,
          displayName: user?.name ?? 'there',
          otp
        })

        return { success: true }
      }
    ),

  submit: protectedProcedure.user.onboarding.submit.handler(
    async ({ input, context }) => {
      // 1. Get user record with all needed fields
      const userRecord = await db.query.user.findFirst({
        where: eq(userTable.id, context.session.user.id),
        columns: {
          universityEmail: true,
          universityId: true,
          image: true
        }
      })

      if (!userRecord) {
        throw new ORPCError('UNIVERSITY_EMAIL_TAKEN', {
          message:
            'Please add your university email before completing your profile'
        })
      }

      const { universityEmail, universityId, image } = userRecord

      if (!universityEmail) {
        throw new ORPCError('UNIVERSITY_EMAIL_TAKEN', {
          message:
            'Please add your university email before completing your profile'
        })
      }

      if (!universityId) {
        throw new ORPCError('UNIVERSITY_EMAIL_TAKEN', {
          message:
            'Please add your university email before completing your profile'
        })
      }

      const isValidDomain = await validateUniversityEmail(
        universityEmail,
        universityId
      )

      if (!isValidDomain) {
        throw new ORPCError('INVALID_UNIVERSITY_DOMAIN', {
          message: 'Email domain does not match university requirements'
        })
      }

      // 2. Update user record with onboarding data
      await db
        .update(userTable)
        .set({
          name: input.displayName,
          image: input.profileImageUrl ?? image ?? undefined,
          major: input.major,
          yearOfStudy: input.yearOfStudy,
          interests: input.interests
        })
        .where(eq(userTable.id, context.session.user.id))

      // 3. Generate 6-digit OTP
      const otp = generateOTP()
      const hashedOTP = hashOTP(otp)

      // 4. Delete any existing verification records for this user
      await db
        .delete(verificationTable)
        .where(eq(verificationTable.identifier, context.session.user.id))

      // 5. Store in verification table
      await db.insert(verificationTable).values({
        id: nanoid(),
        identifier: context.session.user.id,
        value: hashedOTP,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      })

      // 6. Send OTP email via Resend
      await sendOTPEmail({
        to: universityEmail,
        displayName: input.displayName,
        otp
      })

      // 7. Emit analytics event to PostHog
      await emitEvent('user.onboarding_submitted', context.session.user.id, {
        universityEmail,
        universityId,
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
          universityEmail: true,
          universityId: true
        }
      })

      const hasCompletedProfile = Boolean(user?.universityId)

      return {
        isVerified: user?.isVerified ?? false,
        hasUniversityEmail: !!user?.universityEmail,
        needsOnboarding: !hasCompletedProfile
      }
    }
  )
}
