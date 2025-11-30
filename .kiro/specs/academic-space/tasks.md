# Implementation Plan

- [ ] 1. Enable Academic Space and create enrollment flow
- [ ] 1.1 Update Academic Space page to check enrollment
  - Update `apps/web/src/app/spaces/academics/page.tsx`
  - Check if user has program enrollment and course enrollments
  - If no enrollment, redirect to `/spaces/academics/onboarding`
  - If enrolled, show dashboard with enrolled courses
  - Remove mock data, replace with real data from API
  - _Requirements: N/A (prerequisite)_

- [ ] 1.2 Create program enrollment wizard
  - Create `apps/web/src/app/spaces/academics/onboarding/page.tsx`
  - Step 1: Select institution (if not already set via instituitionEnrollment)
  - Step 2: Select program (major/degree)
  - Step 3: Select current semester/term
  - Step 4: Select courses for the semester (multi-select)
  - Use TanStack Form for multi-step form
  - Show progress indicator
  - _Requirements: N/A (prerequisite)_

- [ ] 1.4 Create ORPC contracts for enrollment
  - Create `packages/orpc-contracts/src/academic/index.ts`
  - Add routes for getPrograms, getTerms, getCourses, enrollProgram, enrollCourses, getEnrollmentStatus
  - Use existing program, institutionalTerm, courseOffering schemas from database
  - _Requirements: N/A (prerequisite)_

- [ ] 1.5 Create enrollment service
  - Create `apps/server/src/services/academic/enrollment.service.ts`
  - Implement getPrograms (filter by institutionId)
  - Implement getTerms (filter by institutionId, show current/upcoming terms)
  - Implement getCourses (filter by programId and termId)
  - Implement enrollProgram (create programEnrollment record)
  - Implement enrollCourses (create courseEnrollment records for selected courses)
  - Implement getEnrollmentStatus (check if user has program and courses)
  - _Requirements: N/A (prerequisite)_

- [ ] 1.6 Create enrollment API routes
  - Create `apps/server/src/routes/academic/enrollment.ts`
  - Wire up enrollment service to ORPC routes
  - Add authentication middleware
  - Register routes in main router
  - _Requirements: N/A (prerequisite)_

- [ ] 1.7 Update Academic Space dashboard with real data
  - Update `apps/web/src/app/spaces/academics/page.tsx` to fetch and display real enrolled courses
  - Replace mock course cards with real courseEnrollment data
  - Add "Discussions" link to each course card
  - Show semester/term information at top
  - Add "Manage Enrollment" button to modify courses
  - Keep the existing UI structure but populate with real data
  - _Requirements: N/A (prerequisite)_

- [ ] 2. Checkpoint - Ensure enrollment flow works
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 3. Set up database schema and permissions for discussions
- [x] 3.1 Create discussion schema file
  - Create `packages/db/src/schema/discussion.ts` with thread, threadReply, threadVote, and threadFollow tables
  - Add proper foreign key relationships and constraints
  - Include timestamps and indexes
  - _Requirements: 1.1, 1.3, 2.1, 2.2, 3.1, 6.1_

- [x] 3.2 Update database schema exports
  - Export new tables from `packages/db/src/schema/index.ts`
  - Update database type exports
  - _Requirements: 1.1_

- [x] 3.3 Add discussion permissions to auth
  - Update `packages/auth/src/permissions.ts` to include `discussion: ['create', 'moderate']`
  - Update permission types
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 3.4 Run database migrations
  - Generate migration files with `drizzle-kit generate`
  - Apply migrations with `drizzle-kit push`
  - Verify schema in database
  - _Requirements: 1.1_

- [ ] 4. Create ORPC contracts for discussion system
- [x] 4.1 Create generated schemas
  - Create `packages/orpc-contracts/src/discussion/generated-schemas.ts`
  - Generate insert, select, and update schemas for thread, threadReply, threadVote, threadFollow
  - _Requirements: 1.1, 2.1, 3.1, 6.1_

