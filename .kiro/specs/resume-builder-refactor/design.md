# Resume Builder Refactor - Design Document

## Overview

The Resume Builder refactor aims to dramatically simplify the current complex implementation by consolidating state management, removing dead code, and reducing the number of files to an absolute minimum. The new architecture will use a single state management approach (React Query + ORPC), eliminate temporal state complexity, and colocate related functionality to improve maintainability.

### Key Design Goals

1. **Radical Simplification**: Minimize file count by colocating related components and logic
2. **Single Source of Truth**: Use React Query cache exclusively for resume data
3. **Type Safety**: Full TypeScript coverage with ORPC contracts
4. **Maintainability**: Fewer files means easier navigation and understanding
5. **User Experience**: Real-time preview updates and auto-save functionality

### Simplification Strategy

**Core Principle**: Reduce from 70+ files to 20-30 files by eliminating unnecessary fragmentation.

**Current Problem**:
- ~70 files with excessive fragmentation
- Each section has 3-4 separate files (schema, form UI, section component, sidebar item)
- Multiple state management files (Zustand stores, Jotai atoms, Temporal state)
- Commented-out code and dead imports
- Unclear boundaries between components

**Target**: 20-30 files total

**Consolidation Strategy**:

1. **One file per section** (not 3-4 files per section)
   - Combine schema + form UI + section logic into single file
   - Example: `sections/basic-info.tsx` contains everything for basic info

2. **One file per template** (extensible for future templates)
   - `templates/default.tsx`
   - `templates/modern.tsx` (when added)
   - Each template is self-contained

3. **Single state management approach**
   - Remove Zustand stores, Jotai atoms, Temporal state
   - Use only React Query + ORPC

4. **Consolidate utilities**
   - One `lib/schemas.ts` for all validation schemas
   - One `lib/hooks.ts` for shared hooks
   - One `lib/pdf-export.ts` for PDF generation

**What We're Eliminating**:
- ❌ Separate schema files per section
- ❌ Separate form component files per section
- ❌ Multiple state management libraries and their files
- ❌ Wrapper components that just pass props
- ❌ Commented-out code and dead imports

**What We're Keeping**:
- ✅ One file per section (logical separation)
- ✅ One file per template (extensibility)
- ✅ Shared utilities in lib/
- ✅ Clear component boundaries

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Resume Builder Page                      │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │  Resume    │  │   Section    │  │   Live Preview   │    │
│  │  List      │  │   Editor     │  │   (Template)     │    │
│  │  Sidebar   │  │   Forms      │  │                  │    │
│  └────────────┘  └──────────────┘  └──────────────────┘    │
└─────────────────────────────────────────────────────────────┘
         │                  │                    │
         └──────────────────┼────────────────────┘
                            │
                    ┌───────▼────────┐
                    │  React Query   │
                    │  + ORPC Client │
                    └───────┬────────┘
                            │
                    ┌───────▼────────┐
                    │  Hono Server   │
                    │  + Drizzle ORM │
                    └────────────────┘
```

### State Management Strategy

**Decision**: Use React Query as the single source of truth, eliminating Zustand and Jotai.

**Rationale**:
- React Query provides built-in caching, invalidation, and optimistic updates
- Reduces complexity by removing multiple state management libraries
- ORPC integration provides type-safe server state management
- Form state handled locally by TanStack Form (ephemeral, doesn't need global state)

### Data Flow

1. **Initial Load**: Fetch resume list via ORPC → React Query cache
2. **Select Resume**: Navigate to editor, fetch full resume data
3. **Edit Section**: Local form state (TanStack Form) → Preview updates via props
4. **Save Changes**: Mutation via ORPC → Optimistic update → Server sync → Cache invalidation
5. **Export PDF**: Client-side generation using resume data from cache

## Components and Interfaces

### Simplified File Structure

**Target**: 20-30 files (down from 70+)

```
/spaces/career/resume/
├── page.tsx                          # Resume list view
├── [resumeId]/
│   └── page.tsx                     # Editor layout & orchestration

/components/resume/                   # All components in components directory
├── resume-card.tsx                   # Resume card component
├── empty-state.tsx                   # Empty state UI
├── create-resume-dialog.tsx          # Create resume modal
├── section-sidebar.tsx               # Navigation sidebar
├── preview-panel.tsx                 # Preview container with zoom
├── export-button.tsx                 # PDF export button
├── sections/
│   ├── basic-info.tsx               # Basic info form (schema + UI + logic)
│   ├── education.tsx                # Education form (schema + UI + logic)
│   ├── experience.tsx               # Experience form (schema + UI + logic)
│   ├── projects.tsx                 # Projects form (schema + UI + logic)
│   ├── certifications.tsx           # Certifications form
│   ├── languages.tsx                # Languages form
│   ├── interests.tsx                # Interests form
│   └── volunteer.tsx                # Volunteer form
├── templates/
│   ├── default.tsx                  # Default template
│   └── modern.tsx                   # Modern template (future)
└── lib/
    ├── schemas.ts                   # Shared validation schemas
    ├── hooks.ts                     # useAutoSave, useResumeData
    ├── pdf-export.ts                # PDF generation utility
    └── utils.ts                     # Helper functions (sorting, formatting)
