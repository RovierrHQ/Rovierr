# Implementation Plan

- [x] 1. Set up database schema and migrations
  - Create `registration_settings` table with all configuration fields
  - Create `join_requests` table with status, payment, and approval fields
  - Add payment verification fields (paymentVerifiedBy, paymentVerifiedAt, paymentNotes)
  - Create indexes for performance (society_id, user_id, status, submitted_at)
  - Run migrations and verify schema
  - _Requirements: All requirements depend on data persistence_

- [x] 2. Create ORPC contracts for registration system
  - Define registration settings schemas (create, update, get)
  - Define join request schemas (create, list, approve, reject, bulk operations)
  - Define payment verification schemas
  - Define QR code generation schemas
  - Define analytics schemas
  - Set up type-safe API contracts with proper validation
  - _Requirements: All requirements_

- [x] 3. Implement RegistrationService (backend)
  - Create RegistrationService class with CRUD operations
  - Implement getRegistrationSettings, updateRegistrationSettings
  - Implement generateRegistrationUrl with slug-based routing
  - Implement isRegistrationOpen with date/capacity/pause checks
  - Implement checkCapacity with current count and max calculation
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.1, 11.1, 11.2, 12.1, 12.2, 23.1_

- [ ]* 3.1 Write property test for registration toggle consistency
  - **Property 1: Registration Toggle Consistency**
  - **Validates: Requirements 1.2**

- [ ]* 3.2 Write property test for unique URL generation
  - **Property 9: Unique Registration URL Generation**
  - **Validates: Requirements 3.1**

- [x] 4. Implement JoinRequestService (backend)
  - Create JoinRequestService class
  - Implement createJoinRequest with form response linking
  - Implement getJoinRequest, listJoinRequests with filtering
  - Implement approveJoinRequest with membership creation
  - Implement rejectJoinRequest with reason storage
  - Implement bulkApproveRequests, bulkRejectRequests
  - Implement getUserJoinRequestStatus
  - _Requirements: 5.5, 7.1, 7.2, 7.3, 7.4, 8.1, 8.2, 9.1, 9.2, 10.1, 10.2, 15.1, 15.2, 15.3, 16.1_

- [ ]* 4.1 Write property test for join request creation
  - **Property 17: Join Request Creation on Valid Submission**
  - **Validates: Requirements 5.5**

- [ ]* 4.2 Write property test for membership creation on approval
  - **Property 28: Membership Creation on Approval**
  - **Validates: Requirements 9.2**

- [ ]* 4.3 Write property test for member count invariant
  - **Property 31: Member Count Increment (Invariant)**
  - **Validates: Requirements 9.5**

- [ ]* 4.4 Write property test for no membership on rejection
  - **Property 35: No Membership on Rejection (Invariant)**
  - **Validates: Requirements 10.5**

- [x] 5. Implement PaymentVerificationService (backend)
  - Create PaymentVerificationService class
  - Implement markPaymentAsVerified with notes
  - Implement markPaymentAsNotVerified with reason
  - Implement getPaymentInstructions from form
  - Handle payment status updates and notifications
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ]* 5.1 Write property test for payment verification status update
  - **Property 19: Payment Success Status Update**
  - **Validates: Requirements 6.2**

- [x] 6. Implement QRCodeService (backend)
  - Create QRCodeService class using qrcode library
  - Implement generateQRCode with customization options
  - Implement generatePrintableQRCode with society branding
  - Add error handling for QR generation failures
  - _Requirements: 3.2, 3.3, 3.4, 3.5_

- [ ]* 6.1 Write property test for QR code URL round-trip
  - **Property 10: QR Code URL Round-trip**
  - **Validates: Requirements 3.5**

- [x] 7. Implement RegistrationAnalyticsService (backend)
  - Create RegistrationAnalyticsService class
  - Implement getRegistrationMetrics (total, pending, approved, rejected, rates)
  - Implement getApplicationTrends with time-series data
  - Implement getApprovalMetrics (average time to approval)
  - Implement getFormCompletionRate
  - Add caching for analytics data (15 minute TTL)
  - _Requirements: 25.1, 25.2, 25.3, 25.4, 25.5_

- [ ]* 7.1 Write property test for member count display calculation
  - **Property 69: Member Count Display**
  - **Validates: Requirements 21.2**