- [x] 4.2 Create API schemas
  - Create `packages/orpc-contracts/src/discussion/schemas.ts`
  - Define createThreadSchema, updateThreadSchema, listThreadsSchema
  - Define createReplySchema, updateReplySchema, endorseReplySchema
  - Define voteSchema, unvoteSchema
  - Define followThreadSchema, unfollowThreadSchema
  - Include composite schemas for fullThreadSchema with nested replies
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 4.2, 6.1, 6.2_

- [x] 4.3 Create ORPC contract definitions
  - Create `packages/orpc-contracts/src/discussion/index.ts`
  - Define thread routes (create, list, get, update, delete, pin, lock)
  - Define reply routes (create, update, delete, endorse)
  - Define vote routes (vote, unvote)
  - Define follow routes (follow, unfollow, list)
  - Add proper error definitions for each route
  - _Requirements: 1.1, 1.4, 2.1, 2.5, 3.1, 4.1, 4.2, 4.3, 6.1, 6.2, 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 4.4 Export discussion contracts
  - Update `packages/orpc-contracts/src/index.ts` to export discussion contracts
  - _Requirements: 1.1_

- [ ] 5. Implement thread service
- [x] 5.1 Create thread service file
  - Create `apps/server/src/services/discussion/thread.service.ts`
  - Implement createThread with context validation
  - Implement listThreads with filtering and pagination
  - Implement getThread with vote counts and reply counts
  - Implement updateThread with ownership validation
  - Implement deleteThread with ownership validation
  - Implement pinThread with moderator permission check
  - Implement lockThread with moderator permission check
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.5, 4.5, 7.1, 7.2, 7.3, 7.4, 7.5, 8.1_

- [ ]* 5.2 Write property test for thread creation
  - **Property 1: Thread Creation with Context**
  - **Validates: Requirements 1.1, 1.3**

- [ ]* 5.3 Write property test for context access control
  - **Property 3: Context Access Control**
  - **Validates: Requirements 1.4**

- [ ]* 5.4 Write property test for view count increment
  - **Property 20: View Count Increment**
  - **Validates: Requirements 8.1**

- [ ] 6. Implement reply service
- [x] 6.1 Create reply service file
  - Create `apps/server/src/services/discussion/reply.service.ts`
  - Implement createReply with thread validation and hierarchy support
  - Implement updateReply with ownership validation
  - Implement deleteReply with ownership validation
  - Implement endorseReply with moderator permission check
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.2, 4.3_

- [ ]* 6.2 Write property test for reply hierarchy
  - **Property 4: Reply Hierarchy Maintenance**
  - **Validates: Requirements 2.2**

- [ ]* 6.3 Write property test for reply count increment
  - **Property 5: Reply Count Increment**
  - **Validates: Requirements 2.4**

- [ ]* 6.4 Write property test for locked thread prevention
  - **Property 6: Locked Thread Reply Prevention**
  - **Validates: Requirements 2.5**

- [ ]* 6.5 Write property test for endorsed reply sorting
  - **Property 10: Reply Endorsement Ordering**
  - **Validates: Requirements 4.2**

- [ ] 7. Implement vote service
- [x] 7.1 Create vote service file
  - Create `apps/server/src/services/discussion/vote.service.ts`
  - Implement vote with duplicate prevention
  - Implement unvote
  - Implement getVoteCount aggregation
  - Implement getUserVote lookup
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 8.4_

- [ ]* 7.2 Write property test for vote uniqueness
  - **Property 7: Vote Uniqueness**
  - **Validates: Requirements 3.5**

- [ ]* 7.3 Write property test for vote count accuracy
  - **Property 8: Vote Count Update**
  - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

- [ ]* 7.4 Write property test for user vote status
  - **Property 22: User Vote Status Accuracy**
  - **Validates: Requirements 8.4**

