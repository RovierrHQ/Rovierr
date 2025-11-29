import { z } from 'zod'

// ============================================================================
// Enums
// ============================================================================

export const questionTypeSchema = z.enum([
  'short-text',
  'long-text',
  'multiple-choice',
  'checkboxes',
  'dropdown',
  'date',
  'time',
  'email',
  'phone',
  'number',
  'rating',
  'file-upload'
])

export const formStatusSchema = z.enum([
  'draft',
  'published',
  'closed',
  'archived'
])

export const entityTypeSchema = z.enum(['society', 'event', 'survey'])

export const paymentStatusSchema = z.enum([
  'pending',
  'paid',
  'failed',
  'refunded'
])

export const responseStatusSchema = z.enum([
  'submitted',
  'approved',
  'rejected'
])

export const conditionOperatorSchema = z.enum([
  'equals',
  'not_equals',
  'contains',
  'not_contains'
])

export const profileFieldCategorySchema = z.enum([
  'personal',
  'academic',
  'contact',
  'other'
])

export const profileFieldDataTypeSchema = z.enum([
  'text',
  'email',
  'phone',
  'date',
  'number'
])

export const templateCategorySchema = z.enum([
  'registration',
  'survey',
  'feedback',
  'application',
  'other'
])

// ============================================================================
// Validation Rules
// ============================================================================

export const validationRuleSchema = z
  .object({
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    minLengthMessage: z.string().optional(),
    maxLengthMessage: z.string().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    minMessage: z.string().optional(),
    maxMessage: z.string().optional(),
    pattern: z.string().optional(),
    patternMessage: z.string().optional(),
    minSelect: z.number().optional(),
    maxSelect: z.number().optional(),
    minSelectMessage: z.string().optional(),
    maxSelectMessage: z.string().optional()
  })
  .optional()

// ============================================================================
// Form Schemas
// ============================================================================

export const createFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  entityType: entityTypeSchema,
  entityId: z.string().min(1, 'Entity ID is required'),

  // Settings
  allowMultipleSubmissions: z.boolean().default(false),
  requireAuthentication: z.boolean().default(true),
  openDate: z.string().datetime().optional(),
  closeDate: z.string().datetime().optional(),
  maxResponses: z.number().positive().optional(),

  // Payment
  paymentEnabled: z.boolean().default(false),
  paymentAmount: z.string().optional(),
  paymentCurrency: z.string().default('USD'),

  // Notifications
  notificationsEnabled: z.boolean().default(false),
  notificationEmails: z.array(z.string().email()).optional(),

  // Confirmation
  confirmationMessage: z.string().max(1000).optional(),
  confirmationEmailEnabled: z.boolean().default(true),
  confirmationEmailContent: z.string().max(2000).optional()
})

export const updateFormSchema = createFormSchema.partial().extend({
  id: z.string().min(1, 'Form ID is required')
})

export const formIdSchema = z.object({
  id: z.string().min(1, 'Form ID is required')
})

export const listFormsSchema = z.object({
  entityType: entityTypeSchema.optional(),
  entityId: z.string().optional(),
  status: formStatusSchema.optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0)
})

// ============================================================================
// Page Schemas
// ============================================================================

export const createPageSchema = z.object({
  formId: z.string().min(1, 'Form ID is required'),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(500).optional(),
  order: z.number().min(0),

  // Conditional Logic
  conditionalLogicEnabled: z.boolean().default(false),
  sourceQuestionId: z.string().optional(),
  condition: conditionOperatorSchema.optional(),
  conditionValue: z.string().optional()
})

export const updatePageSchema = createPageSchema.partial().extend({
  id: z.string().min(1, 'Page ID is required')
})

export const reorderPagesSchema = z.object({
  formId: z.string().min(1, 'Form ID is required'),
  pageIds: z.array(z.string()).min(1, 'At least one page ID is required')
})

// ============================================================================
// Question Schemas
// ============================================================================

export const createQuestionSchema = z.object({
  formId: z.string().min(1, 'Form ID is required'),
  pageId: z.string().min(1, 'Page ID is required'),
  type: questionTypeSchema,
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string().max(1000).optional(),
  placeholder: z.string().max(200).optional(),
  required: z.boolean().default(false),
  order: z.number().min(0),

  // Options for choice-based questions
  options: z.array(z.string()).optional(),

  // Validation Rules
  validationRules: validationRuleSchema,

  // Conditional Logic
  conditionalLogicEnabled: z.boolean().default(false),
  sourceQuestionId: z.string().optional(),
  condition: conditionOperatorSchema.optional(),
  conditionValue: z.string().optional(),

  // Smart Field Mapping
  profileFieldKey: z.string().optional(),
  enableAutoFill: z.boolean().default(false),
  enableBidirectionalSync: z.boolean().default(false),

  // File Upload Settings
  acceptedFileTypes: z.array(z.string()).optional(),
  maxFileSize: z.number().positive().optional()
})

export const updateQuestionSchema = createQuestionSchema.partial().extend({
  id: z.string().min(1, 'Question ID is required')
})

export const reorderQuestionsSchema = z.object({
  pageId: z.string().min(1, 'Page ID is required'),
  questionIds: z
    .array(z.string())
    .min(1, 'At least one question ID is required')
})

// ============================================================================
// Response Schemas
// ============================================================================

export const submitResponseSchema = z.object({
  formId: z.string().min(1, 'Form ID is required'),
  answers: z.record(z.string(), z.unknown()),
  completionTime: z.number().positive().optional()
})

export const saveProgressSchema = z.object({
  formId: z.string().min(1, 'Form ID is required'),
  answers: z.record(z.string(), z.unknown()),
  currentPageId: z.string().optional()
})

export const listResponsesSchema = z.object({
  formId: z.string().min(1, 'Form ID is required'),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  paymentStatus: paymentStatusSchema.optional(),
  status: responseStatusSchema.optional(),
  searchQuery: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0)
})

export const exportResponsesSchema = z.object({
  formId: z.string().min(1, 'Form ID is required'),
  format: z.enum(['csv', 'excel'])
})

// ============================================================================
// Template Schemas
// ============================================================================

export const saveAsTemplateSchema = z.object({
  formId: z.string().min(1, 'Form ID is required'),
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(500).optional(),
  category: templateCategorySchema.optional(),
  isPublic: z.boolean().default(false)
})

export const createFromTemplateSchema = z.object({
  templateId: z.string().min(1, 'Template ID is required'),
  entityType: entityTypeSchema,
  entityId: z.string().min(1, 'Entity ID is required'),
  title: z.string().min(1, 'Title is required').max(200).optional()
})

export const listTemplatesSchema = z.object({
  category: templateCategorySchema.optional(),
  isPublic: z.boolean().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0)
})

// ============================================================================
// Smart Field Schemas
// ============================================================================

export const getAutoFillDataSchema = z.object({
  formId: z.string().min(1, 'Form ID is required')
})

export const applyProfileUpdatesSchema = z.object({
  responseId: z.string().min(1, 'Response ID is required'),
  fieldKeys: z.array(z.string()).min(1, 'At least one field key is required')
})

export const declineProfileUpdatesSchema = z.object({
  responseId: z.string().min(1, 'Response ID is required')
})

// ============================================================================
// Analytics Schemas
// ============================================================================

export const getAnalyticsSchema = z.object({
  formId: z.string().min(1, 'Form ID is required'),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional()
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
