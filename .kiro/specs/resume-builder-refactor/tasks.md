# Implementation Plan - Resume Builder Refactor

## Overview
This plan refactors the existing resume builder in `apps/web/src/components/resume-builder/` from 70+ files with Zustand/Jotai/Temporal state into a simplified architecture (20-30 files) using React Query + ORPC as the single source of truth.

**Current Structure**:
- `builder/sections/` - 10 section files + shared components
- `resume-profile-form/schema/` - 11 separate schema files
- `resume-profile-form/ui/` - 10 separate UI files
- `zustand-store/` - 2 Zustand store files
- `renderer/` - Template rendering
- Multiple utility and type files

**Target Structure**: Consolidate to ~20-30 files by merging schema + UI + logic per section

---

## Phase 1: Database & API Foundation

- [ ] 1. Set up database schema and ORPC contracts
  - Create resume tables in database schema
  - Generate Zod schemas from Drizzle
  - Define ORPC contracts for resume operations
  - _Requirements: 1.1, 2.1, 2.4, 2.5, 11.1_

- [x] 1.1 Create database schema for resumes
  - Add `resumes` table to `packages/db/src/schema/career.ts`
  - Add `resume_data` table with JSONB columns for sections
  - Include fields: id, userId, title, targetPosition, status, templateId, timestamps
  - _Requirements: 2.1, 2.4, 2.5_

- [x] 1.2 Generate Zod schemas from database
  - Create `packages/orpc-contracts/src/resume/generated-schemas.ts`
  - Use `createInsertSchema`, `createSelectSchema`, `createUpdateSchema` from drizzle-zod
  - Generate schemas for `resumes` and `resume_data` tables
  - _Requirements: 2.1, 3.2, 12.1_

- [x] 1.3 Create API-specific schemas
  - Create `packages/orpc-contracts/src/resume/schemas.ts`
  - Define section schemas (BasicInfo, Education, Experience, etc.)
  - Create composite schemas (FullResume with all sections)
  - Define input/output schemas for API operations
  - _Requirements: 3.2, 4.1, 5.1, 6.1, 7.1, 8.1_

- [x] 1.4 Define ORPC contracts
  - Create `packages/orpc-contracts/src/resume/index.ts`
  - Define routes: list, get, create, updateMetadata, updateSection, delete
  - Add proper error handling for each route
  - Export all schemas and contracts
  - _Requirements: 1.1, 2.1, 2.4, 3.3, 11.1_

- [ ]* 1.5 Write property test for user resume isolation
  - **Property 1: User resume isolation**
  - **Validates: Requirements 1.1**
  - Test that querying resumes only returns resumes belonging to that user
  - Use fast-check to generate random users and resumes
  - _Requirements: 1.1_

- [ ]* 1.6 Write property test for unique ID generation
  - **Property 2: Unique resume ID generation**
  - **Validates: Requirements 2.1**
  - Test that all generated resume IDs are unique with no collisions
  - Generate multiple resumes and verify ID uniqueness
  - _Requirements: 2.1_

- [ ]* 1.7 Write property test for resume persistence
  - **Property 3: Resume creation persistence**
  - **Validates: Requirements 2.4**
  - Test round-trip: create resume then immediately retrieve it
  - Verify all fields match after persistence
  - _Requirements: 2.4_

---

## Phase 2: Server Implementation

- [ ] 2. Implement server-side resume handlers
  - Create Hono route handlers for all resume operations
  - Implement database queries using Drizzle ORM
  - Add authentication and authorization checks
  - _Requirements: 1.1, 2.4, 3.3, 11.1, 11.2, 15.1_

- [x] 2.1 Create resume route handlers
  - Create `apps/server/src/routes/resume/handlers.ts`
  - Implement: listResumes, getResume, createResume, updateResumeMetadata
  - Implement: updateResumeSection, deleteResume
  - Add user authentication checks for all operations
  - _Requirements: 1.1, 2.1, 2.4, 3.3_

