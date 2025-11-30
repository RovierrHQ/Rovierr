# Requirements Document

## Introduction

The Society Member Registration System enables society presidents to configure and manage how prospective members can join their society. Presidents can create custom registration forms (using the existing Form Builder System), set up payment requirements, generate QR codes for easy access at events, and manage incoming join requests. This system provides a flexible, configurable approach to society membership that can be adapted for different societies' needs - from simple free registration to complex multi-step processes with payments and custom questions.

## Glossary

- **Society President**: A user with president role in a society who can configure registration settings
- **Prospective Member**: A user who wants to join a society but is not yet a member
- **Registration Form**: A custom form created using the Form Builder System for collecting member information
- **Registration Process**: The complete flow a prospective member goes through to join a society
- **Join Request**: A submitted registration form awaiting president approval
- **QR Code**: A scannable code that directs users to the society's registration page
- **Registration URL**: A unique public URL for a society's registration process
- **Registration Settings**: Configuration for how members can join a society
- **Auto-Approval**: Automatic acceptance of join requests without manual review
- **Manual Approval**: President must review and approve each join request
- **Registration Fee**: Optional payment required to complete registration
- **Member Capacity**: Maximum number of members a society can accept
- **Registration Period**: Time window when registration is open

## Requirements

### Requirement 1

**User Story:** As a society president, I want to configure my society's registration process, so that I can control how prospective members join my society

#### Acceptance Criteria

1. WHEN a society president accesses registration settings THEN the System SHALL display a configuration interface at "/spaces/societies/mine/[societyId]/settings/registration"
2. WHEN configuring registration THEN the System SHALL allow the president to enable or disable member registration
3. WHEN registration is enabled THEN the System SHALL allow the president to select an approval mode: "Auto-Approve" or "Manual Review"
4. WHEN configuring registration THEN the System SHALL allow the president to select or create a registration form from the Form Builder
5. WHEN no registration form exists THEN the System SHALL provide a quick action to create a new form

### Requirement 2

**User Story:** As a society president, I want to create a custom registration form, so that I can collect specific information from prospective members

#### Acceptance Criteria

1. WHEN creating a registration form THEN the System SHALL launch the Form Builder with entity type set to "society_registration"
2. WHEN creating a registration form THEN the System SHALL pre-populate smart fields for common member data (name, email, student ID, university, department)
3. WHEN saving a registration form THEN the System SHALL associate it with the society
4. WHEN a registration form is saved THEN the System SHALL make it available for selection in registration settings
5. WHEN a registration form includes payment THEN the System SHALL configure the registration fee automatically

### Requirement 3

**User Story:** As a society president, I want to generate a QR code for my registration process, so that I can easily share it at university events and fairs

#### Acceptance Criteria

1. WHEN registration is enabled THEN the System SHALL generate a unique registration URL in format "/join/[societySlug]"
2. WHEN viewing registration settings THEN the System SHALL display a QR code that links to the registration URL
3. WHEN the president clicks "Download QR Code" THEN the System SHALL generate a high-resolution PNG image with the society logo and name
4. WHEN the president clicks "Print QR Code" THEN the System SHALL open a print-friendly page with the QR code, society name, and brief description
5. WHEN the QR code is scanned THEN the System SHALL redirect users to the society registration page

### Requirement 4

**User Story:** As a prospective member, I want to access a society's registration page via QR code or URL, so that I can easily start the join process

#### Acceptance Criteria

1. WHEN a user visits "/join/[societySlug]" THEN the System SHALL display the society's public registration page
2. WHEN registration is disabled THEN the System SHALL display a message indicating registration is currently closed
3. WHEN registration is enabled THEN the System SHALL display the society banner, logo, name, and description
4. WHEN viewing the registration page THEN the System SHALL display a "Join Now" button
5. WHEN the user is already a member THEN the System SHALL display a message indicating they are already a member

### Requirement 5

**User Story:** As a prospective member, I want to fill out the registration form, so that I can submit my request to join the society

#### Acceptance Criteria

