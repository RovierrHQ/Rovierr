# Implementation Plan

- [x] 1. Refactor database schema and create new tables
  - Rename `university` table to `institution` and add new fields (type, domain)
  - Create new schema files: `academic-journey.ts`, `achievement.ts`
  - Refactor `course.ts` to simplify (remove semester-specific tables)
  - Rename `semester.ts` to `academic-term.ts` and refactor structure
  - Create `course-enrollment.ts` schema
  - Update schema index exports
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 6.1, 6.2, 7.1, 7.2, 7.4_

- [x] 2. Create GPA calculation service
  - Implement `GPACalculator` class with grade-to-points conversion
  - Implement term GPA calculation method
  - Implement journey cumulative GPA calculation method
  - Implement grade validation logic
  - _Requirements: 2.3, 2.4, 3.2, 8.1, 8.2, 8.3_

- [x] 2.1 Write property test for GPA calculation
  - **Property 8: Term GPA calculation accuracy**
  - **Validates: Requirements 2.3, 8.3**

- [x] 2.2 Write property test for cascading GPA recalculation
  - **Property 9: Cascading GPA recalculation**
  - **Validates: Requirements 2.4, 8.1, 8.2**

- [x] 2.3 Write property test for course status GPA inclusion
  - **Property 12: Course status affects GPA inclusion**
  - **Validates: Requirements 3.3, 3.4, 8.4**

- [x] 2.4 Write unit tests for GPA calculator
  - Test known grade combinations
  - Test edge cases (empty terms, all withdrawn)
  - Test grade validation
  - _Requirements: 2.3, 3.2, 8.3, 8.5_

- [x] 3. Create ORPC contracts for academic endpoints
  - Create `packages/orpc-contracts/src/user/academic/index.ts`
  - Define journey contracts (list, create, update, delete)
  - Define term contracts (list, create, update, delete)
  - Define enrollment contracts (list, create, update, delete)
  - Define achievement contracts (list, create, update, delete)
  - Define timeline contract (get complete timeline)
  - Create Zod schemas for all inputs and outputs
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 4.1, 4.2, 5.1, 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 4. Implement journey management endpoints
  - Create `apps/server/src/routers/user/academic/journeys.ts`
  - Implement list journeys handler
  - Implement create journey handler with validation
  - Implement update journey handler with GPA recalculation
  - Implement delete journey handler with cascade
  - Add authorization checks (user owns journey)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 9.1, 9.5, 10.1, 10.3, 10.4_

- [ ] 4.1 Write property test for journey creation
  - **Property 1: Journey creation stores all required fields**
  - **Validates: Requirements 1.1**

- [ ] 4.2 Write property test for journey retrieval
  - **Property 2: User journey retrieval completeness**
  - **Validates: Requirements 1.2**

- [ ] 4.3 Write property test for journey GPA independence
  - **Property 3: Journey GPA independence**
  - **Validates: Requirements 1.3**

- [ ] 4.4 Write property test for journey completion data preservation
  - **Property 4: Journey completion preserves data**
  - **Validates: Requirements 1.4**

- [ ] 4.5 Write property test for in-progress journey mutations
  - **Property 5: In-progress journeys accept new data**
  - **Validates: Requirements 1.5**

- [ ] 4.6 Write property test for journey cascading deletion
  - **Property 29: Journey cascading deletion**
  - **Validates: Requirements 9.5**

