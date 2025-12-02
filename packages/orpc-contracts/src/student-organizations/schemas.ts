import { z } from 'zod'

// Social link validation schemas with platform-specific patterns
export const socialLinksSchema = z.object({
  instagram: z
    .string()
    .regex(/^@?[\w.]+$/, 'Invalid Instagram username format')
    .optional()
    .or(z.literal('')),
  facebook: z.string().url('Invalid Facebook URL').optional().or(z.literal('')),
  twitter: z
    .string()
    .regex(/^@?[\w]+$/, 'Invalid Twitter username format')
    .optional()
    .or(z.literal('')),
  linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  whatsapp: z.string().optional().or(z.literal('')), // Can be phone number or WhatsApp link
  telegram: z.string().optional().or(z.literal('')), // Can be username or group link
  website: z.string().url('Invalid website URL').optional().or(z.literal(''))
})

// Create society schema for use with Better-Auth organization.create()
// Includes all fields that can be passed as additionalFields
export const createSocietySchema = z
  .object({
    // Better-Auth core fields
    name: z
      .string()
      .min(1, 'Name is required')
      .max(100, 'Name must be less than 100 characters'),
    slug: z.string().optional(), // Auto-generated if not provided

    // Society-specific additional fields
    description: z
      .string()
      .min(1, 'Description is required')
      .max(1000, 'Description must be less than 1000 characters'),
    institutionId: z.string().optional(),
    type: z.enum(['student', 'university'], {
      message: 'Organization type must be either "student" or "university"'
    }),
    visibility: z
      .enum(['public', 'campus_only', 'private'])
      .default('public')
      .optional(),
    tags: z.array(z.string()).optional(),

    // Social links (can be included in creation)
    instagram: z
      .string()
      .regex(/^@?[\w.]+$/, 'Invalid Instagram username format')
      .optional()
      .or(z.literal('')),
    facebook: z
      .string()
      .url('Invalid Facebook URL')
      .optional()
      .or(z.literal('')),
    twitter: z
      .string()
      .regex(/^@?[\w]+$/, 'Invalid Twitter username format')
      .optional()
      .or(z.literal('')),
    linkedin: z
      .string()
      .url('Invalid LinkedIn URL')
      .optional()
      .or(z.literal('')),
    whatsapp: z.string().optional().or(z.literal('')),
    telegram: z.string().optional().or(z.literal('')),
    website: z.string().url('Invalid website URL').optional().or(z.literal(''))
  })
  .refine(
    (data) => {
      // If type is 'university', institutionId is required
      if (data.type === 'university') {
        return !!data.institutionId
      }
      return true
    },
    {
      message:
        'Institution affiliation is required for university organizations',
      path: ['institutionId']
    }
  )

// Update society-specific fields schema (excludes core org fields like name/slug)
// Logo and banner can be updated via ORPC
export const updateSocietyFieldsSchema = z.object({
  description: z.string().min(1).max(1000).optional(),
  institutionId: z.string().optional(),
  type: z.enum(['student', 'university']).optional(),
  visibility: z.enum(['public', 'campus_only', 'private']).optional(),
  tags: z.array(z.string()).optional(),
  logo: z.string().url().optional(),
  banner: z.string().url().optional(),

  // Social links
  instagram: z
    .string()
    .regex(/^@?[\w.]+$/, 'Invalid Instagram username format')
    .optional()
    .or(z.literal('')),
  facebook: z.string().url('Invalid Facebook URL').optional().or(z.literal('')),
  twitter: z
    .string()
    .regex(/^@?[\w]+$/, 'Invalid Twitter username format')
    .optional()
    .or(z.literal('')),
  linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  whatsapp: z.string().optional().or(z.literal('')),
  telegram: z.string().optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),

  // Additional details
  foundingYear: z
    .number()
    .int()
    .min(1800, 'Founding year must be after 1800')
    .max(new Date().getFullYear(), 'Founding year cannot be in the future')
    .optional(),
  meetingSchedule: z
    .string()
    .max(200, 'Meeting schedule must be less than 200 characters')
    .optional(),
  membershipRequirements: z
    .string()
    .max(500, 'Membership requirements must be less than 500 characters')
    .optional(),
  goals: z
    .string()
    .max(1000, 'Goals must be less than 1000 characters')
    .optional(),

  // Branding
  primaryColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Primary color must be a valid hex color')
    .optional()
})

// Legacy update schema for backward compatibility
export const updateSocietySchema = updateSocietyFieldsSchema.extend({
  name: z.string().min(1).max(100).optional(),
  logo: z.string().url().optional()
})

// Society output schema (enriched organization + society fields)
export const societySchema = z.object({
  // Better-Auth organization fields
  id: z.string(),
  name: z.string(),
  slug: z.string().nullable(),
  logo: z.string().nullable(),
  metadata: z.record(z.string(), z.any()).nullable(),

  // Society-specific fields
  description: z.string().nullable(),
  banner: z.string().nullable(),
  institutionId: z.string().nullable(),
  institutionName: z.string().nullable(),
  type: z.enum(['student', 'university']),
  visibility: z.enum(['public', 'campus_only', 'private']),
  isVerified: z.boolean(),
  tags: z.array(z.string()).nullable(),

  // Social links
  instagram: z.string().nullable(),
  facebook: z.string().nullable(),
  twitter: z.string().nullable(),
  linkedin: z.string().nullable(),
  whatsapp: z.string().nullable(),
  telegram: z.string().nullable(),
  website: z.string().nullable(),

  // Additional details
  foundingYear: z.number().nullable(),
  meetingSchedule: z.string().nullable(),
  membershipRequirements: z.string().nullable(),
  goals: z.string().nullable(),

  // Branding
  primaryColor: z.string().nullable(),

  // State tracking
  onboardingCompleted: z.boolean(),
  profileCompletionPercentage: z.number(),

  // Metadata
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  memberCount: z.number().optional()
})

// Image upload constraints
export const imageUploadSchema = z.object({
  societyId: z.string(),
  type: z.enum(['logo', 'banner']),
  file: z.instanceof(File)
})