- [x] 8. Create RegistrationSettings component (frontend)
  - Build main settings interface at /spaces/societies/mine/[societyId]/settings/registration
  - Add toggle for enabling/disabling registration
  - Add approval mode selector (auto/manual)
  - Add form selector with "Create New Form" option
  - Add capacity settings (max capacity input)
  - Add registration period settings (start/end date pickers)
  - Add customization options (welcome message, custom banner upload)
  - Add pause/resume toggle
  - Integrate with ORPC for saving settings
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 11.1, 12.1, 12.2, 17.1, 17.2, 23.1_

- [x] 9. Create QRCodeDisplay component (frontend)
  - Build QR code display section in registration settings
  - Integrate with QRCodeService to generate QR code
  - Add "Download QR Code" button with PNG export
  - Add "Print QR Code" button with print-friendly page
  - Display registration URL below QR code
  - Show society logo and name with QR code
  - _Requirements: 3.2, 3.3, 3.4_

- [x] 10. Create PublicJoinPage component (frontend)
  - Build public registration page at /join/[societySlug]
  - Display society banner, logo, name, and description
  - Show member count and social links
  - Display meeting schedule and membership requirements if set
  - Show "Join Now" button when registration is open
  - Display appropriate messages for closed/paused/full/period states
  - Handle already-member state
  - Integrate with FormRenderer for form display
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 21.1, 21.2, 21.3, 21.4, 21.5_

- [ ]* 10.1 Write property test for registration page routing
  - **Property 11: Registration Page Routing**
  - **Validates: Requirements 4.1**

- [ ]* 10.2 Write property test for registration closed display
  - **Property 12: Registration Closed Display**
  - **Validates: Requirements 4.2**

- [x] 11. Implement form submission flow with payment
  - Extend FormRenderer to handle registration context
  - Implement smart field auto-fill for registration forms
  - Add payment instructions display after submission
  - Add payment proof upload field (optional file upload)
  - Create join request on successful form submission
  - Handle payment-required vs free registration flows
  - Display appropriate confirmation messages
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 13.1, 13.2, 13.3, 13.4_

- [ ]* 11.1 Write property test for smart field auto-fill
  - **Property 14: Smart Field Auto-fill**
  - **Validates: Requirements 5.2**

- [ ]* 11.2 Write property test for required field validation
  - **Property 16: Required Field Validation**
  - **Validates: Requirements 5.4**

- [x] 12. Create JoinRequestManagement component (frontend)
  - Build join request list at /spaces/societies/mine/[societyId]/join-requests
  - Display table with applicant name, submission date, payment status, status
  - Add filtering by status (pending, payment_pending, approved, rejected)
  - Add sorting by submission date
  - Add search functionality
  - Show notification badge for new requests
  - Add pagination for large lists
  - Integrate with ORPC for data fetching
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]* 12.1 Write property test for join request filtering
  - **Property 23: Join Request Filtering**
  - **Validates: Requirements 7.3**

- [ ]* 12.2 Write property test for join request sorting
  - **Property 24: Join Request Sorting**
  - **Validates: Requirements 7.4**

- [x] 13. Create JoinRequestDetail component (frontend)
  - Build detailed view for individual join request
  - Display all form responses in readable format
  - Show applicant profile information
  - Display payment status and amount
  - Show payment proof if uploaded
  - Add payment verification section for presidents
  - Add "Verify Payment" and "Mark as Not Verified" buttons
  - Add "Approve" and "Reject" action buttons for pending requests
  - Show approval/rejection metadata (who, when, reason)
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 11.1, 11.2_

- [x] 14. Implement approval and rejection workflows
  - Add confirmation dialog for approval action
  - Create membership record on approval
  - Update join request status to "approved"
  - Send welcome email to new member
  - Increment society member count
  - Add rejection dialog with optional reason input
  - Update join request status to "rejected"
  - Send rejection notification email
  - Handle auto-approval for verified payments
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 10.2, 10.3, 10.4, 10.5, 6.5_

- [ ]* 14.1 Write property test for status update on approval
  - **Property 29: Status Update on Approval**
  - **Validates: Requirements 9.3**

- [ ]* 14.2 Write property test for status update on rejection
  - **Property 32: Status Update on Rejection**
  - **Validates: Requirements 10.2**

