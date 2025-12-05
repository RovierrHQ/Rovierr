# Implementation Plan

- [x] 1. Database schema and migrations
  - Create cover_letters table with proper indexes
  - Add source_resume_id, optimized_for_job_id, and applied_suggestions columns to resumes table
  - Create indexes for performance optimization
  - Run migrations and verify schema changes
  - _Requirements: 6.1, 6.2, 6.4, 7.2, 9.3, 15.3, 15.4_

- [ ] 2. ORPC contracts and schemas
  - [x] 2.1 Create generated schemas for cover_letters table
    - Generate Zod schemas using drizzle-zod
    - Export insert, select, and update schemas
    - _Requirements: 9.3_

  - [x] 2.2 Create API schemas for AI assistant
    - Define ParsedJobData schema
    - Define ResumeAnalysis schema
    - Define ResumeSuggestion schema
    - Define CoverLetter schemas
    - Define input/output schemas for all endpoints
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 8.1_

  - [x] 2.3 Define ORPC contract routes
    - POST /career/ai/parse-job-description (URL and text variants)
    - POST /career/ai/analyze-resume
    - POST /career/ai/generate-suggestions
    - POST /career/ai/create-optimized-resume
    - POST /career/ai/generate-cover-letter
    - GET /career/ai/cover-letters/:id
    - PATCH /career/ai/cover-letters/:id
    - DELETE /career/ai/cover-letters/:id
    - _Requirements: 1.1, 3.1, 4.1, 6.1, 8.1, 9.3_

- [ ] 3. AI Service implementation
  - [x] 3.1 Extend AIService class with new methods
    - Implement parseJobDescription(text: string)
    - Implement parseJobUrl(url: string)
    - Implement analyzeResume(resumeData, jobData)
    - Implement generateSuggestions(resumeData, jobData, analysis)
    - Implement generateCoverLetter(resumeData, jobData)
    - _Requirements: 1.2, 1.3, 2.1, 3.1, 4.1, 8.1_

  - [ ]* 3.2 Write property test for job description parsing
    - **Property 1: Job description text length validation**
    - **Validates: Requirements 1.4**

  - [x] 3.3 Implement job description parsing with AI
    - Create prompt template for job extraction
    - Define Zod schema for structured output
    - Handle URL fetching and content extraction
    - Implement text parsing with AI
    - Add error handling for parsing failures
    - _Requirements: 1.2, 1.3, 1.5, 2.1, 2.2, 2.3, 2.4_

  - [ ]* 3.4 Write property test for job parser field extraction
    - **Property 2: Job parser field extraction completeness**
    - **Validates: Requirements 2.1, 2.2**

  - [x] 3.5 Implement resume analysis with AI
    - Create prompt template for resume analysis
    - Define Zod schema for analysis output
    - Calculate match score algorithm
    - Identify strengths and gaps
    - Extract keyword matches
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 3.6 Write property test for analysis score bounds
    - **Property 3: Resume analysis score bounds**
    - **Validates: Requirements 3.4**

  - [ ]* 3.7 Write property test for analysis output structure
    - **Property 4: Analysis output structure completeness**
    - **Validates: Requirements 3.2, 3.3, 3.5**

  - [x] 3.8 Implement suggestion generation with AI
    - Create prompt templates for each resume section
    - Define Zod schema for suggestions
    - Generate section-specific suggestions
    - Extract and validate keywords
    - Calculate impact scores
    - Sort suggestions by priority
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 3.9 Write property test for suggestion validity
    - **Property 5: Suggestion section validity**
    - **Property 6: Suggestion content completeness**
    - **Property 7: Suggestion keyword relevance**
    - **Property 8: Suggestion impact score ordering**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.5, 5.3**

  - [x] 3.10 Implement cover letter generation with AI
    - Create prompt template for cover letter
    - Define content structure requirements
    - Generate opening, body, and closing paragraphs
    - Include relevant experiences from resume
    - Add personalization based on job data
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ]* 3.11 Write property test for cover letter structure
    - **Property 13: Cover letter content structure**
    - **Property 14: Cover letter experience inclusion**
    - **Validates: Requirements 8.2, 8.3, 8.4, 8.5**

  - [x] 3.12 Implement retry logic with exponential backoff
    - Create withRetry utility function
    - Implement exponential backoff algorithm
    - Handle retryable vs non-retryable errors
    - Add timeout handling
    - _Requirements: 10.3, 10.4_

  - [ ]* 3.13 Write property test for retry behavior
    - **Property 16: AI service retry behavior**
    - **Validates: Requirements 10.3**

  - [x] 3.14 Implement AI response validation
    - Validate responses against Zod schemas
    - Handle invalid response formats
    - Add error logging for validation failures
    - _Requirements: 10.5_

  - [ ]* 3.15 Write property test for response validation
    - **Property 17: AI response schema validation**
    - **Validates: Requirements 10.5**

