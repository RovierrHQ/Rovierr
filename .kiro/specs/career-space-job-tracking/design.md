# Design Document

## Overview

The Career Space Job Application Tracking System is a student-focused platform within Rovierr that enables university students to manage their job search journey. The system provides a simple, working model with three main components:

1. **Dynamic Side Navigation** - Context-aware navigation that updates when entering Career Space
2. **Resume Builder Placeholder** - A simple placeholder page for future development
3. **Job Application Tracker** - A comprehensive system for tracking job applications with AI-powered URL parsing

The design follows Rovierr's architecture patterns using ORPC for type-safe API contracts, Drizzle ORM for database operations, TanStack Form for form handling, and Vercel AI SDK for intelligent job post parsing.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
│  (Next.js App Router + React Query + TanStack Form)         │
│  ┌──────────────┬──────────────┬──────────────────────┐    │
│  │ Side Nav     │ Resume       │ Application          │    │
│  │ Component    │ Builder Page │ Tracker UI           │    │
│  └──────────────┴──────────────┴──────────────────────┘    │
└──────────────────┬──────────────────────────────────────────┘
                   │ ORPC Contracts
┌──────────────────▼──────────────────────────────────────────┐
│                   API Layer (Hono)                           │
│  ┌──────────────┬──────────────┬──────────────────────┐    │
│  │ Application  │ URL Parser   │ Application          │    │
│  │ Service      │ Service      │ Query                │    │
│  └──────────────┴──────────────┴──────────────────────┘    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ AI Service (Vercel AI SDK + LLM)                     │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│              Database Layer (PostgreSQL)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Job Application                                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### System Components

1. **Side Navigation Manager**: Dynamically updates navigation items based on current space
2. **Resume Builder Page**: Placeholder page for future resume building functionality
3. **Application Service**: Manages CRUD operations for job applications
4. **URL Parser Service**: Fetches and parses HTML content from job post URLs
5. **AI Service**: Uses Vercel AI SDK to extract structured data from job post HTML
6. **Statistics Service**: Calculates and provides application statistics

## Components and Interfaces

### Database Schema

```typescript
// Job Application
export const jobApplication = pgTable('job_application', {
  id: primaryId,
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),

  // Job details
  companyName: text('company_name').notNull(),
  positionTitle: text('position_title').notNull(),
  jobPostUrl: text('job_post_url'),
  location: text('location'),
  salaryRange: text('salary_range'),

  // Application tracking
  status: text('status', {
    enum: [
      'applied',
      'interview_scheduled',
      'interview_completed',
      'offer_received',
      'rejected',
      'withdrawn'
    ]
  })
    .notNull()
    .default('applied'),

  applicationDate: timestamp('application_date').notNull().defaultNow(),
  notes: text('notes'),

  ...timestamps
})
```

### ORPC Contract Structure

```typescript
// packages/orpc-contracts/src/career/index.ts
export const career = {
  applications: {
    create: oc.route({ method: 'POST' })
      .input(createApplicationSchema)
      .output(applicationSchema),

    parseUrl: oc.route({ method: 'POST' })
      .input(z.object({ url: z.string().url() }))
      .output(parsedJobDataSchema),

    list: oc.route({ method: 'GET' })
      .input(listApplicationsSchema)
      .output(applicationsListSchema),

    get: oc.route({ method: 'GET' })
      .input(z.object({ id: z.string() }))
      .output(fullApplicationSchema),

    update: oc.route({ method: 'PATCH' })
      .input(updateApplicationSchema)
      .output(applicationSchema),

    delete: oc.route({ method: 'DELETE' })
      .input(z.object({ id: z.string() }))
      .output(z.object({ success: z.boolean() })),

    updateStatus: oc.route({ method: 'PATCH' })
      .input(updateStatusSchema)
      .output(applicationSchema),

    statistics: oc.route({ method: 'GET' })
      .input(z.object({}))
      .output(statisticsSchema)
  }
}
```

### AI-Powered URL Parsing Flow

```
1. User enters job post URL
   ↓
2. Frontend calls parseUrl endpoint
   ↓
3. URL Parser Service fetches HTML
   ↓
4. Extract text content from HTML
   ↓
5. AI Service processes text with Vercel AI SDK
   ↓
6. LLM extracts structured data (company, position, location, salary)
   ↓
7. Return parsed data to frontend
   ↓
8. Pre-fill form fields with parsed data
```

### AI Service Implementation

```typescript
import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

const jobDataSchema = z.object({
  companyName: z.string().describe('The name of the company posting the job'),
  positionTitle: z.string().describe('The job title or position name'),
  location: z.string().nullable().describe('The job location (city, state, country, or "Remote")'),
  salaryRange: z.string().nullable().describe('The salary range if mentioned (e.g., "$80k-$120k", "£50,000-£70,000")')
})

export class AIService {
  async parseJobPosting(textContent: string): Promise<ParsedJobData> {
    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: jobDataSchema,
      prompt: `Extract job posting information from the following text.
      If any information is not found, return null for that field.

      Text content:
      ${textContent}`,
    })

    return object
  }
}
```

## Data Models

See full design document for complete data models including JobApplication, ApplicationStatus, ParsedJobData, and more.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do.*

The design includes 28 correctness properties covering:
- Side navigation behavior
- Application CRUD operations
- Status management
- Filtering and search
- Statistics accuracy
- AI parsing validation
- URL handling

## Testing Strategy

- **Unit Testing**: Application CRUD, status updates, statistics, URL validation
- **Property-Based Testing**: Using fast-check with 100+ iterations per property
- **Integration Testing**: End-to-end flows, AI parsing, URL fetching

## Security & Performance

- Ownership verification for all operations
- Input sanitization and URL validation
- Rate limiting on URL parsing (10/min per user)
- Database indexing for performance
- Caching strategy for statistics and lists
- AI prompt injection prevention

## Migration Strategy

Six-phase implementation:
1. Database schema
2. ORPC contracts
3. Service implementation (Application, URL Parser, AI)
4. API routes with middleware
5. Client implementation with dynamic sidebar
6. Testing

## Future Enhancements

Resume builder, job board integration, interview prep, networking, analytics, email/calendar integration, document management, and AI-powered features.
