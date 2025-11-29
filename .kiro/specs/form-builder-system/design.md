# Design Document

## Overview

The Form Builder System is a comprehensive, reusable form creation and management solution built for the Rovierr platform. It provides a drag-and-drop interface for creating dynamic forms with support for multiple question types, conditional logic, validation rules, multi-page flows, payment integration, and response analytics.

The system is designed with a context-agnostic architecture, allowing it to be used for society member registration, event registration, surveys, and other data collection needs. The frontend uses React with TypeScript, leveraging the existing UI component library (@rov/ui), while the backend uses Hono with Drizzle ORM and PostgreSQL for data persistence.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Form Builder │  │ Form Preview │  │   Response   │      │
│  │   Editor     │  │   & Submit   │  │  Management  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │  ORPC Contract │
                    │   Type-Safe    │
                    │   API Layer    │
                    └───────┬────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                     Backend Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Form Service │  │   Response   │  │   Payment    │      │
│  │              │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │  Drizzle ORM   │
                    │   PostgreSQL   │
                    └────────────────┘
```

### Component Architecture

The system follows a modular component architecture:

1. **Form Builder Module**: Drag-and-drop editor for creating forms
2. **Form Renderer Module**: Dynamic form rendering based on configuration
3. **Validation Engine**: Runtime validation using Zod schemas
4. **Conditional Logic Engine**: Real-time evaluation of show/hide rules
5. **Response Management Module**: Collection, storage, and analysis of submissions
6. **Payment Integration Module**: Integration with payment gateways
7. **Template System**: Reusable form templates
8. **Smart Field System**: Profile data mapping and auto-fill functionality
9. **Bidirectional Sync Engine**: Profile updates from form responses

### Data Flow

```
Form Creation Flow:
User → Form Builder UI → Smart Field Registry → State Management → ORPC API →
Form Service → Database

Form Submission Flow (with Smart Fields):
User → Form Renderer → Smart Field Engine (Auto-fill) → User Input →
Validation Engine → Conditional Logic → ORPC API → Response Service →
Database → Bidirectional Sync (Profile Update) → Payment Service (if enabled) →
Confirmation

Response Viewing Flow:
Admin → Response Management UI → ORPC API → Response Service → Database →
Analytics Engine → UI Display

