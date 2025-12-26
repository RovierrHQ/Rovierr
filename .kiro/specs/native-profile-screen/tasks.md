# Implementation Plan: Native Profile Screen

## Overview

This implementation plan breaks down the Native Profile Screen feature into discrete, actionable tasks. The implementation follows a bottom-up approach, starting with foundational components and building up to the complete screen.

## Tasks

- [x] 1. Set up component directory structure
  - Create `apps/native/src/components/profile/` directory
  - Create placeholder files for all profile components
  - Export components from index file for easy imports
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Create ProfileSkeleton loading component
  - Build `ProfileSkeleton.tsx` in `apps/native/src/components/profile/`
  - Create skeleton for banner section
  - Create skeleton for profile info section
  - Create skeleton for clubs section
  - Use React Native's Animated API for shimmer effect
  - _Requirements: 6.3_

- [x] 3. Create ActionIcons component
  - Build `ActionIcons.tsx` in `apps/native/src/components/profile/`
  - Implement Settings icon button with semi-transparent background
  - Implement Share icon button with semi-transparent background
  - Implement Edit Profile icon button with semi-transparent background
  - Add backdrop blur effect using react-native-blur or similar
  - Position icons at top right corner of banner
  - Add long-press tooltip functionality
  - Make icons responsive to different screen sizes
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 4. Create ProfileBanner component
  - Build `ProfileBanner.tsx` in `apps/native/src/components/profile/`
  - Display banner image using Expo Image component
  - Display gradient background when no banner image exists
  - Position profile avatar overlaying bottom of banner
  - Add camera icon button on avatar for editing
  - Integrate ActionIcons component at top right
  - Handle banner and avatar edit button presses
  - Add proper image loading states and error handling
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 5. Create ProfileInfo component
  - Build `ProfileInfo.tsx` in `apps/native/src/components/profile/`
  - Display user name with proper typography
  - Add verification badge next to name when verified
  - Display username with @ prefix
  - Display bio text with proper line height
  - Display university badge with name, city, country
  - Display major and year of study badges
  - Display "Member Since" date formatted properly
  - Display social media links with icons (WhatsApp, Telegram, Instagram, Facebook, Twitter, LinkedIn)
  - Make social links tappable to open respective apps/websites
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 6. Create ClubsList component
  - Build `ClubsList.tsx` in `apps/native/src/components/profile/`
  - Display "Joined Clubs" section header
  - Render club cards in grid layout (2 columns)
  - Display club logo, name, and membership role on each card
  - Handle club card press to navigate to club detail screen
  - Display empty state with illustration when no clubs
  - Add "Discover Clubs" button in empty state
  - Show loading skeleton when clubs are loading
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 7. Create ImageUploadModal component
  - Build `ImageUploadModal.tsx` in `apps/native/src/components/profile/`
  - Implement modal with bottom sheet style
  - Add "Choose from Gallery" button
  - Add "Take Photo" button
  - Request camera and photo library permissions
  - Integrate expo-image-picker for image selection
  - Integrate react-native-image-crop-picker for cropping
  - Display crop interface after image selection
  - Handle image upload to backend via `api.user.profile.update.put()`
  - Show loading indicator during upload
  - Display error messages for upload failures
  - Close modal on successful upload
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 8. Create ShareProfileModal component
  - Build `ShareProfileModal.tsx` in `apps/native/src/components/profile/`
  - Generate profile URL from username
  - Display QR code using react-native-qrcode-svg
  - Display profile URL in text input (read-only)
  - Add "Copy Link" button with clipboard functionality
  - Add "Share" button to open native share sheet
  - Show success toast when link is copied
  - Handle share sheet errors gracefully
  - Style modal with proper spacing and colors
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 9. Create ProfileScreen main component
  - Build `ProfileScreen.tsx` in `apps/native/src/components/profile/`
  - Set up React Query for data fetching
  - Fetch profile data using `api.user.profile.details.get()`
  - Fetch clubs data using `authClient.organization.list()`
  - Implement loading state with ProfileSkeleton
  - Implement error state with retry button
  - Set up ScrollView with RefreshControl for pull-to-refresh
  - Manage ImageUploadModal state (visible, type)
  - Manage ShareProfileModal state (visible)
  - Pass data to ProfileBanner, ProfileInfo, and ClubsList components
  - Handle navigation to settings and edit profile screens
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 10. Implement offline support and caching
  - Install and configure @react-native-community/netinfo
  - Add network status listener in ProfileScreen
  - Display offline banner when network is unavailable
  - Configure React Query cache settings (staleTime, cacheTime)
  - Implement cache persistence using AsyncStorage
  - Display "Last updated" timestamp when showing cached data
  - Auto-refresh data when network is restored
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 11. Update screen file to use ProfileScreen component
  - Update `apps/native/src/app/(tabs)/index.tsx`
  - Remove all existing logic and components
  - Import ProfileScreen from components/profile
  - Render ProfileScreen component
  - Keep file minimal (5-10 lines)
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 12. Add navigation handlers
  - Implement navigation to settings screen (create placeholder if needed)
  - Implement navigation to edit profile screen (create placeholder if needed)
  - Implement navigation to club detail screen
  - Implement navigation to discover clubs screen
  - Use expo-router for all navigation
  - _Requirements: 3.2, 3.4, 5.4, 5.5_