- [x] 2.2 Implement database queries
  - Write Drizzle queries for CRUD operations
  - Add proper joins for fetching resume with data
  - Implement filtering and pagination for list endpoint
  - Add transaction support for multi-table updates
  - _Requirements: 1.1, 2.4, 11.1_

- [x] 2.3 Add error handling and validation
  - Validate user ownership before operations
  - Return proper error codes (NOT_FOUND, UNAUTHORIZED, VALIDATION_ERROR)
  - Implement retry logic with exponential backoff
  - Log errors for monitoring
  - _Requirements: 11.2, 11.3, 15.1, 15.3, 15.5_

- [x] 2.4 Register resume routes
  - Add resume routes to main Hono app
  - Configure ORPC router with resume contracts
  - Test all endpoints with sample data
  - _Requirements: 1.1, 2.4, 3.3_

- [ ]* 2.5 Write property test for section validation
  - **Property 4: Section validation enforcement**
  - **Validates: Requirements 3.2**
  - Test that invalid section data is rejected with proper errors
  - Generate random invalid data and verify rejection
  - _Requirements: 3.2, 12.1_

---

## Phase 3: Refactor Core UI Components

- [ ] 3. Refactor existing UI components to use React Query
  - Update resume list view to use ORPC queries
  - Refactor section sidebar to remove Zustand
  - Update preview panel with new data flow
  - _Requirements: 1.1, 1.2, 1.3, 9.1, 9.5, 14.1_

- [x] 3.1 Refactor resume list view
  - Edit `apps/web/src/components/resume-builder/resume-list-view.tsx`
  - Replace mock query with ORPC `career.resume.list` query
  - Remove Zustand store calls (useResumeStore, useBuilderStore)
  - Update create resume button to use ORPC mutation
  - Keep existing DataTable and columns structure
  - _Requirements: 1.1, 1.2, 1.5_

- [x] 3.2 Refactor section sidebar
  - Edit `apps/web/src/components/resume-builder/builder/side-nav.tsx`
  - Remove Zustand dependencies (useBuilderStore, useResumeStore)
  - Use React state for active section tracking
  - Keep existing section list and icons
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [x] 3.3 Refactor preview renderer
  - Edit `apps/web/src/components/resume-builder/renderer/index.tsx`
  - Remove Zustand store dependency
  - Accept resume data as props from React Query
  - Keep existing template rendering logic
  - Add zoom controls (50% to 200%)
  - _Requirements: 9.1, 9.2, 9.4, 9.5_

- [x] 3.4 Update export functionality
  - Edit `apps/web/src/components/resume-builder/renderer/downloadResume.tsx`
  - Remove Zustand dependency
  - Accept resume data as props
  - Keep existing PDF generation logic
  - Add loading state and toast notifications
  - _Requirements: 10.1, 10.3_

---

## Phase 4: Consolidate Section Forms

- [ ] 4. Consolidate section forms (merge schema + UI + logic)
  - Merge separate schema and UI files into single section files
  - Remove Zustand dependencies and use React Query mutations
  - Implement auto-save functionality
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 5.1, 6.1, 7.1, 8.1_

- [x] 4.1 Consolidate basic info section
  - Merge `resume-profile-form/schema/basic.ts` + `builder/sections/basic.tsx`
  - Create new `apps/web/src/components/resume/sections/basic-info.tsx`
  - Remove Zustand setValue calls, use ORPC mutation instead
  - Keep existing TanStack Form structure
  - Add auto-save with 2-second debounce using useAutoSave hook
  - Delete old files after migration
  - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 4.4_

- [ ]* 4.2 Write property test for email validation
  - **Property 6: Email format validation**
  - **Validates: Requirements 4.2**
  - Test that email validation accepts valid emails and rejects invalid ones
  - Use fast-check email generators
  - _Requirements: 4.2, 12.1_

