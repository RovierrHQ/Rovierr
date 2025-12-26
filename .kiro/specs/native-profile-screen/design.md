# Design Document: Native Profile Screen

## Overview

The Native Profile Screen is a Discord-style mobile interface built with React Native and Expo that displays user profile information in a single scrollable view. The design features a prominent banner with overlaying profile avatar, action icons at the top right corner, profile details section, and a joined clubs section below. The architecture follows a clean separation of concerns with minimal screen files in the app directory and all component logic in the components directory.

## Architecture

### File Structure

```
apps/native/src/
├── app/
│   └── (tabs)/
│       └── index.tsx                    # Minimal screen file (imports ProfileScreen)
├── components/
│   └── profile/
│       ├── ProfileScreen.tsx            # Main profile screen component
│       ├── ProfileBanner.tsx            # Banner with avatar and action icons
│       ├── ProfileInfo.tsx              # Profile details section
│       ├── ClubsList.tsx                # Joined clubs list
│       ├── ActionIcons.tsx              # Action icons (Settings, Share, Edit)
│       ├── ImageUploadModal.tsx         # Image upload and crop modal
│       ├── ShareProfileModal.tsx        # Share profile with QR code modal
│       └── ProfileSkeleton.tsx          # Loading skeleton
└── lib/
    ├── api-client.ts                    # ORPC API client (already exists)
    └── auth-client.ts                   # Better-auth client (already exists)
```

### Component Hierarchy

```
ProfileScreen (Main Container)
├── ScrollView (with RefreshControl)
│   ├── ProfileBanner
│   │   ├── Banner Image/Gradient
│   │   ├── ActionIcons (Settings, Share, Edit)
│   │   └── Avatar (with camera button)
│   ├── ProfileInfo
│   │   ├── Name & Verification Badge
│   │   ├── Username
│   │   ├── Bio
│   │   ├── University Badges
│   │   ├── Member Since
│   │   └── Social Links
│   └── ClubsList
│       ├── Section Header
│       ├── Club Cards (grid/list)
│       └── Empty State (if no clubs)
├── ImageUploadModal
└── ShareProfileModal
```

## Components and Interfaces

### Screen Component (Minimal)

**File:** `apps/native/src/app/(tabs)/index.tsx`

```typescript
import { ProfileScreen } from '@native/components/profile/ProfileScreen'

export default function ProfileTab() {
  return <ProfileScreen />
}
```

### ProfileScreen Component

**File:** `apps/native/src/components/profile/ProfileScreen.tsx`

```typescript
interface ProfileScreenProps {
  // No props needed - fetches own data
}

interface ProfileData {
  id: string
  name: string
  username: string | null
  email: string
  image: string | null
  bannerImage: string | null
  bio: string | null
  summary: string | null
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
  createdAt: string
  major: string | null
  yearOfStudy: number | null
}

interface ClubMembership {
  id: string
  name: string
  slug: string
  logo: string | null
  metadata: any
  createdAt: string
}
```

**Responsibilities:**
- Fetch profile data from API
- Fetch club memberships from API
- Manage loading and error states
- Handle pull-to-refresh
- Coordinate modals (image upload, share)
- Pass data to child components

### ProfileBanner Component

**File:** `apps/native/src/components/profile/ProfileBanner.tsx`

```typescript
interface ProfileBannerProps {
  bannerImage: string | null
  profileImage: string | null
  name: string
  onEditBanner: () => void
  onEditAvatar: () => void
}
```

**Responsibilities:**
- Display banner image or gradient background
- Display profile avatar overlaying banner
- Render ActionIcons component
- Handle camera button taps for avatar editing

### ActionIcons Component

**File:** `apps/native/src/components/profile/ActionIcons.tsx`

```typescript
interface ActionIconsProps {
  onSettingsPress: () => void
  onSharePress: () => void
  onEditPress: () => void
}
```

**Responsibilities:**
- Render three action icons (Settings, Share, Edit)
- Style with semi-transparent background and backdrop blur
- Handle icon press events
- Show tooltips on long press

### ProfileInfo Component

**File:** `apps/native/src/components/profile/ProfileInfo.tsx`

```typescript
interface ProfileInfoProps {
  name: string
  username: string | null
  bio: string | null
  studentStatusVerified: boolean
  currentUniversity?: {
    name: string
    city: string
    country: string
  }
  major: string | null
  yearOfStudy: number | null
  createdAt: string
  socialLinks: {
    whatsapp?: string
    telegram?: string
    instagram?: string
    facebook?: string
    twitter?: string
    linkedin?: string
  }
}
```

