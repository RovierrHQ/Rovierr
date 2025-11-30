# Design Document

## Overview

The Society Member Registration System provides a comprehensive solution for society presidents to configure and manage how prospective members join their societies. Built on top of the existing Form Builder System, it enables presidents to create custom registration forms, generate QR codes for easy access at events, manage join requests with approval workflows, and track registration analytics.

The system integrates seamlessly with the Form Builder's smart field functionality for auto-filling user data, supports manual payment verification for membership fees (with automated payment via Stripe Connect planned for future), and provides flexible approval modes (auto-approve or manual review). It's designed to handle various registration scenarios from simple free membership to complex multi-step processes with custom questions and manual payment verification.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Registration │  │ Public Join  │  │ Join Request │      │
│  │   Settings   │  │     Page     │  │  Management  │      │
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
│  │ Registration │  │ Join Request │  │   Payment    │      │
│  │   Service    │  │   Service    │  │ Verification │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Form Builder │  │ Notification │  │   QR Code    │      │
│  │   Service    │  │   Service    │  │  Generator   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
Note: Payment Verification handles manual payment confirmation.
Automated payment via Stripe Connect is planned for future release.
                            │
                    ┌───────▼────────┐
                    │  Drizzle ORM   │
                    │   PostgreSQL   │
                    └────────────────┘
```

### Data Flow

```
Registration Configuration Flow:
President → Settings UI → Registration Service → Database

Join Request Submission Flow:
User → Public Join Page → Form Renderer → Validation → Join Request Service →
Database → Notification Service (with payment instructions if enabled) → Confirmation

Join Request Approval Flow:
President → Join Request Management → Approval Action → Join Request Service →
Member Service → Database → Notification Service → Welcome Email