Smart Field Auto-fill Flow:
Form Load → Smart Field Registry → User Profile Service → Profile Data Retrieval →
Field Population → UI Render
```

## Components and Interfaces

### Frontend Components

#### 1. FormBuilder Component
Main container component for the form builder interface.

```typescript
interface FormBuilderProps {
  formId?: string // For editing existing forms
  entityType: 'society' | 'event' | 'survey'
  entityId: string
  onSave?: (formId: string) => void
  onPublish?: (formId: string) => void
}
```

#### 2. FormEditor Component
The main editing interface with question management.

```typescript
interface FormEditorProps {
  formData: FormData
  setFormData: (data: FormData) => void
  selectedQuestionId: string | null
  setSelectedQuestionId: (id: string | null) => void
}
```

#### 3. QuestionCard Component
Individual question display and inline editing.

```typescript
interface QuestionCardProps {
  question: Question
  isSelected: boolean
  onSelect: () => void
  onUpdate: (updates: Partial<Question>) => void
  onDelete: () => void
  onDuplicate: () => void
  onReorder: (direction: 'up' | 'down') => void
}
```

#### 4. ConfigurationPanel Component
Side panel for detailed question configuration.

```typescript
interface ConfigurationPanelProps {
  question: Question
  allQuestions: Question[]
  onUpdate: (updates: Partial<Question>) => void
  onClose: () => void
}
```

#### 5. FormPreview Component
Live preview of the form as users will see it.

```typescript
interface FormPreviewProps {
  formData: FormData
  mode: 'preview' | 'live' // preview doesn't save, live does
  onSubmit?: (responses: FormResponse) => Promise<void>
}
```

#### 6. FormRenderer Component
Reusable component for rendering forms in different contexts.

```typescript
interface FormRendererProps {
  formId: string
  userId?: string // For authenticated users
  onSubmit: (responses: FormResponse) => Promise<void>
  onSaveProgress?: (responses: Partial<FormResponse>) => Promise<void>
}
```

#### 7. ResponseManagement Component
Admin interface for viewing and managing responses.

```typescript
interface ResponseManagementProps {
  formId: string
  filters?: ResponseFilters
  onExport?: (format: 'csv' | 'excel') => void
}
```

#### 8. FormAnalytics Component
Dashboard for response analytics and insights.

```typescript
interface FormAnalyticsProps {
  formId: string
  dateRange?: { start: Date; end: Date }
}
```

#### 9. SmartFieldSelector Component
Interface for selecting and configuring smart field mappings.

```typescript
interface SmartFieldSelectorProps {
  onSelect: (fieldMapping: ProfileFieldMapping) => void
  availableFields: ProfileFieldMapping[]
  selectedFields: string[] // Already used field IDs
}
```

#### 10. ProfileUpdatePrompt Component
Modal/dialog for prompting users to update their profile with new data.

```typescript
interface ProfileUpdatePromptProps {
  newData: Record<string, any>
  fieldMappings: ProfileFieldMapping[]
  onConfirm: (fieldsToUpdate: string[]) => Promise<void>
  onDecline: () => void
}
```

#### 11. SmartFieldIndicator Component
Visual indicator showing which fields are auto-filled.

```typescript
interface SmartFieldIndicatorProps {
  isAutoFilled: boolean
  fieldName: string
  populationRate?: number // Percentage of users with this field populated
}
```

### Backend Services

#### 1. FormService
Handles form CRUD operations and publishing.

```typescript
class FormService {
  async createForm(data: CreateFormInput): Promise<Form>
  async updateForm(formId: string, data: UpdateFormInput): Promise<Form>
  async getForm(formId: string): Promise<Form>
  async listForms(filters: FormFilters): Promise<Form[]>
  async deleteForm(formId: string): Promise<void>
  async publishForm(formId: string): Promise<Form>
  async unpublishForm(formId: string): Promise<Form>
  async duplicateForm(formId: string): Promise<Form>
  async archiveForm(formId: string): Promise<Form>
}
```

#### 2. ResponseService
Manages form submissions and responses.

```typescript
class ResponseService {
  async submitResponse(formId: string, data: SubmitResponseInput): Promise<Response>
  async saveProgress(formId: string, userId: string, data: Partial<SubmitResponseInput>): Promise<void>
  async getResponse(responseId: string): Promise<Response>
  async listResponses(formId: string, filters: ResponseFilters): Promise<Response[]>
  async deleteResponse(responseId: string): Promise<void>
  async exportResponses(formId: string, format: 'csv' | 'excel'): Promise<Buffer>
  async getAnalytics(formId: string): Promise<FormAnalytics>
}
```

#### 3. TemplateService
Manages form templates.

```typescript
class TemplateService {
  async saveAsTemplate(formId: string, name: string, description: string): Promise<Template>
  async listTemplates(): Promise<Template[]>
  async createFromTemplate(templateId: string, entityType: string, entityId: string): Promise<Form>
  async deleteTemplate(templateId: string): Promise<void>
}
```

#### 4. ValidationService
Server-side validation of form responses.

```typescript
class ValidationService {
  async validateResponse(formId: string, responses: Record<string, any>): Promise<ValidationResult>
  async validateFile(file: File, rules: FileValidationRules): Promise<boolean>
}
```

#### 5. PaymentService
Integration with payment gateways.

```typescript
class PaymentService {
  async createPaymentIntent(responseId: string, amount: number, currency: string): Promise<PaymentIntent>
  async confirmPayment(paymentIntentId: string): Promise<PaymentStatus>
  async refundPayment(paymentIntentId: string): Promise<void>
}
```

#### 6. NotificationService
Handles email notifications.

```typescript
class NotificationService {
  async sendSubmissionNotification(formId: string, responseId: string): Promise<void>
  async sendConfirmationEmail(userId: string, responseId: string): Promise<void>
}
```

#### 7. SmartFieldService
Manages smart field mappings and auto-fill functionality.

```typescript
class SmartFieldService {
  async getAvailableFieldMappings(userType?: string): Promise<ProfileFieldMapping[]>
  async registerFieldMapping(mapping: ProfileFieldMapping): Promise<void>
  async getAutoFillData(userId: string, formId: string): Promise<Record<string, any>>
  async getFieldPopulationStats(fieldKey: string): Promise<{ total: number; populated: number }>
  async syncProfileFromResponse(userId: string, responseData: Record<string, any>, fieldMappings: ProfileFieldMapping[]): Promise<void>
}
```

#### 8. ProfileService
Handles user profile data retrieval and updates.

```typescript
class ProfileService {
  async getUserProfile(userId: string): Promise<UserProfile>
  async updateProfileFields(userId: string, updates: Partial<UserProfile>): Promise<UserProfile>
  async getProfileFieldValue(userId: string, fieldKey: string): Promise<any>
  async batchUpdateProfileFields(userId: string, updates: Record<string, any>): Promise<UserProfile>
}
```

## Data Models

### Database Schema

#### Forms Table
```typescript
const forms = pgTable('forms', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  entityType: text('entity_type').notNull(), // 'society', 'event', 'survey'
  entityId: uuid('entity_id').notNull(),
  status: text('status').notNull().default('draft'), // 'draft', 'published', 'closed', 'archived'

  // Settings
  allowMultipleSubmissions: boolean('allow_multiple_submissions').default(false),
  requireAuthentication: boolean('require_authentication').default(true),
  openDate: timestamp('open_date'),
  closeDate: timestamp('close_date'),
  maxResponses: integer('max_responses'),

  // Payment
  paymentEnabled: boolean('payment_enabled').default(false),
  paymentAmount: decimal('payment_amount', { precision: 10, scale: 2 }),
  paymentCurrency: text('payment_currency').default('USD'),

  // Notifications
  notificationsEnabled: boolean('notifications_enabled').default(false),
  notificationEmails: text('notification_emails').array(),

  // Confirmation
  confirmationMessage: text('confirmation_message'),
  confirmationEmailEnabled: boolean('confirmation_email_enabled').default(true),
  confirmationEmailContent: text('confirmation_email_content'),

  // Metadata
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  publishedAt: timestamp('published_at'),

  // Indexes
  ...indexes
})
```

#### Pages Table
```typescript
const formPages = pgTable('form_pages', {
  id: uuid('id').primaryKey().defaultRandom(),
  formId: uuid('form_id').notNull().references(() => forms.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  order: integer('order').notNull(),

  // Conditional Logic
  conditionalLogicEnabled: boolean('conditional_logic_enabled').default(false),
  sourceQuestionId: uuid('source_question_id').references(() => formQuestions.id),
  condition: text('condition'), // 'equals', 'not_equals', 'contains', 'not_contains'
  conditionValue: text('condition_value'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
```

#### Questions Table
```typescript
const formQuestions = pgTable('form_questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  formId: uuid('form_id').notNull().references(() => forms.id, { onDelete: 'cascade' }),
  pageId: uuid('page_id').notNull().references(() => formPages.id, { onDelete: 'cascade' }),

  type: text('type').notNull(), // 'short-text', 'long-text', 'multiple-choice', etc.
  title: text('title').notNull(),
  description: text('description'),
  placeholder: text('placeholder'),
  required: boolean('required').default(false),
  order: integer('order').notNull(),

  // Options for choice-based questions
  options: jsonb('options').$type<string[]>(),

  // Validation Rules
  validationRules: jsonb('validation_rules').$type<ValidationRule>(),

  // Conditional Logic
  conditionalLogicEnabled: boolean('conditional_logic_enabled').default(false),
  sourceQuestionId: uuid('source_question_id').references(() => formQuestions.id),
  condition: text('condition'),
  conditionValue: text('condition_value'),

  // File Upload Settings
  acceptedFileTypes: text('accepted_file_types').array(),
  maxFileSize: integer('max_file_size'), // in bytes

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
```

#### Responses Table
```typescript
const formResponses = pgTable('form_responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  formId: uuid('form_id').notNull().references(() => forms.id),
  userId: uuid('user_id').references(() => users.id),

  // Response Data
  answers: jsonb('answers').notNull().$type<Record<string, any>>(),

  // Payment
  paymentStatus: text('payment_status').default('pending'), // 'pending', 'paid', 'failed', 'refunded'
  paymentIntentId: text('payment_intent_id'),
  paymentAmount: decimal('payment_amount', { precision: 10, scale: 2 }),

  // Metadata
  submittedAt: timestamp('submitted_at').notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  completionTime: integer('completion_time'), // in seconds

  // Status
  status: text('status').default('submitted'), // 'submitted', 'approved', 'rejected'

  ...indexes
})
```

#### Saved Progress Table
```typescript
const formProgress = pgTable('form_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  formId: uuid('form_id').notNull().references(() => forms.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

  answers: jsonb('answers').notNull().$type<Record<string, any>>(),
  currentPageId: uuid('current_page_id').references(() => formPages.id),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  expiresAt: timestamp('expires_at').notNull(), // 30 days from creation

  ...indexes
})
```

#### Templates Table
```typescript
const formTemplates = pgTable('form_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category'), // 'registration', 'survey', 'feedback', etc.

  // Template Data (JSON snapshot of form structure)
  templateData: jsonb('template_data').notNull().$type<FormTemplateData>(),

  // Metadata
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  isPublic: boolean('is_public').default(false),
  usageCount: integer('usage_count').default(0),

  ...indexes
})
```

#### File Uploads Table
```typescript
const formFileUploads = pgTable('form_file_uploads', {
  id: uuid('id').primaryKey().defaultRandom(),
  responseId: uuid('response_id').notNull().references(() => formResponses.id, { onDelete: 'cascade' }),
  questionId: uuid('question_id').notNull().references(() => formQuestions.id),

  fileName: text('file_name').notNull(),
  fileSize: integer('file_size').notNull(),
  fileType: text('file_type').notNull(),
  storageUrl: text('storage_url').notNull(),

  uploadedAt: timestamp('uploaded_at').notNull().defaultNow(),

  ...indexes
})
```

### TypeScript Interfaces

```typescript
interface ValidationRule {
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
  maxSelectMessage?: string
  minSelectMessage?: string
}

interface ConditionalLogic {
  enabled: boolean
  sourceQuestionId?: string
  condition?: 'equals' | 'not_equals' | 'contains' | 'not_contains'
  value?: string
}

interface FormTemplateData {
  title: string
  description: string
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

interface FormAnalytics {
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

interface ResponseFilters {
  dateFrom?: Date
  dateTo?: Date
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded'
  status?: 'submitted' | 'approved' | 'rejected'
  searchQuery?: string
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Smart Field System

#### Profile Field Mappings Table
```typescript
const profileFieldMappings = pgTable('profile_field_mappings', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Field Identification
  fieldKey: text('field_key').notNull().unique(), // e.g., 'name', 'email', 'whatsappNumber'
  displayLabel: text('display_label').notNull(), // e.g., 'Full Name', 'WhatsApp Number'
  category: text('category').notNull(), // 'personal', 'academic', 'contact'

  // Field Configuration
  dataType: text('data_type').notNull(), // 'text', 'email', 'phone', 'date', 'number'
  profilePath: text('profile_path').notNull(), // JSON path in user profile, e.g., 'contactInfo.whatsapp'

  // Validation
  defaultValidationRules: jsonb('default_validation_rules').$type<ValidationRule>(),

  // Metadata
  description: text('description'),
  isActive: boolean('is_active').default(true),
  userTypes: text('user_types').array(), // ['student', 'faculty', 'admin'] - null means all

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
```

#### Profile Update Requests Table
```typescript
const profileUpdateRequests = pgTable('profile_update_requests', {
  id: uuid('id').primaryKey().defaultRandom(),

  userId: uuid('user_id').notNull().references(() => users.id),
  responseId: uuid('response_id').notNull().references(() => formResponses.id),

  // Update Data
  fieldKey: text('field_key').notNull(),
  newValue: text('new_value').notNull(),

  // Status
  status: text('status').default('pending'), // 'pending', 'approved', 'declined', 'applied'

  // Metadata
  createdAt: timestamp('created_at').notNull().defaultNow(),
  processedAt: timestamp('processed_at'),

  ...indexes
})
```

#### Smart Field Interfaces

```typescript
interface ProfileFieldMapping {
  id: string
  fieldKey: string // Unique identifier like 'name', 'email', 'studentId'
  displayLabel: string // Human-readable label
  category: 'personal' | 'academic' | 'contact' | 'other'
  dataType: 'text' | 'email' | 'phone' | 'date' | 'number'
  profilePath: string // JSON path to access in user profile
  defaultValidationRules?: ValidationRule
  description?: string
  isActive: boolean
  userTypes?: string[] // Restrict to specific user types
}

interface SmartFieldConfig {
  questionId: string
  profileFieldKey: string
  enableAutoFill: boolean
  enableBidirectionalSync: boolean
  promptUserForUpdate: boolean // If false, auto-update without asking
}

interface AutoFillData {
  questionId: string
  value: any
  source: 'profile' | 'saved_progress'
  isComplete: boolean // Whether the profile field has a value
}

interface ProfileUpdateRequest {
  fieldKey: string
  currentValue: any
  newValue: any
  fieldLabel: string
}

interface UserProfile {
  // Personal Information
  name?: string
  dateOfBirth?: string
  gender?: string

  // Contact Information
  email: string
  phone?: string
  whatsappNumber?: string

  // Academic Information (for students)
  studentId?: string
  universityId?: string
  departmentId?: string
  programId?: string
  enrollmentYear?: number
  expectedGraduationYear?: number

  // Address
  address?: {
    street?: string
    city?: string
    state?: string
    country?: string
    postalCode?: string
  }

  // Social
  linkedinUrl?: string
  githubUrl?: string

  // Metadata
  profileCompleteness: number // 0-100 percentage
  lastUpdated: Date
}
```

#### Smart Field Registry

The Smart Field Registry is a centralized configuration that defines all available profile field mappings:

```typescript
const SMART_FIELD_REGISTRY: ProfileFieldMapping[] = [
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
    description: 'User\'s full legal name',
    isActive: true
  },
  {
    id: 'field-email',
    fieldKey: 'email',
    displayLabel: 'Email Address',
    category: 'contact',
    dataType: 'email',
    profilePath: 'email',
    description: 'Primary email address',
    isActive: true
  },
  {
    id: 'field-whatsapp',
    fieldKey: 'whatsappNumber',
    displayLabel: 'WhatsApp Number',
    category: 'contact',
    dataType: 'phone',
    profilePath: 'whatsappNumber',
    defaultValidationRules: {
      pattern: '^\\+?[1-9]\\d{1,14}$',
      patternMessage: 'Please enter a valid phone number with country code'
    },
    description: 'WhatsApp contact number',
    isActive: true
  },
  {
    id: 'field-student-id',
    fieldKey: 'studentId',
    displayLabel: 'Student ID',
    category: 'academic',
    dataType: 'text',
    profilePath: 'studentId',
    description: 'University-issued student identification number',
    isActive: true,
    userTypes: ['student']
  },
  {
    id: 'field-department',
    fieldKey: 'departmentId',
    displayLabel: 'Department',
    category: 'academic',
    dataType: 'text',
    profilePath: 'departmentId',
    description: 'Academic department',
    isActive: true,
    userTypes: ['student', 'faculty']
  },
  {
    id: 'field-university',
    fieldKey: 'universityId',
    displayLabel: 'University',
    category: 'academic',
    dataType: 'text',
    profilePath: 'universityId',
    description: 'University affiliation',
    isActive: true,
    userTypes: ['student', 'faculty']
  },
  {
    id: 'field-phone',
    fieldKey: 'phone',
    displayLabel: 'Phone Number',
    category: 'contact',
    dataType: 'phone',
    profilePath: 'phone',
    defaultValidationRules: {
      pattern: '^\\+?[1-9]\\d{1,14}$',
      patternMessage: 'Please enter a valid phone number'
    },
    description: 'Primary phone number',
    isActive: true
  },
  {
    id: 'field-dob',
    fieldKey: 'dateOfBirth',
    displayLabel: 'Date of Birth',
    category: 'personal',
    dataType: 'date',
    profilePath: 'dateOfBirth',
    description: 'Date of birth',
    isActive: true
  }
]
```

#### Smart Field Auto-fill Algorithm

```typescript
async function autoFillForm(
  formId: string,
  userId: string
): Promise<Record<string, AutoFillData>> {
  // 1. Get form questions with smart field mappings
  const questions = await getFormQuestions(formId)
  const smartFields = questions.filter(q => q.profileFieldKey && q.enableAutoFill)

  // 2. Get user profile data
  const userProfile = await getUserProfile(userId)

  // 3. Check for saved progress
  const savedProgress = await getSavedProgress(formId, userId)

  // 4. Build auto-fill data
  const autoFillData: Record<string, AutoFillData> = {}

  for (const question of smartFields) {
    // Prioritize saved progress over profile data
    if (savedProgress && savedProgress.answers[question.id]) {
      autoFillData[question.id] = {
        questionId: question.id,
        value: savedProgress.answers[question.id],
        source: 'saved_progress',
        isComplete: true
      }
    } else {
      // Get value from profile using the field mapping
      const fieldMapping = await getFieldMapping(question.profileFieldKey)
      const profileValue = getNestedValue(userProfile, fieldMapping.profilePath)

      if (profileValue !== undefined && profileValue !== null) {
        autoFillData[question.id] = {
          questionId: question.id,
          value: profileValue,
          source: 'profile',
          isComplete: true
        }
      } else {
        autoFillData[question.id] = {
          questionId: question.id,
          value: null,
          source: 'profile',
          isComplete: false
        }
      }
    }
  }

  return autoFillData
}
```

#### Bidirectional Sync Algorithm

```typescript
async function detectProfileUpdates(
  userId: string,
  formId: string,
  responseData: Record<string, any>
): Promise<ProfileUpdateRequest[]> {
  // 1. Get form questions with bidirectional sync enabled
  const questions = await getFormQuestions(formId)
  const syncFields = questions.filter(
    q => q.profileFieldKey && q.enableBidirectionalSync
  )

  // 2. Get current user profile
  const userProfile = await getUserProfile(userId)

  // 3. Detect new or changed values
  const updateRequests: ProfileUpdateRequest[] = []

  for (const question of syncFields) {
    const newValue = responseData[question.id]

    if (!newValue) continue // Skip empty values

    const fieldMapping = await getFieldMapping(question.profileFieldKey)
    const currentValue = getNestedValue(userProfile, fieldMapping.profilePath)

    // Check if value is new or different
    if (currentValue === undefined || currentValue === null || currentValue !== newValue) {
      updateRequests.push({
        fieldKey: question.profileFieldKey,
        currentValue,
        newValue,
        fieldLabel: fieldMapping.displayLabel
      })
    }
  }

  return updateRequests
}

async function applyProfileUpdates(
  userId: string,
  updates: ProfileUpdateRequest[]
): Promise<void> {
  const profileUpdates: Record<string, any> = {}

  for (const update of updates) {
    const fieldMapping = await getFieldMapping(update.fieldKey)
    setNestedValue(profileUpdates, fieldMapping.profilePath, update.newValue)
  }

  await updateUserProfile(userId, profileUpdates)
}
```

### Extension Points

The system is designed to be easily extensible:

1. **New Question Types**: Add new question types by:
   - Defining the type in the `QuestionType` enum
   - Creating a renderer component in `FormPreview`
   - Adding validation logic in `ValidationService`
   - Updating the `QuestionTypeSelector` component

2. **New Smart Fields**: Add new profile field mappings by:
   - Adding entry to `SMART_FIELD_REGISTRY`
   - Ensuring the user profile model includes the field
   - No code changes required in form builder or renderer

3. **Custom Validation Rules**: Extend validation by:
   - Adding new rule types to `ValidationRule` interface
   - Implementing validation logic in `createQuestionSchema`
   - Adding UI controls in `ConfigurationPanel`

4. **Payment Gateways**: Support new payment providers by:
   - Implementing `PaymentProvider` interface
   - Registering provider in `PaymentService`
   - Adding provider-specific configuration UI

5. **Export Formats**: Add new export formats by:
   - Implementing `ExportFormatter` interface
   - Registering formatter in `ResponseService`
   - Adding format option in export UI


## Acceptence Criteria Testing Prework

### Requirement 1 - Form Creation with Question Types

1.1 WHEN a society administrator accesses the form builder THEN the system SHALL display an interface for creating new forms
Thoughts: This is about UI rendering on initial load. We can test that the form builder component renders with the expected elements.
Testable: yes - example

1.2 WHEN creating a form THEN the system SHALL allow the administrator to add questions of types: short text, long text, multiple choice, checkboxes, dropdown, date, time, email, phone number, number, rating, and file upload
Thoughts: This is testing that for any form, we can add all specified question types. We can generate random forms and ensure all question types can be added.
Testable: yes - property

1.3 WHEN adding a question THEN the system SHALL allow the administrator to specify a question title, optional description, and whether the question is required
Thoughts: For any question being added, these fields should be configurable. We can test that question objects have these properties.
Testable: yes - property

1.4 WHEN adding multiple choice, checkbox, or dropdown questions THEN the system SHALL allow the administrator to define custom options
Thoughts: For any choice-based question type, options should be definable. We can test that these question types have an options array.
Testable: yes - property

1.5 WHEN configuring questions THEN the system SHALL persist all changes to the database immediately
Thoughts: This is about persistence behavior. For any question update, the database should reflect the change.
Testable: yes - property

### Requirement 2 - Multi-page Forms

2.1 WHEN creating a form THEN the system SHALL support multiple pages with the ability to add, remove, and reorder pages
Thoughts: For any form, we should be able to perform page operations. We can test that adding/removing/reordering pages works correctly.
Testable: yes - property

2.2 WHEN a form has multiple pages THEN the system SHALL display page navigation controls in the form preview
Thoughts: For any multi-page form, navigation controls should be present. We can test that forms with >1 page render navigation.
Testable: yes - property

2.3 WHEN a user fills out a multi-page form THEN the system SHALL validate the current page before allowing navigation to the next page
Thoughts: For any page with required fields, validation should block navigation if incomplete.
Testable: yes - property

2.4 WHEN configuring pages THEN the system SHALL allow the administrator to set a page title and optional description
Thoughts: For any page, these properties should be settable.
Testable: yes - property

2.5 WHEN deleting a page with questions THEN the system SHALL move those questions to another page rather than deleting them
Thoughts: For any page deletion where questions exist, questions should be preserved. This is an invariant - question count should remain the same.
Testable: yes - property

### Requirement 3 - Validation Rules

3.1 WHEN configuring text questions THEN the system SHALL allow setting minimum length, maximum length, and regex pattern validation
Thoughts: For any text question, these validation rules should be configurable.
Testable: yes - property

3.2 WHEN configuring number questions THEN the system SHALL allow setting minimum value and maximum value constraints
Thoughts: For any number question, min/max should be configurable.
Testable: yes - property

3.3 WHEN configuring checkbox questions THEN the system SHALL allow setting minimum and maximum selection counts
Thoughts: For any checkbox question, selection limits should be configurable.
Testable: yes - property

3.4 WHEN a validation rule is violated THEN the system SHALL display a clear error message to the user
Thoughts: For any validation failure, an error message should be present. We can test that validation returns error messages.
Testable: yes - property

3.5 WHEN validation rules are configured THEN the system SHALL allow custom error messages for each rule
Thoughts: For any validation rule, a custom message should be settable.
Testable: yes - property

### Requirement 4 - Conditional Logic

4.1 WHEN configuring a question or page THEN the system SHALL allow the administrator to enable conditional logic
Thoughts: For any question or page, conditional logic should be enableable.
Testable: yes - property

4.2 WHEN conditional logic is enabled THEN the system SHALL allow selection of a source question, a comparison operator, and a target value
Thoughts: For any conditional logic configuration, these fields should be settable.
Testable: yes - property

4.3 WHEN a form is being filled out THEN the system SHALL evaluate conditional logic rules in real-time and show or hide questions accordingly
Thoughts: For any form with conditional logic, questions should show/hide based on answers. We can test that the visibility function returns correct results.
Testable: yes - property

4.4 WHEN conditional logic creates a dependency chain THEN the system SHALL evaluate all dependent conditions when any answer changes
Thoughts: For any chain of dependencies, all should be re-evaluated. This is about cascading updates.
Testable: yes - property

4.5 WHEN a hidden question has a value THEN the system SHALL clear that value to prevent invalid data submission
Thoughts: For any question that becomes hidden, its value should be cleared. This is an invariant.
Testable: yes - property

### Requirement 5 - Form Preview

5.1 WHEN editing a form THEN the system SHALL provide a preview mode that displays the form exactly as users will see it
Thoughts: This is about UI rendering consistency. We can test that preview mode renders the same structure as live mode.
Testable: yes - property

5.2 WHEN in preview mode THEN the system SHALL allow the administrator to interact with all form elements including conditional logic
Thoughts: For any form element, it should be interactive in preview mode.
Testable: yes - property

5.3 WHEN in preview mode THEN the system SHALL not save responses to the database
Thoughts: For any preview submission, no database record should be created.
Testable: yes - property

5.4 WHEN switching between edit and preview modes THEN the system SHALL preserve all unsaved changes
Thoughts: For any form state, switching modes should not lose data. This is a round-trip property.
Testable: yes - property

5.5 WHEN previewing a multi-page form THEN the system SHALL display page navigation and validate pages as users would experience
Thoughts: For any multi-page form in preview, navigation and validation should work identically to live mode.
Testable: yes - property

### Requirement 21 - Smart Field Mapping

21.1 WHEN adding a question THEN the system SHALL provide an option to map the question to a known user profile field
Thoughts: For any question being added, smart field mapping should be available.
Testable: yes - property

21.2 WHEN a question is mapped to a profile field THEN the system SHALL display available profile fields
Thoughts: For any smart field selection, available fields should be shown.
Testable: yes - example

21.3 WHEN creating a form THEN the system SHALL allow adding pre-configured smart field templates
Thoughts: For any form, smart field templates should be available.
Testable: yes - example

21.4 WHEN a smart field is added THEN the system SHALL automatically configure appropriate validation rules based on the field type
Thoughts: For any smart field, validation rules should match the field type. We can test that email fields get email validation, etc.
Testable: yes - property

21.5 WHEN a form builder adds a smart field THEN the system SHALL indicate which fields will be auto-filled
Thoughts: For any smart field, an indicator should be present.
Testable: yes - property

### Requirement 22 - Auto-fill Functionality

22.1 WHEN an authenticated user opens a form THEN the system SHALL identify all smart fields mapped to profile attributes
Thoughts: For any form with smart fields, they should be identified correctly.
Testable: yes - property

22.2 WHEN smart fields are present THEN the system SHALL automatically populate them with the user's profile data
Thoughts: For any smart field with corresponding profile data, it should be auto-filled. This is the core auto-fill property.
Testable: yes - property

22.3 WHEN a user's profile is missing data for a smart field THEN the system SHALL leave the field empty and allow manual entry
Thoughts: For any smart field without profile data, it should remain empty and editable.
Testable: yes - property

22.4 WHEN auto-filled fields are displayed THEN the system SHALL visually indicate which fields were pre-populated
Thoughts: For any auto-filled field, a visual indicator should be present.
Testable: yes - property

22.5 WHEN a user modifies an auto-filled field THEN the system SHALL allow the change and use the modified value for submission
Thoughts: For any auto-filled field, user edits should override the auto-filled value.
Testable: yes - property

### Requirement 23 - Bidirectional Sync

23.1 WHEN a user fills out a smart field that was empty in their profile THEN the system SHALL detect the new information
Thoughts: For any smart field with new data, the system should detect it. We can test the detection algorithm.
Testable: yes - property

23.2 WHEN new profile data is detected THEN the system SHALL prompt the user to add it to their profile
Thoughts: For any detected new data, a prompt should be shown.
Testable: yes - property

23.3 WHEN the user approves the profile update THEN the system SHALL save the new information to their user profile
Thoughts: For any approved update, the profile should be updated. This is a round-trip property.
Testable: yes - property

23.4 WHEN the user declines the profile update THEN the system SHALL only use the data for the current form submission
Thoughts: For any declined update, the profile should remain unchanged.
Testable: yes - property

23.5 WHEN multiple new profile fields are detected THEN the system SHALL batch the update prompt to avoid multiple interruptions
Thoughts: For any submission with multiple new fields, only one prompt should be shown.
Testable: yes - property


### Property Reflection

After reviewing all properties, several can be consolidated:

- Properties about "for any X, field Y should be configurable" can be combined into a single property about data model completeness
- Properties about validation rules can be combined into a comprehensive validation property
- Properties about conditional logic evaluation can be combined
- Auto-fill properties can be consolidated into fewer, more comprehensive properties

The following properties represent the unique, non-redundant correctness guarantees:

Property 1: Question type support
Property 2: Question persistence
Property 3: Page deletion preserves questions (invariant)
Property 4: Validation schema generation
Property 5: Conditional logic evaluation
Property 6: Hidden question value clearing (invariant)
Property 7: Preview mode isolation
Property 8: Mode switching preservation (round-trip)
Property 9: Smart field validation auto-configuration
Property 10: Auto-fill data population
Property 11: Auto-fill override capability
Property 12: Profile update detection
Property 13: Profile update round-trip
Property 14: Batch update prompt consolidation

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Question Type Support
*For any* form and any question type from the supported set (short-text, long-text, multiple-choice, checkboxes, dropdown, date, time, email, phone, number, rating, file-upload), adding a question of that type should succeed and the question should be retrievable with the correct type.
**Validates: Requirements 1.2**

### Property 2: Question Persistence
*For any* question update operation, the changes should be immediately reflected in the database, and retrieving the question should return the updated values.
**Validates: Requirements 1.5**

### Property 3: Page Deletion Preserves Questions (Invariant)
*For any* form with multiple pages, when deleting a page that contains questions, the total number of questions in the form should remain unchanged, and all questions should be reassigned to other pages.
**Validates: Requirements 2.5**

### Property 4: Validation Schema Generation
*For any* form with validation rules configured on questions, generating a Zod schema and validating responses should correctly enforce all configured rules (min/max length, min/max value, min/max selections, patterns) and return appropriate error messages.
**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

### Property 5: Conditional Logic Evaluation
*For any* form with conditional logic rules, when answers change, the visibility of dependent questions and pages should be correctly computed based on the condition operators (equals, not_equals, contains, not_contains), including cascading through dependency chains.
**Validates: Requirements 4.3, 4.4**

### Property 6: Hidden Question Value Clearing (Invariant)
*For any* question that becomes hidden due to conditional logic, its value in the response data should be cleared or excluded from submission to maintain data integrity.
**Validates: Requirements 4.5**

### Property 7: Preview Mode Isolation
*For any* form submission in preview mode, no response record should be created in the database, ensuring preview interactions don't pollute production data.
**Validates: Requirements 5.3**

### Property 8: Mode Switching Preservation (Round-trip)
*For any* form state in edit mode, switching to preview mode and back to edit mode should preserve all form data, questions, pages, and configuration without loss.
**Validates: Requirements 5.4**

### Property 9: Smart Field Validation Auto-configuration
*For any* question mapped to a smart field, the validation rules should automatically match the field type (e.g., email fields get email validation, phone fields get phone validation, student ID fields get appropriate pattern validation).
**Validates: Requirements 21.4**

### Property 10: Auto-fill Data Population
*For any* authenticated user opening a form with smart fields, all smart fields that have corresponding non-null values in the user's profile should be automatically populated with those values.
**Validates: Requirements 22.2**

### Property 11: Auto-fill Override Capability
*For any* auto-filled field, when a user modifies the value, the modified value should be used for form submission instead of the original auto-filled value.
**Validates: Requirements 22.5**

### Property 12: Profile Update Detection
*For any* form submission with smart fields enabled for bidirectional sync, the system should correctly identify all fields where the submitted value differs from the current profile value or where the profile value is null.
**Validates: Requirements 23.1**

### Property 13: Profile Update Round-trip
*For any* approved profile update from a form submission, retrieving the user's profile should return the updated values, and those values should auto-fill in subsequent form submissions.
**Validates: Requirements 23.3**

### Property 14: Batch Update Prompt Consolidation
*For any* form submission that detects multiple new profile fields, only a single update prompt should be displayed to the user, containing all detected updates.
**Validates: Requirements 23.5**

## Error Handling

### Form Builder Errors

1. **Invalid Question Configuration**: When a question is configured with invalid data (e.g., empty title, invalid validation rules), the system should display clear error messages and prevent saving until corrected.

2. **Circular Conditional Logic**: When conditional logic creates a circular dependency (Question A depends on Question B, which depends on Question A), the system should detect and prevent this configuration.

3. **Invalid Field Mapping**: When a smart field is mapped to a non-existent profile field, the system should display an error and prevent the mapping.

4. **Concurrent Edits**: When multiple administrators edit the same form simultaneously, the system should use optimistic locking to prevent data loss and notify users of conflicts.

### Form Submission Errors

1. **Validation Failures**: When form validation fails, the system should display all errors grouped by question, with clear messages and visual indicators.

2. **Payment Failures**: When payment processing fails, the system should save the form response as unpaid, display a clear error message, and provide a retry mechanism.

3. **File Upload Failures**: When file uploads fail (size limit, type restriction, malware detection), the system should display specific error messages and allow retry without losing other form data.

4. **Network Errors**: When network connectivity is lost during submission, the system should save progress locally and allow retry when connectivity is restored.

### Auto-fill Errors

1. **Profile Data Access Errors**: When the system cannot access user profile data, it should gracefully degrade to manual entry without blocking form submission.

2. **Invalid Profile Data**: When profile data doesn't match the expected format for a smart field, the system should skip auto-fill for that field and log the issue.

3. **Profile Update Conflicts**: When a profile update conflicts with concurrent changes from another source, the system should use last-write-wins strategy and log the conflict.

## Testing Strategy

### Unit Testing

Unit tests will cover:

- Individual component rendering and behavior
- Validation rule application for each question type
- Conditional logic evaluation functions
- Smart field mapping and auto-fill algorithms
- Profile update detection logic
- Data transformation functions (form to schema, response to export format)
- Error handling for edge cases

### Property-Based Testing

The system will use **fast-check** (JavaScript/TypeScript property-based testing library) to verify the correctness properties defined above.

**Configuration**:
- Minimum 100 iterations per property test
- Custom generators for form structures, questions, and user profiles
- Shrinking enabled to find minimal failing cases

**Property Test Implementation Requirements**:
- Each property test MUST be tagged with a comment: `**Feature: form-builder-system, Property {number}: {property_text}**`
- Each property test MUST reference the requirements it validates
- Property tests MUST use realistic data generators that respect domain constraints
- Property tests MUST be independent and not rely on shared state

**Example Property Test Structure**:
```typescript
/**
 * **Feature: form-builder-system, Property 3: Page Deletion Preserves Questions (Invariant)**
 * **Validates: Requirements 2.5**
 */
test('page deletion preserves all questions', () => {
  fc.assert(
    fc.property(
      formWithMultiplePagesGenerator(),
      async (form) => {
        const initialQuestionCount = form.questions.length
        const pageToDelete = form.pages[1] // Don't delete first page

        const updatedForm = await deletePage(form.id, pageToDelete.id)

        expect(updatedForm.questions.length).toBe(initialQuestionCount)
        expect(updatedForm.questions.every(q => q.pageId !== pageToDelete.id)).toBe(true)
      }
    ),
    { numRuns: 100 }
  )
})
```

### Integration Testing

Integration tests will verify:
- End-to-end form creation, publishing, and submission flows
- Payment gateway integration
- Email notification delivery
- File upload and storage
- Database transactions and data consistency
- ORPC contract compliance

### User Acceptance Testing

UAT will focus on:
- Form builder usability and workflow
- Form filling experience across devices
- Smart field auto-fill accuracy
- Profile update prompts and user experience
- Response management and analytics interfaces

## Performance Considerations

### Form Builder Performance

- **Lazy Loading**: Load form questions and pages on demand for large forms
- **Debounced Saves**: Batch question updates to reduce database writes
- **Optimistic UI Updates**: Update UI immediately while persisting in background
- **Virtual Scrolling**: Use virtual scrolling for forms with many questions

### Form Rendering Performance

- **Conditional Logic Optimization**: Cache evaluation results and only re-evaluate affected questions
- **Smart Field Batching**: Fetch all profile data in a single request
- **Progressive Enhancement**: Load and render pages incrementally for multi-page forms
- **Validation Debouncing**: Debounce validation to avoid excessive re-validation during typing

### Response Management Performance

- **Pagination**: Paginate response lists for forms with many submissions
- **Lazy Loading**: Load response details on demand
- **Export Streaming**: Stream large exports to avoid memory issues
- **Analytics Caching**: Cache analytics computations with appropriate TTL

### Database Performance

- **Indexes**: Create indexes on frequently queried fields (formId, userId, entityType, entityId, status)
- **Query Optimization**: Use selective field loading and joins
- **Connection Pooling**: Use connection pooling for database access
- **Archival Strategy**: Archive old responses to separate tables for better query performance

## Security Considerations

### Authentication and Authorization

- **Form Access Control**: Verify user permissions before allowing form creation, editing, or viewing
- **Response Access Control**: Ensure users can only view responses for forms they own or have permission to access
- **Role-Based Access**: Implement role-based access control for society administrators
- **Token-Based Auth**: Use JWT tokens for API authentication

### Data Protection

- **Input Sanitization**: Sanitize all user inputs to prevent XSS attacks
- **SQL Injection Prevention**: Use parameterized queries via Drizzle ORM
- **File Upload Security**: Validate file types, scan for malware, and store in isolated storage
- **Encryption**: Encrypt sensitive data at rest and in transit
- **PII Protection**: Handle personally identifiable information according to privacy regulations

### Payment Security

- **PCI Compliance**: Use PCI-compliant payment gateway (Stripe)
- **No Card Storage**: Never store credit card information directly
- **Secure Webhooks**: Verify webhook signatures from payment providers
- **Transaction Logging**: Log all payment transactions for audit trails

### Rate Limiting

- **Form Submission**: Limit form submissions per user per time period
- **API Endpoints**: Rate limit API endpoints to prevent abuse
- **File Uploads**: Limit file upload frequency and total size per user

## Deployment Strategy

### Database Migrations

- Use Drizzle Kit for schema migrations
- Test migrations on staging environment before production
- Implement rollback procedures for failed migrations
- Maintain migration history and documentation

### Feature Flags

- Use feature flags for gradual rollout of new features
- Enable smart field system for specific user groups initially
- Monitor performance and user feedback before full rollout

### Monitoring and Observability

- **Application Metrics**: Track form creation, submission rates, and completion rates
- **Error Tracking**: Use error tracking service (e.g., Sentry) for production errors
- **Performance Monitoring**: Monitor API response times and database query performance
- **User Analytics**: Track user behavior and form builder usage patterns

### Backup and Recovery

- **Database Backups**: Automated daily backups with point-in-time recovery
- **File Storage Backups**: Backup uploaded files to separate storage
- **Disaster Recovery**: Document and test disaster recovery procedures
- **Data Retention**: Implement data retention policies for archived forms and responses
