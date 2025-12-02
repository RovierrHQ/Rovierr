# Design Document

## Overview

The Rovierr Platform Foundation is a comprehensive, production-ready monorepo application built for university students. It provides a unified ecosystem of academic and lifestyle tools through a modern tech stack including Next.js, React Native (Expo), Tauri, Bun, Hono, Drizzle ORM, PostgreSQL, and Centrifugo for real-time communication.

The platform follows a modular architecture with clear separation between frontend applications (web, mobile, desktop), backend services, and shared packages. All code is organized in a Turborepo monorepo with type-safe communication via ORPC contracts, ensuring full-stack type safety from database to UI.

Key architectural principles:
- **Type Safety**: End-to-end type safety from database schemas to API contracts to UI components
- **Code Reusability**: Shared packages for UI components, utilities, and business logic
- **Scalability**: Modular architecture allowing independent scaling of services
- **Developer Experience**: Fast builds with Turbo, instant feedback with Bun, comprehensive tooling
- **Real-time First**: Built-in real-time capabilities via Centrifugo for live updates

## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend Applications                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Next.js    │  │     Expo     │  │    Tauri     │          │
│  │   Web App    │  │  Mobile App  │  │ Desktop App  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │  ORPC Contract │
                    │   Type-Safe    │
                    │   API Layer    │
                    └───────┬────────┘
                            │
┌─────────────────────────────────────────────────────────────────┐
│                     Backend Services                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Hono Server │  │  Centrifugo  │  │  ID Parser   │          │
│  │   (Bun)      │  │   Realtime   │  │   (Python)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │  Drizzle ORM   │
                    │   PostgreSQL   │
                    │     (Neon)     │
                    └────────────────┘
```

### Monorepo Structure

```
rovierr/
├── apps/
│   ├── web/              # Next.js web application
│   ├── native/           # Expo mobile application
│   ├── desktop/          # Tauri desktop application
│   ├── server/           # Hono backend server
│   └── docs/             # Mintlify documentation
│
├── packages/
│   ├── ui/               # Shared UI components (Radix + Tailwind)
│   ├── orpc-contracts/   # Type-safe API contracts
│   ├── db/               # Database schemas and migrations
│   ├── db-seed/          # Database seeding utilities
│   ├── auth/             # Authentication utilities
│   ├── realtime/         # Centrifugo client/server wrappers
│   ├── shared/           # Common utilities and types
│   ├── id-parser/        # Student ID parsing service
│   └── typescript-config/# Shared TypeScript configurations
│
├── turbo.json            # Turborepo configuration
├── package.json          # Root package configuration
├── biome.json            # Linting and formatting config
└── docker-compose.yml    # Service orchestration
```

## Components and Interfaces

### Frontend Applications

#### 1. Web Application (apps/web)
Next.js 15 application with App Router and Server Actions.

**Key Features:**
- Server-side rendering and static generation
- Server Actions for mutations
- Optimistic UI updates
- Progressive Web App (PWA) support
- Responsive design with Tailwind CSS

**Directory Structure:**
```
apps/web/src/
├── app/                  # Next.js App Router pages
│   ├── (auth)/          # Authentication routes
│   ├── profile/         # User profile pages
│   ├── societies/       # Society management
│   ├── spaces/          # Academic spaces
│   └── apps/            # Feature apps
├── components/          # React components
│   ├── layout/          # Layout components
│   ├── shared/          # Shared components
│   ├── form/            # Form components
│   ├── profile/         # Profile components
│   └── societies/       # Society components
├── lib/                 # Utilities and configurations
│   ├── auth-client.ts   # Better Auth client
│   └── quera-store.ts   # State management
└── utils/
    └── orpc.ts          # ORPC client configuration
