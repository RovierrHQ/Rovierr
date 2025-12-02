# Implementation Plan

- [ ] 1. Set up database schema and ORPC contracts
- [x] 1.1 Create job_application table in database schema
  - Add table definition in `packages/db/src/schema/career.ts`
  - Include all fields: userId, companyName, positionTitle, jobPostUrl, location, salaryRange, status, applicationDate, notes
  - Add foreign key reference to user table
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 1.2 Run database migration
  - Execute `bun db:push` to apply schema changes
  - Verify table creation in database
  - _Requirements: 3.1_

- [x] 1.3 Create generated schemas for career domain
  - Create `packages/orpc-contracts/src/career/generated-schemas.ts`
  - Generate insert, select, and update schemas using drizzle-zod
  - _Requirements: 3.1_

- [x] 1.4 Create API-specific schemas
  - Create `packages/orpc-contracts/src/career/schemas.ts`
  - Define createApplicationSchema, updateApplicationSchema, listApplicationsSchema
  - Define parsedJobDataSchema for AI parsing output
  - Define statisticsSchema for dashboard
  - Extract status enum from generated schema
  - _Requirements: 3.1, 3.4, 5.3, 10.1, 11.1_

- [x] 1.5 Define ORPC contracts
  - Create `packages/orpc-contracts/src/career/index.ts`
  - Define routes for create, list, get, update, delete, updateStatus, statistics, parseUrl
  - Add error definitions for each route
  - Export career contracts
  - _Requirements: 3.1, 4.1, 5.1, 7.1, 8.1, 9.2, 10.1, 11.1, 12.4_

- [ ] 2. Implement backend services
- [x] 2.1 Create Application Service
  - Create `apps/server/src/services/career/application-service.ts`
  - Implement createApplication method
  - Implement listApplications with filtering and pagination
  - Implement getApplication method
  - Implement updateApplication method
  - Implement deleteApplication method
  - Implement updateStatus method
  - Implement getStatistics method
  - Add ownership verification helper
  - _Requirements: 3.1, 3.2, 3.3, 3.5, 4.1, 4.2, 4.3, 5.1, 7.1, 8.1, 8.2, 9.2, 10.1, 10.2, 10.3, 10.4, 11.1, 11.2, 11.3, 11.4_

- [x] 2.2 Create URL Parser Service
  - Create `apps/server/src/services/career/url-parser-service.ts`
  - Implement fetchHTML method using fetch API
  - Implement extractTextContent method to parse HTML and extract text
  - Add URL validation
  - Add HTML sanitization
  - Add timeout handling (10 seconds)
  - _Requirements: 8.3, 12.4_

- [x] 2.3 Create AI Service for job post parsing
  - Create `apps/server/src/services/career/ai-service.ts`
  - Install Vercel AI SDK: `bun add ai @ai-sdk/openai`
  - Implement parseJobPosting method using generateObject
  - Define Zod schema for parsed job data
  - Add error handling for AI failures
  - _Requirements: 3.1, 3.4_

- [ ] 3. Create API routes
- [x] 3.1 Set up career routes directory
  - Create `apps/server/src/routes/career/` directory
  - Create index file to export all routes
  - _Requirements: 3.1_

- [x] 3.2 Implement application CRUD routes
  - Create `apps/server/src/routes/career/applications.ts`
  - Wire up create, list, get, update, delete endpoints
  - Add authentication middleware
  - Add ownership verification middleware
  - _Requirements: 3.1, 4.1, 7.1, 8.1, 9.2_

- [x] 3.3 Implement URL parsing route
  - Add parseUrl endpoint in applications routes
  - Wire up URL Parser Service and AI Service
  - Add rate limiting middleware (10 requests per minute)
  - Add error handling with fallback
  - _Requirements: 8.3, 12.4_

- [x] 3.4 Implement statistics route
  - Add statistics endpoint in applications routes
  - Wire up Application Service getStatistics method
  - Add caching (5 minutes)
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 3.5 Register career routes in main app
  - Import career routes in `apps/server/src/index.ts`
  - Mount routes under `/api/career` path
  - _Requirements: 3.1_

- [ ] 4. Implement dynamic side navigation
- [x] 4.1 Create career sidebar configuration
  - Create `apps/web/src/components/career/career-sidebar-config.ts`
  - Define sidebar nodes for Resume Builder, My Applications, Find Jobs, Network
  - Export configuration
  - _Requirements: 1.1, 1.2_

- [x] 4.2 Update Career Space layout
  - Modify `apps/web/src/app/spaces/career/layout.tsx`
  - Use useSpaceSidebarItems hook to set sidebar tree
  - Update sidebar when entering Career Space
  - Highlight active page based on pathname
  - _Requirements: 1.1, 1.2, 1.4, 1.5_

