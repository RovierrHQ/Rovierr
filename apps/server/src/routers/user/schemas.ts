import { z } from 'zod'

// ============================================================================
// Social Links Schema
// ============================================================================

export const socialLinksSchema = z.object({
  whatsapp: z.string().nullable(),
  telegram: z.string().nullable(),
  instagram: z.string().nullable(),
  facebook: z.string().nullable(),
  twitter: z.string().nullable(),
  linkedin: z.string().nullable()
})

// ============================================================================
// Profile Update Schema
// ============================================================================

export const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .optional(),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Username can only contain letters, numbers, - and _'
    )
    .optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  summary: z
    .string()
    .max(2000, 'Summary must be less than 2000 characters')
    .optional(),
  website: z.url('Invalid URL').optional().or(z.literal('')),
  image: z.string().optional().or(z.literal('')),
  bannerImage: z.string().optional().or(z.literal('')),
  whatsapp: z
    .string()
    .max(50, 'WhatsApp number must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  telegram: z
    .string()
    .max(50, 'Telegram username must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  instagram: z
    .string()
    .max(100, 'Instagram handle must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  facebook: z
    .string()
    .max(100, 'Facebook handle must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  twitter: z
    .string()
    .max(100, 'Twitter handle must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  linkedin: z
    .string()
    .max(100, 'LinkedIn handle must be less than 100 characters')
    .optional()
    .or(z.literal(''))
})

// ============================================================================
// Response Schemas
// ============================================================================

export const universitySchema = z.object({
  id: z.string(),
  name: z.string(),
  logo: z.string().nullable(),
  slug: z.string().optional(),
  country: z.string(),
  city: z.string()
})

export const profileInfoSchema = z.object({
  currentUniversity: universitySchema.optional(),
  studentStatusVerified: z.boolean()
})

export const profileDetailsSchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string().nullable(),
  email: z.string(),
  image: z.string().nullable(),
  bannerImage: z.string().nullable(),
  bio: z.string().nullable(),
  summary: z.string().nullable(),
  website: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  phoneNumberVerified: z.boolean(),
  socialLinks: socialLinksSchema,
  currentUniversity: universitySchema.omit({ slug: true }).nullable(),
  studentStatusVerified: z.boolean(),
  createdAt: z.date(),
  major: z.string().nullable(),
  yearOfStudy: z.string().nullable()
})

export const profileUpdateResponseSchema = z.object({
  success: z.boolean(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    username: z.string().nullable(),
    bio: z.string().nullable(),
    summary: z.string().nullable(),
    website: z.string().nullable(),
    image: z.string().nullable(),
    bannerImage: z.string().nullable(),
    socialLinks: socialLinksSchema
  })
})

// ============================================================================
// Academic Schemas
// ============================================================================

export const academicEnrollmentSchema = z.object({
  id: z.string(),
  program: z.object({
    id: z.string(),
    name: z.string(),
    code: z.string(),
    degreeLevel: z.string()
  }),
  university: z.object({
    id: z.string(),
    name: z.string(),
    logo: z.string().nullable()
  }),
  studentStatusVerified: z.boolean(),
  startedOn: z.date().nullable(),
  graduatedOn: z.date().nullable(),
  isPrimary: z.boolean()
})

export const academicResponseSchema = z.object({
  enrollments: z.array(academicEnrollmentSchema)
})

// ============================================================================
// Activity Schemas
// ============================================================================

export const activityQuerySchema = z.object({
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0)
})

export const activityItemSchema = z.object({
  id: z.string(),
  type: z.enum(['post', 'comment', 'join', 'event', 'achievement']),
  title: z.string(),
  description: z.string().nullable(),
  timestamp: z.date(),
  metadata: z.record(z.string(), z.any())
})

export const activityResponseSchema = z.object({
  activities: z.array(activityItemSchema),
  total: z.number(),
  hasMore: z.boolean()
})

// ============================================================================
// Public Profile Schemas
// ============================================================================

export const publicProfileQuerySchema = z.object({
  username: z.string().min(1)
})

export const publicProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string(),
  image: z.string().nullable(),
  bannerImage: z.string().nullable(),
  bio: z.string().nullable(),
  summary: z.string().nullable(),
  website: z.string().nullable(),
  socialLinks: socialLinksSchema,
  currentUniversity: universitySchema.omit({ slug: true }).nullable(),
  studentStatusVerified: z.boolean(),
  createdAt: z.date(),
  major: z.string().nullable(),
  yearOfStudy: z.string().nullable()
})

// ============================================================================
// Student Verification Schemas
// ============================================================================

export const studentIdCardSchema = z.object({
  id: z.string(),
  imageUrl: z.string(),
  university: z.string().nullable(),
  studentId: z.string().nullable(),
  expiryDate: z.string().nullable(),
  createdAt: z.date(),
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
  email: z.string().email('Invalid email address'),
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

// ============================================================================
// Common Response Schemas
// ============================================================================

export const successResponseSchema = z.object({
  success: z.boolean()
})

export const verifyOTPResponseSchema = z.object({
  success: z.boolean(),
  verified: z.boolean()
})

// ============================================================================
// Type Exports
// ============================================================================

export type SocialLinks = z.infer<typeof socialLinksSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
export type ProfileDetails = z.infer<typeof profileDetailsSchema>
export type AcademicEnrollment = z.infer<typeof academicEnrollmentSchema>
export type ActivityItem = z.infer<typeof activityItemSchema>
export type PublicProfile = z.infer<typeof publicProfileSchema>
export type StudentIdCard = z.infer<typeof studentIdCardSchema>
export type VerificationStatus = z.infer<typeof verificationStatusSchema>