- [ ] 4. Backend route handlers
  - [x] 4.1 Implement parseJobDescription handler
    - Handle both URL and text input
    - Call AIService.parseJobDescription or parseJobUrl
    - Return structured ParsedJobData
    - Handle errors and return appropriate error codes
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 4.2 Implement analyzeResume handler
    - Fetch resume data from database
    - Verify user authorization
    - Call AIService.analyzeResume
    - Return ResumeAnalysis with suggestions
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 4.3 Implement createOptimizedResume handler
    - Fetch original resume data
    - Verify user authorization
    - Apply selected suggestions to resume data
    - Create new resume version with metadata
    - Link to job application
    - Return new resume ID
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ]* 4.4 Write property test for resume preservation
    - **Property 9: Original resume preservation**
    - **Property 10: Applied suggestions reflection**
    - **Property 11: Resume version job association**
    - **Property 12: Resume version metadata**
    - **Validates: Requirements 6.2, 6.3, 6.4, 7.2**

  - [x] 4.5 Implement generateCoverLetter handler
    - Fetch resume data from database
    - Verify user authorization
    - Call AIService.generateCoverLetter
    - Save cover letter to database
    - Link to job application if provided
    - Return cover letter data
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 9.3_

  - [ ]* 4.6 Write property test for cover letter association
    - **Property 15: Cover letter job association**
    - **Validates: Requirements 9.3, 15.4**

  - [x] 4.7 Implement cover letter CRUD handlers
    - GET handler to retrieve cover letter
    - PATCH handler to update cover letter content
    - DELETE handler to remove cover letter
    - Verify user authorization for all operations
    - _Requirements: 9.3, 9.4_

- [x] 5. Checkpoint - Backend functionality complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Job description input UI component
  - [x] 6.1 Create JobDescriptionInput component
    - Implement tab interface for URL vs text input
    - Add URL input field with validation
    - Add textarea for manual text entry (10,000 char limit)
    - Add character counter for text input
    - Implement parse button with loading state
    - Display parsed job data preview
    - _Requirements: 1.1, 1.4_

  - [x] 6.2 Integrate with ORPC parseJobDescription endpoint
    - Call ORPC mutation on parse button click
    - Handle loading and error states
    - Display parsed job information
    - Allow editing of parsed data
    - _Requirements: 1.2, 1.3, 1.5_

  - [x] 6.3 Add error handling and fallback UI
    - Display error messages for failed parsing
    - Provide fallback to manual text entry
    - Show retry option on failures
    - _Requirements: 2.5, 13.1_

- [ ] 7. Resume analysis UI component
  - [x] 7.1 Create ResumeAnalysisView component
    - Display match score with visual indicator (0-100)
    - Show strengths section with bullet points
    - Show gaps section with bullet points
    - Display keyword analysis (found vs missing)
    - Show section-by-section scores
    - Add overall feedback summary
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 7.2 Create SuggestionsList component
    - Group suggestions by resume section
    - Display suggestion cards in priority order
    - Show selection checkboxes for each suggestion
    - Add "Select All" / "Deselect All" functionality
    - Display count of selected suggestions
    - _Requirements: 4.1, 4.5, 5.1, 5.4_

  - [x] 7.3 Create SuggestionCard component
    - Display section and field name
    - Show before/after content with diff highlighting
    - Display reasoning explanation
    - Show impact score indicator (1-10)
    - Display keywords being added
    - Add checkbox for selection
    - _Requirements: 4.2, 4.3, 5.2, 5.3, 5.5_

  - [x] 7.4 Integrate with ORPC analyzeResume endpoint
    - Trigger analysis on user action
    - Display loading state during analysis
    - Handle analysis results
    - Show progress indicator
    - Allow cancellation of analysis
    - _Requirements: 3.1, 12.2, 12.3, 12.5_

- [ ] 8. Resume optimization workflow
  - [x] 8.1 Create ApplySuggestionsDialog component
    - Show summary of selected suggestions
    - Display new resume title input
    - Show warning about creating new version
    - Add confirm/cancel buttons
    - Display loading state during creation
    - _Requirements: 6.1, 6.2_

  - [x] 8.2 Implement suggestion application logic
    - Collect selected suggestion IDs
    - Call ORPC createOptimizedResume endpoint
    - Handle success and navigate to new resume
    - Handle errors and display messages
    - _Requirements: 6.1, 6.3, 6.4, 6.5_

  - [ ]* 8.3 Write property test for factual accuracy
    - **Property 18: Suggestion factual accuracy**
    - **Validates: Requirements 11.2**

