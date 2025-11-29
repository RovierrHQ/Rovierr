import { relations } from 'drizzle-orm'
import {
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp
} from 'drizzle-orm/pg-core'
import { primaryId, timestamps } from '../helper'
import { user } from './auth'

// ============================================================================
// Forms Table
// ============================================================================
export const forms = pgTable(
  'forms',
  {
    id: primaryId,
    title: text('title').notNull(),
    description: text('description'),
    entityType: text('entity_type', {
      enum: ['society', 'event', 'survey']
    }).notNull(),
    entityId: text('entity_id').notNull(),
    status: text('status', {
      enum: ['draft', 'published', 'closed', 'archived']
    })
      .notNull()
      .default('draft'),

    // Settings
    allowMultipleSubmissions: boolean('allow_multiple_submissions').default(
      false
    ),
    requireAuthentication: boolean('require_authentication').default(true),
    openDate: timestamp('open_date', { withTimezone: true }),
    closeDate: timestamp('close_date', { withTimezone: true }),
    maxResponses: integer('max_responses'),

    // Payment
    paymentEnabled: boolean('payment_enabled').default(false),
    paymentAmount: decimal('payment_amount', { precision: 10, scale: 2 }),
    paymentCurrency: text('payment_currency', { enum: ['HKD'] }).default('HKD'),

    // Notifications
    notificationsEnabled: boolean('notifications_enabled').default(false),
    notificationEmails: text('notification_emails').array(),

    // Confirmation
    confirmationMessage: text('confirmation_message'),
    confirmationEmailEnabled: boolean('confirmation_email_enabled').default(
      true
    ),
    confirmationEmailContent: text('confirmation_email_content'),

    // Metadata
    createdBy: text('created_by')
      .notNull()
      .references(() => user.id),
    publishedAt: timestamp('published_at', { withTimezone: true }),

    ...timestamps
  },
  (table) => [
    index('forms_entity_type_idx').on(table.entityType),
    index('forms_entity_id_idx').on(table.entityId),
    index('forms_status_idx').on(table.status),
    index('forms_created_by_idx').on(table.createdBy)
  ]
)

export const formsRelations = relations(forms, ({ one, many }) => ({
  creator: one(user, {
    fields: [forms.createdBy],
    references: [user.id]
  }),
  pages: many(formPages),
  questions: many(formQuestions),
  responses: many(formResponses)
}))