```

**File Count Breakdown**:
- App pages: 2 files (list page + editor page)
- Components: 6 files (cards, sidebar, preview, export, empty state, dialog)
- Sections: 8 files (one per section in components/resume/sections/)
- Lib: 4 files (utilities in components/resume/lib/)
- Templates: 1-2 files (in components/resume/templates/)
- **Total: ~21 files** (vs current 70+)

**Key Consolidations**:

1. **Section Files** (8 files instead of 24-32):
   - Before: schema.ts + form.tsx + section.tsx + sidebar-item.tsx per section
   - After: One file per section containing schema + form + logic

2. **State Management** (0 files instead of 10-15):
   - Before: Zustand stores, Jotai atoms, Temporal state files
   - After: React Query only (no separate files needed)

3. **Utilities** (4 files instead of 10-15):
   - Before: Scattered utility files, multiple schema files
   - After: Consolidated into lib/ folder

**Benefits**:
- One file per section = easy to find and modify
- Extensible for new templates (just add template file)
- Clear separation of concerns
- Reduced cognitive load (70 → 20 files)

### Component Patterns

#### 1. Section Component Pattern

**One file per section** containing schema + form + logic

```typescript
// components/resume/sections/basic-info.tsx

import { z } from 'zod'
import { useAppForm } from '@rov/ui/components/form'
import { useAutoSave } from '../lib/hooks'

// Schema in same file
export const basicInfoSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string(),
  location: z.string(),
  summary: z.string().max(500).optional()
})

export type BasicInfo = z.infer<typeof basicInfoSchema>

// Component in same file
interface BasicInfoSectionProps {
  data: BasicInfo | null
  onSave: (data: BasicInfo) => Promise<void>
}

export function BasicInfoSection({ data, onSave }: BasicInfoSectionProps) {
  const form = useAppForm({
    validators: { onSubmit: basicInfoSchema },
    defaultValues: data || { name: '', email: '', phone: '', location: '', summary: '' },
    onSubmit: async ({ value }) => await onSave(value)
  })

  const { isSaving } = useAutoSave(form.state.values, onSave)

  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }} className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Basic Information</h2>
        {isSaving && <span className="text-sm text-muted-foreground">Saving...</span>}
      </div>

      <form.AppField name="name" children={(field) => (
        <field.Text label="Full Name" placeholder="John Doe" />
      )} />

      <form.AppField name="email" children={(field) => (
        <field.Text label="Email" type="email" placeholder="john@example.com" />
      )} />

      {/* Other fields */}
    </form>
  )
}
```

**Benefits**:
- Everything for a section in one place (schema + UI + logic)
- Easy to find and modify
- No jumping between files
- Clear boundaries between sections

#### 2. Editor Page Pattern

**Orchestration layer** that imports and renders sections

```typescript
// app/spaces/career/resume/[resumeId]/page.tsx

import { BasicInfoSection } from '@/components/resume/sections/basic-info'
import { EducationSection } from '@/components/resume/sections/education'
import { ExperienceSection } from '@/components/resume/sections/experience'
import { SectionSidebar } from '@/components/resume/section-sidebar'
import { PreviewPanel } from '@/components/resume/preview-panel'
// ... other sections

export default function ResumeEditorPage({ params }: { params: { resumeId: string } }) {
  const [activeSection, setActiveSection] = useState('basicInfo')
  const { data: resume } = useQuery(orpc.resume.get.queryOptions({ id: params.resumeId }))

  const updateSection = useMutation(orpc.resume.updateSection.mutationOptions())

  const renderSection = () => {
    const onSave = (data: any) =>
      updateSection.mutate({ resumeId: params.resumeId, section: activeSection, data })

    switch (activeSection) {
      case 'basicInfo': return <BasicInfoSection data={resume.data.basicInfo} onSave={onSave} />
      case 'education': return <EducationSection data={resume.data.education} onSave={onSave} />
      case 'experience': return <ExperienceSection data={resume.data.experience} onSave={onSave} />
      // ... other sections
    }
  }

  return (
    <div className="flex h-screen">
      <SectionSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <div className="flex-1 p-8 overflow-auto">{renderSection()}</div>
      <PreviewPanel data={resume.data} />
    </div>
  )
}
```

#### 3. Template Pattern

**One file per template** for extensibility

```typescript
// components/resume/templates/default.tsx

export interface TemplateProps {
  data: ResumeData
  zoom?: number
}

export function DefaultTemplate({ data, zoom = 100 }: TemplateProps) {
  return (
    <div
      className="bg-white p-8 shadow-lg"
      style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
    >
      {/* Basic Info */}
      {data.basicInfo && (
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{data.basicInfo.name}</h1>
          <p>{data.basicInfo.email} | {data.basicInfo.phone}</p>
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold border-b mb-2">Education</h2>
          {data.education.map(edu => (
            <div key={edu.id} className="mb-2">
              <div className="font-semibold">{edu.institution}</div>
              <div>{edu.degree} in {edu.fieldOfStudy}</div>
            </div>
          ))}
        </section>
      )}

      {/* Other sections */}
    </div>
  )
}
```

**Adding new templates**: Just create a new file like `components/resume/templates/modern.tsx`


## Data Models

### Database Schema (Drizzle)

```typescript
// packages/db/src/schema/resume.ts

