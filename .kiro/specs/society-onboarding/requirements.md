# Requirements: Society Creation and Onboarding

## Introduction

This document outlines the requirements for implementing a comprehensive society creation and onboarding flow. The system allows verified students to create societies (student clubs/organizations), complete a guided onboarding process to set up their society profile with social links and additional information, and access a settings dashboard to manage their society.

## Glossary

- **Society**: A student-run organization or club within a university
- **Creator**: The verified student who creates a society and becomes its first president
- **President**: The primary administrator role for a society with full permissions
- **Society Profile**: The public-facing information about a society including name, description, logo, banner, and social links
- **Social Links**: External platform URLs (Instagram, Facebook, Twitter, LinkedIn, WhatsApp, Telegram, Website)
- **Onboarding Flow**: A guided multi-step process to help society creators set up their society profile after creation
- **Society Settings**: Administrative interface for managing society information, members, and configuration
- **University Official Organization**: A society officially recognized and managed by the university administration
- **Student Society**: A student-run organization that may or may not be affiliated with a university

## Requirements

### Requirement 1: Enhanced Society Creation Form

**User Story:** As a verified student, I want to create a new society with comprehensive information including social links, so that I can establish my organization's online presence from the start

#### Acceptance Criteria

1. WHEN a verified user accesses the society creation page, THE System SHALL display a creation form with all required and optional fields
2. WHEN the user fills the creation form, THE Form SHALL collect:
   - Society name (required, 1-100 characters)
   - Description (required, 1-1000 characters)
   - University affiliation (optional, selected from university list)
   - Organization type (required, toggle: "Student Society" or "University Official")
   - Tags (optional, array of strings for categorization)
   - Instagram handle (optional, URL format)
   - Facebook page URL (optional, URL format)
   - Twitter handle (optional, URL format)
   - LinkedIn page URL (optional, URL format)
   - WhatsApp contact (optional, phone number or group link)
   - Telegram group/channel (optional, URL or username)
   - Website URL (optional, URL format)
3. WHEN the organization type is "University Official", THE Form SHALL require university affiliation selection
4. WHEN the organization type is "Student Society", THE Form SHALL make university affiliation optional
5. WHEN the user submits the form with valid data, THE System SHALL create the society record with all provided information
6. WHEN the society is created, THE System SHALL automatically assign the creator as president with full permissions
7. WHEN the society creation succeeds, THE System SHALL redirect the user to the society onboarding flow

### Requirement 2: Society Onboarding Flow

**User Story:** As a society creator, I want to complete a guided onboarding process after creating my society, so that I can set up my society's profile with visual branding and additional details

#### Acceptance Criteria

1. WHEN a society is created, THE System SHALL redirect the creator to "/spaces/societies/mine/[societyId]/onboarding"
2. WHEN the onboarding page loads, THE System SHALL display a multi-step wizard with progress indicator
3. WHEN the user is on Step 1 (Visual Branding), THE Form SHALL collect:
   - Society logo (optional, image upload, max 5MB, formats: jpg, png, webp)
   - Society banner (optional, image upload, max 10MB, formats: jpg, png, webp)
   - Primary color (optional, color picker for theme customization)
4. WHEN the user is on Step 2 (Contact Information), THE Form SHALL allow editing:
   - Instagram handle (optional)
   - Facebook page URL (optional)
   - Twitter handle (optional)
   - LinkedIn page URL (optional)
   - WhatsApp contact (optional)
   - Telegram group/channel (optional)
   - Website URL (optional)
5. WHEN the user is on Step 3 (Additional Details), THE Form SHALL collect:
   - Founding year (optional, year picker)
   - Meeting schedule (optional, text field, e.g., "Every Tuesday 6 PM")
   - Membership requirements (optional, textarea, max 500 characters)
   - Society goals (optional, textarea, max 1000 characters)
6. WHEN the user completes any step, THE System SHALL save the data immediately
7. WHEN the user clicks "Skip" on any step, THE System SHALL proceed to the next step without saving
8. WHEN the user completes all steps or clicks "Finish Later", THE System SHALL redirect to the society dashboard
9. WHEN the user returns to onboarding later, THE System SHALL resume from the last incomplete step

