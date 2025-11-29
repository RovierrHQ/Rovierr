import type { ProfileFieldMapping, ValidationRule } from './form-types'

// ============================================================================
// Smart Field Registry
// ============================================================================
// This registry defines all available profile field mappings for the form
// builder system. Each mapping connects a form question to a user profile field.

export const SMART_FIELD_REGISTRY: ProfileFieldMapping[] = [
  // ============================================================================
  // Personal Information
  // ============================================================================
  {
    id: 'field-name',
    fieldKey: 'name',
    displayLabel: 'Full Name',
    category: 'personal',
    dataType: 'text',
    profilePath: 'name',
    defaultValidationRules: {
      minLength: 2,
      maxLength: 100,
      minLengthMessage: 'Name must be at least 2 characters',
      maxLengthMessage: 'Name cannot exceed 100 characters'
    },
    description: "User's full legal name",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'field-username',
    fieldKey: 'username',
    displayLabel: 'Username',
    category: 'personal',
    dataType: 'text',
    profilePath: 'username',
    defaultValidationRules: {
      minLength: 3,
      maxLength: 30,
      pattern: '^[a-zA-Z0-9_-]+$',
      minLengthMessage: 'Username must be at least 3 characters',
      maxLengthMessage: 'Username cannot exceed 30 characters',
      patternMessage: 'Username can only contain letters, numbers, - and _'
    },
    description: "User's unique username",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'field-bio',
    fieldKey: 'bio',
    displayLabel: 'Bio',
    category: 'personal',
    dataType: 'text',
    profilePath: 'bio',
    defaultValidationRules: {
      maxLength: 500,
      maxLengthMessage: 'Bio cannot exceed 500 characters'
    },
    description: 'Short biography or description',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'field-summary',
    fieldKey: 'summary',
    displayLabel: 'Summary',
    category: 'personal',
    dataType: 'text',
    profilePath: 'summary',
    defaultValidationRules: {
      maxLength: 2000,
      maxLengthMessage: 'Summary cannot exceed 2000 characters'
    },
    description: 'Detailed summary or about section',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // ============================================================================
  // Contact Information
  // ============================================================================
  {
    id: 'field-email',
    fieldKey: 'email',
    displayLabel: 'Email Address',
    category: 'contact',
    dataType: 'email',
    profilePath: 'email',
    defaultValidationRules: {
      pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
      patternMessage: 'Please enter a valid email address'
    },
    description: 'Primary email address',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'field-phone',
    fieldKey: 'phoneNumber',
    displayLabel: 'Phone Number',
    category: 'contact',
    dataType: 'phone',
    profilePath: 'phoneNumber',
    defaultValidationRules: {
      pattern: '^\\+?[1-9]\\d{1,14}$',
      patternMessage: 'Please enter a valid phone number with country code'
    },
    description: 'Primary phone number',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'field-whatsapp',
    fieldKey: 'whatsapp',
    displayLabel: 'WhatsApp Number',
    category: 'contact',
    dataType: 'phone',
    profilePath: 'whatsapp',
    defaultValidationRules: {
      pattern: '^\\+?[1-9]\\d{1,14}$',
      maxLength: 50,
      patternMessage: 'Please enter a valid WhatsApp number with country code',
      maxLengthMessage: 'WhatsApp number cannot exceed 50 characters'
    },
    description: 'WhatsApp contact number',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'field-telegram',
    fieldKey: 'telegram',
    displayLabel: 'Telegram Username',
    category: 'contact',
    dataType: 'text',
    profilePath: 'telegram',
    defaultValidationRules: {
      maxLength: 50,
      pattern: '^@?[a-zA-Z0-9_]{5,32}$',
      maxLengthMessage: 'Telegram username cannot exceed 50 characters',
      patternMessage: 'Please enter a valid Telegram username'
    },
    description: 'Telegram username',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'field-website',
    fieldKey: 'website',
    displayLabel: 'Website',
    category: 'contact',
    dataType: 'text',
    profilePath: 'website',
    defaultValidationRules: {
      pattern: '^https?://[^\\s]+$',
      patternMessage:
        'Please enter a valid URL starting with http:// or https://'
    },
    description: 'Personal or professional website',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // ============================================================================
  // Social Media
  // ============================================================================
  {
    id: 'field-instagram',
    fieldKey: 'instagram',
    displayLabel: 'Instagram Handle',
    category: 'contact',
    dataType: 'text',
    profilePath: 'instagram',
    defaultValidationRules: {
      maxLength: 100,
      pattern: '^@?[a-zA-Z0-9._]+$',
      maxLengthMessage: 'Instagram handle cannot exceed 100 characters',
      patternMessage: 'Please enter a valid Instagram handle'
    },
    description: 'Instagram username or handle',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'field-facebook',
    fieldKey: 'facebook',
    displayLabel: 'Facebook Profile',
    category: 'contact',
    dataType: 'text',
    profilePath: 'facebook',
    defaultValidationRules: {
      maxLength: 100,
      maxLengthMessage: 'Facebook profile cannot exceed 100 characters'
    },
    description: 'Facebook profile URL or username',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'field-twitter',
    fieldKey: 'twitter',
    displayLabel: 'Twitter/X Handle',
    category: 'contact',
    dataType: 'text',
    profilePath: 'twitter',
    defaultValidationRules: {
      maxLength: 100,
      pattern: '^@?[a-zA-Z0-9_]+$',
      maxLengthMessage: 'Twitter handle cannot exceed 100 characters',
      patternMessage: 'Please enter a valid Twitter handle'
    },
    description: 'Twitter/X username or handle',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'field-linkedin',
    fieldKey: 'linkedin',
    displayLabel: 'LinkedIn Profile',
    category: 'contact',
    dataType: 'text',
    profilePath: 'linkedin',
    defaultValidationRules: {
      maxLength: 100,
      maxLengthMessage: 'LinkedIn profile cannot exceed 100 characters'
    },
    description: 'LinkedIn profile URL or username',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get a smart field mapping by field key
 */
export function getSmartFieldMapping(
  fieldKey: string
): ProfileFieldMapping | undefined {
  return SMART_FIELD_REGISTRY.find((field) => field.fieldKey === fieldKey)
}

/**
 * Get all active smart field mappings
 */
export function getActiveSmartFields(): ProfileFieldMapping[] {
  return SMART_FIELD_REGISTRY.filter((field) => field.isActive)
}

/**
 * Get smart field mappings by category
 */
export function getSmartFieldsByCategory(
  category: 'personal' | 'academic' | 'contact' | 'other'
): ProfileFieldMapping[] {
  return SMART_FIELD_REGISTRY.filter(
    (field) => field.category === category && field.isActive
  )
}

/**
 * Get smart field mappings by user type
 */
export function getSmartFieldsByUserType(
  userType?: string
): ProfileFieldMapping[] {
  return SMART_FIELD_REGISTRY.filter((field) => {
    if (!field.isActive) return false
    if (!field.userTypes || field.userTypes.length === 0) return true
    return field.userTypes.includes(userType || '')
  })
}

/**
 * Get nested value from object using dot notation path
 * Example: getNestedValue({ user: { name: 'John' } }, 'user.name') => 'John'
 */
export function getNestedValue(
  obj: Record<string, unknown>,
  path: string
): unknown {
  const keys = path.split('.')
  let current: unknown = obj

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key]
    } else {
      return
    }
  }

  return current
}

/**
 * Set nested value in object using dot notation path
 * Example: setNestedValue({}, 'user.name', 'John') => { user: { name: 'John' } }
 */
export function setNestedValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown
): void {
  const keys = path.split('.')
  const lastKey = keys.at(-1)
  if (!lastKey) return

  const target = keys
    .slice(0, -1)
    .reduce(
      (
        current: Record<string, unknown>,
        key: string
      ): Record<string, unknown> => {
        if (!current[key] || typeof current[key] !== 'object') {
          current[key] = {}
        }
        return current[key] as Record<string, unknown>
      },
      obj
    )
  target[lastKey] = value
}

