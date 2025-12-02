# Society Email Service Design Document

## Overview

The Society Email Service enables society presidents to send mass emails to all members with rich text formatting and dynamic variable support. The system leverages the existing UseSend email infrastructure and integrates with the organization/member database schema from Better Auth.

**Key Design Principles:**
- Reuse existing email sender service (`apps/server/src/services/email/sender.ts`)
- Leverage Better Auth's organization and member tables
- Asynchronous email sending to prevent UI blocking
- Type-safe variable validation using database schema
- Rich text editing with TipTap editor
- Comprehensive audit trail for sent emails

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Web Frontend                          │
│  ┌────────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │ Email Composer │  │   Preview    │  │  Email History  │ │
│  │   (TipTap)     │  │   Modal      │  │     List        │ │
│  └────────────────┘  └──────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ ORPC
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Server (Hono)                           │
│  ┌────────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │ Authorization  │  │  Variable    │  │  Existing       │ │
│  │   Check        │  │  Replacement │  │  UseSend        │ │
│  └────────────────┘  └──────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database (Postgres)                     │
│  ┌────────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │ organization   │  │    member    │  │  society_email  │ │
│  │     (auth)     │  │    (auth)    │  │   (new table)   │ │
│  └────────────────┘  └──────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Design Rationale:**
- Reuse existing UseSend email service (`apps/server/src/services/email/sender.ts`)
- Simple variable replacement function (no complex templating engine needed)
- Store email history for audit trail
- Leverage Better Auth's organization/member tables

### Component Interaction Flow

1. **Authorization Check**: Verify user is president of the society
2. **Email Composition**: Rich text editor with variable insertion
3. **Validation**: Check subject, body, and variable syntax
4. **Member Retrieval**: Query all active members from database
5. **Variable Replacement**: Replace {{user.name}} etc. for each member
6. **Send via UseSend**: Use existing email service to send
7. **Store History**: Save email record to database

## Components and Interfaces

### 1. Database Schema

#### New Table: `society_email`

```typescript
export const societyEmail = pgTable('society_email', {
  id: text('id').primaryKey(), // nanoid
  organizationId: text('organization_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  senderId: text('sender_id')
    .notNull()
    .references(() => user.id),
  subject: text('subject').notNull(),
  bodyHtml: text('body_html').notNull(),
  bodyText: text('body_text').notNull(),
  recipientCount: integer('recipient_count').notNull(),
  successCount: integer('success_count').default(0).notNull(),
  failureCount: integer('failure_count').default(0).notNull(),
  status: text('status', {
    enum: ['completed', 'failed']
  }).notNull(),
  sentAt: timestamp('sent_at'),
  ...timestamps
}, (table) => [
  index('society_email_organization_id_idx').on(table.organizationId),
  index('society_email_sender_id_idx').on(table.senderId),
  index('society_email_sent_at_idx').on(table.sentAt)
])
```

**Design Rationale:**
- Store both HTML and plain text versions for email client compatibility
- Track success/failure counts for basic monitoring
- Index on organizationId for fast history queries
- Simple status field for tracking send progress
- No need for complex recipient tracking - UseSend handles delivery

### 2. Frontend Components

#### Email Composer Page (`apps/web/src/app/(authenticated)/spaces/societies/[slug]/email/page.tsx`)

**Responsibilities:**
- Authorization check (president role only)
- Rich text editor integration (TipTap)
- Variable insertion UI
- Form validation
- Preview modal trigger
- Send confirmation dialog

**Key Features:**
- Subject line input with character limit (200)
- TipTap editor with formatting toolbar
- Variable picker dropdown showing available fields
- Recipient count display
- Real-time validation feedback
- Loading states during send operation

#### Email Composer Component (`apps/web/src/components/societies/email-composer.tsx`)

```typescript
interface EmailComposerProps {
  organizationId: string
  organizationName: string
  memberCount: number
}

export function EmailComposer({
  organizationId,
  organizationName,
  memberCount
}: EmailComposerProps) {
  // TipTap editor instance
  // Variable insertion logic
  // Form state management
  // Preview modal state
  // Send mutation
}
```

**Design Rationale:**
- Separate component for reusability and testing
- Props include necessary context (org ID, name, member count)
- Encapsulates all email composition logic

#### Variable Picker Component

```typescript
interface VariablePickerProps {
  onInsert: (variable: string) => void
}

const AVAILABLE_VARIABLES = [
  { key: 'user.name', label: 'Member Name', example: 'John Doe' },
  { key: 'user.email', label: 'Member Email', example: 'john@university.edu' },
  { key: 'user.username', label: 'Username', example: 'johndoe' },
  { key: 'organization.name', label: 'Society Name', example: 'Computer Science Club' }
]
```

