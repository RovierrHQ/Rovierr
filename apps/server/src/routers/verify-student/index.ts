import { db } from '@api/db'
import {
  FORBIDDEN,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND
} from '@api/lib/common-errors'
import { generateOTP, hashOTP } from '@api/lib/utils'
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
  PARSING_FAILED,
  TOKEN_EXPIRED,
  TOKEN_INVALID,
  USER_NOT_FOUND
} from './errors'
import {
  listIdCardsResponseSchema,
  sendVerificationOTPSchema,
  successResponseSchema,
  uploadIdCardResponseSchema,
  uploadIdCardSchema,
  verificationStatusSchema,
  verifyOTPResponseSchema,
  verifyOTPSchema
} from './schemas'

const BASE64_IMAGE_REGEX = /^data:image\/\w+;base64,/

export const verifyStudentRouter = new Elysia({ name: 'verify-student' })
  .use(betterAuth)
  // Student verification routes (auth required)
  .group(
    '/verify-student',
    {
      auth: true,
      detail: {
        tags: ['Verification']
      }
    },
    (app) =>
      app
        // GET /verify-student/id-cards - List student ID cards
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
                row.enrollmentVerified === true ||
                (existing?.isVerified ?? false)

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
                  createdAt: card.createdAt,
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
              summary: 'List Student ID Cards'
            }
          }
        )

        // POST /verify-student/upload-id-card - Upload student ID card
        .post(
          '/upload-id-card',
          async ({ body, user }) => {
            try {
              // Convert base64 to Buffer
              const base64Data = body.imageBase64.replace(
                BASE64_IMAGE_REGEX,
                ''
              )
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
              summary: 'Upload Student ID Card'
            }
          }
        )

        // DELETE /verify-student/id-card/:id - Delete student ID card
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
              summary: 'Delete Student ID Card'
            }
          }
        )

        // POST /verify-student/send-otp - Send verification OTP
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
            const isValidDomain = institution.validEmailDomains.some((domain) =>
              body.email.toLowerCase().endsWith(domain.toLowerCase())
            )

            if (!isValidDomain) {
              console.error('[sendVerificationOTP] Invalid email domain')
              throw new INVALID_EMAIL_DOMAIN(
                `Email domain does not match ${institution.name} requirements`
              )
            }

            // Delete any enrollments in 'otp' step to clean up stale verifications
            console.log(
              '[sendVerificationOTP] Deleting any enrollments in OTP step...'
            )
            const deletedEnrollments = await db
              .delete(institutionEnrollmentTable)
              .where(
                and(
                  eq(institutionEnrollmentTable.userId, user.id),
                  eq(institutionEnrollmentTable.verificationStep, 'otp')
                )
              )
              .returning()

            if (deletedEnrollments.length > 0) {
              console.log(
                '[sendVerificationOTP] Deleted stale OTP enrollments:',
                deletedEnrollments.map((e) => e.id)
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

            // Enrollment checks
            // Note: Since email domains are unique per university, we only need to check:
            // 1. If email is used by another user (email is globally unique)
            // 2. If user has existing enrollment for this university

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
                '[sendVerificationOTP] Email already taken by another user',
                {
                  email: body.email,
                  otherUserId: existingEmailEnrollment.userId
                }
              )
              throw new EMAIL_ALREADY_TAKEN(
                'This university email is already registered to another account'
              )
            }

            // Check for existing enrollment for this specific university
            const enrollmentForUniversity =
              await db.query.instituitionEnrollment.findFirst({
                where: and(
                  eq(institutionEnrollmentTable.userId, user.id),
                  eq(
                    institutionEnrollmentTable.institutionId,
                    body.universityId
                  )
                ),
                columns: { id: true }
              })

            console.log('[sendVerificationOTP] Enrollment check results:', {
              hasEnrollmentForUniversity: !!enrollmentForUniversity,
              enrollmentId: enrollmentForUniversity?.id
            })

            // currently we dont allow multiple enrollments for the same university
            if (enrollmentForUniversity) {
              console.log(
                '[sendVerificationOTP] Updating existing enrollment...'
              )
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
                    eq(
                      institutionEnrollmentTable.id,
                      enrollmentForUniversity.id
                    )
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
            console.log(
              '[sendVerificationOTP] Old verification records deleted'
            )

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
            console.log(
              '[sendVerificationOTP] Sending OTP email to:',
              body.email
            )
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
              summary: 'Send Verification OTP'
            }
          }
        )

        // POST /verify-student/verify-otp - Verify OTP
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

            // Get user's institution enrollment that's in OTP verification step
            // This ensures we verify the correct enrollment (the one from send-otp)
            const enrollment = await db.query.instituitionEnrollment.findFirst({
              where: and(
                eq(institutionEnrollmentTable.userId, user.id),
                eq(institutionEnrollmentTable.verificationStep, 'otp')
              ),
              columns: {
                id: true,
                institutionId: true,
                email: true
              }
            })

            if (!enrollment) {
              throw new USER_NOT_FOUND(
                'No pending verification found. Please request a new OTP.'
              )
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
                  verificationStep: 'completed'
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
              summary: 'Verify OTP'
            }
          }
        )

        // POST /verify-student/resend-otp - Resend OTP
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
              summary: 'Resend OTP'
            }
          }
        )

        // GET /verify-student/status - Get verification status
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
              verificationStep: enrollment?.verificationStep ?? 'email',
              hasIdCard: !!enrollment?.studentIdCardId,
              parsedData
            }
          },
          {
            response: verificationStatusSchema,
            detail: {
              description: 'Gets the verification status for the user.',
              summary: 'Get Verification Status'
            }
          }
        )
  )