/**
 * Validate a value against validation rules
 */
export function validateValue(
  value: unknown,
  rules?: ValidationRule
): { valid: boolean; error?: string } {
  if (!rules) return { valid: true }

  const stringValue = String(value || '')

  // Min length
  if (rules.minLength && stringValue.length < rules.minLength) {
    return {
      valid: false,
      error: rules.minLengthMessage || `Minimum length is ${rules.minLength}`
    }
  }

  // Max length
  if (rules.maxLength && stringValue.length > rules.maxLength) {
    return {
      valid: false,
      error: rules.maxLengthMessage || `Maximum length is ${rules.maxLength}`
    }
  }

  // Pattern
  if (rules.pattern) {
    const regex = new RegExp(rules.pattern)
    if (!regex.test(stringValue)) {
      return {
        valid: false,
        error: rules.patternMessage || 'Invalid format'
      }
    }
  }

  // Number validation
  if (typeof value === 'number') {
    if (rules.min !== undefined && value < rules.min) {
      return {
        valid: false,
        error: rules.minMessage || `Minimum value is ${rules.min}`
      }
    }
    if (rules.max !== undefined && value > rules.max) {
      return {
        valid: false,
        error: rules.maxMessage || `Maximum value is ${rules.max}`
      }
    }
  }

  return { valid: true }
}
