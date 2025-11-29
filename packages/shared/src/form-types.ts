// ============================================================================
// Form Builder System - Shared TypeScript Types
// ============================================================================

export type QuestionType =
  | 'short-text'
  | 'long-text'
  | 'multiple-choice'
  | 'checkboxes'
  | 'dropdown'
  | 'date'
  | 'time'
  | 'email'
  | 'phone'
  | 'number'
  | 'rating'
  | 'file-upload'

export type FormStatus = 'draft' | 'published' | 'closed' | 'archived'

export type EntityType = 'society' | 'event' | 'survey'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export type ResponseStatus = 'submitted' | 'approved' | 'rejected'

export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'

export type ProfileFieldCategory = 'personal' | 'academic' | 'contact' | 'other'

export type ProfileFieldDataType =
  | 'text'
  | 'email'
  | 'phone'
  | 'date'
  | 'number'

export type ProfileUpdateStatus =
  | 'pending'
  | 'approved'
  | 'declined'
  | 'applied'

export type TemplateCategory =
  | 'registration'
  | 'survey'
  | 'feedback'
  | 'application'
  | 'other'

// ============================================================================
// Validation Rules
// ============================================================================

export interface ValidationRule {
  minLength?: number
  maxLength?: number
  minLengthMessage?: string
  maxLengthMessage?: string
  min?: number
  max?: number
  minMessage?: string
  maxMessage?: string
  pattern?: string
  patternMessage?: string
  minSelect?: number
  maxSelect?: number
  minSelectMessage?: string
  maxSelectMessage?: string
}

// ============================================================================
// Conditional Logic
// ============================================================================

export interface ConditionalLogic {
  enabled: boolean
  sourceQuestionId?: string
  condition?: ConditionOperator
  value?: string
}

// ============================================================================
// Form Models
// ============================================================================

export interface Form {
  id: string
  title: string
  description?: string
  entityType: EntityType
  entityId: string
  status: FormStatus

  // Settings
  allowMultipleSubmissions: boolean
  requireAuthentication: boolean
  openDate?: Date
  closeDate?: Date
  maxResponses?: number

  // Payment
  paymentEnabled: boolean
  paymentAmount?: string
  paymentCurrency: string

  // Notifications
  notificationsEnabled: boolean
  notificationEmails?: string[]

  // Confirmation
  confirmationMessage?: string
  confirmationEmailEnabled: boolean
  confirmationEmailContent?: string

  // Metadata
  createdBy: string
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
}

export interface FormPage {
  id: string
  formId: string
  title: string
  description?: string
  order: number

  // Conditional Logic
  conditionalLogicEnabled: boolean
  sourceQuestionId?: string
  condition?: ConditionOperator
  conditionValue?: string

  createdAt: Date
  updatedAt: Date
}

export interface FormQuestion {
  id: string
  formId: string
  pageId: string
  type: QuestionType
  title: string
  description?: string
  placeholder?: string
  required: boolean
  order: number

  // Options for choice-based questions
  options?: string[]

  // Validation Rules
  validationRules?: ValidationRule

  // Conditional Logic
  conditionalLogicEnabled: boolean
  sourceQuestionId?: string
  condition?: ConditionOperator
  conditionValue?: string

  // Smart Field Mapping
  profileFieldKey?: string
  enableAutoFill: boolean
  enableBidirectionalSync: boolean

  // File Upload Settings
  acceptedFileTypes?: string[]
  maxFileSize?: number

  createdAt: Date
  updatedAt: Date
}

export interface FormResponse {
  id: string
  formId: string
  userId?: string

  // Response Data
  answers: Record<string, unknown>

  // Payment
  paymentStatus: PaymentStatus
  paymentIntentId?: string
  paymentAmount?: string

  // Metadata
  submittedAt: Date
  ipAddress?: string
  userAgent?: string
  completionTime?: number

  // Status
  status: ResponseStatus
}

export interface FormProgress {
  id: string
  formId: string
  userId: string
  answers: Record<string, unknown>
  currentPageId?: string
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface FormTemplate {
  id: string
  name: string
  description?: string
  category?: TemplateCategory
  templateData: FormTemplateData
  createdBy: string
  isPublic: boolean
  usageCount: number
  createdAt: Date
  updatedAt: Date
}

export interface FormTemplateData {
  title: string
  description?: string
  pages: Array<{
    title: string
    description?: string
    order: number
  }>
  questions: Array<{
    type: QuestionType
    title: string
    description?: string
    placeholder?: string
    required: boolean
    options?: string[]
    validationRules?: ValidationRule
    pageOrder: number
    questionOrder: number
  }>
}

export interface FormFileUpload {
  id: string
  responseId: string
  questionId: string
  fileName: string
  fileSize: number
  fileType: string
  storageUrl: string
  uploadedAt: Date
}

// ============================================================================
// Smart Field System
// ============================================================================

export interface ProfileFieldMapping {
  id: string
  fieldKey: string
  displayLabel: string
  category: ProfileFieldCategory
  dataType: ProfileFieldDataType
  profilePath: string
  defaultValidationRules?: ValidationRule
  description?: string
  isActive: boolean
  userTypes?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface SmartFieldConfig {
  questionId: string
  profileFieldKey: string
  enableAutoFill: boolean
  enableBidirectionalSync: boolean
  promptUserForUpdate: boolean
}

export interface AutoFillData {
  questionId: string
  value: unknown
  source: 'profile' | 'saved_progress'
  isComplete: boolean
}

export interface ProfileUpdateRequest {
  id: string
  userId: string
  responseId: string
  fieldKey: string
  newValue: string
  status: ProfileUpdateStatus
  processedAt?: Date
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// Analytics
// ============================================================================

export interface FormAnalytics {
  totalResponses: number
  completionRate: number
  averageCompletionTime: number
  responsesByDate: Array<{ date: string; count: number }>
  questionAnalytics: Array<{
    questionId: string
    questionTitle: string
    responseDistribution: Record<string, number>
  }>
}

// ============================================================================
// Filters
// ============================================================================

export interface ResponseFilters {
  dateFrom?: Date
  dateTo?: Date
  paymentStatus?: PaymentStatus
  status?: ResponseStatus
  searchQuery?: string
}

export interface FormFilters {
  entityType?: EntityType
  entityId?: string
  status?: FormStatus
  createdBy?: string
}
