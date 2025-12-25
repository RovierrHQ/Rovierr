# Requirements Document

## Introduction

This specification defines the authentication system for the Rovierr native mobile application (Expo/React Native). The system will implement a complete authentication flow including an animated welcome screen, sign-in functionality with email/password and Google OAuth, and protected route navigation. The implementation will integrate with the existing better-auth backend used by the web application.

## Glossary

- **Native_App**: The Expo-based React Native mobile application for iOS and Android
- **Auth_Client**: The better-auth client library configured for React Native
- **Welcome_Screen**: The animated onboarding screen shown to unauthenticated users
- **SignIn_Sheet**: A form sheet modal presenting authentication options
- **Protected_Routes**: App screens that require user authentication (tabs, spaces, profile)
- **Auth_Provider**: React context provider managing authentication state
- **Session**: User authentication state managed by better-auth
- **Backend_API**: The Elysia server running better-auth at `/auth` endpoint

## Requirements

### Requirement 1: Animated Welcome Screen

**User Story:** As a new user, I want to see an engaging animated welcome screen when I first open the app, so that I understand the app's value proposition and feel welcomed.

#### Acceptance Criteria

1. WHEN an unauthenticated user opens the app, THE Native_App SHALL display the animated welcome screen with text and images
2. WHEN the welcome screen animations complete, THE Native_App SHALL display a "Get Started" button
3. WHEN a user taps the "Get Started" button, THE Native_App SHALL present the SignIn_Sheet as a form sheet modal
4. THE Welcome_Screen SHALL use react-native-reanimated for smooth animations with FadeIn, SlideInLeft, and SlideInRight effects
5. THE Welcome_Screen SHALL display the text sequence: "Your", "All-In-One", "Creative", "Powerhouse" with corresponding images

### Requirement 2: Sign-In Form Sheet

**User Story:** As a user, I want to sign in using my email/password or Google account, so that I can access my personalized content and protected features.

#### Acceptance Criteria

1. WHEN a user taps "Get Started" on the welcome screen, THE Native_App SHALL present the SignIn_Sheet with form sheet presentation style
2. THE SignIn_Sheet SHALL display email and password input fields with appropriate keyboard types
3. WHEN a user enters valid credentials and taps "Sign in", THE Auth_Client SHALL authenticate with the Backend_API
4. WHEN authentication succeeds, THE Native_App SHALL dismiss the SignIn_Sheet and navigate to the protected tabs screen
5. WHEN authentication fails, THE Native_App SHALL display an error message to the user
6. THE SignIn_Sheet SHALL display a "Login with Google" button for OAuth authentication
7. WHEN a user taps "Login with Google", THE Auth_Client SHALL initiate Google OAuth flow
8. WHEN Google OAuth completes successfully, THE Native_App SHALL dismiss the SignIn_Sheet and navigate to protected routes
9. THE SignIn_Sheet SHALL display loading states during authentication requests
10. THE SignIn_Sheet SHALL include a link to the sign-up flow (future implementation)

### Requirement 3: Better-Auth Integration

**User Story:** As a developer, I want the native app to use the same authentication backend as the web app, so that users have a consistent experience across platforms.

#### Acceptance Criteria

1. THE Auth_Client SHALL be configured to connect to the Backend_API at `{SERVER_URL}/auth`
2. THE Auth_Client SHALL support email/password authentication using better-auth's signIn.email method
3. THE Auth_Client SHALL support Google OAuth using better-auth's signIn.social method with provider "google"
4. WHEN authentication succeeds, THE Auth_Client SHALL store the session securely using AsyncStorage
5. WHEN the app launches, THE Auth_Client SHALL restore the session from AsyncStorage if available
6. THE Auth_Client SHALL provide session state through React hooks (useSession)
7. THE Auth_Client SHALL handle token refresh automatically when tokens expire

### Requirement 4: Protected Routes

**User Story:** As a user, I want the app to automatically show me the welcome screen when I'm not logged in and the main app when I am, so that my content is secure.

#### Acceptance Criteria

1. WHEN an unauthenticated user opens the app, THE Native_App SHALL display the Welcome_Screen
2. WHEN an authenticated user opens the app, THE Native_App SHALL display the protected tabs screen
3. WHEN a user's session expires, THE Native_App SHALL redirect to the Welcome_Screen
4. THE Native_App SHALL check authentication state before rendering any protected routes
5. WHILE checking authentication state, THE Native_App SHALL display a loading indicator
6. THE Protected_Routes SHALL include: spaces tab, notifications tab, profile tab, and spaces-selector modal