- [x] 4.3 Consolidate education section
  - Merge `resume-profile-form/schema/education.ts` + `resume-profile-form/ui/education.tsx` + `builder/sections/education.tsx`
  - Create new `apps/web/src/components/resume/sections/education.tsx`
  - Remove Zustand dependencies, use ORPC mutation
  - Keep existing form fields and list display
  - Add chronological sorting utility
  - Delete old files after migration
  - _Requirements: 3.1, 3.2, 5.1, 5.2, 5.3, 5.4_

- [ ]* 4.4 Write property test for chronological sorting
  - **Property 7: Chronological sorting consistency**
  - **Validates: Requirements 5.2, 6.2**
  - Test that date-based entries are sorted newest first
  - Generate random date arrays and verify sorting
  - _Requirements: 5.2, 6.2_

- [x] 4.5 Consolidate experience section
  - Merge `resume-profile-form/schema/experience.ts` + `resume-profile-form/ui/experience.tsx` + `builder/sections/experience.tsx`
  - Create new `apps/web/src/components/resume/sections/experience.tsx`
  - Remove Zustand dependencies, use ORPC mutation
  - Keep existing rich text editor for description
  - Add chronological sorting
  - Delete old files after migration
  - _Requirements: 3.1, 3.2, 6.1, 6.2, 6.3, 6.4_

- [x] 4.6 Consolidate projects section
  - Merge `resume-profile-form/schema/project.ts` + `resume-profile-form/ui/project.tsx` + `builder/sections/project.tsx`
  - Create new `apps/web/src/components/resume/sections/projects.tsx`
  - Remove Zustand dependencies, use ORPC mutation
  - Keep existing form fields
  - Add URL validation
  - Delete old files after migration
  - _Requirements: 3.1, 3.2, 7.1, 7.2, 7.3, 7.4_

- [ ]* 4.7 Write property test for URL validation
  - **Property 8: URL format validation**
  - **Validates: Requirements 7.2**
  - Test that URL validation accepts valid URLs and rejects invalid ones
  - Use fast-check URL generators
  - _Requirements: 7.2, 12.1_

- [x] 4.8 Consolidate additional sections
  - Merge certification schema + UI + section into `apps/web/src/components/resume/sections/certifications.tsx`
  - Merge language schema + UI + section into `apps/web/src/components/resume/sections/languages.tsx`
  - Merge interest schema + UI + section into `apps/web/src/components/resume/sections/interests.tsx`
  - Merge volunteering schema + UI + section into `apps/web/src/components/resume/sections/volunteer.tsx`
  - Remove Zustand dependencies from all
  - Delete old files after migration
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

---

## Phase 5: Refactor Template System

- [ ] 5. Refactor existing template system
  - Update templates to accept props instead of reading from Zustand
  - Keep existing Azurill template
  - Ensure extensibility for future templates
  - _Requirements: 9.1, 9.2, 9.3, 10.2_

- [x] 5.1 Refactor Azurill template
  - Edit `apps/web/src/components/resume-builder/renderer/templates/azurill.tsx`
  - Remove Zustand store dependency (useResumeStore)
  - Accept resume data as props via TemplateProps interface
  - Keep existing styling and layout
  - Support zoom scaling via transform
  - _Requirements: 9.1, 9.3, 9.4_

- [x] 5.2 Update template components
  - Edit files in `renderer/templates/components/` if needed
  - Remove any Zustand dependencies
  - Accept data as props
  - Keep existing styling
  - _Requirements: 9.1, 9.3_

- [x] 5.3 Update template index
  - Edit `apps/web/src/components/resume-builder/renderer/templates/index.tsx`
  - Update template registry to pass props
  - Keep template switching logic
  - Document how to add new templates
  - _Requirements: 9.3_

---

## Phase 6: PDF Export

- [ ] 6. Implement PDF export functionality
  - Add PDF generation using html2canvas and jsPDF
  - Preserve formatting and styling
  - Ensure text is selectable
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 6.1 Create PDF generation utility
  - Create `apps/web/src/components/resume/lib/pdf-export.ts`
  - Use html2canvas to capture preview element
  - Convert to PDF with jsPDF
  - Handle page breaks and margins
  - _Requirements: 10.1, 10.2, 10.4_

