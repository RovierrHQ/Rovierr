/**
 * Validation service for society operations
 * Handles social link validation, input sanitization, and uniqueness checks
 */

import type { DB } from '@rov/db'

type SocialPlatform =
  | 'instagram'
  | 'facebook'
  | 'twitter'
  | 'linkedin'
  | 'whatsapp'
  | 'telegram'
  | 'website'

// Regex patterns for social link validation
const INSTAGRAM_PATTERN = /^@?[\w.]+$/
const TWITTER_PATTERN = /^@?[\w]+$/
const PHONE_PATTERN = /^\+?[\d\s\-()]+$/
const WHATSAPP_LINK_PATTERN = /^https?:\/\/(wa\.me|api\.whatsapp\.com)/
const TELEGRAM_USERNAME_PATTERN = /^@?[\w]+$/
const TELEGRAM_LINK_PATTERN = /^https?:\/\/(t\.me|telegram\.me)/

/**
 * Validate social link format for each platform
 */
export function validateSocialLink(
  platform: SocialPlatform,
  value: string
): boolean {
  if (!value || value.trim() === '') {
    return true // Empty values are valid (optional fields)
  }

  const trimmedValue = value.trim()

  switch (platform) {
    case 'instagram':
      // Instagram username: alphanumeric, dots, underscores, optional @ prefix
      return INSTAGRAM_PATTERN.test(trimmedValue)

    case 'facebook':
      // Facebook: valid URL
      try {
        const url = new URL(trimmedValue)
        return url.protocol === 'http:' || url.protocol === 'https:'
      } catch {
        return false
      }

    case 'twitter':
      // Twitter username: alphanumeric, underscores, optional @ prefix
      return TWITTER_PATTERN.test(trimmedValue)

    case 'linkedin':
      // LinkedIn: valid URL
      try {
        const url = new URL(trimmedValue)
        return url.protocol === 'http:' || url.protocol === 'https:'
      } catch {
        return false
      }

    case 'whatsapp': {
      // WhatsApp: phone number or valid WhatsApp link
      // Accept phone numbers (with or without +) or wa.me links
      return (
        PHONE_PATTERN.test(trimmedValue) ||
        WHATSAPP_LINK_PATTERN.test(trimmedValue)
      )
    }

    case 'telegram': {
      // Telegram: username (@username) or t.me link
      return (
        TELEGRAM_USERNAME_PATTERN.test(trimmedValue) ||
        TELEGRAM_LINK_PATTERN.test(trimmedValue)
      )
    }

    case 'website':
      // Website: valid URL with protocol
      try {
        const url = new URL(trimmedValue)
        return url.protocol === 'http:' || url.protocol === 'https:'
      } catch {
        return false
      }

    default:
      return false
  }
}

/**
 * Sanitize input to prevent XSS attacks
 * Removes potentially malicious HTML/script tags and dangerous characters
 */
export function sanitizeInput(input: string): string {
  if (!input) return input

  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '')

  // Remove script-related content
  sanitized = sanitized.replace(/javascript:/gi, '')
  sanitized = sanitized.replace(/on\w+\s*=/gi, '')

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '')

  // Trim whitespace
  sanitized = sanitized.trim()

  return sanitized
}

/**
 * Check if society name is unique within a university
 * Returns true if name is available, false if taken
 */
export async function checkUniqueName(
  db: DB,
  name: string,
  universityId?: string,
  excludeId?: string
): Promise<boolean> {
  const { organization } = await import('@rov/db/schema')
  const { eq, and } = await import('drizzle-orm')

  const conditions = [eq(organization.name, name)]

  if (universityId) {
    conditions.push(eq(organization.institutionId, universityId))
  }

  if (excludeId) {
    const { ne } = await import('drizzle-orm')
    conditions.push(ne(organization.id, excludeId))
  }

  const existing = await db
    .select({ id: organization.id })
    .from(organization)
    .where(and(...conditions))
    .limit(1)

  return existing.length === 0
}

/**
 * Validate image file constraints
 */
export interface ImageConstraints {
  maxSize: number // in bytes
  formats: string[]
  minWidth: number
  minHeight: number
}

export const LOGO_CONSTRAINTS: ImageConstraints = {
  maxSize: 5 * 1024 * 1024, // 5MB
  formats: ['image/jpeg', 'image/png', 'image/webp'],
  minWidth: 200,
  minHeight: 200
}

export const BANNER_CONSTRAINTS: ImageConstraints = {
  maxSize: 10 * 1024 * 1024, // 10MB
  formats: ['image/jpeg', 'image/png', 'image/webp'],
  minWidth: 1200,
  minHeight: 400
}

export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validate image file against constraints
 */
export function validateImage(
  file: File,
  constraints: ImageConstraints
): ValidationResult {
  // Check file size
  if (file.size > constraints.maxSize) {
    const maxSizeMB = constraints.maxSize / (1024 * 1024)
    return {
      valid: false,
      error: `Image must be under ${maxSizeMB}MB`
    }
  }

  // Check file format
  if (!constraints.formats.includes(file.type)) {
    const formatList = constraints.formats
      .map((f) => f.replace('image/', ''))
      .join(', ')
    return {
      valid: false,
      error: `Only ${formatList} formats are supported`
    }
  }

  // Note: Dimension validation requires loading the image
  // This should be done client-side or in the image service
  // For now, we'll return valid if size and format are correct

  return { valid: true }
}