### Requirement 5: Navigation Flow

**User Story:** As a user, I want smooth transitions between authentication screens and the main app, so that the experience feels polished and professional.

#### Acceptance Criteria

1. WHEN authentication succeeds, THE Native_App SHALL use router.replace to navigate to "(tabs)" route
2. WHEN a user signs out, THE Native_App SHALL use router.replace to navigate to "welcome" route
3. THE Native_App SHALL use Expo Router's file-based routing for navigation structure
4. THE SignIn_Sheet SHALL be presented with "formSheet" presentation style on iOS
5. WHEN the SignIn_Sheet is dismissed without authentication, THE Native_App SHALL remain on the Welcome_Screen
6. THE Native_App SHALL prevent back navigation from protected routes to authentication screens

### Requirement 6: Session Management

**User Story:** As a user, I want my login session to persist across app restarts, so that I don't have to sign in every time I open the app.

#### Acceptance Criteria

1. WHEN a user successfully authenticates, THE Auth_Client SHALL persist the session to AsyncStorage
2. WHEN the app launches, THE Auth_Client SHALL attempt to restore the session from AsyncStorage
3. WHEN session restoration succeeds, THE Native_App SHALL navigate directly to protected routes
4. WHEN session restoration fails, THE Native_App SHALL display the Welcome_Screen
5. WHEN a user signs out, THE Auth_Client SHALL clear the session from AsyncStorage
6. THE Auth_Client SHALL validate stored sessions with the Backend_API on app launch

### Requirement 7: Error Handling

**User Story:** As a user, I want clear error messages when authentication fails, so that I understand what went wrong and how to fix it.

#### Acceptance Criteria

1. WHEN network requests fail, THE Native_App SHALL display a user-friendly error message
2. WHEN credentials are invalid, THE Native_App SHALL display "Invalid email or password"
3. WHEN Google OAuth is cancelled, THE Native_App SHALL dismiss the SignIn_Sheet without error
4. WHEN the Backend_API is unreachable, THE Native_App SHALL display "Unable to connect. Please check your internet connection"
5. THE Native_App SHALL log detailed error information to the console for debugging
6. WHEN authentication errors occur, THE SignIn_Sheet SHALL remain visible for retry

### Requirement 8: UI/UX Consistency

**User Story:** As a user, I want the mobile app authentication to feel consistent with the web app, so that I have a familiar experience across platforms.

#### Acceptance Criteria

1. THE SignIn_Sheet SHALL use the same visual design language as the web login form
2. THE SignIn_Sheet SHALL display the Rovierr logo at the top
3. THE SignIn_Sheet SHALL use consistent button styles, colors, and typography
4. THE SignIn_Sheet SHALL include the same "Welcome back" heading and description
5. THE SignIn_Sheet SHALL display "Or continue with" divider between email and social login
6. THE SignIn_Sheet SHALL include links to Terms of Service and Privacy Policy
7. THE Welcome_Screen SHALL use the brand color scheme (#0C1824 for text, #F7F7F7 for background)

### Requirement 9: Environment Configuration

**User Story:** As a developer, I want authentication configuration to be environment-based, so that I can easily switch between development and production servers.

#### Acceptance Criteria

1. THE Native_App SHALL read the server URL from environment variable EXPO_PUBLIC_SERVER_URL
2. THE Native_App SHALL read the Google Client ID from environment variable EXPO_PUBLIC_GOOGLE_CLIENT_ID
3. WHEN required environment variables are missing, THE Native_App SHALL throw a descriptive error at startup
4. THE Native_App SHALL support different configurations for development and production builds
5. THE Auth_Client SHALL be initialized with environment-based configuration before app render

### Requirement 10: Sign-Out Functionality

**User Story:** As a user, I want to be able to sign out of my account, so that I can protect my privacy on shared devices.

#### Acceptance Criteria

1. WHEN a user taps a sign-out button, THE Auth_Client SHALL call the signOut method
2. WHEN sign-out succeeds, THE Auth_Client SHALL clear the session from AsyncStorage
3. WHEN sign-out succeeds, THE Native_App SHALL navigate to the Welcome_Screen
4. WHEN sign-out fails, THE Native_App SHALL display an error message but still clear local session
5. THE Native_App SHALL provide a sign-out button in the profile tab