- [x] 6.2 Implement export button handler
  - Add click handler to export button
  - Show loading state during generation
  - Use resume title as filename
  - Display success/error notifications
  - _Requirements: 10.1, 10.3_

- [ ]* 6.3 Write property test for PDF content preservation
  - **Property 9: PDF content preservation**
  - **Validates: Requirements 10.2**
  - Test that generated PDF contains all text from preview
  - Generate random resume data and verify content
  - _Requirements: 10.2_

---

## Phase 7: Refactor Pages & Routing

- [ ] 7. Refactor existing page components
  - Update resume list page to use ORPC
  - Update resume editor page to use React Query
  - Improve responsive layouts
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 13.1, 13.2, 13.3_

- [x] 7.1 Refactor resume list page
  - Edit `apps/web/src/app/spaces/career/resume-builder/page.tsx`
  - Replace with ORPC query for resume list
  - Import refactored ResumeListView component
  - Keep existing routing structure
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 7.2 Refactor resume editor page
  - Edit `apps/web/src/app/spaces/career/resume-builder/[resumeid]/page.tsx`
  - Fetch resume data using ORPC query
  - Remove Zustand store initialization
  - Import refactored section components
  - Implement section switching with React state
  - Display live preview with refactored renderer
  - _Requirements: 3.1, 3.4, 9.1, 14.2_

- [x] 7.3 Improve responsive layouts
  - Edit `apps/web/src/components/resume-builder/layout.tsx`
  - Add mobile warning for screens < 768px
  - Vertical stack for tablet (768-1024px)
  - Side-by-side for desktop (>1024px)
  - Use existing useBreakpoint hook
  - _Requirements: 13.1, 13.2, 13.3, 13.4_

---

## Phase 8: Implement Auto-Save & Optimistic Updates

- [ ] 8. Add auto-save and optimistic updates
  - Create shared hooks for auto-save
  - Implement optimistic updates with React Query
  - Replace Zustand state with React Query cache
  - _Requirements: 3.4, 3.5, 11.1, 11.2, 11.3, 11.4_

- [x] 8.1 Create shared hooks
  - Create `apps/web/src/components/resume/lib/hooks.ts`
  - Implement useAutoSave hook with 2-second debounce (using use-debounce)
  - Implement useResumeData hook wrapping ORPC query
  - Add loading and error states
  - _Requirements: 11.1, 11.2_

- [x] 8.2 Implement optimistic updates
  - Add onMutate handler to ORPC mutations for immediate UI updates
  - Add onError handler for rollback to previous state
  - Add onSuccess handler for cache invalidation
  - Show toast notifications using sonner
  - Apply to all section update mutations
  - _Requirements: 3.4, 11.3, 15.4_

- [ ]* 8.3 Write property test for save before navigation
  - **Property 10: Save completion before navigation**
  - **Validates: Requirements 11.4**
  - Test that pending changes are saved before navigation
  - Simulate navigation with unsaved changes
  - _Requirements: 11.4_

---

## Phase 9: Form Validation & Error Handling

- [ ] 9. Implement comprehensive validation and error handling
  - Add field-level validation
  - Display error messages
  - Handle network and server errors
  - _Requirements: 3.2, 12.1, 12.2, 12.3, 12.4, 12.5, 15.1, 15.2, 15.3, 15.4_

- [x] 9.1 Implement form validation
  - Add Zod schemas for all sections
  - Display field-level errors below inputs
  - Prevent submission with invalid data
  - Clear errors when corrected
  - Focus first invalid field on submit
  - _Requirements: 3.2, 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ]* 9.2 Write property test for validation error display
  - **Property 11: Validation error display**
  - **Validates: Requirements 12.1**
  - Test that validation errors are displayed in UI
  - Generate invalid form data and verify error messages
  - _Requirements: 12.1_