```

#### 2. Mobile Application (apps/native)
Expo React Native application for iOS and Android.

**Key Features:**
- Native mobile experience
- Shared components with web via @rov/ui
- Offline-first capabilities
- Push notifications
- Native device integrations

**Directory Structure:**
```
apps/native/
├── app/                 # Expo Router pages
├── components/          # React Native components
├── lib/                 # Mobile-specific utilities
└── assets/              # Images and fonts
```

#### 3. Desktop Application (apps/desktop)
Tauri desktop application for Windows, macOS, and Linux.

**Key Features:**
- Native desktop experience
- System tray integration
- Local file system access
- Native notifications
- Auto-updates

### Backend Services

#### 1. Hono Server (apps/server)
Main backend API server built with Hono framework running on Bun.

**Key Features:**
- Fast, lightweight HTTP server
- ORPC route handlers
- Better Auth integration
- Database operations via Drizzle ORM
- Real-time event publishing

**Directory Structure:**
```
apps/server/src/
├── routes/              # ORPC route implementations
│   ├── user/           # User-related routes
│   ├── form/           # Form builder routes
│   ├── society/        # Society management routes
│   └── academic/       # Academic features routes
├── services/           # Business logic services
├── middleware/         # HTTP middleware
└── index.ts            # Server entry point
```

**Server Configuration:**
```typescript
interface ServerConfig {
  port: number
  cors: CORSConfig
  database: DatabaseConfig
  auth: AuthConfig
  realtime: RealtimeConfig
}
```

#### 2. Centrifugo Realtime Server (packages/realtime)
WebSocket server for real-time communication.

**Key Features:**
- Channel-based pub/sub
- JWT authentication
- Presence tracking
- Message history
- Scalable architecture

**Configuration:**
```json
{
  "token_hmac_secret_key": "secret",
  "api_key": "api_key",
  "admin_password": "admin_password",
  "admin_secret": "admin_secret",
  "allowed_origins": ["http://localhost:3000"]
}
```

#### 3. ID Parser Service (packages/id-parser)
Python FastAPI service for parsing student IDs.

**Key Features:**
- Pattern matching for university IDs
- Data extraction (university, department, year)
- Validation and verification
- RESTful API
- Docker containerization

### Shared Packages

#### 1. UI Package (@rov/ui)
Comprehensive component library built on Radix UI and Tailwind CSS.

**Components:**
- Form components (Input, Select, Textarea, Checkbox, Radio)
- Layout components (Card, Dialog, Sheet, Tabs)
- Data display (Table, Badge, Avatar)
- Feedback (Toast, Alert, Progress)
- Navigation (Dropdown, Command Menu)

**Form Integration:**
```typescript
import { useAppForm } from '@rov/ui/components/form'

const form = useAppForm({
  validators: { onSubmit: schema },
  defaultValues: { /* ... */ },
  onSubmit: async ({ value }) => {
    await orpc.endpoint.call(value)
  }
})
```

#### 2. ORPC Contracts (@rov/orpc-contracts)
Type-safe API contracts for client-server communication.

**Structure:**
```
packages/orpc-contracts/src/
├── user/
│   ├── generated-schemas.ts  # Auto-generated from DB
│   ├── schemas.ts            # API-specific schemas
│   └── index.ts              # ORPC contracts
├── form/
├── society/
├── academic/
└── index.ts                  # Exported contracts
```

**Contract Definition Pattern:**
```typescript
export const user = {
  profile: {
    get: oc
      .route({
        method: 'GET',
        description: 'Get user profile',
        tags: ['User']
      })
      .input(z.object({ id: z.string() }))
      .output(userProfileSchema)
      .errors({
        NOT_FOUND: {
          data: z.object({
            message: z.string().default('User not found')
          })
        }
      })
  }
}
```

#### 3. Database Package (@rov/db)
Database schemas and utilities using Drizzle ORM.

**Schema Organization:**
```
packages/db/src/schema/
├── auth.ts              # Authentication tables
├── institution.ts       # Universities, departments
├── course.ts            # Academic courses
├── form.ts              # Form builder tables
├── discussion.ts        # Discussion forums
├── expenses.ts          # Expense tracking
├── tasks.ts             # Task management
└── index.ts             # Schema exports
```

**Schema Pattern:**
```typescript
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})
```

#### 4. Authentication Package (@rov/auth)
Better Auth configuration and utilities.

**Features:**
- Google OAuth integration
- Session management
- Organization support
- Role-based access control
- Token generation and validation

## Data Models

### Core Database Schema

The database uses PostgreSQL with Drizzle ORM. All schemas follow consistent patterns:
- UUID primary keys
- Timestamps (createdAt, updatedAt)
- Soft deletes where appropriate
- Foreign key relationships with cascading
- Indexes on frequently queried fields

### Key Tables

#### Authentication & Users
```typescript
// users table (from Better Auth)
- id: uuid (PK)
- email: text (unique)
- name: text
- emailVerified: boolean
- image: text
- createdAt: timestamp
- updatedAt: timestamp