1. WHEN a user clicks "Join Now" THEN the System SHALL display the configured registration form
2. WHEN the form includes smart fields THEN the System SHALL auto-fill them with the user's profile data
3. WHEN the form includes payment THEN the System SHALL display the registration fee amount
4. WHEN the user submits the form THEN the System SHALL validate all required fields
5. WHEN validation passes THEN the System SHALL create a join request record with status "pending"

### Requirement 6

**User Story:** As a prospective member, I want to see payment instructions if required, so that I can complete payment and finalize my registration

#### Acceptance Criteria

1. WHEN a registration form includes payment THEN the System SHALL display payment instructions (e.g., bank details, payment QR code screenshot) after form submission
2. WHEN payment instructions are displayed THEN the System SHALL update the join request status to "payment_pending"
3. WHEN a user submits payment proof THEN the System SHALL allow uploading payment confirmation (screenshot, receipt)
4. WHEN payment instructions are displayed THEN the System SHALL send a confirmation email with payment details to the user
5. WHEN auto-approval is enabled and payment is manually verified THEN the System SHALL automatically approve the join request

Note: Automated payment processing via Stripe Connect is planned for future release. Current implementation uses manual payment verification by society presidents.

### Requirement 7

**User Story:** As a society president, I want to view all join requests, so that I can manage prospective members

#### Acceptance Criteria

1. WHEN a president accesses "/spaces/societies/mine/[societyId]/join-requests" THEN the System SHALL display a list of all join requests
2. WHEN viewing join requests THEN the System SHALL display: applicant name, submission date, payment status, and current status
3. WHEN viewing join requests THEN the System SHALL allow filtering by status: "pending", "approved", "rejected", "payment_pending"
4. WHEN viewing join requests THEN the System SHALL allow sorting by submission date
5. WHEN a new join request is submitted THEN the System SHALL display a notification badge on the join requests navigation item

### Requirement 8

**User Story:** As a society president, I want to review individual join requests, so that I can make informed approval decisions

#### Acceptance Criteria

1. WHEN a president clicks on a join request THEN the System SHALL display a detailed view with all form responses
2. WHEN viewing a join request THEN the System SHALL display the applicant's profile information
3. WHEN viewing a join request THEN the System SHALL display payment status and transaction details if applicable
4. WHEN viewing a pending request THEN the System SHALL display "Approve" and "Reject" action buttons
5. WHEN viewing a join request THEN the System SHALL display the submission timestamp and any notes

### Requirement 9

**User Story:** As a society president, I want to approve join requests, so that I can add new members to my society

#### Acceptance Criteria

1. WHEN a president clicks "Approve" on a join request THEN the System SHALL prompt for confirmation
2. WHEN approval is confirmed THEN the System SHALL create a membership record with role "member"
3. WHEN a member is added THEN the System SHALL update the join request status to "approved"
4. WHEN a member is added THEN the System SHALL send a welcome email to the new member
5. WHEN a member is added THEN the System SHALL increment the society's member count

### Requirement 10

**User Story:** As a society president, I want to reject join requests, so that I can decline applicants who don't meet requirements

#### Acceptance Criteria

1. WHEN a president clicks "Reject" on a join request THEN the System SHALL prompt for an optional rejection reason
2. WHEN rejection is confirmed THEN the System SHALL update the join request status to "rejected"
3. WHEN a request is rejected THEN the System SHALL send a notification email to the applicant
4. WHEN a rejection reason is provided THEN the System SHALL include it in the notification email
5. WHEN a request is rejected THEN the System SHALL not create a membership record

### Requirement 11

**User Story:** As a society president, I want to manually verify payment for join requests, so that I can confirm members have paid before approving them

#### Acceptance Criteria

1. WHEN viewing a join request with payment required THEN the System SHALL display payment amount and any uploaded payment proof
2. WHEN a president verifies payment THEN the System SHALL allow marking payment as "verified" with optional notes
3. WHEN payment is marked as verified THEN the System SHALL update the join request payment status to "verified"
4. WHEN payment is not verified THEN the System SHALL allow marking it as "not_verified" with a reason
5. WHEN payment status changes THEN the System SHALL send a notification to the applicant

### Requirement 12

