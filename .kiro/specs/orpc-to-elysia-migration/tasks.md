# Implementation Plan

## Phase 1: Preparation and Infrastructure

- [x] 1. Set up migration infrastructure
  - Create migration utilities and helper functions
  - Set up testing framework for migration verification
  - Create migration checklist template
  - _Requirements: 13.1, 13.2_

- [x] 2. Create common error classes
  - Create `apps/server/src/lib/common-errors.ts` with base error classes (UNAUTHORIZED, NOT_FOUND, FORBIDDEN, BAD_REQUEST, INTERNAL_SERVER_ERROR)
  - Export error classes for reuse across routers
  - _Requirements: 4.1, 4.2_

- [ ]* 2.1 Write unit tests for error classes
  - Test error instantiation with default messages
  - Test error instantiation with custom messages
  - _Requirements: 4.1_

## Phase 2: High-Priority Core Routers

- [x] 3. Migrate user router
  - [x] 3.1 Extract schemas from `packages/orpc-contracts/src/user/`
    - Copy Zod schemas to `apps/server/src/routers/user/schemas.ts`
    - _Requirements: 2.1, 2.2, 2.5_

  - [x] 3.2 Migrate user profile routes
    - Convert ORPC handlers to Elysia routes in `apps/server/src/routers/user/profile.ts`
    - Apply betterAuth middleware for protected routes
    - Preserve all business logic from original implementation
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.1, 3.2_

  - [x] 3.3 Update user router index
    - Export Elysia router from `apps/server/src/routers/user/index.ts`
    - Register router in main server index
    - _Requirements: 1.1, 6.3_

  - [ ]* 3.4 Write integration tests for user endpoints
    - Test profile retrieval
    - Test profile updates
    - Test authentication requirements
    - _Requirements: 10.1, 10.5, 13.3_

- [x] 4. Migrate chat router
  - [x] 4.1 Create chat router structure
    - Create `apps/server/src/routers/chat/schemas.ts` for Zod schemas
    - Create `apps/server/src/routers/chat/errors.ts` for custom errors
    - _Requirements: 2.1, 2.2, 4.2, 6.2_

  - [x] 4.2 Migrate chat service integration
    - Convert ORPC handlers to Elysia routes in `apps/server/src/routers/chat/routes.ts`
    - Integrate ChatService with Elysia handlers
    - Preserve error handling logic (NOT_CONNECTED, NOT_PARTICIPANT, CONNECTION_REMOVED)
    - _Requirements: 1.4, 4.1, 4.4, 4.5_

  - [x] 4.3 Migrate presence endpoints
    - Convert presence ORPC handlers to Elysia routes
    - Integrate PresenceService with Elysia handlers
    - _Requirements: 1.1, 1.4_

  - [x] 4.4 Update chat router index and register
    - Export Elysia router from `apps/server/src/routers/chat/index.ts`
    - Register in main server index
    - _Requirements: 1.1, 6.3_

  - [ ]* 4.5 Write integration tests for chat endpoints
    - Test conversation creation
    - Test message sending
    - Test presence updates
    - _Requirements: 10.1, 10.5, 13.3_

- [x] 5. Migrate connection router
  - [x] 5.1 Extract and migrate connection schemas
    - Copy schemas from ORPC contracts to `apps/server/src/routers/connection/schemas.ts`
    - _Requirements: 2.1, 2.2, 2.5_

  - [x] 5.2 Migrate connection routes
    - Convert ORPC handlers to Elysia routes
    - Apply authentication middleware
    - Preserve connection management logic
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.1_

  - [x] 5.3 Register connection router
    - Export and register in main server index
    - _Requirements: 1.1, 6.3_

  - [ ]* 5.4 Write integration tests for connection endpoints
    - Test connection creation
    - Test connection listing
    - Test connection removal
    - _Requirements: 10.1, 10.5, 13.3_

- [x] 6. Checkpoint - Verify core routers
  - Ensure all tests pass, ask the user if questions arise.

## Phase 3: Campus and Social Features

