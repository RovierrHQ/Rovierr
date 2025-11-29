import { z } from 'zod'
import type { Question } from '@/components/form/form-builder'

// Regex patterns defined at module level for performance
const PHONE_PATTERN = /^\+?[\d\s-()]+$/
const TIME_PATTERN = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/

export function createQuestionSchema(question: Question): z.ZodTypeAny {
  let schema: z.ZodTypeAny

  switch (question.type) {
    case 'short-text':
      schema = z.string()
      if (question.validationRules?.minLength) {
        schema = (schema as z.ZodString).min(
          question.validationRules.minLength,
          {
            message:
              question.validationRules.minLengthMessage ||
              `Minimum ${question.validationRules.minLength} characters required`
          }
        )
      }
      if (question.validationRules?.maxLength) {
        schema = (schema as z.ZodString).max(
          question.validationRules.maxLength,
          {
            message:
              question.validationRules.maxLengthMessage ||
              `Maximum ${question.validationRules.maxLength} characters allowed`
          }
        )
      }
      if (question.validationRules?.pattern) {
        schema = (schema as z.ZodString).regex(
          new RegExp(question.validationRules.pattern),
          {
            message: question.validationRules.patternMessage || 'Invalid format'
          }
        )
      }
      break

    case 'long-text':
      schema = z.string()
      if (question.validationRules?.minLength) {
        schema = (schema as z.ZodString).min(question.validationRules.minLength)
      }
      if (question.validationRules?.maxLength) {
        schema = (schema as z.ZodString).max(question.validationRules.maxLength)
      }
      break

    case 'email':
      schema = z.string().email({ message: 'Invalid email address' })
      break

    case 'phone':
      schema = z.string().regex(PHONE_PATTERN, {
        message: 'Invalid phone number'
      })
      break

    case 'number':
      schema = z.coerce.number()
      if (question.validationRules?.min !== undefined) {
        schema = (schema as z.ZodNumber).min(question.validationRules.min, {
          message:
            question.validationRules.minMessage ||
            `Minimum value is ${question.validationRules.min}`
        })
      }
      if (question.validationRules?.max !== undefined) {
        schema = (schema as z.ZodNumber).max(question.validationRules.max, {
          message:
            question.validationRules.maxMessage ||
            `Maximum value is ${question.validationRules.max}`
        })
      }
      break

    case 'multiple-choice':
    case 'dropdown':
      if (question.options && question.options.length > 0) {
        schema = z.enum(question.options as [string, ...string[]])
      } else {
        schema = z.string()
      }
      break

    case 'checkboxes':
      schema = z.array(z.string())
      if (question.validationRules?.minSelect) {
        schema = (schema as z.ZodArray<z.ZodString>).min(
          question.validationRules.minSelect,
          {
            message: `Select at least ${question.validationRules.minSelect} option(s)`
          }
        )
      }
      if (question.validationRules?.maxSelect) {
        schema = (schema as z.ZodArray<z.ZodString>).max(
          question.validationRules.maxSelect,
          {
            message: `Select at most ${question.validationRules.maxSelect} option(s)`
          }
        )
      }
      break

    case 'date':
      schema = z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
        message: 'Invalid date'
      })
      break

    case 'time':
      schema = z.string().regex(TIME_PATTERN, {
        message: 'Invalid time format'
      })
      break

    case 'rating':
      schema = z.number().min(1).max(5)
      break

    case 'file-upload':
      schema = z.any()
      break

    default:
      schema = z.string()
  }

  // Apply required validation
  if (!question.required) {
    schema = schema.optional().or(z.literal(''))
  }

  return schema
}

export function createFormSchema(
  questions: Question[]
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {}

  for (const question of questions) {
    shape[question.id] = createQuestionSchema(question)
  }

  return z.object(shape)
}
