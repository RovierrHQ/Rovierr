/**
 * Validation Service
 * Generates Zod schemas from validation rules and validates form responses
 */

import type { ValidationRule } from '@rov/shared'
import { z } from 'zod'

// Regex patterns defined at module level for performance
const PHONE_PATTERN = /^\+?[1-9]\d{1,14}$/
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/

/**
 * Create a Zod schema for a question based on its type and validation rules
 */
export function createQuestionSchema(
  questionType: string,
  required: boolean,
  validationRules?: ValidationRule,
  options?: string[]
): z.ZodTypeAny {
  let schema: z.ZodTypeAny

  switch (questionType) {
    case 'short-text':
    case 'long-text':
      schema = z.string()
      if (validationRules?.minLength) {
        schema = (schema as z.ZodString).min(
          validationRules.minLength,
          validationRules.minLengthMessage ||
            `Minimum length is ${validationRules.minLength}`
        )
      }
      if (validationRules?.maxLength) {
        schema = (schema as z.ZodString).max(
          validationRules.maxLength,
          validationRules.maxLengthMessage ||
            `Maximum length is ${validationRules.maxLength}`
        )
      }
      if (validationRules?.pattern) {
        schema = (schema as z.ZodString).regex(
          new RegExp(validationRules.pattern),
          validationRules.patternMessage || 'Invalid format'
        )
      }
      break

    case 'email':
      schema = z.string().email({
        message: validationRules?.patternMessage || 'Invalid email address'
      })
      break

    case 'phone': {
      schema = z.string()
      if (validationRules?.pattern) {
        schema = (schema as z.ZodString).regex(
          new RegExp(validationRules.pattern),
          validationRules.patternMessage || 'Invalid phone number'
        )
      } else {
        // Default phone pattern
        schema = (schema as z.ZodString).regex(
          PHONE_PATTERN,
          'Invalid phone number'
        )
      }
      break
    }

    case 'number':
      schema = z.number()
      if (validationRules?.min !== undefined) {
        schema = (schema as z.ZodNumber).min(
          validationRules.min,
          validationRules.minMessage ||
            `Minimum value is ${validationRules.min}`
        )
      }
      if (validationRules?.max !== undefined) {
        schema = (schema as z.ZodNumber).max(
          validationRules.max,
          validationRules.maxMessage ||
            `Maximum value is ${validationRules.max}`
        )
      }
      break

    case 'rating':
      schema = z.number().min(1).max(5)
      break

    case 'date':
      schema = z.string().datetime({
        message: 'Invalid date format'
      })
      break

    case 'time':
      schema = z.string().regex(TIME_PATTERN, 'Invalid time format (HH:MM)')
      break

    case 'multiple-choice':
    case 'dropdown':
      if (options && options.length > 0) {
        schema = z.enum(options as [string, ...string[]])
      } else {
        schema = z.string()
      }
      break

    case 'checkboxes':
      schema = z.array(z.string())
      if (validationRules?.minSelect) {
        schema = (schema as z.ZodArray<z.ZodString>).min(
          validationRules.minSelect,
          validationRules.minSelectMessage ||
            `Select at least ${validationRules.minSelect} options`
        )
      }
      if (validationRules?.maxSelect) {
        schema = (schema as z.ZodArray<z.ZodString>).max(
          validationRules.maxSelect,
          validationRules.maxSelectMessage ||
            `Select at most ${validationRules.maxSelect} options`
        )
      }
      break

    case 'file-upload':
      // File upload validation is handled separately
      schema = z.object({
        fileName: z.string(),
        fileSize: z.number(),
        fileType: z.string(),
        fileUrl: z.string()
      })
      break

    default:
      schema = z.unknown()
  }

  // Make optional if not required
  if (!required) {
    schema = schema.optional()
  }

  return schema
}

/**
 * Create a Zod schema for an entire form based on its questions
 */
export function createFormSchema(
  questions: Array<{
    id: string
    type: string
    required: boolean
    validationRules?: ValidationRule
    options?: string[]
    conditionalLogicEnabled: boolean
  }>
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {}

  for (const question of questions) {
    // Skip questions with conditional logic for now
    // They will be validated separately based on visibility
    if (question.conditionalLogicEnabled) {
      shape[question.id] = z.unknown().optional()
      continue
    }

    shape[question.id] = createQuestionSchema(
      question.type,
      question.required,
      question.validationRules,
      question.options
    )
  }

  return z.object(shape)
}

/**
 * Validate file upload
 */
export function validateFile(
  file: {
    fileName: string
    fileSize: number
    fileType: string
  },
  acceptedFileTypes?: string[],
  maxFileSize?: number
): { valid: boolean; error?: string } {
  // Check file type
  if (acceptedFileTypes && acceptedFileTypes.length > 0) {
    const fileExtension = file.fileName.split('.').pop()?.toLowerCase()
    const mimeType = file.fileType.toLowerCase()

    const isAccepted = acceptedFileTypes.some((acceptedType) => {
      const accepted = acceptedType.toLowerCase()
      // Check both extension and MIME type
      return (
        accepted === `.${fileExtension}` ||
        accepted === fileExtension ||
        accepted === mimeType ||
        mimeType.startsWith(accepted.replace('*', ''))
      )
    })

    if (!isAccepted) {
      return {
        valid: false,
        error: `File type not accepted. Accepted types: ${acceptedFileTypes.join(', ')}`
      }
    }
  }

  // Check file size
  if (maxFileSize && file.fileSize > maxFileSize) {
    const maxSizeMB = (maxFileSize / (1024 * 1024)).toFixed(2)
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxSizeMB}MB`
    }
  }

  return { valid: true }
}

/**
 * Validate form response against form schema
 */
export function validateFormResponse(
  responses: Record<string, unknown>,
  questions: Array<{
    id: string
    type: string
    required: boolean
    validationRules?: ValidationRule
    options?: string[]
    conditionalLogicEnabled: boolean
    acceptedFileTypes?: string[]
    maxFileSize?: number
  }>
): { valid: boolean; errors?: Record<string, string> } {
  const errors: Record<string, string> = {}

  // Validate each question
  for (const question of questions) {
    const value = responses[question.id]

    // Skip if question has conditional logic (should be validated separately)
    if (question.conditionalLogicEnabled) {
      continue
    }

    // Check required
    if (
      question.required &&
      (value === undefined || value === null || value === '')
    ) {
      errors[question.id] = 'This field is required'
      continue
    }

    // Skip validation if not required and empty
    if (
      !question.required &&
      (value === undefined || value === null || value === '')
    ) {
      continue
    }

    // Create schema for this question
    const schema = createQuestionSchema(
      question.type,
      question.required,
      question.validationRules,
      question.options
    )

    // Validate with Zod
    const result = schema.safeParse(value)
    if (!result.success) {
      const firstError = result.error.issues[0]
      errors[question.id] = firstError?.message || 'Invalid value'
      continue
    }

    // Additional file validation
    if (question.type === 'file-upload' && value) {
      const fileValidation = validateFile(
        value as { fileName: string; fileSize: number; fileType: string },
        question.acceptedFileTypes,
        question.maxFileSize
      )
      if (!fileValidation.valid) {
        errors[question.id] = fileValidation.error || 'Invalid file'
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined
  }
}

/**
 * Scan file for malware (stub for now)
 * In production, this should integrate with a malware scanning service
 */
export function scanFileForMalware(): Promise<{
  safe: boolean
  threat?: string
}> {
  // TODO: Integrate with malware scanning service (e.g., ClamAV, VirusTotal)
  // For now, just return safe
  return Promise.resolve({ safe: true })
}
