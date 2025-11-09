# Requirements: Social Onboarding Flow

## Overview

This document outlines the requirements for implementing a social onboarding flow that allows users to sign in with Google and complete their student profile with university email verification.

## Requirement 1: Google Sign-In

**User Story:** As a new user, I want to sign in with my Google account, so that I can quickly access the platform without creating a password

### Acceptance Criteria

1. WHEN a user clicks the "Sign in with Google" button, THE Better-Auth SHALL initiate the Google OAuth flow
2. WHEN Better-Auth completes the OAuth flow for a new user, THE Better-Auth SHALL redirect the client to "/onboarding"
3. WHEN Better-Auth completes the OAuth flow for an existing user, THE Better-Auth SHALL redirect the client to "/spaces"
4. WHEN Better-Auth creates a new user account, THE App User creation hook SHALL create a corresponding users table record

## Requirement 2: Onboarding Form

**User Story:** As a new user, I want to complete my profile with university information, so that I can access student features

### Acceptance Criteria

1. WHEN a new user is redirected to "/onboarding", THE App SHALL display an onboarding form
2. WHEN the user fills out the onboarding form, THE Form SHALL collect:
   - Display name (required)
   - Profile image URL (optional)
   - University selection (required)
   - University email (required)
   - Major (optional)
   - Year of study (optional)
   - Interests (optional, max 10)
3. WHEN the user submits the form, THE App SHALL validate that the university email domain matches the selected university's valid domains
4. WHEN validation passes, THE App SHALL update the user record with the provided information
5. WHEN the user record is updated, THE App SHALL send a verification email with a 6-digit OTP to the university email
6. WHEN the OTP is sent, THE App SHALL store the hashed OTP in the verification table with a 10-minute expiration

## Requirement 3: Email Verification

**User Story:** As a user who submitted onboarding, I want to verify my university email, so that I can prove I'm a student

### Acceptance Criteria

1. WHEN the user receives the verification email, THE Email SHALL contain a 6-digit OTP code
2. WHEN the user enters the OTP in the verification form, THE App SHALL validate the OTP against the hashed value in the database
3. WHEN the OTP is valid and not expired, THE App SHALL:
   - Update the user's `isVerified` field to true
   - Delete the verification record
   - Redirect the user to "/spaces"
4. WHEN the OTP is invalid or expired, THE App SHALL display an error message
5. WHEN the user clicks "Resend Code", THE App SHALL generate a new OTP and send it to the university email
6. WHEN the user completes verification, THE App SHALL set `profile_completed: true` in localStorage

## Requirement 4: Feature Gating

**User Story:** As a verified student, I want access to student-only features, so that I can use the full platform

### Acceptance Criteria

1. WHEN a user attempts to access a student-only feature, THE App SHALL check the user's `isVerified` status
2. WHEN the user is not verified, THE App SHALL display a feature gate component with a "Verify Now" button
3. WHEN the user clicks "Verify Now", THE App SHALL display a modal with the OTP verification form
4. WHEN the user is verified, THE App SHALL display a "Student • Verified ✅" badge
5. WHEN the user is not verified, THE App SHALL display a "Student (unverified)" badge

## Requirement 5: Analytics Tracking

**User Story:** As a system administrator, I want to track user onboarding events, so that I can monitor the onboarding funnel and identify issues

### Acceptance Criteria

1. WHEN a new user account is created, THE System SHALL emit a "user.created" event to PostHog with user id and email
2. WHEN a user submits the onboarding form, THE System SHALL emit a "user.onboarding_submitted" event to PostHog with user id and university email
3. WHEN a user completes university verification, THE System SHALL emit a "user.verified" event to PostHog with user id and university email
4. THE System SHALL use PostHog for all event tracking, logging, and funnel analysis

## Non-Functional Requirements

### Security
- OTP codes must be hashed using SHA-256 before storage
- OTP codes must expire after 10 minutes
- OTP codes must be single-use (deleted after successful verification)
- University email domain validation must be enforced

### Performance
- Onboarding form submission should complete within 2 seconds
- Email delivery should occur within 30 seconds
- OTP verification should complete within 1 second

### Usability
- Onboarding is optional - users can skip and complete later from profile page
- Users can access the profile page to complete verification at any time
- Clear error messages for validation failures
- Loading states for all async operations

### Technology Stack
- Backend: Bun + Hono + Drizzle ORM + PostgreSQL
- Frontend: Next.js + React + TypeScript + Tailwind CSS
- Email: Resend
- Analytics: PostHog
- Auth: Better-Auth with Google OAuth
