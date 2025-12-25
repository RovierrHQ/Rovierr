# Implementation Plan: Native App Authentication

## Overview

This implementation plan breaks down the native app authentication system into discrete, incremental tasks. Each task builds on previous work, starting with core infrastructure (auth client, provider), then implementing UI components (welcome screen, sign-in sheet), adding navigation and route protection, and finally implementing session management and error handling. The plan includes property-based tests and unit tests as sub-tasks to validate correctness throughout development.

## Tasks

- [x] 1. Set up authentication infrastructure
  - Create auth client configuration with better-auth
  - Set up environment variables for server URL and Google Client ID
  - Configure AsyncStorage for session persistence
  - _Requirements: 3.1, 3.2, 3.3, 9.1, 9.2, 9.5_

- [ ]* 1.1 Write unit tests for auth client configuration
  - Test client initialization with valid config
  - Test error thrown when environment variables are missing
  - Test AsyncStorage integration
  - _Requirements: 9.3_

- [x] 2. Create Auth Provider component
  - Implement AuthContext with session state management
  - Create useAuth hook for consuming auth context
  - Implement signIn.email method wrapper
  - Implement signIn.social method wrapper for Google OAuth
  - Implement signOut method wrapper
  - Handle loading states during auth operations
  - _Requirements: 3.2, 3.3, 3.6_

- [ ]* 2.1 Write property test for session state management
  - **Property 7: Session Persistence After Authentication**
  - **Validates: Requirements 3.4, 6.1**

- [ ]* 2.2 Write property test for session restoration
  - **Property 8: Session Restoration on App Launch**
  - **Validates: Requirements 3.5, 6.2**

- [ ]* 2.3 Write unit tests for Auth Provider
  - Test context provides correct values
  - Test useAuth hook returns session state
  - Test signIn methods call auth client correctly
  - Test signOut clears session
  - _Requirements: 3.6_

- [x] 3. Implement Welcome Screen component
  - Create welcome.tsx route file
  - Implement HeadText component with animations
  - Add FadeIn, SlideInLeft, SlideInRight animations using react-native-reanimated
  - Implement dynamic width calculation for image containers
  - Add "Get Started" button with navigation to sign-in
  - Apply safe area insets for proper spacing
  - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [ ]* 3.1 Write property test for Get Started navigation
  - **Property 1: Navigation on Get Started**
  - **Validates: Requirements 1.3, 2.1**

- [ ]* 3.2 Write unit tests for Welcome Screen
  - Test animated text sequence renders correctly
  - Test "Get Started" button exists
  - Test images are displayed
  - _Requirements: 1.1, 1.2, 1.5_

- [x] 4. Create Sign-In Sheet component
  - Create (auth)/signin.tsx route file with form sheet presentation
  - Implement email input field with proper keyboard type
  - Implement password input field with secure text entry
  - Add "Sign in" button with loading state
  - Add "Login with Google" button
  - Implement form validation (email format, password length)
  - Display inline error messages
  - Add sign-up link (placeholder for future implementation)
  - Style to match web app design (logo, "Welcome back" heading, divider)
  - _Requirements: 2.2, 2.6, 2.9, 2.10, 8.2, 8.4, 8.5, 8.6_

- [ ]* 4.1 Write property test for authentication API call
  - **Property 2: Authentication API Call**
  - **Validates: Requirements 2.3**

- [ ]* 4.2 Write property test for loading state
  - **Property 6: Loading State During Authentication**
  - **Validates: Requirements 2.9**

- [ ]* 4.3 Write unit tests for Sign-In Sheet
  - Test email and password inputs render
  - Test Google button renders
  - Test form validation
  - Test sign-up link exists
  - _Requirements: 2.2, 2.6, 2.10_

- [x] 5. Implement authentication flow logic
  - Connect sign-in form to Auth Provider methods
  - Handle successful email authentication
  - Handle successful Google OAuth authentication
  - Navigate to tabs on successful authentication using router.replace
  - Display error messages on authentication failure
  - Keep sheet visible after errors for retry
  - _Requirements: 2.3, 2.4, 2.5, 2.7, 2.8, 5.1, 7.6_

- [ ]* 5.1 Write property test for navigation after successful auth
  - **Property 3: Navigation After Successful Authentication**
  - **Validates: Requirements 2.4, 2.8**

- [ ]* 5.2 Write property test for error display on auth failure
  - **Property 4: Error Display on Authentication Failure**
  - **Validates: Requirements 2.5**

- [ ]* 5.3 Write property test for OAuth flow initiation
  - **Property 5: OAuth Flow Initiation**
  - **Validates: Requirements 2.7**

- [ ]* 5.4 Write property test for navigation method
  - **Property 15: Navigation Method on Authentication Success**
  - **Validates: Requirements 5.1**

- [ ]* 5.5 Write property test for sheet visibility after error
  - **Property 26: Sheet Visibility After Error**
  - **Validates: Requirements 7.6**

- [x] 6. Checkpoint - Ensure authentication flow works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement route protection
  - Create ProtectedRoute wrapper component
  - Check authentication state before rendering protected routes
  - Display loading indicator during auth check
  - Redirect to welcome screen if unauthenticated
  - Wrap (tabs) layout with ProtectedRoute
  - Prevent back navigation from protected routes to auth screens
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.6_

- [ ]* 7.1 Write property test for route protection (unauthenticated)
  - **Property 10: Route Protection for Unauthenticated Users**
  - **Validates: Requirements 4.1**

- [ ]* 7.2 Write property test for route access (authenticated)
  - **Property 11: Route Access for Authenticated Users**
  - **Validates: Requirements 4.2**

- [ ]* 7.3 Write property test for auth check before render
  - **Property 13: Auth Check Before Protected Route Render**
  - **Validates: Requirements 4.4**