// sessions table
- id: uuid (PK)
- userId: uuid (FK → users)
- expiresAt: timestamp
- token: text
- ipAddress: text
- userAgent: text

// organizations table
- id: uuid (PK)
- name: text
- slug: text (unique)
- logo: text
- createdAt: timestamp
```

#### Institutions
```typescript
// universities table
- id: uuid (PK)
- name: text
- code: text (unique)
- city: text
- country: text
- website: text
- logo: text

// departments table
- id: uuid (PK)
- universityId: uuid (FK → universities)
- name: text
- code: text

// programs table
- id: uuid (PK)
- departmentId: uuid (FK → departments)
- name: text
- degree: text (Bachelor, Master, PhD)
- duration: integer
```

#### Forms (Form Builder System)
```typescript
// forms table
- id: uuid (PK)
- title: text
- description: text
- entityType: text (society, event, survey)
- entityId: uuid
- status: text (draft, published, closed, archived)
- settings: jsonb (payment, notifications, dates, limits)
- createdBy: uuid (FK → users)
- createdAt: timestamp
- updatedAt: timestamp
- publishedAt: timestamp

// form_pages table
- id: uuid (PK)
- formId: uuid (FK → forms, cascade)
- title: text
- description: text
- order: integer
- conditionalLogic: jsonb

// form_questions table
- id: uuid (PK)
- formId: uuid (FK → forms, cascade)
- pageId: uuid (FK → form_pages, cascade)
- type: text (short-text, long-text, multiple-choice, etc.)
- title: text
- description: text
- required: boolean
- order: integer
- options: jsonb
- validationRules: jsonb
- conditionalLogic: jsonb
- profileFieldKey: text (for smart fields)

// form_responses table
- id: uuid (PK)
- formId: uuid (FK → forms)
- userId: uuid (FK → users)
- answers: jsonb
- paymentStatus: text
- submittedAt: timestamp
- completionTime: integer

// profile_field_mappings table
- id: uuid (PK)
- fieldKey: text (unique)
- displayLabel: text
- category: text
- dataType: text
- profilePath: text
- defaultValidationRules: jsonb
- isActive: boolean
```

#### Societies
```typescript
// societies table
- id: uuid (PK)
- name: text
- description: text
- universityId: uuid (FK → universities)
- logo: text
- status: text
- createdAt: timestamp

// society_members table
- id: uuid (PK)
- societyId: uuid (FK → societies)
- userId: uuid (FK → users)
- role: text (member, admin, president)
- joinedAt: timestamp

// society_registrations table
- id: uuid (PK)
- societyId: uuid (FK → societies)
- formId: uuid (FK → forms)
- userId: uuid (FK → users)
- responseId: uuid (FK → form_responses)
- status: text (pending, approved, rejected)
- registeredAt: timestamp
```

#### Academic Features
```typescript
// courses table
- id: uuid (PK)
- code: text
- name: text
- departmentId: uuid (FK → departments)
- credits: integer
- semester: text

// assignments table
- id: uuid (PK)
- courseId: uuid (FK → courses)
- title: text
- description: text
- dueDate: timestamp
- maxPoints: integer

// discussions table
- id: uuid (PK)
- title: text
- content: text
- authorId: uuid (FK → users)
- entityType: text
- entityId: uuid
- createdAt: timestamp

// discussion_replies table
- id: uuid (PK)
- discussionId: uuid (FK → discussions, cascade)
- content: text
- authorId: uuid (FK → users)
- parentId: uuid (FK → discussion_replies)
- createdAt: timestamp
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Type Safety Across Stack
*For any* API endpoint defined in ORPC contracts, calling it from the frontend should provide full TypeScript type inference for inputs, outputs, and errors without manual type annotations.
**Validates: Requirements 4.2, 4.3**

### Property 2: Database Schema to API Schema Consistency
*For any* database table with generated Zod schemas, the API schemas derived from them should correctly validate data that conforms to the database constraints.
**Validates: Requirements 3.3, 4.3, 4.4**

