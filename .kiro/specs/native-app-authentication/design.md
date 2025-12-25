# Design Document

## Overview

This design document outlines the implementation of a complete authentication system for the Rovierr native mobile application. The system provides an animated welcome experience for new users, secure sign-in with email/password and Google OAuth, session persistence, and protected route navigation. The implementation leverages the existing better-auth backend infrastructure and integrates seamlessly with Expo Router's file-based navigation.

The authentication flow follows a modern mobile UX pattern: unauthenticated users see an engaging welcome screen, tap "Get Started" to reveal a sign-in form sheet, authenticate, and are immediately navigated to the protected app content. The system maintains session state across app restarts using secure storage.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Native App (Expo)                        │
│                                                              │
│  ┌────────────────┐         ┌──────────────────┐           │
│  │  Welcome       │────────▶│  SignIn Sheet    │           │
│  │  Screen        │         │  (Form Sheet)    │           │
│  └────────────────┘         └──────────────────┘           │
│         │                            │                       │
│         │                            │                       │
│         │                            ▼                       │
│         │                   ┌──────────────────┐           │
│         │                   │  Auth Provider   │           │
│         │                   │  (Context)       │           │
│         │                   └──────────────────┘           │
│         │                            │                       │
│         │                            │                       │
│         └────────────────────────────┼───────────────────┐  │
│                                      │                   │  │
│                                      ▼                   ▼  │
│                            ┌──────────────────┐  ┌──────────┐
│                            │  Protected       │  │  Auth    │
│                            │  Routes (Tabs)   │  │  Client  │
│                            └──────────────────┘  └──────────┘
│                                                       │       │
└───────────────────────────────────────────────────────┼──────┘
                                                        │
                                                        ▼
                                              ┌──────────────────┐
                                              │  Backend API     │
                                              │  (better-auth)   │
                                              └──────────────────┘
```

### Navigation Structure

```
app/
├── _layout.tsx                 # Root layout with auth provider
├── welcome.tsx                 # Welcome screen (unauthenticated)
├── (auth)/
│   └── signin.tsx             # Sign-in form sheet
└── (tabs)/                    # Protected routes
    ├── _layout.tsx
    ├── spaces/
    ├── notifications/
    └── index.tsx (profile)
```

### Authentication State Flow

```
App Launch
    │
    ▼
Check Session
    │
    ├─── Session Valid ────▶ Navigate to (tabs)
    │
    └─── No Session ───────▶ Show Welcome Screen
                                    │
                                    ▼
                            User taps "Get Started"
                                    │
                                    ▼
                            Present SignIn Sheet
                                    │
                                    ▼
                            User Authenticates
                                    │
                                    ▼
                            Store Session
                                    │
                                    ▼
                            Navigate to (tabs)
```

## Components and Interfaces

### 1. Auth Provider Component

**Purpose:** Manages global authentication state and provides auth context to the app.

**Location:** `apps/native/lib/auth-provider.tsx`

**Interface:**
```typescript
interface AuthContextValue {
  session: Session | null
  isLoading: boolean
  signIn: {
    email: (credentials: EmailCredentials) => Promise<SignInResult>
    social: (options: SocialSignInOptions) => Promise<SignInResult>
  }
  signOut: () => Promise<void>
}

interface EmailCredentials {
  email: string
  password: string
}

interface SocialSignInOptions {
  provider: 'google'
  callbackURL?: string
}

interface SignInResult {
  data?: Session
  error?: AuthError
}

interface Session {
  user: {
    id: string
    email: string
    name: string
    image?: string
  }
  session: {
    token: string
    expiresAt: Date
  }
}
```

**Responsibilities:**
- Initialize auth client on mount
- Restore session from AsyncStorage on app launch
- Provide authentication methods to child components
- Manage loading states during auth operations
- Handle session expiration and refresh

### 2. Auth Client Configuration

**Purpose:** Configure and export the better-auth client for React Native.

**Location:** `apps/native/lib/auth-client.ts`

**Interface:**
```typescript
export const authClient: NativeAuthClient

