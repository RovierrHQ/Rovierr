/**
 * This file uses Drizzle-generated schemas as the source of truth and extends them
 * for API-specific use cases. This approach:
 * - Reduces duplication
 * - Ensures consistency with database schema
 * - Makes maintenance easier (single source of truth)
 */

import { z } from 'zod'
import {
  updateFormPageSchema as generatedUpdateFormPageSchema,
  updateFormQuestionSchema as generatedUpdateFormQuestionSchema,
  updateFormSchema as generatedUpdateFormSchema,
  insertFormPageSchema,
  insertFormProgressSchema,
  insertFormQuestionSchema,
  insertFormResponseSchema,
  insertFormSchema,
  insertFormTemplateSchema,
  selectFormPageSchema,
  selectFormQuestionSchema,
  selectFormResponseSchema,
  selectFormSchema,
  selectFormTemplateSchema,
  selectProfileFieldMappingSchema
} from './generated-schemas'

// ============================================================================
// Enum Schemas - Extracted from generated schemas
// ============================================================================

// Extract enum schemas directly from generated schemas to avoid duplication
export const questionTypeSchema = selectFormQuestionSchema.shape.type
export const formStatusSchema = selectFormSchema.shape.status
export const entityTypeSchema = selectFormSchema.shape.entityType
export const paymentStatusSchema = selectFormResponseSchema.shape.paymentStatus
export const responseStatusSchema = selectFormResponseSchema.shape.status
export const conditionOperatorSchema = selectFormPageSchema.shape.condition
export const profileFieldCategorySchema =
  selectProfileFieldMappingSchema.shape.category
export const profileFieldDataTypeSchema =
  selectProfileFieldMappingSchema.shape.dataType
export const templateCategorySchema = selectFormTemplateSchema.shape.category

// ============================================================================
// Composite Schemas (for API responses with relations)
// ============================================================================

/**
 * Full form schema with pages and questions included
 * This is what the API returns when fetching a complete form
 *
 * Note: We override Date fields to be strings for API responses
 */
export const fullFormSchema = selectFormSchema
  .omit({
    openDate: true,
    closeDate: true,
    publishedAt: true,
    createdAt: true,
    updatedAt: true,
    allowMultipleSubmissions: true,
    requireAuthentication: true,
    paymentEnabled: true,
    notificationsEnabled: true,
    confirmationEmailEnabled: true
  })
  .extend({
    openDate: z.string().nullable(),
    closeDate: z.string().nullable(),
    publishedAt: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    allowMultipleSubmissions: z.boolean(),
    requireAuthentication: z.boolean(),
    paymentEnabled: z.boolean(),
    notificationsEnabled: z.boolean(),
    confirmationEmailEnabled: z.boolean(),
    pages: z.array(
      selectFormPageSchema
        .omit({
          createdAt: true,
          updatedAt: true,
          conditionalLogicEnabled: true
        })
        .extend({
          createdAt: z.string(),
          updatedAt: z.string(),
          conditionalLogicEnabled: z.boolean()
        })
    ),
    questions: z.array(
      selectFormQuestionSchema
        .omit({
          createdAt: true,
          updatedAt: true,
          required: true,
          conditionalLogicEnabled: true,
          enableAutoFill: true,
          enableBidirectionalSync: true
        })
        .extend({
          createdAt: z.string(),
          updatedAt: z.string(),
          required: z.boolean(),
          conditionalLogicEnabled: z.boolean(),
          enableAutoFill: z.boolean(),
          enableBidirectionalSync: z.boolean()
        })
    )
  })

export type FullForm = z.infer<typeof fullFormSchema>

// ============================================================================
// Form Schemas - Built from generated schemas
// ============================================================================

/**
 * Schema for creating a new form
 * Picks only the fields needed for creation and adds validation
 */
export const createFormSchema = insertFormSchema
  .pick({
    title: true,
    description: true,
    entityType: true,
    entityId: true,
    allowMultipleSubmissions: true,
    requireAuthentication: true,
    openDate: true,
    closeDate: true,
    maxResponses: true,
    paymentEnabled: true,
    paymentAmount: true,
    paymentCurrency: true,
    notificationsEnabled: true,
    notificationEmails: true,
    confirmationMessage: true,
    confirmationEmailEnabled: true,
    confirmationEmailContent: true
  })
  .extend({
    // Add custom validation on top of generated schema
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().max(1000).optional(),
    entityId: z.string().min(1, 'Entity ID is required'),
    confirmationMessage: z.string().max(1000).optional(),
    confirmationEmailContent: z.string().max(2000).optional()
  })

/**
 * Schema for updating a form
 * Uses generated update schema and adds custom validation
 */