**Responsibilities:**
- Display user name with verification badge
- Display username with @ prefix
- Display bio text
- Display university, major, and year badges
- Display "Member Since" date
- Display social media links with icons

### ClubsList Component

**File:** `apps/native/src/components/profile/ClubsList.tsx`

```typescript
interface ClubsListProps {
  clubs: ClubMembership[]
  isLoading: boolean
  onClubPress: (clubSlug: string) => void
  onDiscoverPress: () => void
}
```

**Responsibilities:**
- Display "Joined Clubs" section header
- Render club cards in grid/list layout
- Handle club card press to navigate to club detail
- Display empty state with "Discover Clubs" button
- Show loading skeleton when loading

### ImageUploadModal Component

**File:** `apps/native/src/components/profile/ImageUploadModal.tsx`

```typescript
interface ImageUploadModalProps {
  visible: boolean
  type: 'profile' | 'banner'
  currentImageUrl: string | null
  onClose: () => void
  onSave: (imageData: string) => Promise<void>
}
```

**Responsibilities:**
- Open image picker (camera or gallery)
- Display image cropping interface
- Handle image crop and save
- Upload image to backend via API
- Show loading state during upload
- Handle upload errors

### ShareProfileModal Component

**File:** `apps/native/src/components/profile/ShareProfileModal.tsx`

```typescript
interface ShareProfileModalProps {
  visible: boolean
  username: string
  profileUrl: string
  onClose: () => void
}
```

**Responsibilities:**
- Display QR code for profile URL
- Show profile URL with copy button
- Provide native share button
- Handle copy to clipboard
- Show success toast on copy

## Data Models

### API Endpoints Used

All endpoints are already implemented in the backend:

1. **GET `/user/profile/details`**
   - Returns: Full profile data including banner, image, bio, social links, university, verification status
   - Used by: ProfileScreen component

2. **PUT `/user/profile/update`**
   - Input: `{ image?, bannerImage?, name?, username?, bio?, website?, socialLinks? }`
   - Returns: Updated user data
   - Used by: ImageUploadModal component

3. **GET `/organization/list`** (better-auth)
   - Returns: List of user's organization memberships
   - Used by: ProfileScreen component

### Data Flow

1. **Profile Loading**
   ```
   ProfileScreen mounts
   → Fetch profile data: api.user.profile.details.get()
   → Fetch clubs: authClient.organization.list()
   → Cache data locally (React Query)
   → Render ProfileBanner, ProfileInfo, ClubsList
   ```

2. **Image Upload**
   ```
   User taps camera icon
   → Open ImageUploadModal
   → User selects image from picker
   → Display crop interface
   → User confirms crop
   → Upload to backend: api.user.profile.update.put({ image: base64 })
   → Update cache
   → Close modal
   → Display updated image
   ```

3. **Profile Sharing**
   ```
   User taps Share icon
   → Open ShareProfileModal
   → Generate profile URL: https://rovierr.com/{username}
   → Generate QR code from URL
   → User taps Share button
   → Open native share sheet
   → OR User taps Copy button
   → Copy URL to clipboard
   → Show success toast
   ```

4. **Pull to Refresh**
   ```
   User pulls down
   → Show refresh indicator
   → Refetch profile data
   → Refetch clubs data
   → Update cache
   → Hide refresh indicator
   ```

## Styling and Design

### Design System

Using React Native's StyleSheet and following Discord's design patterns:

**Colors:**
- Primary: `#5865F2` (Discord blue)
- Background: `#36393F` (Dark mode) / `#FFFFFF` (Light mode)
- Card Background: `#2F3136` (Dark) / `#F2F3F5` (Light)
- Text Primary: `#FFFFFF` (Dark) / `#060607` (Light)
- Text Secondary: `#B9BBBE` (Dark) / `#4E5058` (Light)
- Success (Verified): `#3BA55D`
- Banner Gradient: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`

**Typography:**
- Name: Bold, 24px
- Username: Regular, 14px
- Bio: Regular, 16px
- Section Headers: Semibold, 18px
- Body Text: Regular, 14px

**Spacing:**
- Banner Height: 120px
- Avatar Size: 80px
- Avatar Overlap: 40px (half of avatar extends below banner)
- Section Padding: 16px
- Card Margin: 8px
- Icon Size: 20px

### Component Styles

**ProfileBanner:**
- Full width banner (120px height)
- Gradient or image background
- Avatar positioned at bottom center, overlapping banner by 40px
- Action icons at top right with semi-transparent background
- Camera button on avatar with primary color background

**ProfileInfo:**
- White/dark card with padding
- Name centered with verification badge
- Username below name in muted color
- Bio text with line height 1.5
- Badges in horizontal scroll
- Social links as icon buttons

**ClubsList:**
- Section header with "Joined Clubs" title
- Grid layout (2 columns on mobile)
- Club cards with logo, name, and role
- Empty state centered with illustration

## Error Handling

### Frontend Error Handling

```typescript
// API Error Handling
try {
  const profile = await api.user.profile.details.get()
} catch (error) {
  if (error.status === 401) {
    // Unauthorized - redirect to login
    router.replace('/auth')
  } else if (error.status === 404) {
    // Profile not found
    showError('Profile not found')
  } else {
    // Generic error
    showError('Failed to load profile. Pull to refresh.')
  }
}

// Image Upload Error Handling
try {
  await api.user.profile.update.put({ image: base64Image })
} catch (error) {
  if (error.status === 413) {
    showError('Image too large. Please select a smaller image.')
  } else if (error.status === 400) {
    showError('Invalid image format.')
  } else {
    showError('Failed to upload image. Please try again.')
  }
}
```

### Offline Handling

```typescript
// Check network status
import NetInfo from '@react-native-community/netinfo'

const [isOffline, setIsOffline] = useState(false)

useEffect(() => {
  const unsubscribe = NetInfo.addEventListener(state => {
    setIsOffline(!state.isConnected)
  })
  return unsubscribe
}, [])

// Show offline banner
{isOffline && (
  <View style={styles.offlineBanner}>
    <Text>You're offline. Showing cached data.</Text>
  </View>
)}
```

## Performance Considerations

1. **Image Optimization**
   - Use Expo Image for automatic caching and optimization
   - Compress images before upload (max 2MB)
   - Use placeholder images while loading

2. **List Performance**
   - Use FlatList for clubs list (virtualization)
   - Implement pagination if clubs > 20
   - Memoize club card components

3. **Caching Strategy**
   - Use React Query for API caching
   - Cache profile data for 5 minutes
   - Cache clubs data for 10 minutes
   - Invalidate cache on pull-to-refresh

4. **Bundle Size**
   - Lazy load modals (ImageUploadModal, ShareProfileModal)
   - Use react-native-svg for icons (smaller than images)
   - Optimize QR code generation library

## Accessibility

1. **Screen Reader Support**
   - Add accessibilityLabel to all interactive elements
   - Add accessibilityHint for action icons
   - Add accessibilityRole for buttons and links

2. **Touch Targets**
   - Minimum 44x44 points for all touchable elements
   - Adequate spacing between interactive elements

3. **Color Contrast**
   - Ensure WCAG AA compliance for text
   - Use high contrast for action icons on banner

4. **Focus Management**
   - Proper focus order for keyboard navigation
   - Focus trap in modals

## Testing Strategy

### Unit Tests

- Component rendering tests
- API call mocking and testing
- Error handling tests
- Data transformation tests

### Integration Tests

- Profile data loading flow
- Image upload flow
- Share profile flow
- Pull-to-refresh flow
- Navigation tests

### E2E Tests (Detox)

- Complete profile viewing flow
- Image upload and crop flow
- Share profile with QR code
- Club navigation
- Offline mode behavior

## Security Considerations

1. **Authentication**: All API calls require authenticated user
2. **Image Upload**: Validate image size and format before upload
3. **Data Privacy**: Don't expose sensitive data in logs
4. **Deep Links**: Validate profile URLs before opening

## Platform-Specific Considerations

### iOS

- Use native share sheet (Share.share)
- Request photo library permissions
- Use iOS-style modals and alerts

### Android

- Use Android share intent
- Request storage permissions
- Use Material Design components where appropriate

## Future Enhancements

1. **Edit Profile Screen**: Dedicated screen for editing all profile fields
2. **Settings Screen**: Account settings, privacy, notifications
3. **Profile Analytics**: View profile views and engagement
4. **Custom Themes**: Allow users to customize profile colors
5. **Profile Badges**: Achievement and verification badges
6. **Profile Completion**: Progress indicator for profile completion