### Property 3: Authentication Token Validity
*For any* authenticated request, the system should correctly validate the authentication token and reject requests with invalid or expired tokens.
**Validates: Requirements 2.3, 28.1**

### Property 4: Workspace Package Resolution
*For any* package in the @rov/* namespace, importing it from any application should resolve to the correct package without version conflicts.
**Validates: Requirements 1.4, 18.4**

### Property 5: Form Builder Question Persistence
*For any* question update operation in the form builder, the changes should be immediately reflected in the database, and retrieving the question should return the updated values.
**Validates: Requirements 8.2, 8.3**

### Property 6: Smart Field Auto-fill Population
*For any* authenticated user opening a form with smart fields, all smart fields that have corresponding non-null values in the user's profile should be automatically populated with those values.
**Validates: Requirements 9.2, 9.3**

### Property 7: Profile Update Round-trip
*For any* approved profile update from a form submission, retrieving the user's profile should return the updated values, and those values should auto-fill in subsequent form submissions.
**Validates: Requirements 9.4**

### Property 8: Real-time Message Delivery
*For any* message published to a Centrifugo channel, all subscribed clients should receive the message within acceptable latency bounds.
**Validates: Requirements 5.2, 5.3**

### Property 9: Build Cache Consistency
*For any* package that hasn't changed, Turborepo should use cached build outputs instead of rebuilding, and the cached outputs should be functionally equivalent to fresh builds.
**Validates: Requirements 1.2, 29.3**

### Property 10: Environment Variable Validation
*For any* required environment variable, the application should fail to start with a clear error message if the variable is missing or invalid.
**Validates: Requirements 23.5**

### Property 11: Database Migration Idempotency
*For any* database migration, running it multiple times should produce the same final schema state as running it once.
**Validates: Requirements 3.2**

### Property 12: CORS Configuration Correctness
*For any* API request from an allowed origin, the server should accept the request, and requests from disallowed origins should be rejected.
**Validates: Requirements 28.3**

### Property 13: File Upload Security
*For any* file upload, the system should validate file type and size before accepting, and reject files that don't meet the criteria.
**Validates: Requirements 28.4**

### Property 14: Session Invalidation Consistency
*For any* user sign-out operation, all active sessions for that user should be invalidated across all applications.
**Validates: Requirements 2.4**

### Property 15: Responsive Layout Consistency
*For any* UI component, it should render correctly and maintain functionality across different viewport sizes (mobile, tablet, desktop).
**Validates: Requirements 26.1**

## Error Handling

### API Error Handling

All ORPC endpoints follow a consistent error handling pattern:

```typescript
.errors({
  UNAUTHORIZED: {
    data: z.object({
      message: z.string().default('User not authenticated')
    })
  },
  NOT_FOUND: {
    data: z.object({
      message: z.string().default('Resource not found')
    })
  },
  VALIDATION_ERROR: {
    data: z.object({
      message: z.string(),
      errors: z.record(z.string(), z.string())
    })
  },
  INTERNAL_ERROR: {
    data: z.object({
      message: z.string().default('An internal error occurred')
    })
  }
})
```

### Frontend Error Handling

**React Error Boundaries:**
- Catch rendering errors
- Display fallback UI
- Log errors to monitoring service

**API Error Handling:**
```typescript
try {
  await orpc.endpoint.call(data)
  toast.success('Success!')
} catch (error) {
  if (error.code === 'VALIDATION_ERROR') {
    // Handle validation errors
  } else if (error.code === 'UNAUTHORIZED') {
    // Redirect to login
  } else {
    toast.error(error.message || 'An error occurred')
  }
}
```

### Database Error Handling

**Transaction Rollback:**
```typescript
await db.transaction(async (tx) => {
  try {
    await tx.insert(table1).values(data1)
    await tx.insert(table2).values(data2)
  } catch (error) {
    // Transaction automatically rolls back
    throw error
  }
})
```

**Constraint Violations:**
- Unique constraint violations → User-friendly messages
- Foreign key violations → Prevent orphaned records
- Not null violations → Validation before insert

### Real-time Error Handling

**Connection Errors:**
- Automatic reconnection with exponential backoff
- Queue messages during disconnection
- Notify user of connection status

**Message Delivery Failures:**
- Retry failed publishes
- Log delivery failures
- Fallback to polling for critical updates

## Testing Strategy

### Unit Testing

Unit tests cover individual functions, components, and utilities:

**Frontend Unit Tests:**
- Component rendering and behavior
- Hook logic and state management
- Utility function correctness
- Form validation logic

**Backend Unit Tests:**
- Service layer business logic
- Data transformation functions
- Validation schema generation
- Authentication and authorization logic

**Testing Framework:**
- Vitest for JavaScript/TypeScript
- React Testing Library for components
- MSW for API mocking

### Property-Based Testing

The system uses **fast-check** for property-based testing to verify correctness properties.

**Configuration:**
- Minimum 100 iterations per property test
- Custom generators for domain objects
- Shrinking enabled for minimal failing cases

**Property Test Requirements:**
- Each test MUST be tagged: `**Feature: rovierr-platform-foundation, Property {number}: {property_text}**`
- Each test MUST reference validated requirements
- Tests MUST use realistic data generators
- Tests MUST be independent

**Example Property Test:**
```typescript
/**
 * **Feature: rovierr-platform-foundation, Property 6: Smart Field Auto-fill Population**
 * **Validates: Requirements 9.2, 9.3**
 */