export const resumes = pgTable('resumes', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  targetPosition: text('target_position'),
  status: text('status', { enum: ['draft', 'published'] }).default('draft'),
  templateId: text('template_id').default('default'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const resumeData = pgTable('resume_data', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  resumeId: text('resume_id').notNull().references(() => resumes.id, { onDelete: 'cascade' }),
  basicInfo: jsonb('basic_info').$type<BasicInfo>(),
  education: jsonb('education').$type<Education[]>().default([]),
  experience: jsonb('experience').$type<Experience[]>().default([]),
  projects: jsonb('projects').$type<Project[]>().default([]),
  certifications: jsonb('certifications').$type<Certification[]>().default([]),
  languages: jsonb('languages').$type<Language[]>().default([]),
  interests: jsonb('interests').$type<string[]>().default([]),
  volunteer: jsonb('volunteer').$type<Volunteer[]>().default([]),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})
```

### TypeScript Types

```typescript
// Basic Info
interface BasicInfo {
  name: string
  email: string
  phone: string
  location: string
  summary?: string
}

// Education Entry
interface Education {
  id: string
  institution: string
  degree: string
  fieldOfStudy: string
  startDate: string
  endDate?: string
  current: boolean
  gpa?: number
  gpaScale?: number
}

// Experience Entry
interface Experience {
  id: string
  company: string
  position: string
  location: string
  startDate: string
  endDate?: string
  current: boolean
  description: string
}

// Project Entry
interface Project {
  id: string
  name: string
  description: string
  technologies: string[]
  startDate?: string
  endDate?: string
  url?: string
  order: number
}

// Certification Entry
interface Certification {
  id: string
  name: string
  issuer: string
  issueDate: string
  expirationDate?: string
}

// Language Entry
interface Language {
  id: string
  name: string
  proficiency: 'basic' | 'conversational' | 'fluent' | 'native'
}

// Volunteer Entry
interface Volunteer {
  id: string
  organization: string
  role: string
  startDate: string
  endDate?: string
  current: boolean
  description: string
}

// Complete Resume Data
interface ResumeData {
  basicInfo: BasicInfo | null
  education: Education[]
  experience: Experience[]
  projects: Project[]
  certifications: Certification[]
  languages: Language[]
  interests: string[]
  volunteer: Volunteer[]
}

// Resume Metadata
interface Resume {
  id: string
  userId: string
  title: string
  targetPosition: string | null
  status: 'draft' | 'published'
  templateId: string
  createdAt: string
  updatedAt: string
}

// Full Resume (for editor)
interface FullResume extends Resume {
  data: ResumeData
}
```

### ORPC Contracts

```typescript
// packages/orpc-contracts/src/resume/index.ts

export const resume = {
  // List all resumes for current user
  list: oc
    .route({
      method: 'GET',
      description: 'List all resumes for the authenticated user',
      summary: 'List Resumes',
      tags: ['Resume']
    })
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0)
    }))
    .output(z.object({
      resumes: z.array(selectResumeSchema),
      total: z.number(),
      hasMore: z.boolean()
    }))
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('User not authenticated')
        })
      }
    }),

  // Get single resume with full data
  get: oc
    .route({
      method: 'GET',
      description: 'Get a resume by ID with all data',
      summary: 'Get Resume',
      tags: ['Resume']
    })
    .input(z.object({
      id: z.string().min(1)
    }))
    .output(fullResumeSchema)
    .errors({
      NOT_FOUND: {
        data: z.object({
          message: z.string().default('Resume not found')
        })
      },
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('Not authorized to access this resume')
        })
      }
    }),

  // Create new resume
  create: oc
    .route({
      method: 'POST',
      description: 'Create a new resume',
      summary: 'Create Resume',
      tags: ['Resume']
    })
    .input(createResumeSchema)
    .output(z.object({
      id: z.string(),
      title: z.string()
    }))
    .errors({
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('User not authenticated')
        })
      }
    }),

  // Update resume metadata
  updateMetadata: oc
    .route({
      method: 'PATCH',
      description: 'Update resume title, position, or template',
      summary: 'Update Resume Metadata',
      tags: ['Resume']
    })
    .input(updateResumeMetadataSchema)
    .output(selectResumeSchema)
    .errors({
      NOT_FOUND: {
        data: z.object({
          message: z.string().default('Resume not found')
        })
      }
    }),

  // Update resume section data
  updateSection: oc
    .route({
      method: 'PATCH',
      description: 'Update a specific section of resume data',
      summary: 'Update Resume Section',
      tags: ['Resume']
    })
    .input(updateResumeSectionSchema)
    .output(z.object({
      success: z.boolean(),
      updatedAt: z.string()
    }))
    .errors({
      NOT_FOUND: {
        data: z.object({
          message: z.string().default('Resume not found')
        })
      },
      VALIDATION_ERROR: {
        data: z.object({
          message: z.string(),
          errors: z.record(z.string(), z.string())
        })
      }
    }),

  // Delete resume
  delete: oc
    .route({
      method: 'DELETE',
      description: 'Delete a resume',
      summary: 'Delete Resume',
      tags: ['Resume']
    })
    .input(z.object({
      id: z.string().min(1)
    }))
    .output(z.object({
      success: z.boolean()
    }))
    .errors({
      NOT_FOUND: {
        data: z.object({
          message: z.string().default('Resume not found')
        })
      }
    })
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Acceptance Criteria Testing Prework

1.1 WHEN a user navigates to the resume builder page THEN the system SHALL display a list of all resumes belonging to that user
  Thoughts: This is about ensuring that the query correctly filters resumes by the authenticated user ID. We can test this by creating random users with random resumes, then verifying that querying for a specific user only returns their resumes.
  Testable: yes - property

1.2 WHEN the resume list is empty THEN the system SHALL display an empty state with a call-to-action to create a new resume
  Thoughts: This is a UI rendering test for a specific state (empty list). We can test this by rendering the component with an empty array and checking for the presence of the empty state UI.
  Testable: yes - example

1.3 WHEN a user clicks on a resume in the list THEN the system SHALL navigate to the resume editor for that specific resume
  Thoughts: This is a UI interaction test. We can test that clicking triggers navigation with the correct resume ID.
  Testable: yes - property

2.1 WHEN a user creates a new resume THEN the system SHALL generate a unique resume ID
  Thoughts: This tests that all generated IDs are unique. We can create multiple resumes and verify no ID collisions occur.
  Testable: yes - property

2.4 WHEN a resume is created THEN the system SHALL persist it to the database immediately
  Thoughts: This is a round-trip property. We can create a resume, then immediately query for it and verify it exists.
  Testable: yes - property

3.2 WHEN a user fills in section data THEN the system SHALL validate the input according to the section schema
  Thoughts: This tests that validation correctly rejects invalid inputs. We can generate random invalid data and ensure it's rejected.
  Testable: yes - property

