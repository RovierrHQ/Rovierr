// ============================================================================
// Student Verification Schemas
// ============================================================================

import z from 'zod'

export const studentIdCardSchema = z.object({
  id: z.string(),
  imageUrl: z.string(),
  university: z.string().nullable(),
  studentId: z.string().nullable(),
  expiryDate: z.string().nullable(),
  createdAt: z.iso.datetime(),
  isVerified: z.boolean()
})

export const listIdCardsResponseSchema = z.object({
  idCards: z.array(studentIdCardSchema)
})

export const uploadIdCardSchema = z.object({
  imageBase64: z.string().describe('Base64 encoded image data')
})

export const uploadIdCardResponseSchema = z.object({
  id: z.string(),
  university: z.string().nullable(),
  studentId: z.string().nullable(),
  expiryDate: z.string().nullable(),
  rawText: z.array(z.string())
})

export const deleteIdCardSchema = z.object({
  id: z.string().min(1, 'Student ID card ID is required')
})

export const sendVerificationOTPSchema = z.object({
  email: z.string().email(),
  universityId: z.string().min(1, 'University ID is required')
})

export const verifyOTPSchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must be 6 digits')
})

export const verificationStatusSchema = z.object({
  isVerified: z.boolean(),
  hasUniversityEmail: z.boolean(),
  emailVerified: z.boolean(),
  studentStatusVerified: z.boolean(),
  verificationStep: z.enum(['upload', 'email', 'otp']).nullable(),
  hasIdCard: z.boolean(),
  parsedData: z
    .object({
      university: z.string().nullable(),
      studentId: z.string().nullable()
    })
    .nullable()
})

export const successResponseSchema = z.object({
  success: z.boolean()
})

export const verifyOTPResponseSchema = z.object({
  success: z.boolean(),
  verified: z.boolean()
})

export type StudentIdCard = z.infer<typeof studentIdCardSchema>
export type VerificationStatus = z.infer<typeof verificationStatusSchema>