- [ ] 5. Create Resume Builder placeholder page
- [x] 5.1 Implement Resume Builder page
  - Create `apps/web/src/app/spaces/career/resume-builder/page.tsx`
  - Display placeholder UI with "Under Development" message
  - Add icon and descriptive text
  - Ensure sidebar remains visible
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 6. Implement My Applications page
- [x] 6.1 Create applications list page
  - Create `apps/web/src/app/spaces/career/applications/page.tsx`
  - Fetch applications using orpc.career.applications.list
  - Display applications in a list/grid layout
  - Show company name, position, status badge, application date
  - Add empty state for no applications
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 6.2 Add statistics dashboard
  - Create statistics component in applications page
  - Fetch statistics using orpc.career.applications.statistics
  - Display total, by status, upcoming interviews, pending responses
  - Use card layout for visual clarity
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 6.3 Implement search and filter UI
  - Add search input for company/position search
  - Add status filter dropdown
  - Add clear filters button
  - Update query parameters on filter change
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 7. Create application form with AI parsing
- [x] 7.1 Create application form component
  - Create `apps/web/src/components/career/application-form.tsx`
  - Use useAppForm from TanStack Form
  - Add fields: companyName, positionTitle, jobPostUrl, location, salaryRange, notes
  - Add validation using Zod schema
  - _Requirements: 3.1, 3.4_

- [x] 7.2 Implement URL parsing integration
  - Add URL input field with "Parse" button
  - Call orpc.career.applications.parseUrl when URL is entered
  - Show loading state during parsing
  - Pre-fill form fields with parsed data
  - Handle parsing errors gracefully with fallback to manual entry
  - _Requirements: 8.3, 12.4_

- [x] 7.3 Create application creation dialog
  - Create dialog component wrapping application form
  - Add "Add Application" button on applications page
  - Handle form submission with orpc.career.applications.create
  - Show success/error toast notifications
  - Invalidate queries on success
  - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [ ] 8. Implement application detail view
- [x] 8.1 Create application detail page
  - Create `apps/web/src/app/spaces/career/applications/[id]/page.tsx`
  - Fetch application using orpc.career.applications.get
  - Display all application fields
  - Show job post URL as clickable link (opens in new tab)
  - Add edit and delete buttons
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 8.2 Implement status update UI
  - Add status dropdown in detail view
  - Call orpc.career.applications.updateStatus on change
  - Show confirmation toast
  - Update UI optimistically
  - _Requirements: 5.1, 5.3_

- [x] 8.3 Create application edit dialog
  - Reuse application form component
  - Pre-fill with existing data
  - Call orpc.career.applications.update on submit
  - Preserve applicationDate during update
  - _Requirements: 8.1, 8.2_

- [x] 8.4 Implement delete confirmation
  - Add delete button with confirmation dialog
  - Call orpc.career.applications.delete on confirm
  - Redirect to applications list on success
  - _Requirements: 9.2, 9.3_

- [ ] 9. Add placeholder pages for Find Jobs and Network
- [x] 9.1 Create Find Jobs placeholder
  - Create `apps/web/src/app/spaces/career/find-jobs/page.tsx`
  - Display "Coming Soon" message
  - _Requirements: 1.2_

- [x] 9.2 Create Network placeholder
  - Create `apps/web/src/app/spaces/career/network/page.tsx`
  - Display "Coming Soon" message
  - _Requirements: 1.2_

- [ ] 10. Testing and validation
- [ ]* 10.1 Write unit tests for Application Service
  - Test createApplication
  - Test listApplications with filters
  - Test updateApplication
  - Test deleteApplication
  - Test getStatistics
  - _Requirements: 3.1, 4.1, 8.1, 9.2, 11.1_

- [ ]* 10.2 Write property-based tests
  - **Property 5: Application Creation Stores All Fields**
  - **Validates: Requirements 3.1, 3.4**

- [ ]* 10.3 Write property-based tests
  - **Property 6: Initial Status is Applied**
  - **Validates: Requirements 3.2**

- [ ]* 10.4 Write property-based tests
  - **Property 11: Applications Sorted by Recent First**
  - **Validates: Requirements 4.3**

- [ ]* 10.5 Write property-based tests
  - **Property 16: Application Date Invariant**
  - **Validates: Requirements 8.2**

- [ ]* 10.6 Write property-based tests
  - **Property 19: Status Filter Accuracy**
  - **Validates: Requirements 10.1**

- [ ]* 10.7 Write property-based tests
  - **Property 20: Search Match Accuracy**
  - **Validates: Requirements 10.2**

- [ ]* 10.8 Write property-based tests
  - **Property 23: Statistics Total Count Accuracy**
  - **Validates: Requirements 11.1**

- [ ]* 10.9 Write integration tests for API endpoints
  - Test end-to-end application creation flow
  - Test URL parsing with sample HTML
  - Test filter combinations
  - _Requirements: 3.1, 8.3, 10.3_

- [ ]* 10.10 Test AI parsing with real job posts
  - Test with LinkedIn job posts
  - Test with Indeed job posts
  - Test with company career pages
  - Verify parsed data accuracy
  - _Requirements: 8.3_

- [ ] 11. Final integration and polish
- [ ] 11.1 Test complete user flow
  - Navigate to Career Space
  - Verify sidebar updates
  - Create application with URL parsing
  - View application list
  - Update application status
  - Delete application
  - _Requirements: 1.1, 1.5, 3.1, 4.1, 5.1, 9.2_

- [ ] 11.2 Add loading states and error handling
  - Add skeleton loaders for applications list
  - Add error boundaries
  - Add retry logic for failed requests
  - _Requirements: 4.1_

- [ ] 11.3 Optimize performance
  - Verify database indexes are created
  - Test query performance with large datasets
  - Verify caching is working
  - _Requirements: 4.1, 11.1_

- [ ] 11.4 Update documentation
  - Add API documentation for career endpoints
  - Document AI parsing feature
  - Add usage examples
  - _Requirements: 3.1_