**User Story:** As a society president, I want to set registration capacity limits, so that I can control society size

#### Acceptance Criteria

1. WHEN configuring registration settings THEN the System SHALL allow setting a maximum member capacity
2. WHEN capacity is set THEN the System SHALL display current member count and remaining slots
3. WHEN capacity is reached THEN the System SHALL automatically close registration
4. WHEN capacity is reached THEN the System SHALL display a "Registration Full" message on the registration page
5. WHEN a member leaves and capacity was full THEN the System SHALL automatically reopen registration

### Requirement 13

**User Story:** As a society president, I want to set registration periods, so that I can control when registration is open

#### Acceptance Criteria

1. WHEN configuring registration settings THEN the System SHALL allow setting a registration start date and time
2. WHEN configuring registration settings THEN the System SHALL allow setting a registration end date and time
3. WHEN current time is before start date THEN the System SHALL display "Registration Opens On [Date]" message
4. WHEN current time is after end date THEN the System SHALL display "Registration Closed" message
5. WHEN registration period is active THEN the System SHALL allow new submissions

### Requirement 14

**User Story:** As a prospective member, I want to receive confirmation after submitting my registration, so that I know my request was received

#### Acceptance Criteria

1. WHEN a registration form is submitted successfully THEN the System SHALL display a confirmation page
2. WHEN auto-approval is enabled THEN the System SHALL display "Welcome! You are now a member" message
3. WHEN manual approval is required THEN the System SHALL display "Your request is under review" message
4. WHEN payment is required THEN the System SHALL display payment instructions
5. WHEN registration is submitted THEN the System SHALL send a confirmation email with next steps

### Requirement 15

**User Story:** As a society president, I want to receive notifications for new join requests, so that I can respond promptly

#### Acceptance Criteria

1. WHEN a new join request is submitted THEN the System SHALL send an email notification to all society presidents
2. WHEN a join request includes payment THEN the System SHALL include payment details in the notification
3. WHEN configuring registration settings THEN the System SHALL allow enabling/disabling email notifications
4. WHEN notifications are enabled THEN the System SHALL send a daily digest of pending requests
5. WHEN a join request is submitted THEN the System SHALL create an in-app notification for presidents

### Requirement 26

**User Story:** As a society president, I want to bulk approve or reject join requests, so that I can efficiently process multiple applications

#### Acceptance Criteria

1. WHEN viewing join requests THEN the System SHALL display checkboxes for selecting multiple requests
2. WHEN multiple requests are selected THEN the System SHALL display bulk action buttons
3. WHEN bulk approving THEN the System SHALL process all selected requests and create membership records
4. WHEN bulk rejecting THEN the System SHALL prompt for a common rejection reason
5. WHEN bulk actions complete THEN the System SHALL display a summary of successful and failed operations

### Requirement 26

**User Story:** As a prospective member, I want to track my registration status, so that I know where I am in the process

#### Acceptance Criteria

1. WHEN a user has submitted a join request THEN the System SHALL display the request status on their profile
2. WHEN viewing registration status THEN the System SHALL display: "Pending Review", "Payment Required", "Approved", or "Rejected"
3. WHEN payment is pending THEN the System SHALL display a "Complete Payment" button
4. WHEN a request is approved THEN the System SHALL display a "View Society" button
5. WHEN a request is rejected THEN the System SHALL display the rejection reason if provided

### Requirement 26

**User Story:** As a society president, I want to customize the registration page appearance, so that it matches my society's branding

#### Acceptance Criteria

1. WHEN configuring registration settings THEN the System SHALL allow customizing the welcome message
2. WHEN configuring registration settings THEN the System SHALL allow uploading a custom registration banner
3. WHEN configuring registration settings THEN the System SHALL use the society's primary color for buttons and accents
4. WHEN viewing the registration page THEN the System SHALL display the custom welcome message if set
5. WHEN no custom banner is set THEN the System SHALL use the society's default banner

### Requirement 26

**User Story:** As a society president, I want to export join request data, so that I can analyze applications and maintain records

#### Acceptance Criteria