3.4 WHEN section data is updated THEN the system SHALL reflect changes in the preview immediately
  Thoughts: This tests that the preview component receives updated data. We can update section data and verify the preview props contain the new data.
  Testable: yes - property

4.2 WHEN a user provides an email THEN the system SHALL validate it is a properly formatted email address
  Thoughts: This tests email validation across all possible inputs. We can generate random strings and valid emails to ensure proper validation.
  Testable: yes - property

5.2 WHEN a user adds multiple education entries THEN the system SHALL display them in reverse chronological order
  Thoughts: This tests sorting logic. We can create random education entries with different dates and verify they're sorted correctly.
  Testable: yes - property

6.2 WHEN a user adds multiple experience entries THEN the system SHALL display them in reverse chronological order
  Thoughts: Same as education - tests sorting by date.
  Testable: yes - property

7.2 WHEN a user provides a project URL THEN the system SHALL validate it is a properly formatted URL
  Thoughts: This tests URL validation across all inputs. We can generate random strings and valid URLs to test validation.
  Testable: yes - property

9.1 WHEN a user edits any section THEN the system SHALL update the preview within 500 milliseconds
  Thoughts: This is a performance requirement that's difficult to test reliably in unit tests due to timing variability.
  Testable: no

10.2 WHEN generating a PDF THEN the system SHALL preserve all formatting and styling from the preview
  Thoughts: This tests that PDF generation maintains visual fidelity. We can generate a PDF and verify it contains all the expected text content.
  Testable: yes - property

11.1 WHEN a user makes changes to resume data THEN the system SHALL save changes to the database within 2 seconds
  Thoughts: This is a performance/timing requirement that's difficult to test reliably.
  Testable: no

11.4 WHEN a user navigates away from the editor THEN the system SHALL ensure all changes are saved before leaving
  Thoughts: This tests that pending saves complete before navigation. We can trigger navigation with unsaved changes and verify the save completes.
  Testable: yes - property

12.1 WHEN a user enters invalid data THEN the system SHALL display an error message below the field
  Thoughts: This tests that validation errors are properly displayed. We can submit invalid data and check for error messages.
  Testable: yes - property

12.2 WHEN a required field is empty THEN the system SHALL prevent form submission and highlight the field
  Thoughts: This tests form validation prevents submission with missing required fields.
  Testable: yes - property

### Property Reflection

After reviewing all properties, I've identified the following consolidations:

- Properties 5.2 and 6.2 (sorting education and experience) can be combined into a single property about sorting date-based arrays
- Properties 4.2 and 7.2 (email and URL validation) are both format validation properties but test different formats, so they should remain separate
- Property 11.4 (save before navigation) is actually testing the same underlying save mechanism as other save properties, but in a specific context, so it provides unique value

All other properties provide unique validation value and should be retained.

### Correctness Properties

Property 1: User resume isolation
*For any* user and any set of resumes in the database, querying for a user's resumes should only return resumes where the userId matches that user
**Validates: Requirements 1.1**

Property 2: Unique resume ID generation
*For any* set of resume creation operations, all generated resume IDs should be unique with no collisions
**Validates: Requirements 2.1**

Property 3: Resume creation persistence
*For any* valid resume data, creating a resume and then immediately querying for it should return the same resume data
**Validates: Requirements 2.4**

Property 4: Section validation enforcement
*For any* section schema and invalid input data, the validation should reject the input and provide error messages
**Validates: Requirements 3.2**

Property 5: Preview data synchronization
*For any* resume section update, the preview component should receive the updated data within the same render cycle
**Validates: Requirements 3.4**

Property 6: Email format validation
*For any* string input, the email validation should accept valid email formats and reject invalid formats according to RFC 5322
**Validates: Requirements 4.2**

Property 7: Chronological sorting consistency
*For any* array of date-based entries (education, experience, volunteer), the system should display them in reverse chronological order (newest first)
**Validates: Requirements 5.2, 6.2**

Property 8: URL format validation
*For any* string input, the URL validation should accept valid URL formats and reject invalid formats
**Validates: Requirements 7.2**

Property 9: PDF content preservation
*For any* resume data, the generated PDF should contain all text content present in the preview
**Validates: Requirements 10.2**

Property 10: Save completion before navigation
*For any* navigation event with pending changes, all changes should be persisted to the database before navigation completes
**Validates: Requirements 11.4**

Property 11: Validation error display
*For any* form field with validation errors, the error message should be displayed in the UI adjacent to the field
**Validates: Requirements 12.1**

Property 12: Required field enforcement
*For any* form with required fields, submission should be prevented when required fields are empty
**Validates: Requirements 12.2**


## Error Handling

### Error Categories

#### 1. Network Errors

**Scenario**: API request fails due to network issues

**Handling**:
- Display toast notification: "Connection error. Please check your internet."
- Preserve local changes in form state
- Provide retry button
- Auto-retry with exponential backoff (3 attempts)

```typescript
const updateMutation = useMutation(
  orpc.resume.updateSection.mutationOptions({
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      if (error.message.includes('network')) {
        toast.error('Connection error. Please check your internet.', {
          action: {
            label: 'Retry',
            onClick: () => updateMutation.mutate(data)
          }
        })
      }
    }
  })
)
```

#### 2. Validation Errors

**Scenario**: User submits invalid data

**Handling**:
- Display field-level error messages
- Prevent form submission
- Focus first invalid field
- Highlight invalid fields with red border

```typescript
const form = useAppForm({
  validators: { onSubmit: basicInfoSchema },
  onSubmit: async ({ value }) => {
    try {
      await orpc.resume.updateSection.call({
        resumeId,
        section: 'basicInfo',
        data: value
      })
      toast.success('Basic info saved')
    } catch (error) {
      if (error.code === 'VALIDATION_ERROR') {
        // Errors automatically displayed by TanStack Form
        toast.error('Please fix the errors before saving')
      }
    }
  }
})
```