- [ ] 9. Resume version management UI
  - [x] 9.1 Update ResumeListView component
    - Display resume version badges
    - Show source resume indicator
    - Display "Optimized for: [Job Title]" label
    - Add version comparison button
    - Show creation context in metadata
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 9.2 Add resume version deletion
    - Implement delete confirmation dialog
    - Call delete endpoint
    - Update UI after deletion
    - _Requirements: 7.5_

  - [ ]* 9.3 Write property test for cascade deletion
    - **Property 24: Cascade deletion of AI data**
    - **Validates: Requirements 14.4**

- [ ] 10. Cover letter generator UI
  - [x] 10.1 Create CoverLetterGenerator component
    - Add "Generate Cover Letter" button
    - Display loading state during generation
    - Show generated content in editable textarea
    - Add character counter
    - Implement save button
    - Add regenerate button
    - _Requirements: 8.1, 9.1, 9.2, 9.4_

  - [x] 10.2 Integrate with ORPC generateCoverLetter endpoint
    - Trigger generation on button click
    - Display loading indicator
    - Handle generated content
    - Allow editing of content
    - Save edited content to database
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 9.3_

  - [x] 10.3 Implement cover letter export
    - Add export to PDF button
    - Add export to plain text button
    - Generate downloadable files
    - Use appropriate filename
    - _Requirements: 9.5_

  - [ ]* 10.4 Write property test for cover letter export
    - **Property 15: Cover letter job association** (already covered in 4.6)
    - Verify export produces valid files

- [ ] 11. Job application integration
  - [x] 11.1 Add AI assistant to job application detail page
    - Add "Optimize Resume" button
    - Add "Generate Cover Letter" button
    - Display associated resume versions
    - Display associated cover letters
    - _Requirements: 15.1, 15.2, 15.5_

  - [x] 11.2 Implement optimize resume workflow from job application
    - Open job description (already in application)
    - Select resume to optimize
    - Trigger analysis and suggestions
    - Create optimized version linked to job
    - _Requirements: 15.1, 15.3_

  - [x] 11.3 Implement cover letter workflow from job application
    - Select resume to use
    - Generate cover letter
    - Automatically link to job application
    - Display in job application details
    - _Requirements: 15.2, 15.4, 15.5_

- [ ] 12. Performance optimization
  - [ ] 12.1 Implement caching for analysis results
    - Create cache key from resume ID and job description hash
    - Store analysis results in memory cache
    - Set TTL to 1 hour
    - Invalidate cache on resume updates
    - _Requirements: 12.1, 12.2_

  - [ ]* 12.2 Write property tests for performance
    - **Property 19: Job parsing performance**
    - **Property 20: Resume analysis performance**
    - **Property 21: Cover letter generation performance**
    - **Validates: Requirements 12.1, 12.2, 12.4**

  - [ ] 12.3 Optimize AI prompts for token efficiency
    - Reduce prompt verbosity
    - Exclude unnecessary resume fields
    - Truncate long descriptions
    - Test token usage
    - _Requirements: 12.1, 12.2, 12.4_

- [ ] 13. Error handling and resilience
  - [ ] 13.1 Implement error boundary components
    - Create ErrorBoundary for AI features
    - Display user-friendly error messages
    - Provide retry buttons
    - Log errors for monitoring
    - _Requirements: 13.1, 13.2, 13.4_

  - [ ]* 13.2 Write property test for state preservation
    - **Property 22: Network error state preservation**
    - **Validates: Requirements 13.3**

  - [ ] 13.3 Add partial result handling
    - Display partial analysis if available
    - Show warning about incomplete data
    - Allow user to proceed or retry
    - _Requirements: 13.5_

- [ ] 14. Security implementation
  - [ ]* 14.1 Write property test for HTTPS enforcement
    - **Property 23: HTTPS connection enforcement**
    - **Validates: Requirements 14.1**

  - [ ] 14.2 Implement rate limiting
    - Add rate limiting middleware
    - Configure limits per endpoint
    - Return appropriate error codes
    - Queue requests when rate limited
    - _Requirements: 10.4_

  - [ ] 14.3 Add input sanitization
    - Sanitize job description text
    - Validate URL formats
    - Strip HTML from scraped content
    - Prevent prompt injection
    - _Requirements: 1.2, 1.3, 1.4_

  - [ ] 14.4 Implement authorization checks
    - Verify user owns resume before analysis
    - Verify user owns job application before linking
    - Check permissions on all operations
    - _Requirements: 14.1, 14.2, 14.3_

- [ ] 15. Final checkpoint - All features complete
  - Ensure all tests pass, ask the user if questions arise.
  - Verify all acceptance criteria are met
  - Test end-to-end workflows
  - Check performance benchmarks
  - Review security implementation
