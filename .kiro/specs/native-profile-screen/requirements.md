# Requirements Document

## Introduction

The Native Profile Screen feature provides a Discord-style mobile interface for students to view their profile information on the Rovierr mobile app. The design features a prominent banner with profile image overlay, action icons at the top right corner, and a scrollable single-page layout displaying profile details and joined clubs below the banner.

## Glossary

- **Profile Screen**: The main profile interface in the React Native mobile app
- **User**: An authenticated student using the Rovierr mobile application
- **Profile Banner**: The header image displayed at the top of the profile screen
- **Profile Avatar**: The circular user profile picture overlaying the banner
- **Action Icons**: Quick access buttons displayed at the top right corner of the banner (Settings, Share, Edit Profile)
- **Profile Section**: A content area displaying specific information (Profile Details, Clubs, etc.)
- **Native App**: The React Native mobile application built with Expo
- **API Client**: The ORPC client for backend communication
- **Screen Component**: A minimal file in the app directory that imports and renders a component
- **Feature Component**: A complete component with logic located in the components directory

## Requirements

### Requirement 1: File Organization and Architecture

**User Story:** As a developer, I want a clean file structure with separation of concerns, so that the codebase is maintainable and follows best practices

#### Acceptance Criteria

1. WHEN a screen file is created in the app directory, THE Profile System SHALL keep it minimal with only imports and rendering
2. WHEN component logic is needed, THE Profile System SHALL place all logic in components located in the components directory
3. WHEN organizing components, THE Profile System SHALL group related components in feature-specific folders
4. WHEN the profile screen is accessed, THE Profile System SHALL import the ProfileScreen component from components/profile directory
5. WHEN new profile features are added, THE Profile System SHALL organize them within the components/profile folder structure

### Requirement 2: Profile Banner and Avatar Display

**User Story:** As a mobile user, I want to see my profile banner and avatar prominently displayed, so that I can have a visually appealing profile similar to Discord

#### Acceptance Criteria

1. WHEN the User navigates to the profile screen, THE Profile System SHALL display a full-width banner at the top
2. WHEN the User has a custom banner image, THE Profile System SHALL display the banner image
3. WHERE the User has no custom banner image, THE Profile System SHALL display a gradient background
4. WHEN the banner is displayed, THE Profile System SHALL show the profile avatar overlaying the bottom portion of the banner
5. WHEN the profile avatar is displayed, THE Profile System SHALL show a camera icon button for editing the avatar
6. WHEN the User taps the camera icon on the avatar, THE Profile System SHALL open the image upload dialog

### Requirement 3: Action Icons on Banner

**User Story:** As a mobile user, I want quick access to profile actions from the banner, so that I can efficiently manage my profile settings and share my profile

#### Acceptance Criteria

1. WHEN the Profile Banner is displayed, THE Profile System SHALL show action icons at the top right corner of the banner
2. WHEN the User taps the Settings icon, THE Profile System SHALL navigate to a settings screen
3. WHEN the User taps the Share icon, THE Profile System SHALL open the native share dialog with profile link and QR code
4. WHEN the User taps the Edit Profile icon, THE Profile System SHALL navigate to an edit profile screen
5. WHEN action icons are displayed, THE Profile System SHALL use semi-transparent backgrounds with proper contrast for visibility
6. WHEN the User long-presses an action icon, THE Profile System SHALL display a tooltip explaining the action

### Requirement 4: Profile Information Display

**User Story:** As a mobile user, I want to view my profile information below the banner, so that I can see my name, username, verification status, bio, and university

#### Acceptance Criteria

1. WHEN the profile information section is displayed, THE Profile System SHALL show the User's name prominently
2. WHEN the User is verified, THE Profile System SHALL display a verification badge next to the name
3. WHEN the User has a username, THE Profile System SHALL display the username with @ prefix
4. WHEN the User has a bio, THE Profile System SHALL display the bio text below the name
5. WHEN the User is enrolled at a university, THE Profile System SHALL display university badges
6. WHEN the User has a major or year of study, THE Profile System SHALL display these as additional badges
7. WHEN the User has social media links, THE Profile System SHALL display them with appropriate icons in the profile details section

### Requirement 5: Joined Clubs Display

**User Story:** As a mobile user, I want to view my joined clubs below my profile details, so that I can see all my club memberships in one place

#### Acceptance Criteria