- [ ] 8. Implement follow service
- [x] 8.1 Create follow service file
  - Create `apps/server/src/services/discussion/follow.service.ts`
  - Implement followThread
  - Implement unfollowThread
  - Implement getFollowedThreads
  - Implement isFollowing check
  - Implement getFollowers for notification purposes
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 8.5_

- [ ]* 8.2 Write property test for auto-follow on creation
  - **Property 16: Auto-follow on Creation**
  - **Validates: Requirements 6.3**

- [ ]* 8.3 Write property test for auto-follow on reply
  - **Property 17: Auto-follow on Reply**
  - **Validates: Requirements 6.4**

- [ ]* 8.4 Write property test for follow status accuracy
  - **Property 23: Follow Status Accuracy**
  - **Validates: Requirements 8.5**

- [ ]* 9. Implement notification service
- [ ]* 9.1 Create notification service file
  - Create `apps/server/src/services/discussion/notification.service.ts`
  - Implement notifyThreadReply to notify thread author and followers
  - Implement notifyReplyEndorsed to notify reply author
  - Implement notifyAnnouncement to notify all context members
  - Integrate with Centrifugo for real-time delivery
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 9.2 Write property test for follower notifications
  - **Property 12: Thread Follower Notification**
  - **Validates: Requirements 5.1**

- [ ]* 9.3 Write property test for announcement broadcast
  - **Property 13: Announcement Broadcast**
  - **Validates: Requirements 5.2**

- [ ]* 9.4 Write property test for thread author notification
  - **Property 14: Thread Author Reply Notification**
  - **Validates: Requirements 5.3**

- [ ]* 9.5 Write property test for endorsement notification
  - **Property 15: Endorsement Notification**
  - **Validates: Requirements 5.4**

- [ ] 10. Implement access control utilities
- [ ] 10.1 Create access control utility file
  - Create `apps/server/src/services/discussion/access-control.ts`
  - Implement canCreateDiscussion (check course enrollment or organization membership)
  - Implement canModerateDiscussion (check instructor status or organization permission)
  - Implement checkCourseEnrollment helper
  - Implement checkOrganizationPermission helper using Better Auth
  - _Requirements: 1.4, 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ]* 10.2 Write property test for anonymous author hiding
  - **Property 2: Anonymous Thread Author Hiding**
  - **Validates: Requirements 1.2**

- [ ]* 10.3 Write property test for moderator visibility
  - **Property 11: Moderator Author Visibility**
  - **Validates: Requirements 4.4**

- [ ] 11. Create API routes
- [x] 11.1 Create thread routes
  - Create `apps/server/src/routes/discussion/threads.ts`
  - Wire up thread service to ORPC routes
  - Add authentication middleware
  - Add access control checks
  - _Requirements: 1.1, 1.4, 4.5, 7.1, 7.2, 7.3, 7.4, 7.5, 8.1_

- [x] 11.2 Create reply routes
  - Create `apps/server/src/routes/discussion/replies.ts`
  - Wire up reply service to ORPC routes
  - Add authentication middleware
  - Add access control checks
  - _Requirements: 2.1, 2.5, 4.2, 4.3_

- [x] 11.3 Create vote routes
  - Create `apps/server/src/routes/discussion/votes.ts`
  - Wire up vote service to ORPC routes
  - Add authentication middleware
  - _Requirements: 3.1, 3.5_

- [x] 11.4 Create follow routes
  - Create `apps/server/src/routes/discussion/follows.ts`
  - Wire up follow service to ORPC routes
  - Add authentication middleware
  - _Requirements: 6.1, 6.2, 6.5_

- [x] 11.5 Register discussion routes
  - Update `apps/server/src/routes/index.ts` to include discussion routes
  - _Requirements: 1.1_

