# Design Document: User Profile Page

## Overview

The User Profile Page is a comprehensive interface that allows students to view and manage their personal information, academic details, social connections, and account settings. The design follows a tabbed navigation pattern with a prominent hero section and leverages the existing authentication system (better-auth), database schema (Drizzle ORM), and type-safe API contracts (ORPC).

## Architecture

### Frontend Architecture

The profile page follows a component-based architecture using React 19 with Next.js App Router:

```
apps/web/src/
├── app/profile/
│   └── page.tsx                    # Main profile page route
├── components/profile/
│   ├── index.tsx                   # Main profile container (already exists)
│   ├── profile-header.tsx          # Top navigation header
│   ├── profile-hero.tsx            # User avatar, name, verification badge
│   ├── profile-tabs.tsx            # Tab navigation component
│   ├── verification-prompt.tsx     # Unverified user banner
│   └── tabs/
│       ├── overview-tab.tsx        # Overview content
│       ├── about-tab.tsx           # Bio and social links
│       ├── academics-tab.tsx       # Academic information
│       ├── activity-tab.tsx        # Activity feed
│       ├── clubs-tab.tsx           # Club memberships
│       └── settings-tab.tsx        # Account settings
│           ├── profile-settings.tsx      # Personal info editing
│           ├── security-settings.tsx     # Session management
│           └── verification-settings.tsx # Student verification
```

### Backend Architecture

The backend extends the existing ORPC router structure:

```
apps/server/src/
├── routers/user/
│   ├── index.ts                    # User router aggregator
│   ├── profile.ts                  # Profile endpoints (extend existing)
│   ├── onboarding.ts              # Onboarding/verification (already exists)
│   └── settings.ts                 # New settings endpoints
└── services/
    └── verification/
        └── phone.ts                # Phone verification service
```

### Database Schema

Leverages existing schema with potential extensions:

- `user` table (already exists) - stores all profile data
- `userProgramEnrollment` table (already exists) - academic enrollments
- `organization` and `member` tables (already exist) - club memberships
- `session` table (already exists) - active sessions
- `verification` table (already exists) - OTP verification

## Components and Interfaces

### Frontend Components

#### ProfileHero Component
```typescript
interface ProfileHeroProps {
  isVerified: boolean
}
```
- Displays user avatar with upload button
- Shows user name and verification badge
- Displays current university information
- Shows join date and location

#### ProfileTabs Component
```typescript
interface ProfileTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}
```
- Renders tab navigation (Overview, About, Academics, Activity, Clubs, Settings)
- Highlights active tab
- Handles tab switching

#### SettingsTab Components

**ProfileSettings**
- Editable fields: name, username, bio, website
- Phone number input with verification flow
- Form validation and submission

**SecuritySettings**
- Lists all active sessions with device info
- Displays current session badge
- Revoke session functionality

**VerificationSettings**
- University selection dropdown
- University email input
- OTP verification flow
- Student ID upload (future enhancement)

### Backend API Endpoints

#### Profile Endpoints (extend existing)

```typescript
// GET /user/profile/info - Already exists
// Returns: currentUniversity, studentStatusVerified

// NEW: GET /user/profile/details
// Returns: Full user profile including social links, bio, etc.

// NEW: PATCH /user/profile/update
// Input: { name?, username?, bio?, website?, socialLinks? }
// Returns: Updated user data

// NEW: GET /user/profile/academic
// Returns: List of program enrollments with verification status

// NEW: GET /user/profile/activity
// Input: { limit?, offset? }
// Returns: Paginated activity feed

// Club memberships use better-auth organization plugin:
// - authClient.organization.listOrganizations() - Lists user's organizations
// - authClient.organization.getFullOrganization({ organizationId }) - Gets detailed org info
```

#### Settings Endpoints

All settings endpoints use better-auth built-in plugins:

```typescript
// Phone number verification uses better-auth phoneNumber plugin:
// - authClient.phoneNumber.sendOtp({ phoneNumber }) - Sends OTP to phone
// - authClient.phoneNumber.verify({ phoneNumber, code, updatePhoneNumber: true }) - Verifies OTP and updates phone

// Session management uses better-auth built-in APIs:
// - authClient.listSessions() - Lists all active sessions
// - authClient.revokeSession({ token }) - Revokes a specific session

// Club memberships use better-auth organization plugin:
// - authClient.organization.listOrganizations() - Lists user's organizations
// - authClient.organization.getFullOrganization({ organizationId }) - Gets detailed org info
```

### ORPC Contract Types

```typescript
// Profile data type
interface UserProfile {
  id: string
  name: string
  username: string | null
  email: string
  image: string | null
  bio: string | null
  website: string | null
  phoneNumber: string | null
  phoneNumberVerified: boolean
  socialLinks: {
    whatsapp?: string
    telegram?: string
    instagram?: string
    facebook?: string
    twitter?: string
    linkedin?: string
  }
  currentUniversity?: {
    id: string
    name: string
    logo: string | null
    city: string
    country: string
  }
  studentStatusVerified: boolean
  createdAt: Date
}

// Academic enrollment type
interface ProgramEnrollment {
  id: string
  program: {
    id: string
    name: string
    code: string
    degreeLevel: string
  }
  university: {
    id: string
    name: string
    logo: string | null
  }
  studentStatusVerified: boolean
  startedOn: Date | null
  isPrimary: boolean
}

// Activity item type
interface ActivityItem {
  id: string
  type: 'post' | 'comment' | 'join' | 'event' | 'achievement'
  title: string
  description: string | null
  timestamp: Date
  metadata: Record<string, any>
}

// Club membership type
interface ClubMembership {
  id: string
  organization: {
    id: string
    name: string
    slug: string
    logo: string | null
    type: string
  }
  role: string
  joinedAt: Date
}

// Session info type
interface SessionInfo {
  id: string
  token: string
  userAgent: string | null
  ipAddress: string | null
  createdAt: Date
  expiresAt: Date
}
```

