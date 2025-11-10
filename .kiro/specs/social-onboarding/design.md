# Design Document: Social Onboarding Flow

## Overview

This document provides the technical design for implementing a social onboarding flow with Google OAuth and university email verification using 6-digit OTP codes.

## Architecture

### System Components

1. **Better-Auth** - Handles Google OAuth authentication
2. **ORPC API** - Type-safe API endpoints for onboarding
3. **usesend** - Email delivery service for OTP codes
4. **PostHog** - Analytics and event tracking
5. **PostgreSQL** - Data persistence via Drizzle ORM

### Data Flow

```
User → Google OAuth → Better-Auth → Redirect to /onboarding
User → Onboarding Form → ORPC API → Validate Email Domain
ORPC API → Generate OTP → Store Hashed OTP → Send Email via Resend
User → Enter OTP → ORPC API → Verify OTP → Update User → Redirect to /spaces
```

## Database Schema

### Extended User Table

Add new fields to the existing `user` table in `apps/server/src/db/schema/auth.ts`:

```typescript
export const user = pgTable('user', {
  // ... existing fields (id, name, username, email, image, etc.) ...

  // Onboarding fields
  universityEmail: text('university_email').unique(),
  universityId: text('university_id').references(() => university.id),
  major: text('major'),
  yearOfStudy: text('year_of_study'),
  interests: text('interests').array(),

  // Verification status
  isVerified: boolean('is_verified').default(false).notNull()

  // ... existing timestamps ...
})
```

**Design Rationale**: We only add `isVerified` to track university email verification status. This is separate from Better-Auth's `emailVerified` field (which tracks the Google OAuth email). We deliberately avoid adding `isFirstLogin` or `profileCompleted` fields to the database - these states are tracked client-side in localStorage for a lighter implementation. The onboarding flow is not strictly required since users can complete their profile and verify their email from the profile page at any time.

### Verification OTP Table

**Design Decision**: Reuse the existing `verification` table from Better-Auth for storing 6-digit OTP codes instead of tokens. This reduces schema complexity and leverages the existing verification infrastructure.

The existing `verification` table structure:

```typescript
export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(), // Will store userId
  value: text('value').notNull(), // Will store hashed 6-digit OTP
  expiresAt: timestamp('expires_at').notNull(),
  ...timestamps
})
```

**Usage Pattern**:

- `identifier`: Store the user ID to link verification to a specific user
- `value`: Store the hashed 6-digit OTP code (SHA-256)
- `expiresAt`: Set to 10 minutes from creation (shorter window for OTP security)
- After successful verification, delete the record (single-use enforcement)

**OTP Generation**:

- Generate a random 6-digit numeric code (000000-999999)
- Hash the OTP before storing in database
- Send plain OTP to user's university email
- User enters OTP in verification form

**Rationale**: Using a 6-digit OTP provides better UX than clicking email links (especially on mobile), maintains security through short expiration and hashing, and reuses the existing verification infrastructure.

### University Email Validation

**Note on University Email Validation**: The `university` table already contains a `validEmailDomains` field (text array) that stores acceptable email domains for each university. The onboarding validation will check that the provided `universityEmail` ends with one of the domains in this array for the selected university.

## API Design

### ORPC Contracts

Location: `packages/orpc-contracts/src/user/onboarding.ts`

```typescript
import { oc } from '@orpc/contract'
import { z } from 'zod'

export const onboarding = {
  submit: oc
    .route({
      method: 'POST',
      description: 'Submit user onboarding information and send verification OTP',
      summary: 'Submit Onboarding',
      tags: ['User', 'Onboarding']
    })
    .input(
      z.object({
        displayName: z.string().min(1).max(50),
        profileImageUrl: z.string().url().optional(),
        universityEmail: z.string().email(),
        universityId: z.string(),
        major: z.string().optional(),
        yearOfStudy: z.enum(['1', '2', '3', '4', 'graduate', 'phd']).optional(),
        interests: z.array(z.string()).max(10).optional()
      })
    )
    .output(z.object({ success: z.boolean() }))
    .errors({
      INVALID_UNIVERSITY_DOMAIN: { ... },
      UNIVERSITY_EMAIL_TAKEN: { ... }
    }),

  verifyEmail: oc
    .route({
      method: 'POST',
      description: 'Verify university email with OTP code',
      summary: 'Verify Email OTP',
      tags: ['User', 'Onboarding']
    })
    .input(z.object({ otp: z.string().length(6).regex(/^\d{6}$/) }))
    .output(z.object({ success: z.boolean(), verified: z.boolean() }))
    .errors({
      TOKEN_INVALID: { ... },
      TOKEN_EXPIRED: { ... }
    }),

  resendVerification: oc
    .route({
      method: 'POST',
      description: 'Resend verification OTP to university email',
      summary: 'Resend Verification OTP',
      tags: ['User', 'Onboarding']
    })
    .input(z.object({}))
    .output(z.object({ success: z.boolean() }))
    .errors({ USER_NOT_FOUND: { ... } }),

  getStatus: oc
    .route({
      method: 'GET',
      description: 'Get user onboarding status',
      summary: 'Get Onboarding Status',
      tags: ['User', 'Onboarding']
    })
    .output(
      z.object({
        isVerified: z.boolean(),
        hasUniversityEmail: z.boolean(),
        needsOnboarding: z.boolean()
      })
    )
}
```