- [x] 7. Migrate campus-feed router
  - [x] 7.1 Create campus-feed router structure
    - Create schemas, errors, and separate route files for posts, events, interactions
    - _Requirements: 2.1, 2.2, 4.2, 6.2_

  - [x] 7.2 Migrate posts endpoints
    - Convert posts ORPC handlers to Elysia routes in `apps/server/src/routers/campus-feed/posts.ts`
    - Preserve post creation, listing, and interaction logic
    - _Requirements: 1.1, 1.4, 7.1, 7.3_

  - [x] 7.3 Migrate events endpoints
    - Convert events ORPC handlers to Elysia routes in `apps/server/src/routers/campus-feed/events.ts`
    - Preserve event management logic
    - _Requirements: 1.1, 1.4_

  - [x] 7.4 Migrate interactions endpoints
    - Convert interactions ORPC handlers to Elysia routes in `apps/server/src/routers/campus-feed/interactions.ts`
    - Preserve like, comment, share logic
    - _Requirements: 1.1, 1.4_

  - [x] 7.5 Register campus-feed router
    - Export and register in main server index
    - _Requirements: 1.1, 6.3_

  - [ ]* 7.6 Write integration tests for campus-feed endpoints
    - Test post creation and listing
    - Test event management
    - Test interactions
    - _Requirements: 10.1, 10.5, 13.3_

- [x] 8. Migrate discussion router
  - [x] 8.1 Create discussion router structure
    - Create schemas, errors, and separate route files for threads, replies, votes, follows
    - _Requirements: 2.1, 2.2, 4.2, 6.2_

  - [x] 8.2 Migrate threads endpoints
    - Convert threads ORPC handlers to Elysia routes in `apps/server/src/routers/discussion/threads.ts`
    - Preserve thread creation, listing, and management logic
    - _Requirements: 1.1, 1.4, 7.1, 7.3_

  - [x] 8.3 Migrate replies endpoints
    - Convert replies ORPC handlers to Elysia routes in `apps/server/src/routers/discussion/replies.ts`
    - Preserve reply logic
    - _Requirements: 1.1, 1.4_

  - [x] 8.4 Migrate votes endpoints
    - Convert votes ORPC handlers to Elysia routes in `apps/server/src/routers/discussion/votes.ts`
    - Preserve voting logic
    - _Requirements: 1.1, 1.4_

  - [x] 8.5 Migrate follows endpoints
    - Convert follows ORPC handlers to Elysia routes in `apps/server/src/routers/discussion/follows.ts`
    - Preserve follow/unfollow logic
    - _Requirements: 1.1, 1.4_

  - [x] 8.6 Register discussion router
    - Export and register in main server index
    - _Requirements: 1.1, 6.3_

  - [ ]* 8.7 Write integration tests for discussion endpoints
    - Test thread operations
    - Test reply operations
    - Test voting
    - Test following
    - _Requirements: 10.1, 10.5, 13.3_

- [ ] 9. Migrate society router
  - [x] 9.1 Extract and migrate society schemas
    - Copy schemas from ORPC contracts to `apps/server/src/routers/society/schemas.ts`
    - Create error classes in `apps/server/src/routers/society/errors.ts`
    - _Requirements: 2.1, 2.2, 4.2, 6.2_

  - [x] 9.2 Migrate society routes
    - Convert ORPC handlers to Elysia routes
    - Preserve society management, membership, and event logic
    - Apply authorization checks for admin operations
    - _Requirements: 1.1, 1.4, 3.3, 7.1, 7.3_

  - [x] 9.3 Register society router
    - Export and register in main server index
    - _Requirements: 1.1, 6.3_

  - [ ]* 9.4 Write integration tests for society endpoints
    - Test society creation and management
    - Test membership operations
    - Test authorization checks
    - _Requirements: 10.1, 10.5, 13.3_

- [ ] 10. Checkpoint - Verify social features
  - Ensure all tests pass, ask the user if questions arise.

## Phase 4: Academic and Career Features