- [x] 15. Implement bulk operations
  - Add BulkActionToolbar component with checkboxes
  - Implement bulk approve functionality
  - Implement bulk reject functionality with common reason
  - Show bulk operation progress indicator
  - Display summary of successful/failed operations
  - Handle partial failures gracefully
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ]* 15.1 Write property test for bulk approval processing
  - **Property 51: Bulk Approval Processing**
  - **Validates: Requirements 15.3**

- [x] 16. Implement capacity management
  - Add capacity checking in registration service
  - Automatically close registration when capacity reached
  - Display "Registration Full" message on public page
  - Show remaining slots in settings
  - Automatically reopen when member leaves
  - Handle edge cases (concurrent submissions at capacity)
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ]* 16.1 Write property test for automatic closure on capacity
  - **Property 37: Automatic Closure on Capacity Reached**
  - **Validates: Requirements 11.3**

- [ ]* 16.2 Write property test for automatic reopening
  - **Property 39: Automatic Reopening on Capacity Available**
  - **Validates: Requirements 11.5**

- [ ] 17. Implement registration period management
  - Add date/time validation for registration periods
  - Check current time against start/end dates
  - Display "Registration Opens On [Date]" before start
  - Display "Registration Closed" after end
  - Allow submissions only during active period
  - Handle timezone considerations
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ]* 17.1 Write property test for time-based access (before start)
  - **Property 40: Time-based Registration Access (Before Start)**
  - **Validates: Requirements 12.3**

- [ ]* 17.2 Write property test for time-based access (after end)
  - **Property 41: Time-based Registration Access (After End)**
  - **Validates: Requirements 12.4**

- [ ] 18. Implement notification system
  - Create email templates for join request notifications
  - Send notification to presidents on new request
  - Include payment details in notification if applicable
  - Create confirmation email template for applicants
  - Send confirmation email on submission
  - Create welcome email template for approved members
  - Send rejection notification with reason
  - Create in-app notifications for presidents
  - Add notification preferences in settings
  - _Requirements: 6.4, 9.4, 10.3, 10.4, 13.5, 14.1, 14.2, 14.3, 14.5, 11.5_

- [ ]* 18.1 Write property test for president notification
  - **Property 47: President Notification on New Request**
  - **Validates: Requirements 14.1**

- [ ]* 18.2 Write property test for submission confirmation email
  - **Property 46: Submission Confirmation Email**
  - **Validates: Requirements 13.5**

- [ ] 19. Create RegistrationStatusBadge component
  - Build status badge component for user profiles
  - Display current join request status
  - Show "Complete Payment" button for pending_payment
  - Show "View Society" button for approved
  - Display rejection reason if rejected
  - Handle multiple statuses across different societies
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_

- [ ] 20. Create RegistrationAnalytics component
  - Build analytics dashboard in settings
  - Display total applications, approval rate, rejection rate
  - Show applications over time chart
  - Display average time to approval
  - Show form completion rate and drop-off points
  - Add date range filter
  - Implement data export functionality
  - _Requirements: 25.1, 25.2, 25.3, 25.4, 25.5_

- [ ] 21. Implement export functionality
  - Add export button in join request management
  - Support CSV and Excel formats
  - Include all form responses and metadata
  - Include payment information if applicable
  - Stream large exports for performance
  - Generate downloadable file
  - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_

- [ ]* 21.1 Write property test for export data completeness
  - **Property 61: Export Data Completeness**
  - **Validates: Requirements 18.3**

- [ ] 22. Implement data integrity and relationships
  - Ensure form response created with join request
  - Link join request to society and user
  - Synchronize status updates across join request and form response
  - Include form response data in join request queries
  - Implement cascade delete for society deletion
  - Add foreign key constraints
  - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5_

- [ ]* 22.1 Write property test for form response creation
  - **Property 63: Form Response Creation on Join Request**
  - **Validates: Requirements 19.1**

- [ ]* 22.2 Write property test for relationship integrity
  - **Property 64: Join Request Relationship Integrity**
  - **Validates: Requirements 19.2**

- [ ]* 22.3 Write property test for cascade delete
  - **Property 67: Cascade Delete on Society Deletion**
  - **Validates: Requirements 19.5**