#### 3. Authorization Errors

**Scenario**: User tries to access resume they don't own

**Handling**:
- Redirect to resume list
- Display toast: "You don't have access to this resume"
- Log security event

```typescript
const { data: resume, error } = useQuery(
  orpc.resume.get.queryOptions({ id: resumeId })
)

if (error?.code === 'UNAUTHORIZED') {
  redirect('/spaces/career/resume')
  toast.error('You don\'t have access to this resume')
}
```

#### 4. Not Found Errors

**Scenario**: Resume doesn't exist or was deleted

**Handling**:
- Display 404 page with link to resume list
- Suggest creating a new resume

```typescript
if (error?.code === 'NOT_FOUND') {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Resume Not Found</h1>
      <p className="text-muted-foreground mt-2">
        This resume may have been deleted or doesn't exist.
      </p>
      <Button asChild className="mt-4">
        <Link href="/spaces/career/resume">Back to Resume List</Link>
      </Button>
    </div>
  )
}
```

#### 5. Server Errors

**Scenario**: Unexpected server error (500)

**Handling**:
- Display generic error message
- Log error details to monitoring service
- Preserve user data
- Provide support contact

```typescript
onError: (error) => {
  if (error.code === 'INTERNAL_SERVER_ERROR') {
    console.error('Server error:', error)
    // Log to monitoring service (e.g., Sentry)
    toast.error('Something went wrong. Please try again or contact support.')
  }
}
```

### Error Recovery Strategies

#### Auto-Save Recovery

If auto-save fails, preserve changes locally and retry:

```typescript
const [pendingChanges, setPendingChanges] = useState<Partial<ResumeData>>({})

const debouncedSave = useDebouncedCallback(
  async (data: Partial<ResumeData>) => {
    try {
      await updateMutation.mutateAsync(data)
      setPendingChanges({}) // Clear on success
    } catch (error) {
      setPendingChanges(data) // Preserve on failure
      toast.error('Failed to save. Changes preserved locally.')
    }
  },
  2000
)
```

#### Optimistic Update Rollback

If mutation fails, rollback optimistic update:

```typescript
const updateMutation = useMutation(
  orpc.resume.updateSection.mutationOptions({
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['resume', resumeId] })
      const previousData = queryClient.getQueryData(['resume', resumeId])

      queryClient.setQueryData(['resume', resumeId], (old: any) => ({
        ...old,
        data: { ...old.data, ...newData }
      }))

      return { previousData }
    },
    onError: (err, newData, context) => {
      queryClient.setQueryData(['resume', resumeId], context?.previousData)
      toast.error('Failed to save changes')
    }
  })
)
```

### User-Facing Error Messages

| Error Type | User Message | Action |
|------------|-------------|--------|
| Network Error | "Connection lost. Retrying..." | Auto-retry with backoff |
| Validation Error | "Please fix the highlighted fields" | Show field errors |
| Unauthorized | "You don't have access to this resume" | Redirect to list |
| Not Found | "Resume not found" | Show 404 page |
| Server Error | "Something went wrong. Please try again." | Retry button |
| Save Failed | "Failed to save. Changes preserved locally." | Manual retry |


## Testing Strategy

### Dual Testing Approach

This project will use both unit testing and property-based testing to ensure comprehensive coverage:

- **Unit tests** verify specific examples, edge cases, and error conditions
- **Property tests** verify universal properties that should hold across all inputs
- Together they provide comprehensive coverage: unit tests catch concrete bugs, property tests verify general correctness

### Property-Based Testing

**Library**: `fast-check` (TypeScript/JavaScript property-based testing library)

**Configuration**: Each property-based test will run a minimum of 100 iterations to ensure thorough coverage of the input space.

**Test Tagging**: Each property-based test must be tagged with a comment explicitly referencing the correctness property in the design document using this format:

```typescript
/**
 * Feature: resume-builder-refactor, Property 1: User resume isolation
 * Validates: Requirements 1.1
 */
```

### Property-Based Test Cases

#### Property 1: User Resume Isolation

```typescript
/**
 * Feature: resume-builder-refactor, Property 1: User resume isolation
 * Validates: Requirements 1.1
 */
test('user resume queries only return resumes belonging to that user', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.array(fc.record({
        userId: fc.string(),
        title: fc.string(),
        targetPosition: fc.string()
      }), { minLength: 1, maxLength: 20 }),
      async (resumes) => {
        // Create resumes for different users
        for (const resume of resumes) {
          await createResume(resume)
        }

        // Pick a random user
        const targetUser = resumes[0].userId

        // Query for that user's resumes
        const result = await listResumes(targetUser)

        // All returned resumes should belong to target user
        expect(result.every(r => r.userId === targetUser)).toBe(true)
      }
    ),
    { numRuns: 100 }
  )
})
```

#### Property 2: Unique Resume ID Generation

```typescript
/**
 * Feature: resume-builder-refactor, Property 2: Unique resume ID generation
 * Validates: Requirements 2.1
 */
test('all generated resume IDs are unique', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.integer({ min: 10, max: 100 }),
      async (count) => {
        const ids = new Set<string>()

        for (let i = 0; i < count; i++) {
          const resume = await createResume({
            title: `Resume ${i}`,
            userId: 'test-user'
          })
          ids.add(resume.id)
        }

        // All IDs should be unique
        expect(ids.size).toBe(count)
      }
    ),
    { numRuns: 100 }
  )
})
```

#### Property 3: Resume Creation Persistence (Round Trip)