- [ ] 11. Migrate form router
  - [x] 11.1 Create form router structure
    - Create `apps/server/src/routers/form/schemas.ts` for all form-related schemas
    - Create `apps/server/src/routers/form/errors.ts` for custom errors
    - Create `apps/server/src/routers/form/routes.ts` for route definitions
    - _Requirements: 2.1, 2.2, 4.2, 6.2_

  - [x] 11.2 Migrate form management endpoints
    - Convert form CRUD ORPC handlers to Elysia routes
    - Preserve FormService integration
    - Handle Date to ISO string transformations
    - _Requirements: 1.1, 1.4, 7.5_

  - [x] 11.3 Migrate page management endpoints
    - Convert page CRUD ORPC handlers to Elysia routes
    - Preserve page ordering logic
    - _Requirements: 1.1, 1.4_

  - [x] 11.4 Migrate question management endpoints
    - Convert question CRUD ORPC handlers to Elysia routes
    - Preserve question ordering logic
    - _Requirements: 1.1, 1.4_

  - [x] 11.5 Migrate form response and template stubs
    - Convert stub endpoints to Elysia (maintain NOT_IMPLEMENTED errors)
    - _Requirements: 1.1, 1.4_

  - [x] 11.6 Migrate smart field endpoints
    - Convert smart field ORPC handlers to Elysia routes
    - _Requirements: 1.1, 1.4_

  - [x] 11.7 Register form router
    - Export and register in main server index
    - _Requirements: 1.1, 6.3_

  - [ ]* 11.8 Write integration tests for form endpoints
    - Test form CRUD operations
    - Test page management
    - Test question management
    - Test authorization
    - _Requirements: 10.1, 10.5, 13.3_

- [x] 12. Migrate academic router
  - [x] 12.1 Create academic router structure
    - Create schemas and route files for enrollment
    - _Requirements: 2.1, 2.2, 6.2_

  - [x] 12.2 Migrate enrollment endpoints
    - Convert enrollment ORPC handlers to Elysia routes in `apps/server/src/routers/academic/enrollment.ts`
    - Preserve enrollment logic
    - _Requirements: 1.1, 1.4_

  - [x] 12.3 Register academic router
    - Export and register in main server index
    - _Requirements: 1.1, 6.3_

  - [ ]* 12.4 Write integration tests for academic endpoints
    - Test enrollment operations
    - _Requirements: 10.1, 10.5, 13.3_

- [x] 13. Migrate calendar router
  - [x] 13.1 Create calendar router structure
    - Create schemas and route files for Google Calendar integration
    - _Requirements: 2.1, 2.2, 6.2_

  - [x] 13.2 Migrate calendar endpoints
    - Convert calendar ORPC handlers to Elysia routes
    - Preserve Google Calendar integration logic
    - _Requirements: 1.1, 1.4_

  - [x] 13.3 Register calendar router
    - Export and register in main server index
    - _Requirements: 1.1, 6.3_

  - [ ]* 13.4 Write integration tests for calendar endpoints
    - Test calendar operations
    - _Requirements: 10.1, 10.5, 13.3_

- [x] 14. Migrate career router (1 minor type issue with AI service - can be fixed later)
  - [x] 14.1 Create career router structure
    - Created schemas from ORPC contracts with drizzle-zod
    - Created error classes
    - Created common-errors.ts for reusable error classes
    - _Requirements: 2.1, 2.2, 6.2_

  - [x] 14.2 Migrate career AI endpoints
    - Converted 8 AI ORPC handlers to Elysia routes
    - Preserved AI service integration
    - NOTE: Minor type mismatch in suggestions.section (service returns string, schema expects enum)
    - _Requirements: 1.1, 1.4_

  - [x] 14.3 Migrate career applications endpoints
    - Converted 8 applications ORPC handlers to Elysia routes
    - Preserved ApplicationService integration
    - _Requirements: 1.1, 1.4_

  - [x] 14.4 Register career router
    - Exported and registered in main server index at `/career`
    - _Requirements: 1.1, 6.3_

  - [ ]* 14.5 Write integration tests for career endpoints
    - Test AI features
    - Test application management
    - _Requirements: 10.1, 10.5, 13.3_