// ============================================================================
// Form Pages Table
// ============================================================================
export const formPages = pgTable(
  'form_pages',
  {
    id: primaryId,
    formId: text('form_id')
      .notNull()
      .references(() => forms.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    order: integer('order').notNull(),

    // Conditional Logic
    conditionalLogicEnabled: boolean('conditional_logic_enabled').default(
      false
    ),
    sourceQuestionId: text('source_question_id'),
    condition: text('condition', {
      enum: ['equals', 'not_equals', 'contains', 'not_contains']
    }),
    conditionValue: text('condition_value'),

    ...timestamps
  },
  (table) => [
    index('form_pages_form_id_idx').on(table.formId),
    index('form_pages_order_idx').on(table.order)
  ]
)

export const formPagesRelations = relations(formPages, ({ one, many }) => ({
  form: one(forms, {
    fields: [formPages.formId],
    references: [forms.id]
  }),
  questions: many(formQuestions),
  sourceQuestion: one(formQuestions, {
    fields: [formPages.sourceQuestionId],
    references: [formQuestions.id]
  })
}))

// ============================================================================
// Form Questions Table
// ============================================================================
export const formQuestions = pgTable(
  'form_questions',
  {
    id: primaryId,
    formId: text('form_id')
      .notNull()
      .references(() => forms.id, { onDelete: 'cascade' }),
    pageId: text('page_id')
      .notNull()
      .references(() => formPages.id, { onDelete: 'cascade' }),

    type: text('type', {
      enum: [
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
      ]
    }).notNull(),
    title: text('title').notNull(),
    description: text('description'),
    placeholder: text('placeholder'),
    required: boolean('required').default(false),
    order: integer('order').notNull(),

    // Options for choice-based questions
    options: jsonb('options').$type<string[]>(),

    // Validation Rules
    validationRules: jsonb('validation_rules').$type<{
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
    }>(),

    // Conditional Logic
    conditionalLogicEnabled: boolean('conditional_logic_enabled').default(
      false
    ),
    sourceQuestionId: text('source_question_id'),
    condition: text('condition', {
      enum: ['equals', 'not_equals', 'contains', 'not_contains']
    }),
    conditionValue: text('condition_value'),

    // Smart Field Mapping
    profileFieldKey: text('profile_field_key'),
    enableAutoFill: boolean('enable_auto_fill').default(false),
    enableBidirectionalSync: boolean('enable_bidirectional_sync').default(
      false
    ),

    // File Upload Settings
    acceptedFileTypes: text('accepted_file_types').array(),
    maxFileSize: integer('max_file_size'), // in bytes

    ...timestamps
  },
  (table) => [
    index('form_questions_form_id_idx').on(table.formId),
    index('form_questions_page_id_idx').on(table.pageId),
    index('form_questions_order_idx').on(table.order),
    index('form_questions_profile_field_key_idx').on(table.profileFieldKey)
  ]
)

export const formQuestionsRelations = relations(
  formQuestions,
  ({ one, many }) => ({
    form: one(forms, {
      fields: [formQuestions.formId],
      references: [forms.id]
    }),
    page: one(formPages, {
      fields: [formQuestions.pageId],
      references: [formPages.id]
    }),
    sourceQuestion: one(formQuestions, {
      fields: [formQuestions.sourceQuestionId],
      references: [formQuestions.id]
    }),
    fileUploads: many(formFileUploads),
    profileFieldMapping: one(profileFieldMappings, {
      fields: [formQuestions.profileFieldKey],
      references: [profileFieldMappings.fieldKey]
    })
  })
)

// ============================================================================
// Form Responses Table
// ============================================================================
export const formResponses = pgTable(
  'form_responses',
  {
    id: primaryId,
    formId: text('form_id')
      .notNull()
      .references(() => forms.id),
    userId: text('user_id').references(() => user.id),

    // Response Data
    answers: jsonb('answers').notNull().$type<Record<string, unknown>>(),

    // Payment
    paymentStatus: text('payment_status', {
      enum: ['pending', 'paid', 'failed', 'refunded']
    }).default('pending'),
    paymentIntentId: text('payment_intent_id'),
    paymentAmount: decimal('payment_amount', { precision: 10, scale: 2 }),

    // Metadata
    submittedAt: timestamp('submitted_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    completionTime: integer('completion_time'), // in seconds

    // Status
    status: text('status', {
      enum: ['submitted', 'approved', 'rejected']
    }).default('submitted')
  },
  (table) => [
    index('form_responses_form_id_idx').on(table.formId),
    index('form_responses_user_id_idx').on(table.userId),
    index('form_responses_payment_status_idx').on(table.paymentStatus),
    index('form_responses_submitted_at_idx').on(table.submittedAt)
  ]
)

export const formResponsesRelations = relations(
  formResponses,
  ({ one, many }) => ({
    form: one(forms, {
      fields: [formResponses.formId],
      references: [forms.id]
    }),
    user: one(user, {
      fields: [formResponses.userId],
      references: [user.id]
    }),
    fileUploads: many(formFileUploads),
    profileUpdateRequests: many(profileUpdateRequests)
  })
)

// ============================================================================
// Form Progress Table (Saved Progress)
// ============================================================================
export const formProgress = pgTable(
  'form_progress',
  {
    id: primaryId,
    formId: text('form_id')
      .notNull()
      .references(() => forms.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),

    answers: jsonb('answers').notNull().$type<Record<string, unknown>>(),
    currentPageId: text('current_page_id').references(() => formPages.id),

    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(), // 30 days from creation

    ...timestamps
  },
  (table) => [
    index('form_progress_form_id_user_id_idx').on(table.formId, table.userId),
    index('form_progress_expires_at_idx').on(table.expiresAt)
  ]
)

export const formProgressRelations = relations(formProgress, ({ one }) => ({
  form: one(forms, {
    fields: [formProgress.formId],
    references: [forms.id]
  }),
  user: one(user, {
    fields: [formProgress.userId],
    references: [user.id]
  }),
  currentPage: one(formPages, {
    fields: [formProgress.currentPageId],
    references: [formPages.id]
  })
}))

// ============================================================================
// Form Templates Table
// ============================================================================
export const formTemplates = pgTable(
  'form_templates',
  {
    id: primaryId,
    name: text('name').notNull(),
    description: text('description'),
    category: text('category', {
      enum: ['registration', 'survey', 'feedback', 'application', 'other']
    }),

    // Template Data (JSON snapshot of form structure)
    templateData: jsonb('template_data').notNull().$type<{
      title: string
      description?: string
      pages: Array<{
        title: string
        description?: string
        order: number
      }>
      questions: Array<{
        type: string
        title: string
        description?: string
        placeholder?: string
        required: boolean
        options?: string[]
        validationRules?: Record<string, unknown>
        pageOrder: number
        questionOrder: number
      }>
    }>(),

    // Metadata
    createdBy: text('created_by')
      .notNull()
      .references(() => user.id),
    isPublic: boolean('is_public').default(false),
    usageCount: integer('usage_count').default(0),

    ...timestamps
  },
  (table) => [
    index('form_templates_category_idx').on(table.category),
    index('form_templates_is_public_idx').on(table.isPublic)
  ]
)

export const formTemplatesRelations = relations(formTemplates, ({ one }) => ({
  creator: one(user, {
    fields: [formTemplates.createdBy],
    references: [user.id]
  })
}))

// ============================================================================
// Form File Uploads Table
// ============================================================================
export const formFileUploads = pgTable(
  'form_file_uploads',
  {
    id: primaryId,
    responseId: text('response_id')
      .notNull()
      .references(() => formResponses.id, { onDelete: 'cascade' }),
    questionId: text('question_id')
      .notNull()
      .references(() => formQuestions.id),

    fileName: text('file_name').notNull(),
    fileSize: integer('file_size').notNull(),
    fileType: text('file_type').notNull(),
    storageUrl: text('storage_url').notNull(),

    uploadedAt: timestamp('uploaded_at', { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => [
    index('form_file_uploads_response_id_idx').on(table.responseId),
    index('form_file_uploads_question_id_idx').on(table.questionId)
  ]
)

export const formFileUploadsRelations = relations(
  formFileUploads,
  ({ one }) => ({
    response: one(formResponses, {
      fields: [formFileUploads.responseId],
      references: [formResponses.id]
    }),
    question: one(formQuestions, {
      fields: [formFileUploads.questionId],
      references: [formQuestions.id]
    })
  })
)

// ============================================================================
// Profile Field Mappings Table (Smart Fields)
// ============================================================================
export const profileFieldMappings = pgTable(
  'profile_field_mappings',
  {
    id: primaryId,

    // Field Identification
    fieldKey: text('field_key').notNull().unique(), // e.g., 'name', 'email', 'whatsappNumber'
    displayLabel: text('display_label').notNull(), // e.g., 'Full Name', 'WhatsApp Number'
    category: text('category', {
      enum: ['personal', 'academic', 'contact', 'other']
    }).notNull(),

    // Field Configuration
    dataType: text('data_type', {
      enum: ['text', 'email', 'phone', 'date', 'number']
    }).notNull(),
    profilePath: text('profile_path').notNull(), // JSON path in user profile

    // Validation
    defaultValidationRules: jsonb('default_validation_rules').$type<{
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
    }>(),

    // Metadata
    description: text('description'),
    isActive: boolean('is_active').default(true),
    userTypes: text('user_types').array(), // ['student', 'faculty', 'admin'] - null means all

    ...timestamps
  },
  (table) => [
    index('profile_field_mappings_field_key_idx').on(table.fieldKey),
    index('profile_field_mappings_category_idx').on(table.category),
    index('profile_field_mappings_is_active_idx').on(table.isActive)
  ]
)

export const profileFieldMappingsRelations = relations(
  profileFieldMappings,
  ({ many }) => ({
    questions: many(formQuestions)
  })
)

// ============================================================================
// Profile Update Requests Table
// ============================================================================
export const profileUpdateRequests = pgTable(
  'profile_update_requests',
  {
    id: primaryId,

    userId: text('user_id')
      .notNull()
      .references(() => user.id),
    responseId: text('response_id')
      .notNull()
      .references(() => formResponses.id),

    // Update Data
    fieldKey: text('field_key').notNull(),
    newValue: text('new_value').notNull(),

    // Status
    status: text('status', {
      enum: ['pending', 'approved', 'declined', 'applied']
    }).default('pending'),

    processedAt: timestamp('processed_at', { withTimezone: true }),

    ...timestamps
  },
  (table) => [
    index('profile_update_requests_user_id_idx').on(table.userId),
    index('profile_update_requests_response_id_idx').on(table.responseId),
    index('profile_update_requests_status_idx').on(table.status)
  ]
)

export const profileUpdateRequestsRelations = relations(
  profileUpdateRequests,
  ({ one }) => ({
    user: one(user, {
      fields: [profileUpdateRequests.userId],
      references: [user.id]
    }),
    response: one(formResponses, {
      fields: [profileUpdateRequests.responseId],
      references: [formResponses.id]
    })
  })
)
