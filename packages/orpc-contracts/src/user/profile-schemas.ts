import { z } from 'zod'

// Social links schema
export const socialLinksSchema = z.object({
  whatsapp: z.string().nullable(),
  telegram: z.string().nullable(),
  instagram: z.string().nullable(),
  facebook: z.string().nullable(),
  twitter: z.string().nullable(),
  linkedin: z.string().nullable()
})

// Profile update schema matching the ORPC contract
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

// About tab schema (subset of profile update)
export const aboutUpdateSchema = z.object({
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  summary: z
    .string()
    .max(2000, 'Summary must be less than 2000 characters')
    .optional(),
  website: z.url('Invalid URL').optional().or(z.literal('')),
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

// Verification settings schema
export const verificationSettingsSchema = z.object({
  universityId: z.string().min(1, 'Please select a university'),
  universityEmail: z.email('Invalid email address'),
  startDate: z.string().optional(),
  verificationCode: z
    .string()
    .length(6, 'Verification code must be 6 digits')
    .optional()
})

export type SocialLinks = z.infer<typeof socialLinksSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
export type AboutUpdateInput = z.infer<typeof aboutUpdateSchema>
export type VerificationSettingsInput = z.infer<
  typeof verificationSettingsSchema
>
