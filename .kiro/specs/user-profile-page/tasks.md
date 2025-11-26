# Implementation Plan: User Profile Page

- [x] 1. Set up backend API endpoints for profile data
  - Create new ORPC endpoints in `apps/server/src/routers/user/profile.ts`
  - Add `details` endpoint to return full user profile with social links
  - Add `update` endpoint to handle profile updates (name, username, bio, website, social links)
  - Add `academic` endpoint to return program enrollments with verification status
  - Add `activity` endpoint to return paginated activity feed (placeholder for now)
  - Implement input validation for username uniqueness and URL formats
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 2. Configure better-auth plugins for phone and organization features
  - Add `phoneNumber` plugin to better-auth server configuration in `apps/server/src/lib/auth.ts`
  - Implement `sendOTP` callback for SMS sending (use console.log for development)
  - Configure OTP settings (length: 6, expiry: 300 seconds, allowed attempts: 3)
  - Verify `organization` plugin is already configured
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 3. Create profile hero component
  - Build `ProfileHero` component in `apps/web/src/components/profile/profile-hero.tsx`
  - Display user avatar with camera icon button for future upload functionality
  - Show user name and verification badge based on `studentStatusVerified` status
  - Display current university information (name, city, country)
  - Show join date using `createdAt` field
  - Fetch data using `orpc.user.profile.info.query()` and `authClient.useSession()`
  - _Requirements: 1.1, 1.2, 1.5_

- [x] 4. Create profile tabs navigation component
  - Build `ProfileTabs` component in `apps/web/src/components/profile/profile-tabs.tsx`
  - Implement tab buttons for Overview, About, Academics, Activity, Clubs, Settings
  - Add active tab highlighting using Tailwind classes
  - Handle tab switching via `onTabChange` callback
  - Make tabs responsive for mobile view
  - _Requirements: 8.1, 8.2, 8.3, 8.5_

- [x] 5. Create verification prompt component
  - Build `VerificationPrompt` component in `apps/web/src/components/profile/verification-prompt.tsx`
  - Display banner with shield icon and verification message
  - Add "Verify Now" button that navigates to verification flow
  - Show only when `studentStatusVerified` is false
  - Style with attention-grabbing colors (yellow/orange theme)
  - _Requirements: 1.2, 5.1_

- [x] 6. Implement Overview tab
  - Create `OverviewTab` component in `apps/web/src/components/profile/tabs/overview-tab.tsx`
  - Display quick stats (clubs joined, activities, etc.)
  - Show recent activity preview (3-5 items)
  - Display primary program enrollment
  - Add quick links to other profile sections
  - _Requirements: 1.3, 4.1, 9.1, 10.1_