**Design Rationale:**
- Predefined list prevents invalid variable usage
- Shows examples to help presidents understand output
- Simple dropdown UI for easy insertion

#### Email History Component

```typescript
interface EmailHistoryProps {
  organizationId: string
}

export function EmailHistory({ organizationId }: EmailHistoryProps) {
  // Query email history
  // Display list with pagination
  // View detail modal
  // Delivery status indicators
}
```

### 3. Backend Services

#### ORPC Contract (`packages/orpc-contracts/src/society-email/index.ts`)

```typescript
export const societyEmail = {
  send: oc
    .route({
      method: 'POST',
      description: 'Send mass email to all society members',
      summary: 'Send Society Email',
      tags: ['Society Email']
    })
    .input(sendEmailSchema)
    .output(sendEmailResponseSchema)
    .errors({
      UNAUTHORIZED: { /* ... */ },
      VALIDATION_ERROR: { /* ... */ },
      NO_RECIPIENTS: { /* ... */ },
      SEND_FAILED: { /* ... */ }
    }),

  preview: oc
    .route({
      method: 'POST',
      description: 'Preview email with sample data',
      summary: 'Preview Email',
      tags: ['Society Email']
    })
    .input(previewEmailSchema)
    .output(previewEmailResponseSchema),

  list: oc
    .route({
      method: 'GET',
      description: 'List sent emails for a society',
      summary: 'List Society Emails',
      tags: ['Society Email']
    })
    .input(listEmailsSchema)
    .output(listEmailsResponseSchema),

  get: oc
    .route({
      method: 'GET',
      description: 'Get email details with delivery status',
      summary: 'Get Email Details',
      tags: ['Society Email']
    })
    .input(z.object({ emailId: z.string() }))
    .output(emailDetailsSchema)
}
```

#### Email Service (`apps/server/src/services/email/society-email.ts`)

```typescript
interface SendSocietyEmailParams {
  organizationId: string
  senderId: string
  subject: string
  bodyHtml: string
  bodyText: string
}

export async function sendSocietyEmail(params: SendSocietyEmailParams) {
  // 1. Create email record in database
  // 2. Query all active members
  // 3. For each member:
  //    - Replace variables with member data
  //    - Send individual email via UseSend batch API
  // 4. Update email status and counts
  // 5. Return summary
}
```

**Design Rationale:**
- Use UseSend's batch email API for efficient sending
- Simple variable replacement (no complex templating)
- Store email history for audit trail
- Let UseSend handle delivery tracking

#### Variable Replacement Engine

```typescript
interface VariableContext {
  user: {
    name: string
    email: string
    username: string | null
  }
  organization: {
    name: string
  }
}

export function replaceVariables(
  template: string,
  context: VariableContext
): string {
  // Replace {{user.name}}, {{user.email}}, etc.
  // Handle missing/null values gracefully
  // Escape HTML in replaced values
}
```

**Design Rationale:**
- Simple regex-based replacement
- Type-safe context object
- Handles null/undefined values
- HTML escaping prevents XSS

#### Authorization Middleware

```typescript
export async function requirePresidentRole(
  organizationId: string,
  userId: string
): Promise<void> {
  // Query member table
  // Check role === 'president' or 'owner'
  // Throw UNAUTHORIZED if not president
}
```

## Data Models

### Email Composition Data

```typescript
interface EmailComposition {
  subject: string
  bodyHtml: string
  bodyText: string
}
```

### Email Record

```typescript
interface SocietyEmail {
  id: string
  organizationId: string
  senderId: string
  subject: string
  bodyHtml: string
  bodyText: string
  recipientCount: number
  successCount: number
  failureCount: number
  status: 'pending' | 'completed' | 'failed'
  sentAt: Date | null
  createdAt: Date
  updatedAt: Date
}
```

### Email History Item