- [ ] 4.7 Write unit tests for journey endpoints
  - Test create with valid data
  - Test create with missing fields (validation error)
  - Test update journey
  - Test delete journey cascades
  - Test authorization (cannot access other user's journey)
  - _Requirements: 1.1, 1.2, 9.1, 9.5, 10.3_

- [ ] 5. Implement term management endpoints
  - Create `apps/server/src/routers/user/academic/terms.ts`
  - Implement list terms handler with chronological ordering
  - Implement create term handler
  - Implement update term handler
  - Implement delete term handler with enrollment cascade and GPA recalc
  - Add authorization checks
  - _Requirements: 2.1, 2.2, 2.4, 9.2, 10.1, 10.3_

- [ ] 5.1 Write property test for term creation
  - **Property 6: Term creation stores all required fields**
  - **Validates: Requirements 2.1**

- [ ] 5.2 Write property test for term chronological ordering
  - **Property 7: Terms are ordered chronologically**
  - **Validates: Requirements 2.2**

- [ ] 5.3 Write property test for term deletion with recalculation
  - **Property 27: Cascading deletion with recalculation**
  - **Validates: Requirements 9.2, 9.3**

- [ ] 5.4 Write unit tests for term endpoints
  - Test create term
  - Test list terms in order
  - Test delete term cascades to enrollments
  - Test delete term recalculates journey GPA
  - _Requirements: 2.1, 2.2, 9.2_

- [ ] 6. Implement course enrollment endpoints
  - Create `apps/server/src/routers/user/academic/enrollments.ts`
  - Implement list enrollments handler
  - Implement create enrollment handler with validation
  - Implement update enrollment handler (grade/status) with GPA recalc
  - Implement delete enrollment handler with GPA recalc
  - Add referential integrity checks (course exists, belongs to institution)
  - Add authorization checks
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 6.3, 9.3, 10.1, 10.3_

- [ ] 6.1 Write property test for enrollment creation
  - **Property 10: Enrollment creation stores all required fields**
  - **Validates: Requirements 3.1**

- [ ] 6.2 Write property test for grade validation
  - **Property 11: Grade validation and grade point calculation**
  - **Validates: Requirements 3.2**

- [ ] 6.3 Write property test for in-progress course mutability
  - **Property 13: In-progress courses are mutable**
  - **Validates: Requirements 3.5**

- [ ] 6.4 Write property test for enrollment referential integrity
  - **Property 23: Enrollment referential integrity**
  - **Validates: Requirements 6.3**

- [ ] 6.5 Write unit tests for enrollment endpoints
  - Test create enrollment
  - Test update grade triggers GPA recalc
  - Test delete enrollment recalculates GPA
  - Test withdrawn courses excluded from GPA
  - Test invalid grade rejected
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 9.3_

- [ ] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement achievement endpoints
  - Create `apps/server/src/routers/user/academic/achievements.ts`
  - Implement list achievements handler with date ordering
  - Implement create achievement handler
  - Implement update achievement handler
  - Implement delete achievement handler (isolated, no side effects)
  - Add authorization checks
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 9.4, 10.1, 10.3_

- [ ] 8.1 Write property test for achievement creation
  - **Property 14: Achievement creation stores all required fields**
  - **Validates: Requirements 4.1**

- [ ] 8.2 Write property test for achievement retrieval
  - **Property 15: Achievement retrieval completeness**
  - **Validates: Requirements 4.2**

- [ ] 8.3 Write property test for achievement type flexibility
  - **Property 16: Achievement type flexibility**
  - **Validates: Requirements 4.3**

- [ ] 8.4 Write property test for achievement ordering
  - **Property 17: Achievements ordered by date**
  - **Validates: Requirements 4.4**

- [ ] 8.5 Write property test for achievement deletion isolation
  - **Property 28: Achievement deletion isolation**
  - **Validates: Requirements 9.4**

- [ ] 8.6 Write unit tests for achievement endpoints
  - Test create achievement
  - Test list achievements ordered by date
  - Test delete achievement doesn't affect other data
  - _Requirements: 4.1, 4.2, 4.4, 9.4_

- [ ] 9. Implement timeline endpoint
  - Create `apps/server/src/routers/user/academic/timeline.ts`
  - Implement complex query with nested joins (journeys → terms → enrollments → courses)
  - Include achievements in response
  - Ensure chronological ordering at all levels
  - Optimize query performance with proper joins
  - Add authorization check
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 10.2_

- [ ] 9.1 Write property test for timeline structure
  - **Property 18: Complete timeline structure**
  - **Validates: Requirements 5.1, 5.2, 10.2**

- [ ] 9.2 Write property test for term data completeness
  - **Property 19: Term data completeness**
  - **Validates: Requirements 5.2, 5.3**

- [ ] 9.3 Write property test for timeline hierarchical grouping
  - **Property 20: Timeline hierarchical grouping**
  - **Validates: Requirements 5.4**

- [ ] 9.4 Write unit tests for timeline endpoint
  - Test timeline returns all user data
  - Test chronological ordering
  - Test nested structure (journey → term → enrollment)
  - _Requirements: 5.1, 5.2, 5.4_

- [ ] 10. Implement institution and course catalog endpoints
  - Create `apps/server/src/routers/institution/index.ts`
  - Implement list institutions with type filtering
  - Implement get institution courses
  - Create `apps/server/src/routers/course/index.ts`
  - Implement create custom course (user-created)
  - Add validation for institution and course data
  - _Requirements: 6.1, 6.2, 6.4, 6.5_

- [ ] 10.1 Write property test for institution creation
  - **Property 21: Institution creation stores all required fields**
  - **Validates: Requirements 6.1**

- [ ] 10.2 Write property test for course creation
  - **Property 22: Course creation with institution association**
  - **Validates: Requirements 6.2**

- [ ] 10.3 Write property test for institution filtering
  - **Property 24: Institution filtering by type**
  - **Validates: Requirements 6.4**

- [ ] 10.4 Write property test for user course creation
  - **Property 25: User course creation**
  - **Validates: Requirements 6.5**

- [ ] 10.5 Write unit tests for institution and course endpoints
  - Test list institutions
  - Test filter institutions by type
  - Test create custom course
  - _Requirements: 6.1, 6.2, 6.4, 6.5_

- [ ] 11. Implement authorization middleware
  - Create authorization helper functions
  - Implement ownership verification for journeys
  - Implement ownership verification for terms
  - Implement ownership verification for enrollments
  - Implement ownership verification for achievements
  - Add to all protected endpoints
  - _Requirements: 10.1, 10.3, 10.4_

- [ ] 11.1 Write property test for data ownership
  - **Property 30: Data ownership association**
  - **Validates: Requirements 10.1**

- [ ] 11.2 Write property test for authorization denial
  - **Property 31: Authorization denial for non-owners**
  - **Validates: Requirements 10.3, 10.4**

- [ ] 11.3 Write unit tests for authorization
  - Test user can access own data
  - Test user cannot access other user's data
  - Test authorization on all endpoints
  - _Requirements: 10.1, 10.3, 10.4_

- [ ] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Wire up ORPC contracts to server routers
  - Update `apps/server/src/routers/index.ts` to include academic routers
  - Update `packages/orpc-contracts/src/index.ts` to export academic contracts
  - Update `packages/orpc-contracts/src/user/index.ts` to include academic namespace
  - Ensure type safety between contracts and implementations
  - _Requirements: All_

- [ ] 14. Create frontend components for academic timeline
  - Create `apps/web/app/(authenticated)/profile/academic/page.tsx`
  - Implement `AcademicTimeline` component
  - Implement `JourneyCard` component
  - Implement `TermCard` component
  - Implement `CourseRow` component
  - Implement `AchievementBadge` component
  - Implement `GPADisplay` component with color coding
  - Add loading and error states
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 15. Create forms for adding academic data
  - Create `AddJourneyForm` component using TanStack Form
  - Create `AddTermForm` component
  - Create `AddCourseForm` component with institution course lookup
  - Create `AddAchievementForm` component
  - Implement form validation with Zod schemas
  - Add institution and course selection dropdowns
  - Wire up forms to ORPC mutations
  - Add success/error toast notifications
  - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [ ] 16. Implement edit and delete functionality
  - Add edit buttons to journey, term, enrollment, achievement cards
  - Create edit modals/forms (reuse add forms with initial values)
  - Add delete confirmation dialogs
  - Wire up update and delete mutations
  - Implement optimistic updates for better UX
  - Handle GPA recalculation on frontend (refetch timeline)
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 17. Add data fetching with React Query
  - Implement timeline query with `orpc.user.academic.timeline.queryOptions()`
  - Implement journey list query
  - Implement institution list query with type filter
  - Implement course list query for institution
  - Set up query invalidation on mutations
  - Add loading skeletons
  - Add error boundaries
  - _Requirements: 1.2, 2.2, 4.2, 5.1, 6.4_

- [ ] 18. Style academic profile page
  - Apply Tailwind CSS styling to all components
  - Implement responsive design (mobile, tablet, desktop)
  - Add animations for card expansion/collapse
  - Style GPA displays with color coding (green for high, yellow for medium, red for low)
  - Add icons for achievements (trophy, certificate, etc.)
  - Ensure consistent spacing and typography
  - Match Rovierr design system
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 19. Add database indexes for performance
  - Create index on `academic_journey(user_id)`
  - Create index on `academic_term(journey_id, start_date)`
  - Create index on `course_enrollment(term_id)`
  - Create index on `achievement(journey_id, date_awarded)`
  - Create index on `course(institution_id, code)`
  - Create index on `institution(type, country)`
  - Test query performance with indexes
  - _Requirements: Performance optimization_

- [ ] 20. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 21. Create database migration scripts
  - Generate Drizzle migration for schema changes
  - Test migration on development database
  - Create rollback migration
  - Document migration steps
  - _Requirements: 7.1, 7.2, 7.4_

- [ ] 22. Update API documentation
  - Document all new ORPC endpoints
  - Add example requests and responses
  - Document error codes and messages
  - Add authentication requirements
  - Document GPA calculation formula
  - _Requirements: All_