interface NativeAuthClient {
  useSession: () => {
    data: Session | null
    isPending: boolean
    error: Error | null
  }
  signIn: {
    email: (credentials: EmailCredentials) => Promise<SignInResult>
    social: (options: SocialSignInOptions) => Promise<SignInResult>
  }
  signOut: () => Promise<void>
}
```

**Configuration:**
```typescript
import { createNativeAuthClient } from '@rov/auth/client/native'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const authClient = createNativeAuthClient({
  baseURL: `${process.env.EXPO_PUBLIC_SERVER_URL}/auth`,
  storagePrefix: 'rovierr',
  storage: {
    getItem: (key: string) => AsyncStorage.getItem(key),
    setItem: (key: string, value: string) => AsyncStorage.setItem(key, value)
  }
})
```

### 3. Welcome Screen Component

**Purpose:** Display animated welcome content and provide entry to sign-in flow.

**Location:** `apps/native/app/welcome.tsx`

**Interface:**
```typescript
interface WelcomeScreenProps {
  // No props - uses router for navigation
}

interface HeadTextProps {
  text?: string
  side?: 'left' | 'right'
  image?: ImageSourcePropType
}
```

**Key Features:**
- Animated text and image sequence using react-native-reanimated
- FadeIn, SlideInLeft, SlideInRight animations
- Dynamic width calculation for image containers
- "Get Started" button that presents sign-in sheet
- Safe area insets for proper spacing

**Animation Timing:**
- FadeIn: 1000ms delay
- Slide animations: 1500ms delay
- Layout transitions: 1650ms delay
- Spring physics: damping 18, stiffness 50

### 4. Sign-In Sheet Component

**Purpose:** Present authentication form as a modal sheet.

**Location:** `apps/native/app/(auth)/signin.tsx`

**Interface:**
```typescript
interface SignInSheetProps {
  // No props - uses auth context and router
}

interface SignInFormState {
  email: string
  password: string
  isLoading: boolean
  error: string | null
}
```

**Form Fields:**
- Email input (keyboard type: email-address, autocomplete: email)
- Password input (secure text entry, autocomplete: password)
- Sign in button (disabled during loading)
- Google sign-in button
- Sign up link (navigates to future sign-up screen)

**Validation:**
- Email: Required, valid email format
- Password: Required, minimum 6 characters
- Display inline errors below fields
- Disable submit during validation or loading

### 5. Protected Route Wrapper

**Purpose:** Ensure routes require authentication before rendering.

**Location:** `apps/native/app/(tabs)/_layout.tsx` (enhanced)

**Interface:**
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode
}
```

**Logic:**
```typescript
function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !session) {
      router.replace('/welcome')
    }
  }, [session, isLoading])

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!session) {
    return null
  }

  return <>{children}</>
}
```

### 6. Root Layout Enhancement

**Purpose:** Wrap app with auth provider and handle initial routing.

**Location:** `apps/native/app/_layout.tsx` (enhanced)

**Changes:**
- Wrap Stack with AuthProvider
- Add welcome screen route
- Add (auth) group for sign-in sheet
- Check session on mount and route accordingly

## Data Models

### Session Model

```typescript
interface Session {
  user: User
  session: SessionData
}

interface User {
  id: string
  email: string
  name: string
  image?: string
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

interface SessionData {
  token: string
  expiresAt: Date
  ipAddress?: string
  userAgent?: string
}
```

### Auth Error Model

```typescript
interface AuthError {
  message: string
  code: AuthErrorCode
  details?: Record<string, unknown>
}

type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'NETWORK_ERROR'
  | 'SESSION_EXPIRED'
  | 'OAUTH_CANCELLED'
  | 'OAUTH_FAILED'
  | 'UNKNOWN_ERROR'
```

### Storage Keys