- [ ]* 7.4 Write property test for loading indicator
  - **Property 14: Loading Indicator During Auth Check**
  - **Validates: Requirements 4.5**

- [ ]* 7.5 Write property test for back navigation prevention
  - **Property 18: Back Navigation Prevention**
  - **Validates: Requirements 5.6**

- [ ]* 7.6 Write unit tests for ProtectedRoute
  - Test redirects when unauthenticated
  - Test renders children when authenticated
  - Test shows loading during check
  - _Requirements: 4.1, 4.2, 4.5_

- [x] 8. Enhance root layout with auth provider
  - Wrap Stack with AuthProvider in _layout.tsx
  - Add welcome screen route
  - Configure (auth) group with form sheet presentation
  - Implement initial routing logic based on session state
  - Handle session restoration on app launch
  - _Requirements: 3.5, 6.2, 6.3, 6.4_

- [ ]* 8.1 Write property test for navigation after successful restoration
  - **Property 19: Navigation After Successful Session Restoration**
  - **Validates: Requirements 6.3**

- [ ]* 8.2 Write property test for navigation after failed restoration
  - **Property 20: Navigation After Failed Session Restoration**
  - **Validates: Requirements 6.4**

- [ ]* 8.3 Write integration test for authentication flow
  - Test complete flow from welcome to tabs
  - Test session restoration on app launch
  - _Requirements: 1.1, 1.3, 2.3, 2.4, 6.2, 6.3_

- [x] 9. Implement session management
  - Store session to AsyncStorage after successful authentication
  - Restore session from AsyncStorage on app launch
  - Validate stored session with backend API
  - Handle token refresh on expiration
  - Clear session from AsyncStorage on sign-out
  - Handle session expiration with redirect to welcome
  - _Requirements: 3.4, 3.5, 3.7, 4.3, 6.1, 6.2, 6.5, 6.6_

- [ ]* 9.1 Write property test for session validation
  - **Property 22: Session Validation on App Launch**
  - **Validates: Requirements 6.6**

- [ ]* 9.2 Write property test for token refresh
  - **Property 9: Token Refresh on Expiration**
  - **Validates: Requirements 3.7**

- [ ]* 9.3 Write property test for redirect on session expiration
  - **Property 12: Redirect on Session Expiration**
  - **Validates: Requirements 4.3**

- [ ]* 9.4 Write property test for session cleanup
  - **Property 21: Session Cleanup on Sign Out**
  - **Validates: Requirements 6.5, 10.2**

- [x] 10. Implement sign-out functionality
  - Add sign-out button to profile tab
  - Call auth client signOut method on button press
  - Clear session from AsyncStorage
  - Navigate to welcome screen using router.replace
  - Handle sign-out errors gracefully (show error but still clear local session)
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ]* 10.1 Write property test for sign-out method call
  - **Property 28: Sign Out Method Call**
  - **Validates: Requirements 10.1**

- [ ]* 10.2 Write property test for navigation after sign-out
  - **Property 29: Navigation After Sign Out**
  - **Validates: Requirements 10.3**

- [ ]* 10.3 Write property test for navigation method on sign-out
  - **Property 16: Navigation Method on Sign Out**
  - **Validates: Requirements 5.2**

- [ ]* 10.4 Write property test for error handling on sign-out failure
  - **Property 30: Error Handling with Cleanup on Sign Out Failure**
  - **Validates: Requirements 10.4**

- [ ]* 10.5 Write unit tests for sign-out functionality
  - Test button exists in profile tab
  - Test signOut method is called
  - Test navigation occurs
  - _Requirements: 10.1, 10.3, 10.5_

- [x] 11. Implement comprehensive error handling
  - Add error handling for invalid credentials
  - Add error handling for network failures
  - Add error handling for OAuth cancellation
  - Add error handling for server unreachable
  - Implement error logging to console
  - Display user-friendly error messages
  - Implement retry logic with exponential backoff
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]* 11.1 Write property test for network error messages
  - **Property 23: Error Message on Network Failure**
  - **Validates: Requirements 7.1**

- [ ]* 11.2 Write property test for OAuth cancellation handling
  - **Property 24: OAuth Cancellation Handling**
  - **Validates: Requirements 7.3**

- [ ]* 11.3 Write property test for error logging
  - **Property 25: Error Logging**
  - **Validates: Requirements 7.5**

- [ ]* 11.4 Write unit tests for error handling
  - Test invalid credentials error message
  - Test server unreachable error message
  - Test error logging occurs
  - _Requirements: 7.2, 7.4, 7.5_

- [x] 12. Implement navigation edge cases
  - Handle dismissal of sign-in sheet without authentication
  - Ensure welcome screen persists after dismissal
  - Prevent back navigation from tabs to auth screens
  - _Requirements: 5.5, 5.6_

- [ ]* 12.1 Write property test for welcome screen persistence
  - **Property 17: Welcome Screen Persistence on Dismissal**
  - **Validates: Requirements 5.5**

- [x] 13. Add environment variable validation
  - Validate EXPO_PUBLIC_SERVER_URL exists at startup
  - Validate EXPO_PUBLIC_GOOGLE_CLIENT_ID exists at startup
  - Throw descriptive errors for missing variables
  - _Requirements: 9.1, 9.2, 9.3_

- [ ]* 13.1 Write property test for environment variable validation
  - **Property 27: Environment Variable Validation**
  - **Validates: Requirements 9.3**

- [x] 14. Final checkpoint - Ensure all tests pass and authentication system is complete
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- All code should be written in TypeScript with React Native (Expo)
- Use existing `@rov/auth` package for auth client
- Follow Expo Router file-based routing conventions
- Use react-native-reanimated for animations
- Use AsyncStorage from `@react-native-async-storage/async-storage`