```typescript
interface EmailHistoryItem {
  id: string
  subject: string
  recipientCount: number
  successCount: number
  failureCount: number
  status: string
  sentAt: Date | null
  sender: {
    id: string
    name: string
    image: string | null
  }
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Authorization Enforcement
*For any* email send request, only users with president role in the target organization should be able to send emails
**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Subject Validation
*For any* email send request, the system should reject requests with empty or missing subject lines
**Validates: Requirements 6.2, 9.1**

### Property 3: Body Validation
*For any* email send request, the system should reject requests with empty or missing email body
**Validates: Requirements 9.2**

### Property 4: Variable Syntax Validation
*For any* email template containing variables, all variables should match the pattern `{{field.subfield}}` and reference valid user or organization fields
**Validates: Requirements 3.4, 9.3**

### Property 5: Variable Replacement Consistency
*For any* email sent to multiple recipients, each recipient should receive an email with variables replaced by their own data, not another recipient's data
**Validates: Requirements 3.2, 5.2**

### Property 6: Recipient Count Accuracy
*For any* society, the displayed recipient count should equal the number of active members in the organization
**Validates: Requirements 7.1**

### Property 7: Email Persistence
*For any* successfully sent email, a record should be created in the database with accurate metadata (subject, recipient count, sender)
**Validates: Requirements 8.1, 8.2**

### Property 8: Email Send Success Tracking
*For any* email send operation, the system should track the total number of emails sent and update success/failure counts
**Validates: Requirements 10.3, 10.4**

### Property 9: Batch Email Sending
*For any* email send operation with multiple recipients, the system should use UseSend's batch API to send efficiently
**Validates: Requirements 5.5**

### Property 10: HTML and Text Versions
*For any* email sent, both HTML and plain text versions should be generated and sent to support all email clients
**Validates: Requirements 2.2, 2.3**

### Property 11: Subject Length Constraint
*For any* email subject, the length should not exceed 200 characters
**Validates: Requirements 6.4**

### Property 12: Preview Accuracy
*For any* email preview, the rendered content should match what recipients will see, with variables replaced by sample data
**Validates: Requirements 4.1, 4.2, 4.3**

### Property 13: History Ordering
*For any* email history query, results should be ordered by send date with most recent first
**Validates: Requirements 8.4**

### Property 14: Zero Recipients Handling
*For any* society with zero active members, the send button should be disabled and sending should be prevented
**Validates: Requirements 7.3**

### Property 15: Error Message Specificity
*For any* validation failure, the system should display specific error messages indicating which validation rule failed
**Validates: Requirements 9.4**

## Error Handling

### Client-Side Validation Errors

```typescript
interface ValidationError {
  field: 'subject' | 'body' | 'variables'
  message: string
}
```

**Error Scenarios:**
- Empty subject → "Subject is required"
- Empty body → "Email body cannot be empty"
- Invalid variable syntax → "Invalid variable: {{invalid.field}}"
- Subject too long → "Subject must be 200 characters or less"

### Server-Side Errors

```typescript
enum EmailErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NO_RECIPIENTS = 'NO_RECIPIENTS',
  SEND_FAILED = 'SEND_FAILED',
  DATABASE_ERROR = 'DATABASE_ERROR'
}
```

**Error Handling Strategy:**
- Log all errors with context (organizationId, userId, error details)
- Return user-friendly error messages
- Partial failure handling: Continue sending to remaining recipients if some fail
- Retry logic for transient failures (network issues, rate limits)

### Email Delivery Failures

**Handling Strategy:**
- Individual recipient failures don't block other sends
- Store error message in `society_email_recipient` table
- Update failure count in `society_email` table
- Log detailed error for debugging
- Display delivery status in email history

## Testing Strategy

### Unit Tests

**Variable Replacement Engine:**
- Test valid variable replacement
- Test handling of null/undefined values
- Test HTML escaping
- Test invalid variable syntax

**Authorization Middleware:**
- Test president role check
- Test non-president rejection
- Test non-member rejection

**Validation Functions:**
- Test subject validation (empty, too long)
- Test body validation (empty)
- Test variable syntax validation

### Property-Based Tests

**Property Testing Framework:** fast-check (JavaScript/TypeScript)

**Test Configuration:**
- Minimum 100 iterations per property
- Use realistic data generators (names, emails, HTML content)

**Property Test 1: Authorization Enforcement**
```typescript
// Feature: society-email-service, Property 1: Authorization Enforcement
// Validates: Requirements 1.1, 1.2, 1.3
fc.assert(
  fc.asyncProperty(
    fc.record({
      organizationId: fc.string(),
      userId: fc.string(),
      role: fc.constantFrom('president', 'member', 'admin')
    }),
    async ({ organizationId, userId, role }) => {
      // Setup: Create org and member with specified role
      // Action: Attempt to send email
      // Assert: Only president role succeeds
    }
  ),
  { numRuns: 100 }
)
```

**Property Test 2: Variable Replacement Consistency**
```typescript
// Feature: society-email-service, Property 5: Variable Replacement Consistency
// Validates: Requirements 3.2, 5.2
fc.assert(
  fc.property(
    fc.array(fc.record({
      name: fc.string(),
      email: fc.emailAddress()
    })),
    fc.string(), // email template
    (recipients, template) => {
      // For each recipient, replace variables
      // Assert: Each email contains that recipient's data only
    }
  ),
  { numRuns: 100 }
)
```

**Property Test 3: Subject Length Constraint**
```typescript
// Feature: society-email-service, Property 11: Subject Length Constraint
// Validates: Requirements 6.4
fc.assert(
  fc.property(
    fc.string({ minLength: 0, maxLength: 300 }),
    (subject) => {
      const result = validateSubject(subject)
      if (subject.length > 200) {
        return result.isValid === false
      }
      return true
    }
  ),
  { numRuns: 100 }
)
```

### Integration Tests

**Email Send Flow:**
1. Create test organization with members
2. Authenticate as president
3. Send email with variables
4. Verify email records created
5. Verify recipient records created
6. Verify UseSend API called correctly

**Email History:**
1. Create multiple test emails
2. Query history
3. Verify ordering (most recent first)
4. Verify pagination
5. Verify delivery status display

### End-to-End Tests

**Complete User Journey:**
1. Login as president
2. Navigate to email page
3. Compose email with formatting
4. Insert variables
5. Preview email
6. Send email
7. View confirmation
8. Check email history
9. View email details

## Security Considerations

### Authorization

- **Role-Based Access Control:** Only presidents can send emails
- **Organization Membership:** User must be member of organization
- **Session Validation:** Verify active session via Better Auth

### Input Validation

- **XSS Prevention:** Sanitize HTML content from rich text editor
- **SQL Injection:** Use parameterized queries (Drizzle ORM handles this)
- **Variable Injection:** Validate variable syntax, whitelist allowed fields
- **Subject Length:** Enforce 200 character limit
- **Rate Limiting:** Prevent abuse (e.g., max 10 emails per hour per society)

### Data Privacy

- **Email Storage:** Store sent emails securely
- **Recipient Data:** Only expose recipient data to authorized presidents
- **Audit Trail:** Log all email sends with sender information
- **GDPR Compliance:** Allow users to request email history deletion

## Performance Considerations

### Batch Email Sending with UseSend

**Challenge:** Sending emails to 100+ members efficiently

**Solution:**
- Use UseSend's batch email API (`POST /emails/batch`)
- Send all personalized emails in a single API call
- UseSend handles delivery and tracking

**Implementation:**
```typescript
async function sendSocietyEmail(params) {
  // 1. Get all members
  const members = await getOrganizationMembers(params.organizationId)

  // 2. Prepare batch emails with variable replacement
  const emails = members.map(member => ({
    from: 'Rovierr <noreply@clubs.rovierr.com>',
    to: member.email,
    subject: replaceVariables(params.subject, { user: member }),
    html: replaceVariables(params.bodyHtml, { user: member }),
    text: replaceVariables(params.bodyText, { user: member })
  }))

  // 3. Send via UseSend batch API
  const result = await usesend.emails.sendBatch(emails)

  // 4. Store email record
  await createEmailRecord({
    ...params,
    recipientCount: members.length,
    status: 'completed'
  })

  return { success: true, recipientCount: members.length }
}
```

### Database Optimization

**Indexes:**
- `society_email.organization_id` - Fast history queries
- `society_email.sent_at` - Fast date-based sorting
- `member.organization_id` - Fast member queries (already exists)

**Query Optimization:**
- Use UseSend batch API to send all emails in one request
- Limit history queries with pagination
- Use select only needed fields

### Caching

**Member Count:**
- Cache member count per organization
- Invalidate on member add/remove
- TTL: 5 minutes

**Variable Validation:**
- Cache list of valid variables (static data)
- No invalidation needed

## Deployment Considerations

### Environment Variables

```env
USESEND_API_KEY=<api-key>
WEB_URL=https://rovierr.com
```

### Database Migrations

1. Create `society_email` table
2. Create `society_email_recipient` table
3. Add indexes
4. No data migration needed (new feature)

### Monitoring

**Metrics to Track:**
- Email send success rate
- Email send latency
- Failed delivery count
- UseSend API errors
- Database query performance

**Alerts:**
- Email send failure rate > 10%
- UseSend API errors
- Database connection issues

### Rollback Plan

**If issues occur:**
1. Disable email sending feature (feature flag)
2. Investigate failed emails in database
3. Fix issues
4. Retry failed emails if needed
5. Re-enable feature

## Future Enhancements

### Phase 2 Features

1. **Email Templates:** Pre-defined templates for common announcements
2. **Scheduled Sending:** Schedule emails for future delivery
3. **Recipient Filtering:** Send to specific member segments
4. **Attachment Support:** Allow file attachments
5. **Email Analytics:** Track open rates, click rates
6. **Draft Saving:** Save email drafts for later
7. **A/B Testing:** Test different subject lines
8. **Unsubscribe Management:** Allow members to opt-out

### Scalability Improvements

1. **Rate Limiting:** Implement per-society rate limits (e.g., max 10 emails/hour)
2. **Email Service Abstraction:** Support multiple email providers beyond UseSend
3. **Retry Logic:** Automatic retry for failed batch sends
4. **Monitoring:** Track UseSend API usage and delivery rates

## Technical Decisions and Rationales

### Why TipTap for Rich Text Editing?

**Decision:** Use TipTap editor instead of alternatives (Quill, Draft.js)

**Rationale:**
- Modern, headless editor with React integration
- Excellent TypeScript support
- Extensible with custom nodes/marks
- Active development and community
- Better performance than Draft.js
- More flexible than Quill

### Why Store Both HTML and Plain Text?

**Decision:** Store both `bodyHtml` and `bodyText` in database

**Rationale:**
- Email clients vary in HTML support
- Plain text fallback ensures deliverability
- Better accessibility for screen readers
- Spam filters prefer multipart emails
- Minimal storage overhead

### Why Use UseSend Batch API?

**Decision:** Use UseSend's batch email endpoint instead of individual sends

**Rationale:**
- Single API call for all recipients (more efficient)
- UseSend handles delivery tracking and retries
- Reduces server load and network overhead
- Simpler implementation (no queue management needed)
- Leverages existing UseSend infrastructure

### Why Simple Status Tracking?

**Decision:** Store only basic email metadata (no per-recipient tracking)

**Rationale:**
- UseSend handles delivery tracking
- Simpler database schema
- Faster implementation
- Can add detailed tracking later if needed
- Sufficient for MVP audit trail

### Why Reuse Existing Email Service?

**Decision:** Extend `apps/server/src/services/email/sender.ts` instead of creating new service

**Rationale:**
- Consistent email sending across platform
- Reuse UseSend configuration
- Maintain single source of truth for email templates
- Easier to switch email providers in future
- Less code duplication

### Why Validate Variables on Client and Server?

**Decision:** Implement variable validation on both frontend and backend

**Rationale:**
- Client-side: Immediate feedback, better UX
- Server-side: Security, prevent invalid data
- Defense in depth approach
- Client validation can be bypassed
- Server validation is source of truth

## Dependencies

### New Dependencies

```json
{
  "@tiptap/react": "^2.1.0",
  "@tiptap/starter-kit": "^2.1.0",
  "@tiptap/extension-link": "^2.1.0",
  "@tiptap/extension-placeholder": "^2.1.0"
}
```

### Existing Dependencies

- `usesend-js` - Email sending (already installed)
- `@tanstack/react-query` - Data fetching
- `zod` - Schema validation
- `drizzle-orm` - Database ORM
- `better-auth` - Authentication

## API Endpoints Summary

### POST `/api/society-email/send`
- **Auth:** Required (President role)
- **Input:** `{ organizationId, subject, bodyHtml, bodyText }`
- **Output:** `{ emailId, status, recipientCount }`

### POST `/api/society-email/preview`
- **Auth:** Required (President role)
- **Input:** `{ organizationId, subject, bodyHtml }`
- **Output:** `{ previewHtml, previewText, sampleData }`

### GET `/api/society-email/list`
- **Auth:** Required (President role)
- **Input:** `{ organizationId, limit, offset }`
- **Output:** `{ emails: EmailHistoryItem[], total, hasMore }`

### GET `/api/society-email/:emailId`
- **Auth:** Required (President role)
- **Input:** `{ emailId }`
- **Output:** `{ email: SocietyEmail, recipients: SocietyEmailRecipient[] }`

## Conclusion

This design provides a comprehensive, scalable solution for society email communication. It leverages existing infrastructure (Better Auth, UseSend), follows established patterns (ORPC, Drizzle ORM), and includes robust error handling, validation, and testing strategies. The async processing approach ensures good performance even with large member lists, while the audit trail provides transparency and accountability.