```typescript
const STORAGE_KEYS = {
  SESSION: 'rovierr:session',
  TOKEN: 'rovierr:token',
  REFRESH_TOKEN: 'rovierr:refresh_token',
  USER: 'rovierr:user'
} as const
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Navigation on Get Started

*For any* unauthenticated app state, when the "Get Started" button is tapped, the app should navigate to the signin route.

**Validates: Requirements 1.3, 2.1**

### Property 2: Authentication API Call

*For any* valid email and password credentials, when the sign-in form is submitted, the auth client should make an authentication request to the backend API.

**Validates: Requirements 2.3**

### Property 3: Navigation After Successful Authentication

*For any* successful authentication response (email or OAuth), the app should dismiss the sign-in sheet and navigate to the protected tabs route.

**Validates: Requirements 2.4, 2.8**

### Property 4: Error Display on Authentication Failure

*For any* authentication failure response, the app should display an error message to the user.

**Validates: Requirements 2.5**

### Property 5: OAuth Flow Initiation

*For any* tap on the "Login with Google" button, the auth client should initiate the Google OAuth flow.

**Validates: Requirements 2.7**

### Property 6: Loading State During Authentication

*For any* authentication request (email or OAuth), the sign-in sheet should display a loading state until the request completes.

**Validates: Requirements 2.9**

### Property 7: Session Persistence After Authentication

*For any* successful authentication, the auth client should store the session data to AsyncStorage.

**Validates: Requirements 3.4, 6.1**

### Property 8: Session Restoration on App Launch

*For any* app launch, the auth client should attempt to restore the session from AsyncStorage.

**Validates: Requirements 3.5, 6.2**

### Property 9: Token Refresh on Expiration

*For any* expired authentication token, the auth client should automatically attempt to refresh the token.

**Validates: Requirements 3.7**

### Property 10: Route Protection for Unauthenticated Users

*For any* unauthenticated user state, the app should display the welcome screen and prevent access to protected routes.

**Validates: Requirements 4.1**

### Property 11: Route Access for Authenticated Users

*For any* authenticated user state, the app should display the protected tabs screen.

**Validates: Requirements 4.2**

### Property 12: Redirect on Session Expiration

*For any* session expiration event, the app should redirect to the welcome screen.

**Validates: Requirements 4.3**

### Property 13: Auth Check Before Protected Route Render

*For any* attempt to access a protected route, the app should check authentication state before rendering the route content.

**Validates: Requirements 4.4**

### Property 14: Loading Indicator During Auth Check

*For any* authentication state check, the app should display a loading indicator until the check completes.

**Validates: Requirements 4.5**

### Property 15: Navigation Method on Authentication Success

*For any* successful authentication, the app should use router.replace (not router.push) to navigate to the tabs route.

**Validates: Requirements 5.1**

### Property 16: Navigation Method on Sign Out

*For any* sign-out action, the app should use router.replace (not router.push) to navigate to the welcome route.

**Validates: Requirements 5.2**

### Property 17: Welcome Screen Persistence on Dismissal

*For any* dismissal of the sign-in sheet without authentication, the app should remain on the welcome screen.

**Validates: Requirements 5.5**

### Property 18: Back Navigation Prevention

*For any* protected route, back navigation to authentication screens should be prevented.

**Validates: Requirements 5.6**

### Property 19: Navigation After Successful Session Restoration

*For any* successful session restoration on app launch, the app should navigate directly to protected routes.

**Validates: Requirements 6.3**

### Property 20: Navigation After Failed Session Restoration

*For any* failed session restoration on app launch, the app should display the welcome screen.

**Validates: Requirements 6.4**

### Property 21: Session Cleanup on Sign Out

*For any* sign-out action, the auth client should clear all session data from AsyncStorage.

**Validates: Requirements 6.5, 10.2**

### Property 22: Session Validation on App Launch

*For any* stored session, the auth client should validate it with the backend API on app launch.

**Validates: Requirements 6.6**

### Property 23: Error Message on Network Failure

*For any* network request failure during authentication, the app should display a user-friendly error message.

**Validates: Requirements 7.1**

### Property 24: OAuth Cancellation Handling

*For any* Google OAuth cancellation, the app should dismiss the sign-in sheet without displaying an error.

**Validates: Requirements 7.3**

### Property 25: Error Logging

*For any* authentication error, the app should log detailed error information to the console.

**Validates: Requirements 7.5**

### Property 26: Sheet Visibility After Error

*For any* authentication error, the sign-in sheet should remain visible to allow retry.

**Validates: Requirements 7.6**

### Property 27: Environment Variable Validation

*For any* missing required environment variable (SERVER_URL or GOOGLE_CLIENT_ID), the app should throw a descriptive error at startup.

**Validates: Requirements 9.3**

### Property 28: Sign Out Method Call

*For any* tap on the sign-out button, the auth client's signOut method should be called.

**Validates: Requirements 10.1**

### Property 29: Navigation After Sign Out

*For any* successful sign-out, the app should navigate to the welcome screen.

**Validates: Requirements 10.3**

### Property 30: Error Handling with Cleanup on Sign Out Failure

*For any* sign-out failure, the app should display an error message and still clear the local session data.

**Validates: Requirements 10.4**


## Error Handling

### Error Categories

#### 1. Authentication Errors

**Invalid Credentials:**
- Display: "Invalid email or password"
- Action: Keep sign-in sheet visible, clear password field
- Log: Error details to console

**Account Not Found:**
- Display: "No account found with this email"
- Action: Suggest sign-up flow
- Log: Attempted email (sanitized)

**Account Locked:**
- Display: "Account temporarily locked. Please try again later"
- Action: Disable sign-in for 5 minutes
- Log: Lock reason and duration

#### 2. Network Errors

**Connection Timeout:**
- Display: "Connection timed out. Please try again"
- Action: Enable retry button
- Log: Request details and timeout duration

**No Internet Connection:**
- Display: "Unable to connect. Please check your internet connection"
- Action: Show retry button, check connectivity
- Log: Network state

**Server Unreachable:**
- Display: "Server is temporarily unavailable. Please try again later"
- Action: Enable retry with exponential backoff
- Log: Server URL and response code

#### 3. OAuth Errors

**OAuth Cancelled:**
- Display: No error message (user intentionally cancelled)
- Action: Return to sign-in sheet
- Log: Cancellation event

**OAuth Failed:**
- Display: "Google sign-in failed. Please try again"
- Action: Enable retry
- Log: OAuth error details

**OAuth Token Invalid:**
- Display: "Authentication failed. Please try again"
- Action: Clear OAuth state, enable retry
- Log: Token validation error

#### 4. Session Errors

**Session Expired:**
- Display: "Your session has expired. Please sign in again"
- Action: Navigate to welcome screen, clear session
- Log: Expiration time and reason

**Session Invalid:**
- Display: "Session invalid. Please sign in again"
- Action: Navigate to welcome screen, clear session
- Log: Validation error details

**Token Refresh Failed:**
- Display: "Session expired. Please sign in again"
- Action: Navigate to welcome screen, clear session
- Log: Refresh attempt details

#### 5. Configuration Errors

**Missing Environment Variables:**
- Display: Development error screen with missing variable names
- Action: Prevent app from starting
- Log: Missing variable names

**Invalid Configuration:**
- Display: Development error screen with configuration issues
- Action: Prevent app from starting
- Log: Configuration validation errors

### Error Recovery Strategies

#### Automatic Retry

```typescript
interface RetryConfig {
  maxAttempts: 3
  baseDelay: 1000 // ms
  maxDelay: 10000 // ms
  backoffMultiplier: 2
}
```

**Retry Logic:**
1. First failure: Retry after 1 second
2. Second failure: Retry after 2 seconds
3. Third failure: Show error, enable manual retry

**Applicable to:**
- Network timeouts
- Server errors (5xx)
- Token refresh failures

#### Manual Retry

**User-Initiated:**
- Display "Retry" button after error
- Clear previous error state
- Reattempt operation with same parameters

**Applicable to:**
- All network errors
- Authentication failures
- OAuth failures

#### Graceful Degradation

**Session Restoration Failure:**
- Don't block app startup
- Show welcome screen
- Allow user to sign in again

**Token Refresh Failure:**
- Clear invalid session
- Navigate to welcome screen
- Preserve user's last known state (if possible)

### Error Logging

**Development Mode:**
```typescript
console.error('[Auth Error]', {
  code: error.code,
  message: error.message,
  details: error.details,
  timestamp: new Date().toISOString(),
  stack: error.stack
})
```

**Production Mode:**
```typescript
// Send to error tracking service (e.g., Sentry)
errorTracker.captureException(error, {
  tags: {
    category: 'authentication',
    code: error.code
  },
  extra: {
    userId: session?.user?.id,
    timestamp: new Date().toISOString()
  }
})
```

## Testing Strategy

### Overview

The testing strategy employs a dual approach combining unit tests for specific scenarios and property-based tests for universal behaviors. This ensures both concrete edge cases and general correctness are validated.

### Testing Framework

**Unit Testing:**
- Framework: Jest with React Native Testing Library
- Location: `__tests__` directories co-located with components
- Naming: `*.test.tsx` for component tests, `*.test.ts` for logic tests

**Property-Based Testing:**
- Framework: fast-check (JavaScript property testing library)
- Configuration: Minimum 100 iterations per property test
- Location: `__tests__/properties` directory
- Naming: `*.property.test.ts`

### Unit Testing Approach

#### Component Tests

**Welcome Screen:**
```typescript
describe('WelcomeScreen', () => {
  it('renders animated text sequence', () => {
    const { getByText } = render(<WelcomeScreen />)
    expect(getByText('Your')).toBeTruthy()
    expect(getByText('All-In-One')).toBeTruthy()
    expect(getByText('Creative')).toBeTruthy()
    expect(getByText('Powerhouse')).toBeTruthy()
  })

  it('displays Get Started button', () => {
    const { getByText } = render(<WelcomeScreen />)
    expect(getByText('Get Started')).toBeTruthy()
  })

  it('navigates to signin on button press', () => {
    const { getByText } = render(<WelcomeScreen />)
    fireEvent.press(getByText('Get Started'))
    expect(mockRouter.push).toHaveBeenCalledWith('/signin')
  })
})
```

**Sign-In Sheet:**
```typescript
describe('SignInSheet', () => {
  it('renders email and password inputs', () => {
    const { getByPlaceholderText } = render(<SignInSheet />)
    expect(getByPlaceholderText('name@example.com')).toBeTruthy()
    expect(getByPlaceholderText('Enter your password')).toBeTruthy()
  })

  it('displays error for invalid credentials', async () => {
    mockAuthClient.signIn.email.mockRejectedValue({
      code: 'INVALID_CREDENTIALS'
    })
    const { getByText, getByPlaceholderText } = render(<SignInSheet />)

    fireEvent.changeText(getByPlaceholderText('name@example.com'), 'test@test.com')
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'wrong')
    fireEvent.press(getByText('Sign in'))

    await waitFor(() => {
      expect(getByText('Invalid email or password')).toBeTruthy()
    })
  })

  it('shows loading state during authentication', async () => {
    mockAuthClient.signIn.email.mockImplementation(() =>
      new Promise(resolve => setTimeout(resolve, 1000))
    )
    const { getByText } = render(<SignInSheet />)

    fireEvent.press(getByText('Sign in'))
    expect(getByText('Signing in...')).toBeTruthy()
  })
})
```

#### Integration Tests

**Authentication Flow:**
```typescript
describe('Authentication Flow', () => {
  it('completes full sign-in flow', async () => {
    const { getByText, getByPlaceholderText } = render(<App />)

    // Start at welcome screen
    expect(getByText('Your')).toBeTruthy()

    // Navigate to sign-in
    fireEvent.press(getByText('Get Started'))
    await waitFor(() => {
      expect(getByPlaceholderText('name@example.com')).toBeTruthy()
    })

    // Enter credentials
    fireEvent.changeText(getByPlaceholderText('name@example.com'), 'test@test.com')
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123')

    // Submit
    fireEvent.press(getByText('Sign in'))

    // Verify navigation to tabs
    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)')
    })
  })

  it('restores session on app launch', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockSession))

    const { queryByText } = render(<App />)

    await waitFor(() => {
      expect(queryByText('Your')).toBeNull() // Not on welcome screen
      expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)')
    })
  })
})
```

### Property-Based Testing Approach

**Property Test Configuration:**
```typescript
import fc from 'fast-check'