1. WHEN viewing join requests THEN the System SHALL provide an "Export" button
2. WHEN exporting THEN the System SHALL allow selecting CSV or Excel format
3. WHEN exporting THEN the System SHALL include all form responses and metadata
4. WHEN exporting THEN the System SHALL include payment information if applicable
5. WHEN export is complete THEN the System SHALL download the file to the president's device

### Requirement 26

**User Story:** As a system administrator, I want join requests to be properly linked to form responses, so that data integrity is maintained

#### Acceptance Criteria

1. WHEN a join request is created THEN the System SHALL create a corresponding form response record
2. WHEN a join request is created THEN the System SHALL link it to the society and the user
3. WHEN a join request is approved THEN the System SHALL update both the join request and form response status
4. WHEN querying join requests THEN the System SHALL include all form response data
5. WHEN a society is deleted THEN the System SHALL cascade delete all associated join requests

### Requirement 26

**User Story:** As a society president, I want to preview the registration experience, so that I can verify everything works before sharing the link

#### Acceptance Criteria

1. WHEN viewing registration settings THEN the System SHALL provide a "Preview Registration" button
2. WHEN clicking preview THEN the System SHALL open the registration page in a new tab with a preview banner
3. WHEN in preview mode THEN the System SHALL allow filling out the form
4. WHEN in preview mode THEN the System SHALL not save submissions to the database
5. WHEN in preview mode THEN the System SHALL display a "Preview Mode" indicator at the top

### Requirement 26

**User Story:** As a prospective member, I want to see society information before registering, so that I can make an informed decision

#### Acceptance Criteria

1. WHEN viewing the registration page THEN the System SHALL display society description and goals
2. WHEN viewing the registration page THEN the System SHALL display current member count
3. WHEN viewing the registration page THEN the System SHALL display meeting schedule if set
4. WHEN viewing the registration page THEN the System SHALL display membership requirements if set
5. WHEN viewing the registration page THEN the System SHALL display social links for more information

### Requirement 26

**User Story:** As a society president, I want to edit registration forms after publishing, so that I can update questions without losing existing responses

#### Acceptance Criteria

1. WHEN editing a published registration form THEN the System SHALL create a new version
2. WHEN a new version is created THEN the System SHALL apply it to new submissions only
3. WHEN viewing join requests THEN the System SHALL indicate which form version was used
4. WHEN a form is updated THEN the System SHALL notify the president of the change
5. WHEN viewing form responses THEN the System SHALL display questions from the version used at submission time

### Requirement 26

**User Story:** As a society president, I want to temporarily pause registration, so that I can stop accepting new members without losing my configuration

#### Acceptance Criteria

1. WHEN viewing registration settings THEN the System SHALL provide a "Pause Registration" toggle
2. WHEN registration is paused THEN the System SHALL display "Registration Temporarily Paused" on the registration page
3. WHEN registration is paused THEN the System SHALL not accept new submissions
4. WHEN registration is paused THEN the System SHALL preserve all settings and form configuration
5. WHEN registration is resumed THEN the System SHALL immediately accept new submissions

### Requirement 26

**User Story:** As a prospective member, I want to save my registration progress, so that I can complete it later if interrupted

#### Acceptance Criteria

1. WHEN filling out a registration form THEN the System SHALL automatically save progress every 30 seconds
2. WHEN a user returns to an incomplete registration THEN the System SHALL restore their saved progress
3. WHEN progress is restored THEN the System SHALL display a "Continue where you left off" message
4. WHEN a registration is submitted THEN the System SHALL clear the saved progress
5. WHEN saved progress is older than 7 days THEN the System SHALL automatically delete it

### Requirement 26

**User Story:** As a society president, I want to see registration analytics, so that I can understand application trends and optimize the process

#### Acceptance Criteria

1. WHEN viewing registration settings THEN the System SHALL display a "View Analytics" link
2. WHEN viewing analytics THEN the System SHALL display total applications, approval rate, and rejection rate
3. WHEN viewing analytics THEN the System SHALL display applications over time as a chart
4. WHEN viewing analytics THEN the System SHALL display average time to approval
5. WHEN viewing analytics THEN the System SHALL display form completion rate and drop-off points