test('smart fields auto-fill from profile', () => {
  fc.assert(
    fc.property(
      userProfileGenerator(),
      formWithSmartFieldsGenerator(),
      async (profile, form) => {
        const autoFillData = await autoFillForm(form.id, profile.id)

        for (const question of form.questions) {
          if (question.profileFieldKey && profile[question.profileFieldKey]) {
            expect(autoFillData[question.id].value).toBe(
              profile[question.profileFieldKey]
            )
          }
        }
      }
    ),
    { numRuns: 100 }
  )
})
```

### Integration Testing

Integration tests verify end-to-end flows:

**API Integration Tests:**
- Full request/response cycles
- Database persistence verification
- Authentication flow testing
- Real-time message delivery

**Frontend Integration Tests:**
- User flow testing (sign up, login, form submission)
- Navigation and routing
- State management across components
- API integration with real endpoints

### End-to-End Testing

E2E tests verify complete user journeys:

**Test Scenarios:**
- User registration and onboarding
- Form creation and submission
- Society registration process
- Profile management
- Real-time notifications

**Testing Tools:**
- Playwright for browser automation
- Test databases for isolation
- Seed data for consistent state

## Performance Considerations

### Frontend Performance

**Code Splitting:**
- Route-based code splitting in Next.js
- Dynamic imports for heavy components
- Lazy loading for below-the-fold content

**Asset Optimization:**
- Image optimization with Next.js Image component
- Font optimization with next/font
- SVG sprite sheets for icons
- Bundle size monitoring

**Caching Strategies:**
- React Query for data caching
- Service Worker for offline support
- CDN caching for static assets
- Browser caching headers

**Rendering Optimization:**
- Server-side rendering for initial load
- Incremental Static Regeneration for dynamic content
- React Server Components for zero-JS components
- Virtualization for long lists

### Backend Performance

**Database Optimization:**
- Indexes on frequently queried fields
- Connection pooling (Neon serverless)
- Query optimization with Drizzle
- Prepared statements for repeated queries

**API Performance:**
- Response compression (gzip/brotli)
- Rate limiting to prevent abuse
- Request batching where applicable
- Efficient pagination

**Caching:**
- Redis for session storage
- Query result caching
- Computed value caching
- CDN for API responses where appropriate

### Real-time Performance

**Centrifugo Optimization:**
- Channel namespacing for isolation
- Message batching for high-frequency updates
- Presence optimization
- History size limits

**WebSocket Management:**
- Connection pooling
- Automatic reconnection
- Heartbeat for connection health
- Graceful degradation

### Build Performance

**Turborepo Optimization:**
- Remote caching for CI/CD
- Parallel task execution
- Incremental builds
- Dependency graph optimization

**Bun Performance:**
- Fast package installation
- Quick startup times
- Efficient bundling
- Native TypeScript support

## Security Considerations

### Authentication & Authorization

**Better Auth Security:**
- Secure session management with HTTP-only cookies
- CSRF protection
- Rate limiting on auth endpoints
- Password hashing with bcrypt
- OAuth 2.0 for Google Sign-In

**Authorization Patterns:**
```typescript
// Role-based access control
async function checkPermission(userId: string, resource: string, action: string) {
  const user = await getUser(userId)
  const permissions = await getUserPermissions(user.role)
  return permissions.includes(`${resource}:${action}`)
}