- [ ] 23. Implement preview mode
  - Add "Preview Registration" button in settings
  - Open registration page in new tab with preview banner
  - Allow form interaction in preview mode
  - Prevent database saves in preview mode
  - Display "Preview Mode" indicator
  - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5_

- [ ]* 23.1 Write property test for preview mode isolation
  - **Property 68: Preview Mode Isolation**
  - **Validates: Requirements 20.4**

- [ ] 24. Implement form versioning for registration
  - Create new version when published form is edited
  - Apply new version to new submissions only
  - Preserve original version for existing submissions
  - Display version indicator in join request list
  - Show version-specific questions in responses
  - Notify president of form updates
  - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5_

- [ ]* 24.1 Write property test for version isolation
  - **Property 74: Version Isolation for New Submissions**
  - **Validates: Requirements 22.2**

- [ ] 25. Implement pause/resume functionality
  - Add pause toggle in registration settings
  - Display "Registration Temporarily Paused" on public page
  - Block new submissions when paused
  - Preserve all configuration during pause
  - Allow immediate submissions on resume
  - _Requirements: 23.1, 23.2, 23.3, 23.4, 23.5_

- [ ]* 25.1 Write property test for submission blocking when paused
  - **Property 79: Submission Blocking When Paused**
  - **Validates: Requirements 23.3**

- [ ]* 25.2 Write property test for configuration preservation
  - **Property 80: Configuration Preservation During Pause**
  - **Validates: Requirements 23.4**

- [ ] 26. Implement progress saving for registration forms
  - Auto-save form progress every 30 seconds
  - Store progress in form_progress table
  - Restore progress when user returns
  - Display "Continue where you left off" message
  - Clear progress on submission
  - Implement 7-day expiration for saved progress
  - _Requirements: 24.1, 24.2, 24.3, 24.4, 24.5_

- [ ]* 26.1 Write property test for progress restoration
  - **Property 82: Progress Restoration (Round-trip)**
  - **Validates: Requirements 24.2**

- [ ]* 26.2 Write property test for progress cleanup
  - **Property 84: Progress Cleanup on Submission**
  - **Validates: Requirements 24.4**

- [ ] 27. Implement customization features
  - Add welcome message editor in settings
  - Add custom banner upload with preview
  - Apply society primary color to registration page
  - Display custom welcome message on public page
  - Use default banner as fallback
  - Validate image uploads (size, format)
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_

- [ ]* 27.1 Write property test for primary color application
  - **Property 58: Primary Color Theme Application**
  - **Validates: Requirements 17.3**

- [ ] 28. Add error handling and edge cases
  - Handle invalid society slug (404)
  - Handle registration disabled state
  - Handle capacity reached state
  - Handle outside registration period
  - Handle missing required fields
  - Handle duplicate join requests
  - Handle form not found
  - Handle concurrent submissions
  - Handle payment verification errors
  - _Requirements: All requirements (error handling)_

- [ ] 29. Implement security measures
  - Add authentication checks for all operations
  - Verify president role for settings access
  - Verify president role for approval/rejection
  - Rate limit join request submissions (1 per user per society)
  - Sanitize all user input (XSS prevention)
  - Validate society slug format
  - Verify user is not already a member
  - Validate payment amounts
  - Validate date ranges
  - _Requirements: All requirements (security)_

- [ ] 30. Add performance optimizations
  - Add database indexes (society_id, user_id, status, submitted_at)
  - Implement caching for registration settings (5 min TTL)
  - Implement caching for society info (10 min TTL)
  - Implement caching for member count (1 min TTL)
  - Implement caching for QR codes (indefinite)
  - Implement caching for analytics (15 min TTL)
  - Add pagination for join request lists
  - Optimize form response queries
  - _Requirements: All requirements (performance)_

- [ ] 31. Implement real-time updates
  - Set up Centrifugo channels for join requests
  - Add WebSocket connection for notification badges
  - Implement real-time list updates
  - Add optimistic UI updates for actions
  - Handle connection failures gracefully
  - _Requirements: 7.5, 14.5_

- [ ] 32. Create comprehensive documentation
  - Document API endpoints and ORPC contracts
  - Create user guide for presidents (setting up registration)
  - Create user guide for applicants (joining societies)
  - Document manual payment verification process
  - Add code comments for complex logic
  - Create deployment guide
  - _Requirements: All requirements (documentation)_

- [ ] 33. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