## Data Models

### User Profile Data Flow

1. **Profile Loading**
   - Frontend calls `orpc.user.profile.details.query()`
   - Backend queries `user` table with joins to `university` and `userProgramEnrollment`
   - Returns complete profile data including verification status

2. **Profile Updates**
   - Frontend submits form data via `orpc.user.profile.update.mutate()`
   - Backend validates input (username uniqueness, URL formats)
   - Updates `user` table
   - Returns updated profile data

3. **Academic Data Loading**
   - Frontend calls `orpc.user.profile.academic.query()`
   - Backend queries `userProgramEnrollment` with joins to `program` and `university`
   - Returns list of enrollments with verification status

4. **Activity Feed Loading**
   - Frontend calls `orpc.user.profile.activity.query({ limit: 50 })`
   - Backend queries activity logs (future: dedicated activity table)
   - Returns paginated activity items

5. **Club Memberships Loading**
   - Frontend calls `authClient.organization.listOrganizations()` (better-auth built-in)
   - Returns list of organizations where user is a member
   - For detailed info, call `authClient.organization.getFullOrganization({ organizationId })`

### Phone Verification Flow

1. User enters phone number in settings
2. Frontend calls `authClient.phoneNumber.sendOtp({ phoneNumber })` (better-auth built-in)
3. Better-auth generates OTP (configurable length, default 6 digits), stores hashed version
4. Better-auth calls custom `sendOTP` callback to send SMS via provider (e.g., Twilio)
5. User enters OTP code
6. Frontend calls `authClient.phoneNumber.verify({ phoneNumber, code, updatePhoneNumber: true })`
7. Better-auth validates OTP (with brute force protection), updates `user.phoneNumber` and `user.phoneNumberVerified`
8. Returns success response with verification status

### Session Management Flow

1. Frontend calls `authClient.listSessions()` (better-auth built-in)
2. Better-auth queries `session` table for current user
3. Frontend parses `userAgent` using `ua-parser-js` to extract device/browser info
4. Displays list of sessions with parsed metadata
5. For revocation: Frontend calls `authClient.revokeSession({ token })`
6. Better-auth deletes session from `session` table

## Error Handling

### Frontend Error Handling

- Use React Query error boundaries for API errors
- Display toast notifications for user-facing errors
- Form validation errors shown inline
- Network errors trigger retry mechanism

### Backend Error Handling

```typescript
// Username already taken
throw new ORPCError('USERNAME_TAKEN', {
  message: 'This username is already in use'
})

// Invalid phone number format
throw new ORPCError('INVALID_PHONE_NUMBER', {
  message: 'Please enter a valid phone number'
})

// Invalid verification code
throw new ORPCError('INVALID_CODE', {
  message: 'The verification code is incorrect'
})

// Expired verification code
throw new ORPCError('CODE_EXPIRED', {
  message: 'The verification code has expired'
})

// Cannot revoke current session
throw new ORPCError('CANNOT_REVOKE_CURRENT_SESSION', {
  message: 'You cannot revoke your current session'
})
```

## Testing Strategy

### Unit Tests

- Component rendering tests for all profile components
- Form validation logic tests
- API endpoint handler tests
- Database query tests

### Integration Tests

- Profile data loading and display
- Profile update flow (form submission to database)
- Phone verification flow (OTP generation to verification)
- Session management (list and revoke)
- Tab navigation and state management

### E2E Tests

- Complete profile viewing flow
- Profile editing and saving
- Student verification flow
- Phone number verification flow
- Session revocation flow

### Test Data

- Mock user profiles with various verification states
- Mock university and program data
- Mock session data with different devices
- Mock activity feed data

## Security Considerations

1. **Authentication**: All endpoints require authenticated user (protectedProcedure)
2. **Authorization**: Users can only view/edit their own profile
3. **Input Validation**: Validate all user inputs (username, URLs, phone numbers)
4. **Rate Limiting**: Implement rate limiting on OTP sending endpoints
5. **Session Security**: Validate session tokens, prevent CSRF attacks
6. **Data Privacy**: Don't expose sensitive data (email, phone) to other users

## Performance Considerations

1. **Lazy Loading**: Load tab content only when tab is active
2. **Pagination**: Implement pagination for activity feed
3. **Caching**: Use React Query caching for profile data
4. **Optimistic Updates**: Update UI immediately, sync with backend
5. **Image Optimization**: Use Next.js Image component for avatars
6. **Database Indexing**: Ensure indexes on frequently queried fields (userId, organizationId)

## Accessibility

1. **Keyboard Navigation**: All interactive elements accessible via keyboard
2. **Screen Reader Support**: Proper ARIA labels and semantic HTML
3. **Focus Management**: Clear focus indicators, logical tab order
4. **Color Contrast**: Meet WCAG AA standards
5. **Form Labels**: All form inputs have associated labels
6. **Error Announcements**: Screen reader announcements for errors

## Future Enhancements

1. **Profile Visibility Settings**: Control who can view profile sections
2. **Custom Profile Themes**: Allow users to customize profile appearance
3. **Achievement Badges**: Display earned achievements on profile
4. **Profile Analytics**: Show profile view statistics
5. **Export Profile Data**: Allow users to download their profile data
6. **Two-Factor Authentication**: Add 2FA setup in security settings
7. **Connected Accounts**: Link Google, GitHub accounts
8. **Profile Completion Score**: Encourage users to complete profile sections