### Requirement 3: Society Profile Display

**User Story:** As a society member or visitor, I want to view a society's complete profile with all information and social links, so that I can learn about the society and connect with them

#### Acceptance Criteria

1. WHEN a user visits a public society profile page at "/societies/[societyId]", THE System SHALL display the society banner at the top
2. WHEN the banner is not set, THE System SHALL display a default gradient background
3. WHEN a user views the profile, THE System SHALL display the society logo overlapping the banner
4. WHEN the logo is not set, THE System SHALL display initials in an avatar
5. WHEN a user views the profile, THE System SHALL display:
   - Society name
   - Description
   - Tags as badges
   - Member count
   - University affiliation (if set)
   - Organization type badge
6. WHEN social links are set, THE System SHALL display them as clickable icons in a social links section
7. WHEN additional details are set, THE System SHALL display them in organized sections:
   - About section (goals, founding year)
   - Meeting Information (schedule, location)
   - Membership (requirements)
8. WHEN a social link is not set, THE System SHALL not display that social icon
9. WHEN a member visits their society dashboard at "/spaces/societies/mine/[societyId]", THE System SHALL display member-specific content including profile completion status and quick actions

### Requirement 4: Society Settings Dashboard

**User Story:** As a society president, I want to access a settings dashboard to manage my society's information, so that I can keep the profile up-to-date and configure society settings

#### Acceptance Criteria

1. WHEN a president accesses "/spaces/societies/mine/[societyId]/settings", THE System SHALL display the settings dashboard
2. WHEN a non-president member accesses settings, THE System SHALL display an access denied message
3. WHEN the settings page loads, THE System SHALL display tabs for different setting categories:
   - General (name, description, tags, type, visibility)
   - Branding (logo, banner, colors)
   - Social Links (all social platform links)
   - Details (founding year, meeting info, membership requirements, goals)
   - Members (member management - future requirement)
   - Permissions (role management - future requirement)
4. WHEN the president updates any setting, THE System SHALL validate the input
5. WHEN validation passes, THE System SHALL save the changes immediately
6. WHEN changes are saved, THE System SHALL display a success toast notification
7. WHEN validation fails, THE System SHALL display field-specific error messages
8. WHEN the president changes the society name, THE System SHALL automatically update the slug

### Requirement 5: Image Upload and Management

**User Story:** As a society president, I want to upload and manage logo and banner images, so that I can visually brand my society

#### Acceptance Criteria

1. WHEN a president uploads a logo image, THE System SHALL validate:
   - File size is under 5MB
   - File format is jpg, png, or webp
   - Image dimensions are at least 200x200 pixels
2. WHEN a president uploads a banner image, THE System SHALL validate:
   - File size is under 10MB
   - File format is jpg, png, or webp
   - Image dimensions are at least 1200x400 pixels
3. WHEN validation passes, THE System SHALL upload the image to cloud storage
4. WHEN the upload succeeds, THE System SHALL update the society record with the image URL
5. WHEN the upload fails, THE System SHALL display an error message with the reason
6. WHEN a president removes an image, THE System SHALL delete it from cloud storage and update the society record
7. WHEN displaying images, THE System SHALL use optimized formats and responsive sizing

### Requirement 6: Social Link Validation

**User Story:** As a society president, I want the system to validate social links, so that I can ensure all links are correctly formatted and functional

#### Acceptance Criteria

1. WHEN a president enters an Instagram handle, THE System SHALL validate it matches Instagram username format
2. WHEN a president enters a Facebook URL, THE System SHALL validate it is a valid Facebook page URL
3. WHEN a president enters a Twitter handle, THE System SHALL validate it matches Twitter username format
4. WHEN a president enters a LinkedIn URL, THE System SHALL validate it is a valid LinkedIn page URL
5. WHEN a president enters a WhatsApp contact, THE System SHALL validate it is either a phone number or valid WhatsApp link
6. WHEN a president enters a Telegram link, THE System SHALL validate it is a valid Telegram username or group link
7. WHEN a president enters a website URL, THE System SHALL validate it is a properly formatted URL with protocol
8. WHEN validation fails, THE System SHALL display a helpful error message explaining the expected format

### Requirement 7: Onboarding Progress Tracking