- [ ] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Create shared discussion UI components
- [ ] 13.1 Create thread list component
  - Create `packages/ui/src/components/discussion/thread-list.tsx`
  - Display threads with title, author, vote count, reply count, view count
  - Support filtering by type, unanswered, following
  - Support sorting by recent, popular, unanswered
  - Support search
  - Show pinned threads at top
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 13.2 Create thread card component
  - Create `packages/ui/src/components/discussion/thread-card.tsx`
  - Display thread preview with metadata
  - Show anonymous indicator
  - Show pinned/locked badges
  - Show vote buttons
  - Show follow button
  - _Requirements: 1.2, 4.5_

- [ ] 13.3 Create thread detail component
  - Create `packages/ui/src/components/discussion/thread-detail.tsx`
  - Display full thread content
  - Show nested replies
  - Show endorsed replies at top
  - Support voting on thread and replies
  - Support following/unfollowing
  - Show moderator actions (pin, lock, endorse) for moderators
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 13.4 Create reply component
  - Create `packages/ui/src/components/discussion/reply.tsx`
  - Display reply content with author info
  - Show nested replies recursively
  - Show endorsed badge
  - Show vote buttons
  - Show edit/delete for own replies
  - Show endorse button for moderators
  - _Requirements: 2.2, 4.2, 4.4_

- [ ] 13.5 Create thread form component
  - Create `packages/ui/src/components/discussion/thread-form.tsx`
  - Use TanStack Form for validation
  - Support title, content, type selection
  - Support anonymous posting toggle
  - Support tags input
  - _Requirements: 1.1, 1.2_

- [ ] 13.6 Create reply form component
  - Create `packages/ui/src/components/discussion/reply-form.tsx`
  - Use TanStack Form for validation
  - Support content input
  - Support anonymous posting toggle
  - Support nested reply context
  - _Requirements: 2.1, 2.3_

- [ ] 14. Integrate discussion system with Academic Space
- [ ] 14.1 Create course discussion page
  - Create `apps/web/src/app/spaces/academics/courses/[courseOfferingId]/discussions/page.tsx`
  - Use thread list component
  - Filter threads by courseOfferingId
  - Add "New Thread" button
  - Show course context in header
  - _Requirements: 1.1, 7.1_

- [ ] 14.2 Create course thread detail page
  - Create `apps/web/src/app/spaces/academics/courses/[courseOfferingId]/discussions/[threadId]/page.tsx`
  - Use thread detail component
  - Show full thread with replies
  - Add reply form at bottom
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 14.3 Add discussion tab to course dashboard
  - Update course dashboard to show "Discussions" link on each course card
  - Show unread discussion count badge
  - _Requirements: 1.1_

- [ ] 15. Integrate discussion system with Society pages
- [ ] 15.1 Create society discussion page
  - Create `apps/web/src/app/(authenticated)/societies/[societyId]/discussions/page.tsx`
  - Use thread list component
  - Filter threads by societyId
  - Add "New Thread" button
  - Show society context in header
  - _Requirements: 1.1, 7.1_

- [ ] 15.2 Create society thread detail page
  - Create `apps/web/src/app/(authenticated)/societies/[societyId]/discussions/[threadId]/page.tsx`
  - Use thread detail component
  - Show full thread with replies
  - Add reply form at bottom
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 15.3 Update society navigation
  - Add "Discussions" tab to society navigation
  - Link to society discussion page
  - Show unread count badge
  - _Requirements: 1.1_

- [ ] 16. Implement real-time updates
- [ ] 16.1 Set up Centrifugo channels
  - Define channel naming convention (thread:{threadId}, context:{type}:{id})
  - Implement channel subscription logic
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 16.2 Add real-time thread updates
  - Subscribe to thread channel when viewing thread
  - Update UI when new replies arrive
  - Update UI when replies are endorsed
  - Update UI when thread is pinned/locked
  - _Requirements: 5.1, 5.4_

- [ ] 16.3 Add real-time notification updates
  - Subscribe to user notification channel
  - Show toast notifications for new activity
  - Update notification badge count
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 17. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