const propertyTestConfig = {
  numRuns: 100, // Minimum iterations
  verbose: true,
  seed: Date.now() // For reproducibility
}
```

#### Property Tests

**Property 1: Navigation on Get Started**
```typescript
// Feature: native-app-authentication, Property 1: Navigation on Get Started
describe('Property: Navigation on Get Started', () => {
  it('should navigate to signin for any unauthenticated state', () => {
    fc.assert(
      fc.property(
        fc.record({
          session: fc.constant(null),
          isLoading: fc.constant(false)
        }),
        (authState) => {
          const { getByText } = render(
            <AuthProvider value={authState}>
              <WelcomeScreen />
            </AuthProvider>
          )

          fireEvent.press(getByText('Get Started'))
          expect(mockRouter.push).toHaveBeenCalledWith('/signin')
        }
      ),
      propertyTestConfig
    )
  })
})
```

**Property 3: Navigation After Successful Authentication**
```typescript
// Feature: native-app-authentication, Property 3: Navigation After Successful Authentication
describe('Property: Navigation After Successful Authentication', () => {
  it('should navigate to tabs for any successful auth response', () => {
    fc.assert(
      fc.property(
        fc.record({
          user: fc.record({
            id: fc.uuid(),
            email: fc.emailAddress(),
            name: fc.string({ minLength: 1 })
          }),
          session: fc.record({
            token: fc.string({ minLength: 20 }),
            expiresAt: fc.date({ min: new Date() })
          })
        }),
        (authResponse) => {
          mockAuthClient.signIn.email.mockResolvedValue({
            data: authResponse
          })

          const { getByText } = render(<SignInSheet />)
          fireEvent.press(getByText('Sign in'))

          return waitFor(() => {
            expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)')
          })
        }
      ),
      propertyTestConfig
    )
  })
})
```

**Property 7: Session Persistence After Authentication**
```typescript
// Feature: native-app-authentication, Property 7: Session Persistence After Authentication
describe('Property: Session Persistence After Authentication', () => {
  it('should store session for any successful authentication', () => {
    fc.assert(
      fc.property(
        fc.record({
          user: fc.record({
            id: fc.uuid(),
            email: fc.emailAddress(),
            name: fc.string({ minLength: 1 })
          }),
          session: fc.record({
            token: fc.string({ minLength: 20 }),
            expiresAt: fc.date({ min: new Date() })
          })
        }),
        async (authResponse) => {
          mockAuthClient.signIn.email.mockResolvedValue({
            data: authResponse
          })

          const { getByText } = render(<SignInSheet />)
          fireEvent.press(getByText('Sign in'))

          await waitFor(() => {
            expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
              'rovierr:session',
              expect.stringContaining(authResponse.user.id)
            )
          })
        }
      ),
      propertyTestConfig
    )
  })
})
```

**Property 10: Route Protection for Unauthenticated Users**
```typescript
// Feature: native-app-authentication, Property 10: Route Protection for Unauthenticated Users
describe('Property: Route Protection for Unauthenticated Users', () => {
  it('should show welcome screen for any unauthenticated state', () => {
    fc.assert(
      fc.property(
        fc.constant({ session: null, isLoading: false }),
        (authState) => {
          const { getByText } = render(
            <AuthProvider value={authState}>
              <RootLayout />
            </AuthProvider>
          )

          expect(getByText('Your')).toBeTruthy()
          expect(getByText('All-In-One')).toBeTruthy()
        }
      ),
      propertyTestConfig
    )
  })
})
```

**Property 23: Error Message on Network Failure**
```typescript
// Feature: native-app-authentication, Property 23: Error Message on Network Failure
describe('Property: Error Message on Network Failure', () => {
  it('should display error for any network failure', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant({ code: 'NETWORK_ERROR', message: 'Network request failed' }),
          fc.constant({ code: 'TIMEOUT', message: 'Request timed out' }),
          fc.constant({ code: 'CONNECTION_REFUSED', message: 'Connection refused' })
        ),
        async (networkError) => {
          mockAuthClient.signIn.email.mockRejectedValue(networkError)

          const { getByText } = render(<SignInSheet />)
          fireEvent.press(getByText('Sign in'))

          await waitFor(() => {
            const errorText = getByText(/unable to connect|network|connection/i)
            expect(errorText).toBeTruthy()
          })
        }
      ),
      propertyTestConfig
    )
  })
})
```

### Test Coverage Goals

**Minimum Coverage Targets:**
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

**Critical Paths (100% Coverage Required):**
- Authentication flow (sign-in, sign-out)
- Session management (store, restore, validate)
- Navigation logic (route protection, redirects)
- Error handling (all error types)

### Testing Best Practices

1. **Mock External Dependencies:**
   - Mock auth client methods
   - Mock AsyncStorage
   - Mock Expo Router
   - Mock network requests

2. **Test User Interactions:**
   - Use fireEvent for user actions
   - Use waitFor for async operations
   - Verify UI state changes

3. **Property Test Generators:**
   - Use realistic data generators
   - Cover edge cases (empty strings, special characters)
   - Test boundary conditions

4. **Isolation:**
   - Each test should be independent
   - Clear mocks between tests
   - Reset navigation state

5. **Descriptive Test Names:**
   - Describe what is being tested
   - Include expected behavior
   - Reference requirements when applicable

### Continuous Integration

**Pre-commit Hooks:**
- Run unit tests
- Run linter
- Check TypeScript types

**CI Pipeline:**
- Run full test suite
- Generate coverage report
- Run property tests with increased iterations (500)
- Fail build if coverage drops below targets