```typescript
/**
 * Feature: resume-builder-refactor, Property 3: Resume creation persistence
 * Validates: Requirements 2.4
 */
test('created resume can be immediately retrieved', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.record({
        title: fc.string({ minLength: 1, maxLength: 200 }),
        targetPosition: fc.option(fc.string({ maxLength: 100 })),
        userId: fc.string()
      }),
      async (resumeData) => {
        // Create resume
        const created = await createResume(resumeData)

        // Immediately query for it
        const retrieved = await getResume(created.id)

        // Should match
        expect(retrieved.title).toBe(resumeData.title)
        expect(retrieved.targetPosition).toBe(resumeData.targetPosition)
        expect(retrieved.userId).toBe(resumeData.userId)
      }
    ),
    { numRuns: 100 }
  )
})
```

#### Property 4: Section Validation Enforcement

```typescript
/**
 * Feature: resume-builder-refactor, Property 4: Section validation enforcement
 * Validates: Requirements 3.2
 */
test('invalid section data is rejected with errors', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.record({
        name: fc.string({ maxLength: 5 }), // Too short
        email: fc.string(), // Not an email
        phone: fc.integer() // Wrong type
      }),
      async (invalidData) => {
        const result = basicInfoSchema.safeParse(invalidData)

        // Should fail validation
        expect(result.success).toBe(false)

        if (!result.success) {
          // Should have error messages
          expect(Object.keys(result.error.flatten().fieldErrors).length).toBeGreaterThan(0)
        }
      }
    ),
    { numRuns: 100 }
  )
})
```

#### Property 5: Email Format Validation

```typescript
/**
 * Feature: resume-builder-refactor, Property 6: Email format validation
 * Validates: Requirements 4.2
 */
test('email validation accepts valid emails and rejects invalid ones', async () => {
  await fc.assert(
    fc.property(
      fc.emailAddress(),
      (validEmail) => {
        const result = z.string().email().safeParse(validEmail)
        expect(result.success).toBe(true)
      }
    ),
    { numRuns: 100 }
  )

  await fc.assert(
    fc.property(
      fc.string().filter(s => !s.includes('@')),
      (invalidEmail) => {
        const result = z.string().email().safeParse(invalidEmail)
        expect(result.success).toBe(false)
      }
    ),
    { numRuns: 100 }
  )
})
```

#### Property 7: Chronological Sorting Consistency

```typescript
/**
 * Feature: resume-builder-refactor, Property 7: Chronological sorting consistency
 * Validates: Requirements 5.2, 6.2
 */
test('date-based entries are sorted in reverse chronological order', async () => {
  await fc.assert(
    fc.property(
      fc.array(
        fc.record({
          id: fc.string(),
          startDate: fc.date({ min: new Date('2000-01-01'), max: new Date('2024-12-31') }),
          endDate: fc.option(fc.date({ min: new Date('2000-01-01'), max: new Date('2024-12-31') }))
        }),
        { minLength: 2, maxLength: 10 }
      ),
      (entries) => {
        const sorted = sortByDate(entries)

        // Each entry should be newer than or equal to the next
        for (let i = 0; i < sorted.length - 1; i++) {
          const current = sorted[i].endDate || sorted[i].startDate
          const next = sorted[i + 1].endDate || sorted[i + 1].startDate
          expect(current >= next).toBe(true)
        }
      }
    ),
    { numRuns: 100 }
  )
})
```

#### Property 8: URL Format Validation

```typescript
/**
 * Feature: resume-builder-refactor, Property 8: URL format validation
 * Validates: Requirements 7.2
 */
test('URL validation accepts valid URLs and rejects invalid ones', async () => {
  await fc.assert(
    fc.property(
      fc.webUrl(),
      (validUrl) => {
        const result = z.string().url().safeParse(validUrl)
        expect(result.success).toBe(true)
      }
    ),
    { numRuns: 100 }
  )

  await fc.assert(
    fc.property(
      fc.string().filter(s => !s.startsWith('http')),
      (invalidUrl) => {
        const result = z.string().url().safeParse(invalidUrl)
        expect(result.success).toBe(false)
      }
    ),
    { numRuns: 100 }
  )
})
```

### Unit Testing

Unit tests will cover:

1. **Component Rendering**
   - Resume list displays correctly
   - Empty state shows when no resumes
   - Form fields render with correct labels
   - Preview updates when data changes

2. **Form Validation**
   - Required fields prevent submission
   - Email validation works correctly
   - URL validation works correctly
   - Date validation handles edge cases

3. **User Interactions**
   - Clicking resume navigates to editor
   - Form submission triggers save
   - Delete button shows confirmation
   - Export button generates PDF

4. **Error Handling**
   - Network errors show retry option
   - Validation errors display correctly
   - Unauthorized access redirects
   - Not found shows 404 page

5. **Edge Cases**
   - Empty resume data
   - Very long text inputs
   - Special characters in fields
   - Concurrent saves

### Integration Testing

Integration tests will verify:

1. **End-to-End Flows**
   - Create resume → Edit sections → Export PDF
   - List resumes → Select → Edit → Save
   - Create → Delete → Verify removal

2. **Data Persistence**
   - Changes persist after page reload
   - Multiple sections save correctly
   - Optimistic updates rollback on error

3. **Real-time Preview**
   - Preview updates when form changes
   - Template switching works
   - Zoom controls function correctly

### Test Organization

```
apps/web/src/app/spaces/career/resume/
├── __tests__/
│   ├── resume-list.test.tsx
│   ├── resume-editor.test.tsx
│   ├── section-forms.test.tsx
│   └── pdf-export.test.tsx
└── components/
    └── __tests__/
        ├── resume-card.test.tsx
        ├── section-sidebar.test.tsx
        └── resume-preview.test.tsx

packages/orpc-contracts/src/resume/
└── __tests__/
    ├── schemas.test.ts
    └── properties.test.ts (property-based tests)
```

### Testing Best Practices