QR Code Generation Flow:
President → Settings UI → QR Code Generator → PNG/Print Output
```

## Components and Interfaces

### Frontend Components

#### 1. RegistrationSettings Component
Configuration interface for society presidents to set up registration.

```typescript
interface RegistrationSettingsProps {
  societyId: string
  onSave?: () => void
}
```

#### 2. PublicJoinPage Component
Public-facing registration page accessible via QR code or URL.

```typescript
interface PublicJoinPageProps {
  societySlug: string
}
```

#### 3. JoinRequestManagement Component
Admin interface for viewing and managing join requests.

```typescript
interface JoinRequestManagementProps {
  societyId: string
  filters?: JoinRequestFilters
}
```

#### 4. JoinRequestDetail Component
Detailed view of a single join request with approval actions.

```typescript
interface JoinRequestDetailProps {
  requestId: string
  onApprove?: () => void
  onReject?: () => void
}
```

#### 5. QRCodeDisplay Component
Displays and provides download/print options for registration QR code.

```typescript
interface QRCodeDisplayProps {
  registrationUrl: string
  societyName: string
  societyLogo?: string
}
```

#### 6. RegistrationAnalytics Component
Dashboard showing registration metrics and trends.

```typescript
interface RegistrationAnalyticsProps {
  societyId: string
  dateRange?: { start: Date; end: Date }
}
```

#### 7. BulkActionToolbar Component
Toolbar for performing bulk operations on join requests.

```typescript
interface BulkActionToolbarProps {
  selectedRequests: string[]
  onBulkApprove: () => void
  onBulkReject: () => void
  onClearSelection: () => void
}
```

#### 8. RegistrationStatusBadge Component
Visual indicator of registration status for users.

```typescript
interface RegistrationStatusBadgeProps {
  status: 'pending' | 'payment_pending' | 'approved' | 'rejected'
  showActions?: boolean
}
```

### Backend Services

#### 1. RegistrationService
Manages registration configuration and settings.

```typescript
class RegistrationService {
  async getRegistrationSettings(societyId: string): Promise<RegistrationSettings>
  async updateRegistrationSettings(societyId: string, settings: UpdateRegistrationSettingsInput): Promise<RegistrationSettings>
  async generateRegistrationUrl(societyId: string): Promise<string>
  async isRegistrationOpen(societyId: string): Promise<boolean>
  async checkCapacity(societyId: string): Promise<{ current: number; max: number | null; isFull: boolean }>
}
```

#### 2. JoinRequestService
Handles join request creation, approval, and management.

```typescript
class JoinRequestService {
  async createJoinRequest(societyId: string, userId: string, formResponseId: string): Promise<JoinRequest>
  async getJoinRequest(requestId: string): Promise<JoinRequest>
  async listJoinRequests(societyId: string, filters: JoinRequestFilters): Promise<JoinRequest[]>
  async approveJoinRequest(requestId: string, approverId: string): Promise<void>
  async rejectJoinRequest(requestId: string, reason?: string): Promise<void>
  async bulkApproveRequests(requestIds: string[], approverId: string): Promise<BulkOperationResult>
  async bulkRejectRequests(requestIds: string[], reason?: string): Promise<BulkOperationResult>
  async getUserJoinRequestStatus(userId: string, societyId: string): Promise<JoinRequestStatus | null>
}
```

#### 3. QRCodeService
Generates QR codes for registration URLs.

```typescript
class QRCodeService {
  async generateQRCode(url: string, options?: QRCodeOptions): Promise<Buffer>
  async generatePrintableQRCode(url: string, societyInfo: SocietyInfo): Promise<string> // Returns HTML
}
```

#### 4. RegistrationAnalyticsService
Provides analytics and metrics for registration.

```typescript
class RegistrationAnalyticsService {
  async getRegistrationMetrics(societyId: string): Promise<RegistrationMetrics>
  async getApplicationTrends(societyId: string, dateRange: DateRange): Promise<TrendData[]>
  async getApprovalMetrics(societyId: string): Promise<ApprovalMetrics>
  async getFormCompletionRate(formId: string): Promise<number>
}
```

## Data Models

### Database Schema

#### Registration Settings Table
```typescript
const registrationSettings = pgTable('registration_settings', {
  id: primaryId,
  societyId: text('society_id').notNull().references(() => organization.id, { onDelete: 'cascade' }).unique(),

  // Basic Settings
  isEnabled: boolean('is_enabled').default(false).notNull(),
  approvalMode: text('approval_mode', { enum: ['auto', 'manual'] }).default('manual').notNull(),
  formId: text('form_id').references(() => forms.id),

  // Capacity
  maxCapacity: integer('max_capacity'),

  // Registration Period
  startDate: timestamp('start_date', { withTimezone: true }),
  endDate: timestamp('end_date', { withTimezone: true }),

  // Customization
  welcomeMessage: text('welcome_message'),
  customBanner: text('custom_banner'),

  // State
  isPaused: boolean('is_paused').default(false).notNull(),

  ...timestamps
})
```

#### Join Requests Table
```typescript
const joinRequests = pgTable('join_requests', {
  id: primaryId,
  societyId: text('society_id').notNull().references(() => organization.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id),
  formResponseId: text('form_response_id').notNull().references(() => formResponses.id),

  // Status
  status: text('status', {
    enum: ['pending', 'payment_pending', 'payment_completed', 'approved', 'rejected']
  }).default('pending').notNull(),

  // Payment (Manual Verification)
  // Note: Payment is manually verified by presidents. Automated payment via Stripe Connect is future enhancement.
  paymentStatus: text('payment_status', {
    enum: ['not_required', 'pending', 'verified', 'not_verified']
  }).default('not_required').notNull(),
  paymentAmount: decimal('payment_amount', { precision: 10, scale: 2 }),
  paymentVerifiedBy: text('payment_verified_by').references(() => user.id),
  paymentVerifiedAt: timestamp('payment_verified_at', { withTimezone: true }),
  paymentNotes: text('payment_notes'), // Notes from president about payment verification

  // Approval/Rejection
  reviewedBy: text('reviewed_by').references(() => user.id),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  rejectionReason: text('rejection_reason'),

  // Metadata
  submittedAt: timestamp('submitted_at', { withTimezone: true }).notNull().defaultNow(),

  ...timestamps
}, (table) => [
  index('join_requests_society_id_idx').on(table.societyId),
  index('join_requests_user_id_idx').on(table.userId),
  index('join_requests_status_idx').on(table.status),
  index('join_requests_submitted_at_idx').on(table.submittedAt)
])
```

### TypeScript Interfaces

```typescript
interface RegistrationSettings {
  id: string
  societyId: string
  isEnabled: boolean
  approvalMode: 'auto' | 'manual'
  formId?: string
  maxCapacity?: number
  startDate?: Date
  endDate?: Date
  welcomeMessage?: string
  customBanner?: string
  isPaused: boolean
  createdAt: Date
  updatedAt: Date
}