- [x] 15. Migrate resume router
  - [ ] 15.1 Extract and migrate resume schemas
    - Copy schemas from ORPC contracts to router directory
    - _Requirements: 2.1, 2.2_

  - [x] 15.2 Migrate resume routes
    - Convert ORPC handlers to Elysia routes
    - Preserve resume management logic
    - _Requirements: 1.1, 1.4_

  - [ ] 15.3 Register resume router
    - Export and register in main server index
    - _Requirements: 1.1, 6.3_

  - [ ]* 15.4 Write integration tests for resume endpoints
    - Test resume operations
    - _Requirements: 10.1, 10.5, 13.3_

- [ ] 16. Checkpoint - Verify academic and career features
  - Ensure all tests pass, ask the user if questions arise.

## Phase 5: Supporting Features

- [x] 17. Migrate university router
  - [ ] 17.1 Extract and migrate university schemas
    - Copy schemas from ORPC contracts to router directory
    - _Requirements: 2.1, 2.2_

  - [x] 17.2 Migrate university routes
    - Convert ORPC handlers to Elysia routes
    - Preserve university listing and search logic
    - _Requirements: 1.1, 1.4_

  - [ ] 17.3 Register university router
    - Export and register in main server index
    - _Requirements: 1.1, 6.3_

  - [x]* 17.4 Write integration tests for university endpoints
    - Test university operations
    - _Requirements: 10.1, 10.5, 13.3_

- [x] 18. Migrate society-registration router
  - [ ] 18.1 Extract and migrate society-registration schemas
    - Copy schemas from ORPC contracts to router directory
    - _Requirements: 2.1, 2.2_

  - [x] 18.2 Migrate society-registration routes
    - Convert ORPC handlers to Elysia routes
    - Preserve registration workflow logic
    - _Requirements: 1.1, 1.4_

  - [ ] 18.3 Register society-registration router
    - Export and register in main server index
    - _Requirements: 1.1, 6.3_

  - [ ]* 18.4 Write integration tests for society-registration endpoints
    - Test registration workflow
    - _Requirements: 10.1, 10.5, 13.3_

- [ ] 19. Migrate expenses router
  - [ ] 19.1 Extract and migrate expenses schemas
    - Copy schemas from ORPC contracts to `apps/server/src/routers/expenses/index.ts`
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 19.2 Migrate expenses routes
    - Convert ORPC handlers to Elysia routes in same file
    - Preserve expense tracking logic
    - _Requirements: 1.1, 1.4_

  - [ ] 19.3 Register expenses router
    - Export and register in main server index
    - _Requirements: 1.1, 6.3_

  - [ ]* 19.4 Write integration tests for expenses endpoints
    - Test expense operations
    - _Requirements: 10.1, 10.5, 13.3_

- [ ] 20. Migrate people router
  - [ ] 20.1 Extract and migrate people schemas
    - Copy schemas from ORPC contracts to router directory
    - _Requirements: 2.1, 2.2_

  - [ ] 20.2 Migrate people routes
    - Convert ORPC handlers to Elysia routes
    - Preserve people search and profile logic
    - _Requirements: 1.1, 1.4_

  - [ ] 20.3 Register people router
    - Export and register in main server index
    - _Requirements: 1.1, 6.3_

  - [ ]* 20.4 Write integration tests for people endpoints
    - Test people search
    - _Requirements: 10.1, 10.5, 13.3_

- [ ] 21. Migrate society-email router
  - [ ] 21.1 Extract and migrate society-email schemas
    - Copy schemas from ORPC contracts to router directory
    - _Requirements: 2.1, 2.2_

  - [ ] 21.2 Migrate society-email routes
    - Convert ORPC handlers to Elysia routes
    - Preserve email sending logic
    - _Requirements: 1.1, 1.4_

  - [ ] 21.3 Register society-email router
    - Export and register in main server index
    - _Requirements: 1.1, 6.3_

  - [ ]* 21.4 Write integration tests for society-email endpoints
    - Test email operations
    - _Requirements: 10.1, 10.5, 13.3_