1. **Property tests focus on core logic** - Test business rules and data transformations
2. **Unit tests focus on specific scenarios** - Test edge cases and error conditions
3. **Integration tests verify workflows** - Test complete user journeys
4. **Mock external dependencies** - Use MSW for API mocking in tests
5. **Test user-facing behavior** - Focus on what users see and do, not implementation details


## Implementation Details

### State Management Pattern

#### React Query as Single Source of Truth

```typescript
// apps/web/src/app/spaces/career/resume/[resumeId]/page.tsx

export default function ResumeEditorPage({ params }: { params: { resumeId: string } }) {
  const queryClient = useQueryClient()

  // Fetch resume data
  const { data: resume, isLoading, error } = useQuery(
    orpc.resume.get.queryOptions({ id: params.resumeId })
  )

  // Update section mutation
  const updateSection = useMutation(
    orpc.resume.updateSection.mutationOptions({
      onMutate: async (newData) => {
        // Optimistic update
        await queryClient.cancelQueries({ queryKey: ['resume', params.resumeId] })
        const previousData = queryClient.getQueryData(['resume', params.resumeId])

        queryClient.setQueryData(['resume', params.resumeId], (old: any) => ({
          ...old,
          data: { ...old.data, [newData.section]: newData.data }
        }))

        return { previousData }
      },
      onError: (err, newData, context) => {
        queryClient.setQueryData(['resume', params.resumeId], context?.previousData)
        toast.error('Failed to save changes')
      },
      onSuccess: () => {
        toast.success('Changes saved')
      }
    })
  )

  if (isLoading) return <ResumeEditorSkeleton />
  if (error) return <ResumeErrorState error={error} />
  if (!resume) return <ResumeNotFound />

  return (
    <ResumeEditor
      resume={resume}
      onUpdateSection={(section, data) =>
        updateSection.mutate({ resumeId: params.resumeId, section, data })
      }
    />
  )
}
```

### Auto-Save Implementation

```typescript
// apps/web/src/app/spaces/career/resume/components/section-forms/use-auto-save.ts

import { useDebouncedCallback } from 'use-debounce'
import { useEffect, useRef } from 'react'

export function useAutoSave<T>(
  data: T,
  onSave: (data: T) => Promise<void>,
  delay = 2000
) {
  const initialDataRef = useRef(data)
  const [isSaving, setIsSaving] = useState(false)

  const debouncedSave = useDebouncedCallback(
    async (newData: T) => {
      if (JSON.stringify(newData) === JSON.stringify(initialDataRef.current)) {
        return // No changes
      }

      setIsSaving(true)
      try {
        await onSave(newData)
        initialDataRef.current = newData
      } catch (error) {
        console.error('Auto-save failed:', error)
      } finally {
        setIsSaving(false)
      }
    },
    delay
  )

  useEffect(() => {
    debouncedSave(data)
  }, [data, debouncedSave])

  return { isSaving }
}
```

### Form Pattern with TanStack Form

```typescript
// apps/web/src/app/spaces/career/resume/components/section-forms/basic-info-form.tsx

import { useAppForm } from '@rov/ui/components/form'
import { basicInfoSchema } from '@rov/orpc-contracts/resume/schemas'
import type { z } from 'zod'

interface BasicInfoFormProps {
  resumeId: string
  initialData: BasicInfo | null
  onSave: (data: BasicInfo) => Promise<void>
}

export function BasicInfoForm({ resumeId, initialData, onSave }: BasicInfoFormProps) {
  const form = useAppForm({
    validators: { onSubmit: basicInfoSchema },
    defaultValues: initialData || {
      name: '',
      email: '',
      phone: '',
      location: '',
      summary: ''
    } as z.infer<typeof basicInfoSchema>,
    onSubmit: async ({ value }) => {
      await onSave(value)
    }
  })

  // Auto-save on change
  const { isSaving } = useAutoSave(
    form.state.values,
    onSave,
    2000
  )

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Basic Information</h2>
        {isSaving && (
          <span className="text-sm text-muted-foreground">Saving...</span>
        )}
      </div>

      <form.AppField
        name="name"
        children={(field) => (
          <field.Text
            label="Full Name"
            placeholder="John Doe"
            description="Your full name as it should appear on your resume"
          />
        )}
      />

      <form.AppField
        name="email"
        children={(field) => (
          <field.Text
            label="Email"
            type="email"
            placeholder="john.doe@example.com"
          />
        )}
      />

      <form.AppField
        name="phone"
        children={(field) => (
          <field.Text
            label="Phone Number"
            placeholder="+1 (555) 123-4567"
          />
        )}
      />

      <form.AppField
        name="location"
        children={(field) => (
          <field.Text
            label="Location"
            placeholder="San Francisco, CA"
          />
        )}
      />

      <form.AppField
        name="summary"
        children={(field) => (
          <field.Textarea
            label="Professional Summary"
            placeholder="Brief overview of your professional background..."
            rows={4}
            description="Optional: A brief summary of your experience and goals (max 500 characters)"
          />
        )}
      />
    </form>
  )
}
```

### Preview Component Pattern

```typescript
// apps/web/src/app/spaces/career/resume/components/preview/resume-preview.tsx

interface ResumePreviewProps {
  resumeData: ResumeData
  template?: string
  zoom?: number
}

export function ResumePreview({
  resumeData,
  template = 'default',
  zoom = 100
}: ResumePreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null)

  return (
    <div className="flex flex-col h-full border-l">
      {/* Zoom Controls */}
      <div className="flex items-center justify-between p-4 border-b">
        <span className="text-sm font-medium">Preview</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.max(50, zoom - 10))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm w-12 text-center">{zoom}%</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.min(200, zoom + 10))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto bg-gray-100 p-8">
        <div
          ref={previewRef}
          className="bg-white shadow-lg mx-auto"
          style={{
            width: `${8.5 * zoom}px`,
            minHeight: `${11 * zoom}px`,
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center'
          }}
        >
          {template === 'default' && (
            <DefaultTemplate data={resumeData} />
          )}
        </div>
      </div>
    </div>
  )
}
```