**User Story:** As a society president, I want to see my onboarding progress, so that I know what information is still needed to complete my society profile

#### Acceptance Criteria

1. WHEN a president views the society dashboard, THE System SHALL display a profile completion percentage
2. WHEN the profile is incomplete, THE System SHALL display a "Complete Your Profile" card with missing items
3. WHEN the president clicks on a missing item, THE System SHALL navigate to the relevant settings section
4. WHEN the profile completion reaches 100%, THE System SHALL hide the completion card
5. WHEN calculating completion, THE System SHALL consider:
   - Basic info (name, description) - 30%
   - Visual branding (logo, banner) - 20%
   - Social links (at least 2 links) - 20%
   - Additional details (at least 2 fields) - 20%
   - Member count (at least 3 members) - 10%

### Requirement 8: Database Schema Updates

**User Story:** As a system administrator, I want the database schema to support all society profile fields, so that all information can be properly stored and retrieved

#### Acceptance Criteria

1. WHEN the system initializes, THE Database SHALL include these fields in the organization table:
   - instagram (text, nullable)
   - facebook (text, nullable)
   - twitter (text, nullable)
   - linkedin (text, nullable)
   - whatsapp (text, nullable)
   - telegram (text, nullable)
   - website (text, nullable)
   - foundingYear (integer, nullable)
   - meetingSchedule (text, nullable)
   - membershipRequirements (text, nullable)
   - goals (text, nullable)
   - primaryColor (text, nullable)
   - onboardingCompleted (boolean, default false)
2. WHEN querying societies, THE System SHALL include all social link fields in the response
3. WHEN updating societies, THE System SHALL validate and sanitize all input fields

### Requirement 9: ORPC Contract Updates

**User Story:** As a developer, I want type-safe API contracts for society operations, so that frontend and backend stay in sync

#### Acceptance Criteria

1. WHEN defining the create society contract, THE Contract SHALL include all creation fields with proper validation
2. WHEN defining the update society contract, THE Contract SHALL include all updatable fields with proper validation
3. WHEN defining the get society contract, THE Contract SHALL return all society fields including social links
4. WHEN defining contracts, THE System SHALL use Zod schemas for runtime validation
5. WHEN a contract validation fails, THE System SHALL return descriptive error messages

### Requirement 10: Navigation and Routing

**User Story:** As a society president, I want intuitive navigation between society pages, so that I can easily manage my society

#### Acceptance Criteria

1. WHEN a society is created, THE System SHALL redirect to "/spaces/societies/mine/[societyId]/onboarding"
2. WHEN onboarding is completed, THE System SHALL redirect to "/spaces/societies/mine/[societyId]"
3. WHEN a president clicks "Settings" in the society navigation, THE System SHALL navigate to "/spaces/societies/mine/[societyId]/settings"
4. WHEN a president completes onboarding, THE System SHALL add a "Settings" link to the society sidebar
5. WHEN viewing any society page, THE System SHALL highlight the active navigation item

## Non-Functional Requirements

### Security

- Only verified students can create societies
- Only society presidents can access settings
- Image uploads must be scanned for malicious content
- Social links must be validated to prevent XSS attacks
- All user input must be sanitized before storage

### Performance

- Society creation should complete within 2 seconds
- Image uploads should show progress indicators
- Settings updates should save within 1 second
- Profile pages should load within 1.5 seconds
- Images should be optimized and cached

### Usability

- Onboarding can be skipped and completed later
- All forms should have clear labels and placeholders
- Error messages should be specific and actionable
- Loading states should be shown for all async operations
- Success feedback should be provided for all actions
- Mobile-responsive design for all pages

### Data Integrity

- Society names must be unique within a university
- Slugs must be unique across all societies
- Social links must be validated before storage
- Image URLs must be verified before storage
- All updates must be atomic

### Technology Stack

- Backend: Bun + Hono + Drizzle ORM + PostgreSQL
- Frontend: Next.js + React + TypeScript + Tailwind CSS
- Forms: TanStack Form with Zod validation
- API: ORPC for type-safe contracts
- Auth: Better-Auth for authentication and authorization
- Storage: Cloud storage for images (AWS S3 or similar)
- UI: Radix UI + ShadCN components