interface JoinRequest {
  id: string
  societyId: string
  userId: string
  formResponseId: string
  status: 'pending' | 'payment_pending' | 'payment_completed' | 'approved' | 'rejected'
  paymentStatus: 'not_required' | 'pending' | 'verified' | 'not_verified'
  paymentVerifiedBy?: string
  paymentVerifiedAt?: Date
  paymentNotes?: string
  paymentAmount?: number
  reviewedBy?: string
  reviewedAt?: Date
  rejectionReason?: string
  submittedAt: Date
  createdAt: Date
  updatedAt: Date
}

interface JoinRequestFilters {
  status?: JoinRequest['status'][]
  paymentStatus?: JoinRequest['paymentStatus'][]
  dateFrom?: Date
  dateTo?: Date
  searchQuery?: string
}

interface RegistrationMetrics {
  totalApplications: number
  pendingCount: number
  approvedCount: number
  rejectedCount: number
  approvalRate: number
  averageTimeToApproval: number // in hours
}

interface BulkOperationResult {
  successful: number
  failed: number
  errors: Array<{ requestId: string; error: string }>
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Core Registration Properties

Property 1: Registration Toggle Consistency
*For any* society, enabling or disabling registration should immediately affect the ability to submit new join requests
**Validates: Requirements 1.2**

Property 2: Approval Mode Selection Availability
*For any* society with registration enabled, the system should allow selecting between auto-approve and manual review modes
**Validates: Requirements 1.3**

Property 3: Form Selection Availability
*For any* society during registration configuration, the system should allow selecting or creating a registration form
**Validates: Requirements 1.4**

Property 4: Form Entity Type Assignment
*For any* registration form created through the registration settings, the entity type should be set to "society_registration"
**Validates: Requirements 2.1**

Property 5: Smart Field Pre-population
*For any* new registration form, common member data smart fields should be automatically added
**Validates: Requirements 2.2**

Property 6: Form-Society Association (Round-trip)
*For any* registration form, saving it should associate it with the society, and retrieving the society's forms should include it
**Validates: Requirements 2.3**

Property 7: Saved Form Availability
*For any* saved registration form, it should appear in the form selection list for that society
**Validates: Requirements 2.4**

Property 8: Payment Configuration Synchronization
*For any* registration form with payment enabled, the registration fee should automatically match the form's payment amount
**Validates: Requirements 2.5**

Property 9: Unique Registration URL Generation
*For any* society with registration enabled, a unique registration URL should be generated in the format "/join/[societySlug]"
**Validates: Requirements 3.1**

Property 10: QR Code URL Round-trip
*For any* generated QR code, decoding it should yield the correct registration URL for that society
**Validates: Requirements 3.5**

Property 11: Registration Page Routing
*For any* valid society slug, visiting "/join/[societySlug]" should display the society's registration page
**Validates: Requirements 4.1**

Property 12: Registration Closed Display
*For any* society with registration disabled, the registration page should display a closed message and not show the join form
**Validates: Requirements 4.2**

Property 13: Registration Enabled Display
*For any* society with registration enabled, the registration page should display society information and a join button
**Validates: Requirements 4.3**

### Form Submission Properties

Property 14: Smart Field Auto-fill
*For any* registration form with smart fields, authenticated users should have those fields automatically populated with their profile data
**Validates: Requirements 5.2**

Property 15: Payment Fee Display
*For any* registration form with payment enabled, the registration page should display the fee amount
**Validates: Requirements 5.3**

Property 16: Required Field Validation
*For any* form submission, all required fields must be validated before creating a join request
**Validates: Requirements 5.4**

Property 17: Join Request Creation on Valid Submission
*For any* valid form submission, a join request record with status "pending" should be created
**Validates: Requirements 5.5**

Property 18: Payment Redirect on Payment-Enabled Forms
*For any* form submission where payment is enabled, the system should redirect to the payment gateway
**Validates: Requirements 6.1**

Property 19: Payment Success Status Update
*For any* successful payment, the join request status should be updated to "payment_completed"
**Validates: Requirements 6.2**

Property 20: Payment Failure Status Preservation
*For any* failed payment, the join request should remain in "pending_payment" status
**Validates: Requirements 6.3**

Property 21: Payment Confirmation Email
*For any* completed payment, a confirmation email should be sent to the user
**Validates: Requirements 6.4**

Property 22: Auto-approval on Payment Completion
*For any* society with auto-approval enabled, when payment is completed, the join request should be automatically approved
**Validates: Requirements 6.5**

### Join Request Management Properties

Property 23: Join Request Filtering
*For any* filter applied to join requests, all returned results should match the filter criteria
**Validates: Requirements 7.3**

Property 24: Join Request Sorting
*For any* join request list sorted by submission date, the results should be in chronological order
**Validates: Requirements 7.4**

Property 25: New Request Notification Badge
*For any* new join request submission, a notification badge should appear for society presidents
**Validates: Requirements 7.5**

Property 26: Join Request Detail Display
*For any* join request, the detail view should include applicant profile information, payment status, and metadata
**Validates: Requirements 8.2, 8.3, 8.5**

Property 27: Pending Request Action Buttons
*For any* join request with status "pending" or "payment_completed", the detail view should display approve and reject buttons
**Validates: Requirements 8.4**

### Approval and Rejection Properties

Property 28: Membership Creation on Approval
*For any* approved join request, a membership record with role "member" should be created
**Validates: Requirements 9.2**

Property 29: Status Update on Approval
*For any* approved join request, the status should be updated to "approved"
**Validates: Requirements 9.3**

Property 30: Welcome Email on Approval
*For any* approved join request, a welcome email should be sent to the new member
**Validates: Requirements 9.4**

Property 31: Member Count Increment (Invariant)
*For any* society, the member count should always equal the number of approved join requests
**Validates: Requirements 9.5**

Property 32: Status Update on Rejection
*For any* rejected join request, the status should be updated to "rejected"
**Validates: Requirements 10.2**

Property 33: Rejection Notification Email
*For any* rejected join request, a notification email should be sent to the applicant
**Validates: Requirements 10.3**

Property 34: Rejection Reason Inclusion
*For any* rejection with a provided reason, the notification email should include that reason
**Validates: Requirements 10.4**

Property 35: No Membership on Rejection (Invariant)
*For any* rejected join request, no membership record should be created
**Validates: Requirements 10.5**

### Capacity and Period Properties

Property 36: Capacity Display Calculation
*For any* society with capacity set, the displayed remaining slots should equal max capacity minus current member count
**Validates: Requirements 11.2**

Property 37: Automatic Closure on Capacity Reached
*For any* society, when member count reaches max capacity, registration should automatically close
**Validates: Requirements 11.3**

Property 38: Registration Full Message Display
*For any* society at capacity, the registration page should display "Registration Full" message
**Validates: Requirements 11.4**

Property 39: Automatic Reopening on Capacity Available
*For any* society that was at capacity, when a member leaves, registration should automatically reopen
**Validates: Requirements 11.5**

Property 40: Time-based Registration Access (Before Start)
*For any* society where current time is before the start date, the registration page should display "Registration Opens On [Date]" and not accept submissions
**Validates: Requirements 12.3**

Property 41: Time-based Registration Access (After End)
*For any* society where current time is after the end date, the registration page should display "Registration Closed" and not accept submissions
**Validates: Requirements 12.4**

Property 42: Time-based Registration Access (Active Period)
*For any* society where current time is within the registration period, new submissions should be accepted
**Validates: Requirements 12.5**

### Notification and Confirmation Properties

Property 43: Conditional Confirmation Message (Auto-approval)
*For any* society with auto-approval enabled, successful submission should display "Welcome! You are now a member"
**Validates: Requirements 13.2**

Property 44: Conditional Confirmation Message (Manual Review)
*For any* society with manual approval, successful submission should display "Your request is under review"
**Validates: Requirements 13.3**

Property 45: Conditional Confirmation Message (Payment Required)
*For any* form with payment enabled, successful submission should display payment instructions
**Validates: Requirements 13.4**

Property 46: Submission Confirmation Email
*For any* registration submission, a confirmation email should be sent to the user
**Validates: Requirements 13.5**

Property 47: President Notification on New Request
*For any* new join request, an email notification should be sent to all society presidents
**Validates: Requirements 14.1**

Property 48: Payment Details in Notification
*For any* join request with payment, the notification email should include payment details
**Validates: Requirements 14.2**

Property 49: In-app Notification Creation
*For any* join request submission, an in-app notification should be created for society presidents
**Validates: Requirements 14.5**

### Bulk Operations Properties

Property 50: Bulk Action Button Display
*For any* selection of multiple join requests, bulk action buttons should be displayed
**Validates: Requirements 15.2**

Property 51: Bulk Approval Processing
*For any* set of selected join requests, bulk approval should process all of them and create membership records
**Validates: Requirements 15.3**

Property 52: Bulk Operation Summary
*For any* completed bulk operation, a summary of successful and failed operations should be displayed
**Validates: Requirements 15.5**

### Status Tracking Properties

Property 53: User Status Display
*For any* user with a submitted join request, their profile should display the current request status
**Validates: Requirements 16.1**

Property 54: Status Mapping Display
*For any* join request, the displayed status should correctly map to one of: "Pending Review", "Payment Required", "Approved", or "Rejected"
**Validates: Requirements 16.2**

Property 55: Payment Button Display
*For any* join request with status "pending_payment", a "Complete Payment" button should be displayed
**Validates: Requirements 16.3**

Property 56: Society View Button Display
*For any* approved join request, a "View Society" button should be displayed
**Validates: Requirements 16.4**

Property 57: Rejection Reason Display
*For any* rejected join request with a reason, the reason should be displayed to the user
**Validates: Requirements 16.5**

### Customization Properties

Property 58: Primary Color Theme Application
*For any* society registration page, buttons and accents should use the society's primary color
**Validates: Requirements 17.3**

Property 59: Custom Welcome Message Display
*For any* society with a custom welcome message set, the registration page should display it
**Validates: Requirements 17.4**

Property 60: Default Banner Fallback
*For any* society without a custom banner, the registration page should use the society's default banner
**Validates: Requirements 17.5**

### Export and Data Integrity Properties

Property 61: Export Data Completeness
*For any* export operation, all form responses and metadata should be included in the exported file
**Validates: Requirements 18.3**

Property 62: Payment Information in Export
*For any* export where join requests include payment, payment information should be included
**Validates: Requirements 18.4**

Property 63: Form Response Creation on Join Request
*For any* created join request, a corresponding form response record should also be created
**Validates: Requirements 19.1**

Property 64: Join Request Relationship Integrity
*For any* created join request, it should be properly linked to both the society and the user
**Validates: Requirements 19.2**

Property 65: Status Synchronization on Approval
*For any* approved join request, both the join request and form response status should be updated
**Validates: Requirements 19.3**

Property 66: Form Response Data Inclusion
*For any* join request query, the returned data should include all associated form response data
**Validates: Requirements 19.4**

Property 67: Cascade Delete on Society Deletion
*For any* deleted society, all associated join requests should be cascade deleted
**Validates: Requirements 19.5**

### Preview and Versioning Properties

Property 68: Preview Mode Isolation
*For any* form submission in preview mode, no data should be saved to the database
**Validates: Requirements 20.4**

Property 69: Member Count Display
*For any* registration page, the displayed member count should match the actual number of approved members
**Validates: Requirements 21.2**

Property 70: Conditional Data Display (Meeting Schedule)
*For any* society with meeting schedule set, the registration page should display it
**Validates: Requirements 21.3**

Property 71: Conditional Data Display (Membership Requirements)
*For any* society with membership requirements set, the registration page should display them
**Validates: Requirements 21.4**

Property 72: Social Links Display
*For any* society with social links set, the registration page should display them
**Validates: Requirements 21.5**

Property 73: Form Version Creation on Edit
*For any* published registration form that is edited, a new version should be created
**Validates: Requirements 22.1**

Property 74: Version Isolation for New Submissions
*For any* form with multiple versions, new submissions should use the latest version while existing submissions retain their original version
**Validates: Requirements 22.2**

Property 75: Version Tracking Display
*For any* join request, the system should indicate which form version was used
**Validates: Requirements 22.3**

Property 76: Form Update Notification
*For any* updated registration form, the society president should receive a notification
**Validates: Requirements 22.4**

Property 77: Version-specific Question Display
*For any* form response, the displayed questions should match the version used at submission time
**Validates: Requirements 22.5**

### Pause and Progress Properties

Property 78: Paused Registration Message Display
*For any* society with registration paused, the registration page should display "Registration Temporarily Paused"
**Validates: Requirements 23.2**

Property 79: Submission Blocking When Paused
*For any* society with registration paused, new submissions should not be accepted
**Validates: Requirements 23.3**

Property 80: Configuration Preservation During Pause
*For any* society with registration paused, all settings and form configuration should be preserved
**Validates: Requirements 23.4**

Property 81: Submission Acceptance on Resume
*For any* society with registration resumed, new submissions should be immediately accepted
**Validates: Requirements 23.5**

Property 82: Progress Restoration (Round-trip)
*For any* user with saved registration progress, returning to the form should restore all previously entered data
**Validates: Requirements 24.2**

Property 83: Continuation Message Display
*For any* restored registration progress, a "Continue where you left off" message should be displayed
**Validates: Requirements 24.3**

Property 84: Progress Cleanup on Submission
*For any* submitted registration, the saved progress should be cleared
**Validates: Requirements 24.4**

### Analytics Properties

Property 85: Application Metrics Display
*For any* society, the analytics dashboard should display total applications, approval rate, and rejection rate
**Validates: Requirements 25.2**

Property 86: Time-series Application Data
*For any* date range, the analytics should display applications over time as a chart
**Validates: Requirements 25.3**

Property 87: Average Approval Time Calculation
*For any* society, the analytics should display the average time from submission to approval
**Validates: Requirements 25.4**

Property 88: Form Completion Rate Calculation
*For any* registration form, the analytics should display the completion rate and drop-off points
**Validates: Requirements 25.5**

## Error Handling

### Validation Errors
- Invalid society slug → 404 Not Found
- Registration disabled → Display closed message
- Capacity reached → Display full message
- Outside registration period → Display period message
- Missing required fields → Display field-specific errors
- Invalid payment amount → Display payment error

### Authorization Errors
- Non-president accessing settings → 403 Forbidden
- Non-member accessing member-only content → 401 Unauthorized
- Invalid approval permissions → 403 Forbidden

### Payment Errors
- Payment gateway timeout → Retry mechanism
- Payment declined → Allow retry with saved form data
- Payment webhook failure → Queue for retry

### Data Integrity Errors
- Duplicate join request → Display existing request status
- Form not found → Display error and redirect to settings
- Society not found → 404 Not Found
- Orphaned form response → Log error and notify admin

## Testing Strategy

### Unit Testing
- Registration settings CRUD operations
- Join request status transitions
- Capacity calculations
- Date range validations
- QR code generation
- URL slug generation
- Bulk operation logic
- Analytics calculations

### Property-Based Testing
The system will use **fast-check** (TypeScript/JavaScript property-based testing library) to verify correctness properties. Each property test will:
- Run a minimum of 100 iterations
- Generate random test data (societies, users, forms, join requests)
- Verify the property holds across all generated inputs
- Be tagged with the property number and requirement reference

Example property test structure:
```typescript
/**
 * Feature: society-member-registration, Property 31: Member Count Increment
 * Validates: Requirements 9.5
 */
test('member count equals approved join requests', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.record({
        society: arbitrarySociety(),
        joinRequests: fc.array(arbitraryJoinRequest(), { minLength: 1, maxLength: 20 })
      }),
      async ({ society, joinRequests }) => {
        // Approve random subset of requests
        const approvedRequests = joinRequests.filter(() => Math.random() > 0.5)
        for (const request of approvedRequests) {
          await joinRequestService.approveJoinRequest(request.id, 'admin-id')
        }

        // Verify member count matches approved requests
        const memberCount = await getMemberCount(society.id)
        expect(memberCount).toBe(approvedRequests.length)
      }
    ),
    { numRuns: 100 }
  )
})
```

### Integration Testing
- End-to-end registration flow
- Payment gateway integration
- Email notification delivery
- Form builder integration
- QR code scanning and redirect
- Bulk approval workflow
- Analytics data aggregation

### Edge Cases
- Registration at exact capacity limit
- Registration at exact start/end time
- Concurrent join request submissions
- Form version changes during active registration
- Payment retry after form expiration
- Bulk operations with mixed success/failure
- QR code generation with special characters in society name

## Performance Considerations

### Database Optimization
- Index on `join_requests.society_id` for fast filtering
- Index on `join_requests.status` for status-based queries
- Index on `join_requests.submitted_at` for time-based sorting
- Composite index on `(society_id, status)` for common queries
- Pagination for large join request lists

### Caching Strategy
- Cache registration settings (5 minute TTL)
- Cache society information (10 minute TTL)
- Cache member count (1 minute TTL, invalidate on approval)
- Cache QR code images (indefinite, invalidate on URL change)
- Cache analytics data (15 minute TTL)

### Real-time Updates
- Use Centrifugo for real-time notification badges
- WebSocket connection for join request list updates
- Optimistic UI updates for approval/rejection actions
- Background job for email notifications (non-blocking)

## Security Considerations

### Access Control
- Only society presidents can access registration settings
- Only society presidents can approve/reject join requests
- Public registration page accessible to all authenticated users
- Rate limiting on join request submissions (1 per user per society)

### Data Validation
- Sanitize all user input to prevent XSS
- Validate society slug format
- Verify user is not already a member before allowing submission
- Verify payment amount matches form configuration
- Validate date ranges (start < end)

### Payment Security
- Use payment gateway's secure redirect
- Verify webhook signatures
- Store only payment intent IDs, not card details
- Implement idempotency for payment processing
- Log all payment transactions for audit

## Integration Points

### Form Builder System
- Reuses Form Builder for creating registration forms
- Leverages smart field auto-fill functionality
- Uses form validation engine
- Shares form response storage

### Better Auth
- Uses organization/member tables for membership management
- Leverages invitation system for alternative join flow
- Uses session management for authentication
- Integrates with role-based permissions

### Payment Gateway (Stripe)
- Creates payment intents for registration fees
- Handles payment confirmation webhooks
- Supports payment retry mechanism
- Provides transaction history

### Notification System
- Email notifications for join requests
- Email confirmations for submissions
- Welcome emails for approved members
- In-app notifications for presidents

## Deployment Considerations

### Database Migrations
1. Create `registration_settings` table
2. Create `join_requests` table
3. Add indexes for performance
4. Seed default registration settings for existing societies

### Feature Flags
- `enable_registration_system` - Master toggle for the feature
- `enable_auto_approval` - Allow auto-approval mode
- `enable_registration_analytics` - Enable analytics dashboard
- `enable_qr_code_generation` - Enable QR code features

### Monitoring
- Track join request submission rate
- Monitor payment success/failure rates
- Alert on high rejection rates
- Track QR code generation requests
- Monitor email delivery success rates

### Rollback Plan
- Feature can be disabled via feature flag
- Existing join requests preserved
- Membership records remain intact
- Forms remain accessible for viewing

## Future Enhancements

### Phase 2 Features
- Custom approval workflows (multi-stage approval)
- Interview scheduling integration
- Conditional acceptance (e.g., "accepted pending payment")
- Waitlist management when at capacity
- Referral tracking (who invited whom)

### Phase 3 Features
- A/B testing for registration forms
- Advanced analytics (conversion funnels, drop-off analysis)
- Integration with university student databases
- Automated background checks
- Batch import of members from CSV

### Potential Integrations
- Calendar integration for event-based registration
- Payment plan support (installments)
- Document verification (student ID upload)
- Video interview integration
- SMS notifications
