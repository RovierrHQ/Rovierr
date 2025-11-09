# Implementation Plan: Social Onboarding Flow

## Overview

This implementation plan breaks down the social onboarding feature into discrete, manageable coding tasks. Each task builds incrementally on previous steps, ensuring all code is integrated and functional.

## Tasks

- [x] 1. Database schema updates and migrations
  - Add new fields to user table: `universityEmail`, `universityId`, `major`, `yearOfStudy`, `interests`, `isVerified`
  - Create database migration file using Drizzle Kit
  - Run migration to update schema
  - _Requirements: 2.3, 3.1, 4.2_

- [x] 2. Create ORPC contracts for onboarding endpoints
  - [x] 2.1 Create onboarding contract file
    - Create `packages/orpc-contracts/src/user/onboarding.ts`
    - Define `submit`, `verifyEmail`, `resendVerification`, and `getStatus` endpoints using `oc.route()` pattern
    - Include proper input/output schemas and error definitions
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3_

  - [x] 2.2 Export user contracts
    - Create/update `packages/orpc-contracts/src/user/index.ts`
    - Export onboarding contracts as `user.onboarding`
    - _Requirements: 2.1_

- [x] 3. Implement server-side utilities and helpers
  - [x] 3.1 Create OTP generation utility
    - Create `apps/server/src/lib/utils.ts` (if not exists)
    - Implement `generateOTP()` function for 6-digit codes
    - Implement OTP hashing function using SHA-256
    - _Requirements: 3.1, 3.5_

  - [x] 3.2 Create university email validation utility
    - Implement `validateUniversityEmail()` function
    - Check email domain against university's `validEmailDomains` array
    - _Requirements: 2.5_

  - [x] 3.3 Create PostHog event emission system
    - Create `apps/server/src/lib/events.ts`
    - Implement `emitEvent()` function with PostHog integration
    - Add `shutdownEvents()` helper for cleanup
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 4. Implement email service with Resend
  - [x] 4.1 Create OTP email template
    - Create `apps/server/src/services/email/templates/otp.ts`
    - Implement `generateOTPEmail()` function with HTML and text versions
    - _Requirements: 3.2_

  - [x] 4.2 Create email sender service
    - Create `apps/server/src/services/email/sender.ts`
    - Implement `sendOTPEmail()` function using Resend SDK
    - Add error handling and logging
    - _Requirements: 3.2_

- [x] 5. Implement onboarding API endpoints
  - [x] 5.1 Create submit onboarding endpoint
    - Create `apps/server/src/routers/user/onboarding.ts`
    - Implement `submit` handler with university email validation
    - Update user record with onboarding data
    - Generate and store hashed OTP in verification table
    - Send OTP email via Resend
    - Emit `user.onboarding_submitted` event to PostHog
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.6, 3.1, 3.2, 5.2_

  - [x] 5.2 Create verify email endpoint
    - Implement `verifyEmail` handler
    - Validate OTP by hashing and comparing with database
    - Check OTP expiration (10 minutes)
    - Update user `isVerified` field to true
    - Delete verification record (single-use)
    - Emit `user.verified` event to PostHog
    - _Requirements: 3.3, 3.4, 3.5, 5.3_

  - [x] 5.3 Create resend verification endpoint
    - Implement `resendVerification` handler
    - Delete old verification records for user
    - Generate new OTP and store in database
    - Send new OTP email
    - _Requirements: 3.6_

  - [x] 5.4 Create get onboarding status endpoint
    - Implement `getStatus` handler
    - Return user's verification status and university email presence
    - _Requirements: 2.1, 4.2_

  - [x] 5.5 Export user router
    - Create/update `apps/server/src/routers/user/index.ts`
    - Export onboarding handlers as `user.onboarding`
    - Register user router in main ORPC router
    - _Requirements: 2.1_

- [x] 6. Update Better-Auth configuration
  - [x] 6.1 Update user creation hook
    - Modify `apps/server/src/lib/auth.ts`
    - Update `databaseHooks.user.create.after` to set `isVerified: false`
    - Emit `user.created` event to PostHog
    - _Requirements: 1.4, 5.1_

  - [x] 6.2 Implement redirect logic
    - Add `onSuccess` callback to Google OAuth provider
    - Check for `universityEmail` presence to determine redirect
    - Redirect to `/onboarding` if no university email, otherwise `/spaces`
    - _Requirements: 1.2, 1.3_

  - [x] 6.3 Add isVerified to custom session
    - Extend Better-Auth session to include `isVerified` field
    - Implement custom session handler
    - _Requirements: 4.2_

- [x] 7. Create frontend onboarding page
  - [x] 7.1 Create onboarding form component
    - Create `apps/web/src/app/onboarding/page.tsx`
    - Implement multi-step form with React Hook Form
    - Add form validation using Zod schemas
    - Create university selection dropdown (fetch via ORPC)
    - Add optional profile image upload
    - Add interests multi-select input
    - _Requirements: 2.1, 2.2_

  - [x] 7.2 Implement form submission logic
    - Call `user.onboarding.submit` ORPC endpoint
    - Handle validation errors and display inline
    - Store `profile_completed: true` in localStorage on success
    - Show OTP verification UI after submission
    - _Requirements: 2.3, 3.4_

  - [x] 7.3 Create OTP verification component
    - Create 6-digit OTP input field
    - Call `user.onboarding.verifyEmail` endpoint
    - Handle success/error states
    - Redirect to `/spaces` on successful verification
    - _Requirements: 3.3, 3.4_

- [x] 8. Create verification pending component
  - Create `apps/web/src/components/verification-pending.tsx`
  - Display verification status with OTP input
  - Add resend OTP button (calls `user.onboarding.resendVerification`)
  - Show instructions for checking email
  - Make component reusable for onboarding page and profile page
  - _Requirements: 3.6_

- [x] 9. Implement feature gating for student features
  - [x] 9.1 Create feature gate component
    - Create `apps/web/src/components/feature-gate.tsx`
    - Check `isVerified` from Better-Auth session
    - Display modal for unverified users attempting access
    - Show appropriate badge: "Student (unverified)" or "Student • Verified ✅"
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 9.2 Implement client-side onboarding check
    - Create middleware or layout logic to check localStorage `profile_completed`
    - Fetch onboarding status via `user.onboarding.getStatus` if needed
    - Show onboarding page for users without university email
    - _Requirements: 1.2, 3.4_

- [x] 10. Add environment variables and configuration
  - Add `RESEND_API_KEY` to `.env` files
  - Add `POSTHOG_API_KEY` and `POSTHOG_HOST` to `.env` files
  - Add `APP_URL` for email link generation
  - Update `.env.example` files with new variables
  - _Requirements: 3.2, 5.1, 5.2, 5.3_

- [x] 11. Update profile page for post-onboarding verification
  - Add university email field to profile edit form
  - Show verification status and pending component if not verified
  - Allow users to update university information
  - Trigger verification flow from profile page
  - _Requirements: 2.1, 3.4_

## Status: ✅ All Tasks Completed

All implementation tasks have been completed successfully. The social onboarding flow is ready for testing and deployment.