- [x] 7. Implement About tab with social links
  - Create `AboutTab` component in `apps/web/src/components/profile/tabs/about-tab.tsx`
  - Display bio text area (read-only view)
  - Show website link if available
  - Display social media links with icons (WhatsApp, Telegram, Instagram, Facebook, Twitter, LinkedIn)
  - Add edit button that switches to edit mode
  - Implement edit mode with input fields for bio, website, and social links
  - Add save and cancel buttons in edit mode
  - Call `orpc.user.profile.update.mutate()` on save
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 8. Implement Academics tab
  - Create `AcademicsTab` component in `apps/web/src/components/profile/tabs/academics-tab.tsx`
  - Fetch academic data using `orpc.user.profile.academic.query()`
  - Display list of program enrollments with university info
  - Show verification status badge for each enrollment
  - Display start date and graduation date if available
  - Highlight primary enrollment
  - Show empty state if no enrollments exist
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 9. Implement Activity tab
  - Create `ActivityTab` component in `apps/web/src/components/profile/tabs/activity-tab.tsx`
  - Fetch activity data using `orpc.user.profile.activity.query({ limit: 50 })`
  - Display chronological list of activities with icons
  - Show activity type, title, description, and timestamp
  - Implement infinite scroll for pagination
  - Show empty state with message if no activities
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 10. Implement Clubs tab
  - Create `ClubsTab` component in `apps/web/src/components/profile/tabs/clubs-tab.tsx`
  - Fetch organizations using `authClient.organization.listOrganizations()`
  - Display grid/list of club cards with logo, name, and role
  - Show membership date for each club
  - Add click handler to navigate to club detail page
  - Show empty state with "Discover Clubs" button if no memberships
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 11. Implement Settings tab with profile settings
  - Create `SettingsTab` component in `apps/web/src/components/profile/tabs/settings-tab.tsx`
  - Create `ProfileSettings` sub-component for personal information
  - Add form fields for name, username, bio, and website
  - Implement form validation (username format, URL validation)
  - Add phone number input field
  - Add "Send Verification Code" button for phone verification
  - Show OTP input field after code is sent
  - Call `authClient.phoneNumber.sendOtp()` and `authClient.phoneNumber.verify()`
  - Display success/error messages using toast notifications
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 12. Implement security settings for session management
  - Create `SecuritySettings` component in `apps/web/src/components/profile/tabs/settings-tab.tsx`
  - Fetch sessions using `authClient.listSessions()`
  - Parse user agent using `ua-parser-js` library
  - Display session list with device type icon (mobile/desktop)
  - Show OS name, browser name, and last active time
  - Mark current session with "Current" badge
  - Add revoke button for non-current sessions
  - Call `authClient.revokeSession({ token })` on revoke
  - Disable revoke button for current session
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 13. Implement student verification settings
  - Create `VerificationSettings` component in `apps/web/src/components/profile/tabs/settings-tab.tsx`
  - Show verification status badge at top
  - Display verification form if not verified
  - Add university dropdown (fetch from `orpc.university.list.query()`)
  - Add start date input field
  - Add university email input field
  - Add "Send Verification Code" button
  - Show OTP input field after code is sent
  - Reuse existing onboarding verification endpoints
  - Display success message with checkmark icon when verified
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 14. Create profile header navigation component
  - Build `ProfileHeader` component in `apps/web/src/components/profile/profile-header.tsx`
  - Add back button to navigate to previous page
  - Display "Profile" title
  - Add settings icon button that scrolls to Settings tab
  - Make header sticky on scroll
  - Style with backdrop blur effect
  - _Requirements: 1.1, 8.1_

- [x] 15. Wire up main profile page container
  - Update `apps/web/src/components/profile/index.tsx` to use real data
  - Remove demo toggle button
  - Fetch verification status from `orpc.user.profile.info.query()`
  - Pass verification status to `ProfileHero` and `VerificationPrompt`
  - Implement tab state management
  - Add loading states for data fetching
  - Add error boundaries for error handling
  - _Requirements: 1.1, 1.2, 1.3, 8.1, 8.2, 8.3, 8.4_

- [x] 16. Create profile page route
  - Update or create `apps/web/src/app/profile/page.tsx`
  - Import and render main `ProfilePage` component
  - Add page metadata (title, description)
  - Implement authentication check (redirect to login if not authenticated)
  - Add loading skeleton while data loads
  - _Requirements: 1.1_

- [x] 17. Add error handling and loading states
  - Implement error boundaries for each tab component
  - Add loading skeletons for profile hero, tabs, and content
  - Display user-friendly error messages
  - Add retry mechanisms for failed API calls
  - Implement toast notifications for success/error feedback
  - _Requirements: 2.4, 2.5, 3.4, 3.5, 6.4, 6.5, 7.4, 7.5_

- [x] 18. Add form validation utilities
  - Create validation functions for username format
  - Add URL validation for website and social links
  - Implement phone number format validation
  - Add email domain validation helper
  - Create reusable form error display components
  - _Requirements: 2.2, 2.3, 3.2, 5.2, 6.1_

- [x] 19. Optimize performance and accessibility
  - Add React Query caching for profile data
  - Implement optimistic updates for profile edits
  - Add keyboard navigation support for tabs
  - Ensure proper ARIA labels on all interactive elements
  - Test with screen readers
  - Optimize images with Next.js Image component
  - Add focus management for modals and forms
  - _Requirements: All requirements (accessibility and performance)_

- [x] 20. Add responsive design improvements
  - Test all components on mobile, tablet, and desktop
  - Adjust tab navigation for mobile (horizontal scroll or dropdown)
  - Optimize form layouts for small screens
  - Ensure touch targets are appropriately sized
  - Test on various screen sizes and orientations
  - _Requirements: All requirements (responsive design)_