export const updateFormSchema = generatedUpdateFormSchema
  .pick({
    id: true,
    title: true,
    description: true,
    allowMultipleSubmissions: true,
    requireAuthentication: true,
    openDate: true,
    closeDate: true,
    maxResponses: true,
    paymentEnabled: true,
    paymentAmount: true,
    paymentCurrency: true,
    notificationsEnabled: true,
    notificationEmails: true,
    confirmationMessage: true,
    confirmationEmailEnabled: true,
    confirmationEmailContent: true
  })
  .extend({
    id: z.string().min(1, 'Form ID is required'),
    title: z.string().min(1, 'Title is required').max(200).optional(),
    description: z.string().max(1000).optional(),
    confirmationMessage: z.string().max(1000).optional(),
    confirmationEmailContent: z.string().max(2000).optional()
  })

/**
 * Schema for form ID parameter
 */
export const formIdSchema = z.object({
  id: z.string().min(1, 'Form ID is required')
})

/**
 * Schema for listing forms with filters
 */
export const listFormsSchema = selectFormSchema
  .pick({
    entityType: true,
    entityId: true,
    status: true
  })
  .partial()
  .extend({
    limit: z.number().min(1).max(100).default(50),
    offset: z.number().min(0).default(0)
  })

// ============================================================================
// Page Schemas - Built from generated schemas
// ============================================================================

/**
 * Schema for creating a new page
 */
export const createPageSchema = insertFormPageSchema
  .pick({
    formId: true,
    title: true,
    description: true,
    order: true,
    conditionalLogicEnabled: true,
    sourceQuestionId: true,
    condition: true,
    conditionValue: true
  })
  .extend({
    formId: z.string().min(1, 'Form ID is required'),
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().max(500).optional(),
    order: z.number().min(0)
  })

/**
 * Schema for updating a page
 * Uses generated update schema and adds custom validation
 */
export const updatePageSchema = generatedUpdateFormPageSchema
  .pick({
    id: true,
    title: true,
    description: true,
    order: true,
    conditionalLogicEnabled: true,
    sourceQuestionId: true,
    condition: true,
    conditionValue: true
  })
  .extend({
    id: z.string().min(1, 'Page ID is required'),
    title: z.string().min(1, 'Title is required').max(200).optional(),
    description: z.string().max(500).optional(),
    order: z.number().min(0).optional()
  })

/**
 * Schema for reordering pages
 */
export const reorderPagesSchema = z.object({
  formId: z.string().min(1, 'Form ID is required'),
  pageIds: z.array(z.string()).min(1, 'At least one page ID is required')
})

// ============================================================================
// Question Schemas - Built from generated schemas
// ============================================================================

/**
 * Schema for creating a new question
 */
export const createQuestionSchema = insertFormQuestionSchema
  .pick({
    formId: true,
    pageId: true,
    type: true,
    title: true,
    description: true,
    placeholder: true,
    required: true,
    order: true,
    options: true,
    validationRules: true,
    conditionalLogicEnabled: true,
    sourceQuestionId: true,
    condition: true,
    conditionValue: true,
    profileFieldKey: true,
    enableAutoFill: true,
    enableBidirectionalSync: true,
    acceptedFileTypes: true,
    maxFileSize: true
  })
  .extend({
    formId: z.string().min(1, 'Form ID is required'),
    pageId: z.string().min(1, 'Page ID is required'),
    title: z.string().min(1, 'Title is required').max(500),
    description: z.string().max(1000).optional(),
    placeholder: z.string().max(200).optional(),
    order: z.number().min(0),
    maxFileSize: z.number().positive().optional()
  })

/**
 * Schema for updating a question
 * Uses generated update schema and adds custom validation
 */
export const updateQuestionSchema = generatedUpdateFormQuestionSchema
  .pick({
    id: true,
    type: true,
    title: true,
    description: true,
    placeholder: true,
    required: true,
    order: true,
    options: true,
    validationRules: true,
    conditionalLogicEnabled: true,
    sourceQuestionId: true,
    condition: true,
    conditionValue: true,
    profileFieldKey: true,
    enableAutoFill: true,
    enableBidirectionalSync: true,
    acceptedFileTypes: true,
    maxFileSize: true
  })
  .extend({
    id: z.string().min(1, 'Question ID is required'),
    title: z.string().min(1, 'Title is required').max(500).optional(),
    description: z.string().max(1000).optional(),
    placeholder: z.string().max(200).optional(),
    order: z.number().min(0).optional(),
    maxFileSize: z.number().positive().optional()
  })

/**
 * Schema for reordering questions
 */
export const reorderQuestionsSchema = z.object({
  pageId: z.string().min(1, 'Page ID is required'),
  questionIds: z
    .array(z.string())
    .min(1, 'At least one question ID is required')
})

// ============================================================================
// Response Schemas - Built from generated schemas
// ============================================================================

/**
 * Schema for submitting a form response
 */
