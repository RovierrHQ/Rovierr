# Implementation Plan

- [x] 1. Set up database schema and ORPC contracts
  - Create `society_email` table in database schema
  - Generate Zod schemas from Drizzle
  - Create ORPC contract schemas for email operations
  - Define ORPC routes (send, preview, list, get)
  - _Requirements: All requirements (foundation)_

- [x] 2. Implement variable replacement engine
  - Create utility function to replace {{user.field}} variables
  - Handle null/undefined values gracefully
  - Add HTML escaping for security
  - _Requirements: 3.2, 3.4_

- [ ]* 2.1 Write property test for variable replacement
  - **Property 5: Variable Replacement Consistency**
  - **Validates: Requirements 3.2, 5.2**

- [x] 3. Implement email sending service
  - Create `sendSocietyEmail` function in email service
  - Query organization members from database
  - Replace variables for each recipient
  - Use UseSend batch API to send emails
  - Store email record in database
  - Handle errors and update counts
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 10.1, 10.2_

- [ ]* 3.1 Write unit tests for email service
  - Test member query logic
  - Test batch email preparation
  - Test error handling
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 4. Implement ORPC server handlers
  - Create authorization middleware (president role check)
  - Implement send email handler
  - Implement preview email handler
  - Implement list emails handler
  - Implement get email details handler
  - Add validation for all inputs
  - _Requirements: 1.1, 1.2, 1.3, 9.1, 9.2, 9.3, 9.4_

- [ ]* 4.1 Write property test for authorization
  - **Property 1: Authorization Enforcement**
  - **Validates: Requirements 1.1, 1.2, 1.3**

- [ ]* 4.2 Write property test for subject validation
  - **Property 2: Subject Validation**
  - **Validates: Requirements 6.2, 9.1**

- [ ]* 4.3 Write property test for body validation
  - **Property 3: Body Validation**
  - **Validates: Requirements 9.2**

- [ ]* 4.4 Write property test for variable syntax validation
  - **Property 4: Variable Syntax Validation**
  - **Validates: Requirements 3.4, 9.3**

- [x] 5. Create email composer frontend component
  - Set up TipTap rich text editor
  - Add formatting toolbar (bold, italic, lists, links)
  - Create subject line input with character limit
  - Add variable picker dropdown
  - Display available variables with examples
  - Implement variable insertion into editor
  - Add recipient count display
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.3, 3.5, 6.1, 6.3, 6.4, 7.1_

- [ ]* 5.1 Write unit tests for email composer
  - Test variable insertion
  - Test subject validation
  - Test character limit enforcement
  - _Requirements: 2.1, 2.2, 6.4_

- [x] 6. Implement client-side validation
  - Validate subject is not empty
  - Validate body is not empty
  - Validate variable syntax
  - Display specific error messages
  - Disable send button when invalid
  - Disable send button when zero recipients
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 7.3_

- [ ]* 6.1 Write property test for subject length constraint
  - **Property 11: Subject Length Constraint**
  - **Validates: Requirements 6.4**

- [ ]* 6.2 Write property test for zero recipients handling
  - **Property 14: Zero Recipients Handling**
  - **Validates: Requirements 7.3**

- [x] 7. Implement email preview functionality
  - Create preview modal component
  - Generate sample data for variables
  - Replace variables in preview
  - Display formatted HTML preview
  - _Requirements: 4.1, 4.2, 4.3_

- [ ]* 7.1 Write property test for preview accuracy
  - **Property 12: Preview Accuracy**
  - **Validates: Requirements 4.1, 4.2, 4.3**

- [x] 8. Implement email sending flow
  - Create send confirmation dialog
  - Integrate with ORPC send mutation
  - Show loading state during send
  - Display success message with recipient count
  - Display error message on failure
  - Handle validation errors from server
  - _Requirements: 5.3, 5.4, 5.5_

- [ ]* 8.1 Write unit tests for send flow
  - Test success case
  - Test error handling
  - Test loading states
  - _Requirements: 5.3, 5.4_

- [x] 9. Create email history component
  - Query email history from ORPC
  - Display list with subject, date, recipient count
  - Show sender name and image
  - Order by send date (most recent first)
  - Implement pagination
  - Add view details modal
  - Display delivery status
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ]* 9.1 Write property test for history ordering
  - **Property 13: History Ordering**
  - **Validates: Requirements 8.4**

- [ ]* 9.2 Write unit tests for email history
  - Test list rendering
  - Test pagination
  - Test date formatting
  - _Requirements: 8.1, 8.2, 8.4_

- [x] 10. Create email page route
  - Create page at `/spaces/societies/[slug]/email`
  - Add authorization check (president only)
  - Display unauthorized message for non-presidents
  - Redirect non-members to society page
  - Integrate email composer component
  - Integrate email history component
  - _Requirements: 1.1, 1.2, 1.3_

- [ ]* 10.1 Write integration test for email page
  - Test president access
  - Test non-president denial
  - Test non-member redirect
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 11. Add navigation link to email page
  - Add "Send Email" link to society navigation
  - Show only to presidents
  - Add appropriate icon
  - _Requirements: 1.1_

- [x] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