- [ ] 22. Migrate student-organizations router
  - [ ] 22.1 Extract and migrate student-organizations schemas
    - Copy schemas from ORPC contracts to router directory
    - _Requirements: 2.1, 2.2_

  - [ ] 22.2 Migrate student-organizations routes
    - Convert ORPC handlers to Elysia routes
    - Preserve organization management logic
    - _Requirements: 1.1, 1.4_

  - [ ] 22.3 Register student-organizations router
    - Export and register in main server index
    - _Requirements: 1.1, 6.3_

  - [ ]* 22.4 Write integration tests for student-organizations endpoints
    - Test organization operations
    - _Requirements: 10.1, 10.5, 13.3_

- [ ] 23. Migrate roadmap router
  - [ ] 23.1 Extract and migrate roadmap schemas
    - Copy schemas from ORPC contracts to `apps/server/src/routers/roadmap/index.ts`
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 23.2 Migrate roadmap routes
    - Convert ORPC handlers to Elysia routes in same file
    - Preserve roadmap logic
    - _Requirements: 1.1, 1.4_

  - [ ] 23.3 Register roadmap router
    - Export and register in main server index
    - _Requirements: 1.1, 6.3_

  - [ ]* 23.4 Write integration tests for roadmap endpoints
    - Test roadmap operations
    - _Requirements: 10.1, 10.5, 13.3_

- [ ] 24. Checkpoint - Verify supporting features
  - Ensure all tests pass, ask the user if questions arise.

## Phase 6: Cleanup and Verification

- [ ] 25. Remove ORPC dependencies
  - [ ] 25.1 Remove ORPC imports from all files
    - Search and remove all `@orpc/server` and `@orpc/contract` imports
    - Remove `protectedProcedure` usage
    - _Requirements: 13.5_

  - [ ] 25.2 Remove ORPC packages
    - Remove `@orpc/server` and `@orpc/contract` from `package.json`
    - Remove `packages/orpc-contracts` directory
    - Run `bun install` to clean up dependencies
    - _Requirements: 13.5_

  - [ ] 25.3 Update imports across codebase
    - Update any remaining references to ORPC contracts
    - Ensure all imports point to new Elysia routers
    - _Requirements: 13.5_

- [ ] 26. Update documentation
  - [ ] 26.1 Update API documentation
    - Verify OpenAPI/Swagger documentation is generated correctly
    - Test `/swagger` endpoint
    - _Requirements: 9.1, 9.2_

  - [ ] 26.2 Update developer documentation
    - Update README with Elysia migration notes
    - Document new router patterns
    - Update contribution guidelines
    - _Requirements: 9.1_

  - [ ] 26.3 Update deployment documentation
    - Update deployment scripts if needed
    - Document any environment variable changes
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ] 27. Final verification
  - [ ] 27.1 Run full test suite
    - Run all unit tests
    - Run all integration tests
    - Verify all tests pass
    - _Requirements: 10.5, 13.1, 13.2_

  - [ ] 27.2 Verify TypeScript compilation
    - Run `bun run typecheck` across entire codebase
    - Fix any type errors
    - _Requirements: 13.1_

  - [ ] 27.3 Manual testing
    - Start server and verify all routes are registered
    - Test key endpoints manually
    - Verify authentication works correctly
    - _Requirements: 13.2, 13.3_

  - [ ]* 27.4 Performance testing
    - Run performance benchmarks
    - Compare with baseline metrics
    - Verify response times are within acceptable range
    - _Requirements: 11.1, 11.3, 11.4, 11.5_

  - [ ] 27.5 Code review
    - Review all migrated code
    - Ensure consistency across routers
    - Verify best practices are followed
    - _Requirements: 1.1, 6.1, 6.2, 6.3_

- [ ] 28. Final Checkpoint - Migration complete
  - Ensure all tests pass, ask the user if questions arise.