export const submitResponseSchema = insertFormResponseSchema
  .pick({
    formId: true,
    answers: true,
    completionTime: true
  })
  .extend({
    formId: z.string().min(1, 'Form ID is required'),
    completionTime: z.number().positive().optional()
  })

/**
 * Schema for saving form progress
 */
export const saveProgressSchema = insertFormProgressSchema
  .pick({
    formId: true,
    answers: true,
    currentPageId: true
  })
  .extend({
    formId: z.string().min(1, 'Form ID is required')
  })

/**
 * Schema for listing responses with filters
 */
export const listResponsesSchema = selectFormResponseSchema
  .pick({
    formId: true,
    paymentStatus: true,
    status: true
  })
  .extend({
    formId: z.string().min(1, 'Form ID is required'),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    searchQuery: z.string().optional(),
    limit: z.number().min(1).max(100).default(50),
    offset: z.number().min(0).default(0)
  })

/**
 * Schema for exporting responses
 */
export const exportResponsesSchema = z.object({
  formId: z.string().min(1, 'Form ID is required'),
  format: z.enum(['csv', 'excel'])
})

// ============================================================================
// Template Schemas - Built from generated schemas
// ============================================================================

/**
 * Schema for saving a form as a template
 */
export const saveAsTemplateSchema = insertFormTemplateSchema
  .pick({
    name: true,
    description: true,
    category: true,
    isPublic: true
  })
  .extend({
    formId: z.string().min(1, 'Form ID is required'),
    name: z.string().min(1, 'Name is required').max(200),
    description: z.string().max(500).optional()
  })

/**
 * Schema for creating a form from a template
 */
export const createFromTemplateSchema = z.object({
  templateId: z.string().min(1, 'Template ID is required'),
  entityType: z.enum(['society', 'event', 'survey']),
  entityId: z.string().min(1, 'Entity ID is required'),
  title: z.string().min(1, 'Title is required').max(200).optional()
})

/**
 * Schema for listing templates with filters
 */
export const listTemplatesSchema = z.object({
  category: z
    .enum(['registration', 'survey', 'feedback', 'application', 'other'])
    .optional(),
  isPublic: z.boolean().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0)
})

// ============================================================================
// Smart Field Schemas - Built from generated schemas
// ============================================================================

/**
 * Schema for getting auto-fill data
 */
export const getAutoFillDataSchema = z.object({
  formId: z.string().min(1, 'Form ID is required')
})

/**
 * Schema for applying profile updates
 */
export const applyProfileUpdatesSchema = z.object({
  responseId: z.string().min(1, 'Response ID is required'),
  fieldKeys: z.array(z.string()).min(1, 'At least one field key is required')
})

/**
 * Schema for declining profile updates
 */
export const declineProfileUpdatesSchema = z.object({
  responseId: z.string().min(1, 'Response ID is required')
})

// ============================================================================
// Analytics Schemas
// ============================================================================

/**
 * Schema for getting form analytics
 */
export const getAnalyticsSchema = z.object({
  formId: z.string().min(1, 'Form ID is required'),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional()
})

// ============================================================================
// Type Exports
// ============================================================================

export type CreateFormInput = z.infer<typeof createFormSchema>
export type UpdateFormInput = z.infer<typeof updateFormSchema>
export type CreatePageInput = z.infer<typeof createPageSchema>
export type UpdatePageInput = z.infer<typeof updatePageSchema>
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>
export type SubmitResponseInput = z.infer<typeof submitResponseSchema>
export type SaveProgressInput = z.infer<typeof saveProgressSchema>
export type SaveAsTemplateInput = z.infer<typeof saveAsTemplateSchema>
export type CreateFromTemplateInput = z.infer<typeof createFromTemplateSchema>

// ============================================================================
// Bulk Save Schema
// ============================================================================

/**
 * Schema for bulk saving form with all pages and questions in one call
 * This is more efficient than making multiple API calls
 */
export const bulkSaveFormSchema = z.object({
  formId: z.string().min(1, 'Form ID is required'),
  // Form metadata updates
  formUpdates: updateFormSchema.omit({ id: true }).partial().optional(),
  // Pages to create, update, or delete
  pages: z
    .object({
      create: z
        .array(
          createPageSchema.omit({ formId: true }).extend({
            id: z.string().optional() // Temporary ID for mapping
          })
        )
        .optional(),
      update: z.array(updatePageSchema).optional(),
      delete: z.array(z.string()).optional()
    })
    .optional(),
  // Questions to create, update, or delete
  questions: z
    .object({
      create: z
        .array(
          createQuestionSchema.omit({ formId: true }).extend({
            id: z.string().optional() // Temporary ID for mapping
          })
        )
        .optional(),
      update: z.array(updateQuestionSchema).optional(),
      delete: z.array(z.string()).optional()
    })
    .optional()
})

export type BulkSaveFormInput = z.infer<typeof bulkSaveFormSchema>