- [x] 13. Implement image compression and optimization
  - Add image compression before upload (max 2MB)
  - Use expo-image-manipulator for resizing
  - Convert images to JPEG format for smaller size
  - Add image quality slider in crop interface (optional)
  - Display file size before and after compression
  - _Requirements: 7.3, 7.4_

- [x] 14. Add error handling and user feedback
  - Implement toast notifications using react-native-toast-message
  - Add error boundaries for component error handling
  - Display user-friendly error messages for API failures
  - Add retry mechanisms for failed API calls
  - Show loading states for all async operations
  - _Requirements: 6.4, 7.6, 8.5, 10.4_

- [x] 15. Implement accessibility features
  - Add accessibilityLabel to all interactive elements
  - Add accessibilityHint for action icons
  - Add accessibilityRole for buttons and links
  - Ensure minimum 44x44 touch targets
  - Test with screen reader (TalkBack/VoiceOver)
  - Add focus management for modals
  - _Requirements: All requirements (accessibility)_

- [x] 16. Add platform-specific adjustments
  - Test on iOS and Android devices
  - Adjust modal styles for platform differences
  - Handle safe area insets properly
  - Test image picker on both platforms
  - Test share functionality on both platforms
  - Adjust permissions requests for each platform
  - _Requirements: All requirements (platform compatibility)_

- [x] 17. Optimize performance
  - Memoize ProfileInfo and ClubsList components
  - Use FlatList for clubs if count > 10
  - Implement image caching with Expo Image
  - Lazy load modals (dynamic imports)
  - Profile component rendering performance
  - Test scroll performance with large data sets
  - _Requirements: 9.4, 9.5_

- [x] 18. Add pull-to-refresh functionality
  - Integrate RefreshControl in ScrollView
  - Implement refresh handler to refetch all data
  - Show loading indicator during refresh
  - Update cache after successful refresh
  - Handle refresh errors gracefully
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 19. Style components with design system
  - Create shared styles file for profile components
  - Implement color scheme (light/dark mode support)
  - Add proper spacing and padding
  - Implement typography scale
  - Add shadows and elevation
  - Test on different screen sizes
  - _Requirements: All requirements (visual design)_

- [x] 20. Test complete profile flow
  - Test profile data loading
  - Test image upload for avatar and banner
  - Test profile sharing with QR code
  - Test club navigation
  - Test pull-to-refresh
  - Test offline mode
  - Test error scenarios
  - Test on multiple devices and screen sizes
  - _Requirements: All requirements (integration testing)_

## Notes

- All components should use TypeScript for type safety
- Use React Query for data fetching and caching
- Use Expo Image for optimized image loading
- Follow React Native best practices for performance
- Ensure proper error handling and user feedback
- Test on both iOS and Android platforms
- Components should be reusable and well-documented