// Resource ownership check
async function checkOwnership(userId: string, resourceId: string) {
  const resource = await getResource(resourceId)
  return resource.ownerId === userId
}
```

### Data Protection

**Input Validation:**
- Zod schema validation on all inputs
- SQL injection prevention via parameterized queries
- XSS prevention via input sanitization
- File upload validation (type, size, content)

**Data Encryption:**
- HTTPS for all communications
- Encrypted database connections
- Sensitive data encryption at rest
- Secure environment variable storage

**PII Handling:**
- GDPR compliance for EU users
- Data minimization principles
- User data export capabilities
- Right to deletion implementation

### API Security

**Rate Limiting:**
```typescript
const rateLimiter = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later'
}
```

**CORS Configuration:**
```typescript
const corsConfig = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}
```

**Request Validation:**
- Content-Type validation
- Request size limits
- Header validation
- Token verification

### Real-time Security

**Centrifugo Security:**
- JWT token authentication
- Channel access control
- Message validation
- Connection limits per user

**WebSocket Security:**
- Origin validation
- Token-based authentication
- Message rate limiting
- Automatic disconnection on suspicious activity

### Deployment Security

**Container Security:**
- Non-root user in containers
- Minimal base images
- Regular security updates
- Vulnerability scanning

**Environment Security:**
- Secrets management (not in code)
- Environment variable validation
- Secure defaults
- Production vs development configs

**Monitoring & Logging:**
- Security event logging
- Failed authentication tracking
- Suspicious activity detection
- Audit trails for sensitive operations

## Deployment Strategy

### Development Environment

**Local Development:**
```bash
# Install dependencies
bun install

# Start development servers
bun dev

# Run database migrations
bun db:push

# Open database studio
bun db:studio
```

**Docker Compose:**
```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: rovierr
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"

  centrifugo:
    image: centrifugo/centrifugo:v5
    volumes:
      - ./packages/realtime/centrifugo-config.json:/centrifugo/config.json
    ports:
      - "8000:8000"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

### Staging Environment

**Infrastructure:**
- AWS Amplify for web app
- Neon for PostgreSQL database
- Centrifugo Cloud for real-time
- Vercel for preview deployments

**CI/CD Pipeline:**
```yaml
# .github/workflows/staging.yml
name: Deploy to Staging
on:
  push:
    branches: [develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build
      - run: bun run test
      - run: bun db:migrate
      - uses: aws-actions/configure-aws-credentials@v4
      - run: amplify publish
```

### Production Environment

**Infrastructure:**
- AWS Amplify for web app hosting
- Neon for production PostgreSQL
- Centrifugo Cloud for real-time
- CloudFront CDN for static assets
- Route 53 for DNS management

**Deployment Process:**
1. Merge to main branch
2. Automated tests run
3. Build artifacts created
4. Database migrations applied
5. Zero-downtime deployment
6. Health checks verified
7. Rollback on failure

**Monitoring:**
- Application performance monitoring
- Error tracking (Sentry)
- Log aggregation (CloudWatch)
- Uptime monitoring
- Database performance metrics

### Database Migrations

**Migration Strategy:**
```typescript
// drizzle.config.ts
export default {
  schema: './src/schema/*',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!
  }
}
```

**Migration Commands:**
```bash
# Generate migration
bun db:generate

# Apply migrations
bun db:migrate

# Rollback migration
bun db:rollback
```

**Migration Best Practices:**
- Test migrations on staging first
- Backup database before migrations
- Use transactions for atomic changes
- Document breaking changes
- Maintain rollback procedures

### Scaling Strategy

**Horizontal Scaling:**
- Multiple server instances behind load balancer
- Stateless server design
- Session storage in Redis
- Database connection pooling

**Vertical Scaling:**
- Neon autoscaling for database
- Amplify auto-scaling for web app
- Centrifugo clustering for real-time

**Caching Strategy:**
- CDN for static assets
- Redis for session and query caching
- Browser caching headers
- API response caching