- [ ]* 9.3 Write property test for required field enforcement
  - **Property 12: Required field enforcement**
  - **Validates: Requirements 12.2**
  - Test that forms prevent submission with empty required fields
  - Generate forms with missing required fields
  - _Requirements: 12.2_

- [x] 9.4 Add error handling
  - Handle network errors with retry
  - Handle validation errors with field messages
  - Handle authorization errors with redirect
  - Handle not found errors with 404 page
  - Handle server errors with generic message
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

---

## Phase 10: Cleanup & File Consolidation

- [ ] 10. Delete old files and consolidate structure
  - Delete Zustand stores
  - Delete separated schema and UI files
  - Remove unused utilities
  - Reorganize remaining files
  - _Requirements: All (cleanup enables simplified architecture)_

- [x] 10.1 Delete Zustand stores
  - Delete `apps/web/src/components/resume-builder/zustand-store/builder.ts`
  - Delete `apps/web/src/components/resume-builder/zustand-store/resume.ts`
  - Delete entire `zustand-store/` directory
  - Remove zustand and zundo from package.json if not used elsewhere

- [x] 10.2 Delete old schema files
  - Delete entire `apps/web/src/components/resume-builder/resume-profile-form/schema/` directory
  - All schemas now consolidated into section files
  - Delete `schema/` directory (sections.ts, sample.ts, metadata/)
  - Keep only necessary type definitions

- [x] 10.3 Delete old UI files
  - Delete entire `apps/web/src/components/resume-builder/resume-profile-form/ui/` directory
  - All UI now consolidated into section files
  - Delete `resume-profile-form/` parent directory

- [x] 10.4 Delete old section files
  - Delete `apps/web/src/components/resume-builder/builder/sections/` directory
  - All sections now in new consolidated location
  - Delete shared section components if no longer needed

- [x] 10.5 Clean up utilities
  - Review `apps/web/src/components/resume-builder/hooks.ts` - keep if useful, delete if redundant
  - Review `apps/web/src/components/resume-builder/const.ts` - consolidate into lib/utils.ts
  - Review `apps/web/src/components/resume-builder/state.ts` - delete if Zustand-related
  - Update `apps/web/src/components/resume-builder/types.ts` - keep only necessary types

- [x] 10.6 Reorganize directory structure
  - Move consolidated sections to `apps/web/src/components/resume/sections/`
  - Move templates to `apps/web/src/components/resume/templates/`
  - Move utilities to `apps/web/src/components/resume/lib/`
  - Update all imports across the codebase
  - Delete empty directories

---

## Phase 11: Testing & Polish

- [ ] 11. Final testing and polish
  - Run all property-based tests
  - Write unit tests for components
  - Test end-to-end flows
  - Fix any remaining bugs
  - _Requirements: All_

- [x] 11.1 Run all property-based tests
  - Execute all 12 property tests with 100 iterations each
  - Verify all properties pass
  - Fix any failures discovered
  - Document test coverage

- [ ]* 11.2 Write unit tests for components
  - Test resume card rendering
  - Test empty state display
  - Test section sidebar navigation
  - Test form field rendering
  - Test preview updates

- [ ]* 11.3 Write integration tests
  - Test create → edit → save flow
  - Test list → select → edit flow
  - Test export PDF flow
  - Test error handling flows

- [x] 11.4 Manual testing
  - Test on different screen sizes
  - Test with various data inputs
  - Test error scenarios
  - Test performance with large resumes

- [x] 11.5 Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise

---

## Summary

This implementation plan refactors the resume builder from 70+ files to ~20-30 files by:
- Eliminating Zustand, Jotai, and Temporal state management
- Using React Query + ORPC as single source of truth
- Consolidating section files (schema + form + logic in one file)
- Implementing comprehensive property-based testing
- Following the design document's simplified architecture

Each task builds incrementally on previous tasks, with clear requirements traceability and optional testing tasks marked with *.