### PDF Export Implementation

```typescript
// apps/web/src/app/spaces/career/resume/components/export/pdf-generator.ts

import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export async function generatePDF(
  element: HTMLElement,
  filename: string
): Promise<void> {
  // Capture the element as canvas
  const canvas = await html2canvas(element, {
    scale: 2, // Higher quality
    useCORS: true,
    logging: false
  })

  // Convert to PDF
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: 'letter'
  })

  const imgWidth = pdf.internal.pageSize.getWidth()
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
  pdf.save(`${filename}.pdf`)
}

// Usage in component
export function ExportButton({ resumeData, resumeTitle }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const previewElement = document.getElementById('resume-preview')
      if (!previewElement) throw new Error('Preview element not found')

      await generatePDF(previewElement, resumeTitle)
      toast.success('Resume exported successfully')
    } catch (error) {
      toast.error('Failed to export resume')
      console.error(error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button onClick={handleExport} disabled={isExporting}>
      {isExporting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </>
      )}
    </Button>
  )
}
```

### Responsive Layout Implementation

```typescript
// apps/web/src/app/spaces/career/resume/[resumeId]/page.tsx

export default function ResumeEditorPage({ params }: { params: { resumeId: string } }) {
  const [activeSection, setActiveSection] = useState('basicInfo')
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isTablet = useMediaQuery('(max-width: 1024px)')

  if (isMobile) {
    return (
      <div className="p-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Screen Size Too Small</AlertTitle>
          <AlertDescription>
            Please use a tablet or desktop device for the best resume editing experience.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (isTablet) {
    // Vertical stack layout
    return (
      <div className="flex flex-col h-screen">
        <div className="flex-1 overflow-auto">
          <SectionSidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
          <SectionEditor section={activeSection} />
        </div>
        <div className="h-1/2 border-t">
          <ResumePreview resumeData={resume.data} />
        </div>
      </div>
    )
  }

  // Desktop: side-by-side layout
  return (
    <div className="flex h-screen">
      <div className="w-64 border-r">
        <SectionSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
      </div>
      <div className="flex-1 overflow-auto">
        <SectionEditor section={activeSection} />
      </div>
      <div className="w-1/2">
        <ResumePreview resumeData={resume.data} />
      </div>
    </div>
  )
}
```

### Database Queries (Server-side)

```typescript
// apps/server/src/routes/resume/handlers.ts

import { db } from '@rov/db'
import { resumes, resumeData } from '@rov/db/schema'
import { eq, and } from 'drizzle-orm'

export async function listResumes(userId: string, limit: number, offset: number) {
  const results = await db
    .select()
    .from(resumes)
    .where(eq(resumes.userId, userId))
    .orderBy(resumes.updatedAt, 'desc')
    .limit(limit)
    .offset(offset)

  const total = await db
    .select({ count: count() })
    .from(resumes)
    .where(eq(resumes.userId, userId))

  return {
    resumes: results,
    total: total[0].count,
    hasMore: offset + limit < total[0].count
  }
}

export async function getResume(resumeId: string, userId: string) {
  const [resume] = await db
    .select()
    .from(resumes)
    .leftJoin(resumeData, eq(resumes.id, resumeData.resumeId))
    .where(and(
      eq(resumes.id, resumeId),
      eq(resumes.userId, userId)
    ))

  if (!resume) {
    throw new Error('NOT_FOUND')
  }

  return {
    ...resume.resumes,
    data: resume.resume_data || getDefaultResumeData()
  }
}

export async function updateResumeSection(
  resumeId: string,
  userId: string,
  section: string,
  data: any
) {
  // Verify ownership
  const [resume] = await db
    .select()
    .from(resumes)
    .where(and(
      eq(resumes.id, resumeId),
      eq(resumes.userId, userId)
    ))

  if (!resume) {
    throw new Error('NOT_FOUND')
  }

  // Update section
  await db
    .update(resumeData)
    .set({
      [section]: data,
      updatedAt: new Date()
    })
    .where(eq(resumeData.resumeId, resumeId))

  // Update resume timestamp
  await db
    .update(resumes)
    .set({ updatedAt: new Date() })
    .where(eq(resumes.id, resumeId))

  return { success: true, updatedAt: new Date().toISOString() }
}
```

## Performance Considerations

### Optimization Strategies

1. **Debounced Auto-Save**: 2-second delay prevents excessive API calls
2. **Optimistic Updates**: Immediate UI feedback while server processes
3. **React Query Caching**: Reduces redundant network requests
4. **Lazy Loading**: Load preview templates on demand
5. **Memoization**: Prevent unnecessary re-renders of preview component

```typescript
// Memoized preview component
export const ResumePreview = memo(function ResumePreview({
  resumeData,
  template,
  zoom
}: ResumePreviewProps) {
  // Component implementation
}, (prevProps, nextProps) => {
  return (
    JSON.stringify(prevProps.resumeData) === JSON.stringify(nextProps.resumeData) &&
    prevProps.template === nextProps.template &&
    prevProps.zoom === nextProps.zoom
  )
})
```

### Bundle Size Optimization

1. **Code Splitting**: Lazy load PDF export library
2. **Tree Shaking**: Import only needed components from UI library
3. **Dynamic Imports**: Load templates on demand

```typescript
// Lazy load PDF export
const PDFGenerator = lazy(() => import('./components/export/pdf-generator'))

// Dynamic template loading
const loadTemplate = async (templateId: string) => {
  const module = await import(`./components/preview/templates/${templateId}`)
  return module.default
}
```