### Backend Implementation

Location: `apps/server/src/routers/user/onboarding.ts`

Key implementation details:

1. Validate university email domain against university's `validEmailDomains`
2. Generate 6-digit OTP and hash with SHA-256
3. Store hashed OTP in verification table with 10-minute expiration
4. Send OTP via usesend email service
5. Emit events to PostHog for analytics
6. On verification, update user's `isVerified` field and delete OTP record

## Frontend Design

### Onboarding Page

Location: `apps/web/src/app/onboarding/page.tsx`

Features:

- Multi-step form with React Hook Form + Zod validation
- University selection dropdown (populated via ORPC)
- Profile image upload (optional)
- Interests multi-select
- OTP verification UI after form submission
- localStorage tracking for `profile_completed` flag

**Design Rationale**: Using localStorage for tracking profile completion provides a lightweight client-side solution for the initial onboarding flow. This avoids adding another database field while still preventing users from seeing the onboarding form repeatedly. The server-side `isVerified` field remains the source of truth for access control.

### Verification Components

1. **VerificationPending** (`apps/web/src/components/verification-pending.tsx`)

   - Reusable OTP input component
   - Resend OTP button
   - Can be used on onboarding page and profile page

2. **FeatureGate** (`apps/web/src/components/feature-gate.tsx`)
   - Wraps student-only features
   - Shows modal for unverified users
   - Displays verification badge

### Profile Page Integration

Location: `apps/web/src/app/profile/page.tsx`

- Shows verification status banner if not verified
- Displays verification badge
- Allows users to complete verification post-onboarding

## Email Service

### OTP Email Template

Location: `apps/server/src/services/email/templates/otp.ts`

Features:

- Styled HTML email with gradient header
- Large, centered 6-digit OTP code
- Clear expiration notice (10 minutes)
- Plain text fallback

### Resend Integration

Location: `apps/server/src/services/email/sender.ts`

```typescript
export async function sendOTPEmail(params: {
  to: string
  displayName: string
  otp: string
}): Promise<void>
```

**Design Decision**: Using Resend as the email provider per requirements. The OTP is sent as a 6-digit code in the email body, providing better UX than clicking links (especially on mobile). The 10-minute expiration balances security with user convenience.

## Authentication Integration

### Better-Auth Configuration

Location: `apps/server/src/lib/auth.ts`

1. **User Creation Hook**: Set `isVerified: false` and emit `user.created` event
2. **Redirect Logic**: Check for `universityEmail` to determine if user needs onboarding
3. **Custom Session**: Include full user object with `isVerified` field

## Analytics & Monitoring

### PostHog Integration

Location: `apps/server/src/lib/events.ts`

Events tracked:

- `user.created` - When user signs up via Google
- `user.onboarding_submitted` - When user submits onboarding form
- `user.verified` - When user completes email verification

**Design Decision**: Using PostHog for all analytics tracking, event logging, and funnel analysis. PostHog provides event capture, funnel analysis, user property tracking, and built-in dashboards. This eliminates the need for a separate audit log table.

## Security Considerations

### OTP Security

- Generate 6-digit random numeric codes
- Store hashed OTPs in database (SHA-256)
- Implement OTP expiration (10 minutes)
- Single-use OTPs (deleted after successful verification)
- Short expiration window reduces attack surface

### Email Validation

- Validate email domain against university's approved domains
- Check for duplicate university emails
- Prevent email enumeration attacks

## Performance Optimization

### Database Optimization

- Index on `universityEmail` for fast lookups
- Index on `identifier` in verification table for OTP validation
- Index on `value` in verification table for hashed OTP lookups

### Caching Strategy

- Cache university list for dropdown (1 hour TTL)
- Store `profile_completed` flag in localStorage for client-side tracking
- Invalidate localStorage on profile updates

## Error Handling

Error codes:

- `VALIDATION_ERROR` - Form validation failed
- `TOKEN_EXPIRED` - OTP has expired
- `TOKEN_INVALID` - OTP doesn't match
- `UNIVERSITY_EMAIL_TAKEN` - Email already registered
- `INVALID_UNIVERSITY_DOMAIN` - Email domain not valid for university
- `USER_NOT_FOUND` - User or university email not found

## Testing Strategy

### Unit Tests

- OTP generation and hashing
- Email domain validation
- OTP expiration logic

### Integration Tests

- Complete onboarding flow
- OTP verification flow
- Resend OTP functionality
- Error scenarios

### E2E Tests

- Happy path: Sign in → Onboard → Verify → Access features
- Edge cases: Expired OTP, invalid OTP, resend flow

## Future Enhancements

1. **Rate Limiting** - Add rate limiting for OTP requests (deferred to future iteration)
2. **ClickHouse Integration** - Advanced analytics and querying (deferred)
3. **SMS Verification** - Alternative verification method
4. **Multi-university Support** - Allow users to verify multiple universities