1. WHEN the clubs section is displayed, THE Profile System SHALL show a "Joined Clubs" heading
2. WHEN the Profile System loads club data, THE Profile System SHALL fetch organization memberships from the backend API
3. WHEN clubs are displayed, THE Profile System SHALL show club logo, name, and membership role in a card layout
4. WHEN the User taps on a club card, THE Profile System SHALL navigate to the club's detail screen
5. WHERE the User has no club memberships, THE Profile System SHALL display an empty state with a button to discover clubs
6. WHEN multiple clubs are displayed, THE Profile System SHALL show them in a grid or list layout

### Requirement 6: Profile Data Loading

**User Story:** As a mobile user, I want my profile data to load efficiently, so that I can view my information quickly

#### Acceptance Criteria

1. WHEN the Profile System loads, THE Profile System SHALL fetch profile details from the backend API
2. WHEN the Profile System loads, THE Profile System SHALL fetch club memberships from the backend API
3. WHEN data is loading, THE Profile System SHALL display loading skeletons for each section
4. WHEN data loading fails, THE Profile System SHALL display an error message with a retry button
5. WHEN data loads successfully, THE Profile System SHALL display all profile information and clubs

### Requirement 7: Image Upload and Editing

**User Story:** As a mobile user, I want to upload and edit my profile picture and banner, so that I can personalize my profile

#### Acceptance Criteria

1. WHEN the User taps the camera icon on the avatar, THE Profile System SHALL open an image picker
2. WHEN the User selects an image, THE Profile System SHALL display an image cropping interface
3. WHEN the User confirms the cropped image, THE Profile System SHALL upload the image to the backend
4. WHEN the image upload is successful, THE Profile System SHALL update the displayed image
5. WHEN the User taps the edit banner button, THE Profile System SHALL follow the same upload and crop flow for the banner image
6. WHEN image upload fails, THE Profile System SHALL display an error message

### Requirement 8: Profile Sharing

**User Story:** As a mobile user, I want to share my profile with others, so that I can connect with fellow students

#### Acceptance Criteria

1. WHEN the User taps the Share icon, THE Profile System SHALL generate a profile URL
2. WHEN the share dialog opens, THE Profile System SHALL display a QR code for the profile
3. WHEN the User taps the share button, THE Profile System SHALL open the native share sheet with the profile URL
4. WHEN the User taps the copy link button, THE Profile System SHALL copy the profile URL to the clipboard
5. WHEN the link is copied, THE Profile System SHALL display a confirmation toast message

### Requirement 9: Scrollable Layout

**User Story:** As a mobile user, I want to scroll through my profile content, so that I can view all information on a single screen

#### Acceptance Criteria

1. WHEN the profile screen is displayed, THE Profile System SHALL use a ScrollView for the entire content
2. WHEN the User scrolls down, THE Profile System SHALL show profile details followed by joined clubs
3. WHEN the User scrolls to the top, THE Profile System SHALL show the banner and avatar
4. WHEN the User scrolls, THE Profile System SHALL maintain smooth scrolling performance
5. WHEN content extends beyond the screen, THE Profile System SHALL show a scroll indicator

### Requirement 10: Pull-to-Refresh

**User Story:** As a mobile user, I want to refresh my profile data by pulling down, so that I can ensure I'm viewing the latest information

#### Acceptance Criteria

1. WHEN the User pulls down on the profile screen, THE Profile System SHALL trigger a refresh
2. WHEN refreshing, THE Profile System SHALL display a loading indicator
3. WHEN the refresh is complete, THE Profile System SHALL update all displayed data
4. WHEN the refresh fails, THE Profile System SHALL display an error message
5. WHEN the refresh is successful, THE Profile System SHALL hide the loading indicator

### Requirement 11: Offline Support and Caching

**User Story:** As a mobile user, I want to view my cached profile data when offline, so that I can access my information without an internet connection

#### Acceptance Criteria

1. WHEN the Profile System loads profile data, THE Profile System SHALL cache the data locally
2. WHEN the User is offline, THE Profile System SHALL display the cached profile data
3. WHEN the User is offline, THE Profile System SHALL display an indicator showing offline status
4. WHEN the User regains connectivity, THE Profile System SHALL refresh the profile data from the backend
5. WHEN cached data is displayed, THE Profile System SHALL show a timestamp of when the data was last updated

### Requirement 12: Member Since Display

**User Story:** As a mobile user, I want to see when I joined Rovierr, so that I can track my membership duration

#### Acceptance Criteria

1. WHEN the profile details section is displayed, THE Profile System SHALL show a "Member Since" label
2. WHEN the member since date is displayed, THE Profile System SHALL format it as a readable date
3. WHEN the User has been a member for less than a year, THE Profile System SHALL show the month and year
4. WHEN the User has been a member for over a year, THE Profile System SHALL show the full date
5. WHEN the member since data is unavailable, THE Profile System SHALL hide the member since section
