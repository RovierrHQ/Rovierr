# Implementation Plan

- [x] 1. Set up database schema and migrations
  - Create database tables for posts, likes, comments, shares, events, and RSVPs
  - Add indexes for performance optimization
  - Run migrations to apply schema changes
  - _Requirements: 1.5, 2.2, 3.1, 4.2, 5.5, 9.1, 9.2_

- [ ] 2. Create ORPC contract schemas
- [x] 2.1 Generate base schemas from database
  - Use drizzle-zod to generate schemas from database tables
  - Create generated-schemas.ts file with insert, select, and update schemas
  - _Requirements: 1.5, 2.2_

- [x] 2.2 Create API-specific schemas
  - Define createPostSchema with validation rules
  - Define listPostsSchema with pagination parameters
  - Define postWithDetailsSchema including author and interaction counts
  - Define commentSchema and eventSchema
  - Extract enum schemas from generated schemas
  - _Requirements: 1.1, 1.3, 2.1, 5.2_

- [x] 2.3 Define ORPC contract endpoints
  - Define post creation endpoint with input/output schemas
  - Define feed listing endpoint with pagination
  - Define like, comment, share, and RSVP endpoints
  - Add error schemas for each endpoint
  - _Requirements: 1.2, 2.1, 3.1, 4.2, 5.5, 7.2_

- [ ] 3. Implement backend post service
- [x] 3.1 Create post service with CRUD operations
  - Implement createPost function with author attribution
  - Implement getPost function with author and interaction data
  - Implement listPosts function with pagination
  - Implement deletePost function with authorization check
  - _Requirements: 1.2, 1.5, 2.1, 2.2, 9.1, 9.2_

- [ ]* 3.2 Write property test for post creation
  - **Property 1: Post creation adds to feed**
  - **Validates: Requirements 1.2, 1.4, 1.5**

- [ ]* 3.3 Write property test for empty content rejection
  - **Property 2: Empty content rejection**
  - **Validates: Requirements 1.3**

- [ ]* 3.4 Write property test for feed ordering
  - **Property 3: Feed chronological ordering**
  - **Validates: Requirements 2.1**

- [ ]* 3.5 Write property test for post data completeness
  - **Property 4: Post data completeness**
  - **Validates: Requirements 2.2, 6.1**

- [ ] 4. Implement interaction service
- [x] 4.1 Create like functionality
  - Implement toggleLike function with toggle logic
  - Query like count and user's like status
  - Handle concurrent like operations
  - _Requirements: 3.1, 3.2, 3.4_

- [ ]* 4.2 Write property test for like toggle behavior
  - **Property 5: Like toggle behavior**
  - **Validates: Requirements 3.1, 3.2**

- [ ]* 4.3 Write property test for like count accuracy
  - **Property 6: Like count accuracy**
  - **Validates: Requirements 3.4**

- [x] 4.4 Create comment functionality
  - Implement addComment function
  - Implement getComments function with pagination
  - Include author information in comment queries
  - _Requirements: 4.2, 4.3, 4.4_

- [ ]* 4.5 Write property test for comment addition
  - **Property 8: Comment addition**
  - **Validates: Requirements 4.2**

- [ ]* 4.6 Write property test for comment count accuracy
  - **Property 9: Comment count accuracy**
  - **Validates: Requirements 4.3**

- [x] 4.7 Create share functionality
  - Implement sharePost function
  - Generate shareable link with post ID
  - Track share count in database
  - _Requirements: 7.2, 7.3, 7.4_

- [ ]* 4.8 Write property test for share link generation
  - **Property 16: Share link generation**
  - **Validates: Requirements 7.2, 7.3**

- [ ] 5. Implement event service
- [x] 5.1 Create event post functionality
  - Implement createEventPost function with event details validation
  - Store event details in event_posts table
  - Link event to post record
  - _Requirements: 5.1, 5.2, 5.3_

- [ ]* 5.2 Write property test for event validation
  - **Property 11: Event post validation**
  - **Validates: Requirements 5.2**

- [x] 5.3 Create RSVP functionality
  - Implement rsvpToEvent function
  - Track RSVP status per user
  - Query RSVP count for events
  - _Requirements: 5.5_

- [ ]* 5.4 Write property test for RSVP recording
  - **Property 13: RSVP recording**
  - **Validates: Requirements 5.5**

- [ ] 6. Implement image upload service
- [x] 6.1 Create image upload functionality
  - Set up file storage configuration
  - Implement image upload endpoint
  - Validate file type and size
  - Resize and optimize images
  - Generate unique filenames
  - Return image URL
  - _Requirements: 8.1, 8.2, 8.3, 8.5_

- [ ]* 6.2 Write property test for image validation
  - **Property 19: Image validation**
  - **Validates: Requirements 8.5**

- [ ] 7. Implement ORPC route handlers
- [x] 7.1 Create post route handlers
  - Implement create post handler with authentication check
  - Implement list posts handler with pagination
  - Implement get post handler
  - Add error handling for all routes
  - _Requirements: 1.2, 2.1, 2.2, 9.5_

- [ ]* 7.2 Write property test for author attribution
  - **Property 20: Author attribution**
  - **Validates: Requirements 9.1**

- [x] 7.3 Create interaction route handlers
  - Implement like handler
  - Implement comment handler
  - Implement share handler
  - _Requirements: 3.1, 4.2, 7.2_

- [x] 7.4 Create event route handlers
  - Implement event post creation handler
  - Implement RSVP handler
  - _Requirements: 5.1, 5.5_

- [ ] 8. Set up Centrifugo real-time channels
- [ ] 8.1 Configure Centrifugo channels
  - Set up campus-feed channel for new posts
  - Set up post-specific channels for interactions
  - Set up event-specific channels for RSVPs
  - _Requirements: 3.3, 4.5_

- [ ] 8.2 Implement real-time publish logic
  - Publish to campus-feed on post creation
  - Publish to post channels on like/comment
  - Publish to event channels on RSVP
  - _Requirements: 3.3, 4.5_

- [ ] 9. Create frontend post creation component
- [x] 9.1 Update ClubPostPromptCard component
  - Connect to ORPC create post mutation
  - Add form validation for empty content
  - Implement image upload with preview
  - Show loading state during submission
  - Display success/error messages
  - Clear form after successful submission
  - _Requirements: 1.1, 1.2, 1.3, 8.1, 8.2_

- [ ] 9.2 Add event post creation option
  - Add toggle for event post type
  - Show event detail fields when toggled
  - Validate event fields before submission
  - _Requirements: 5.1, 5.2_

- [ ] 10. Create frontend feed display component
- [x] 10.1 Update ClubPostFeed component
  - Connect to ORPC list posts query
  - Implement infinite scroll with React Query
  - Display loading states
  - Handle empty feed state
  - Show error messages
  - _Requirements: 2.1, 2.2, 2.4, 2.5, 10.2_

- [ ]* 10.2 Subscribe to real-time updates
  - Connect to Centrifugo campus-feed channel
  - Prepend new posts to feed in real-time
  - Update interaction counts in real-time
  - _Requirements: 3.3, 4.5_

- [ ] 11. Create frontend post card component
- [ ] 11.1 Create PostCard component
  - Display post content and author info
  - Show relative timestamp
  - Display interaction counts
  - Render images if present
  - Show event details for event posts
  - _Requirements: 1.4, 2.3, 5.3, 6.1, 6.5_

- [ ]* 11.2 Write property test for author type rendering
  - **Property 14: Author type rendering**
  - **Validates: Requirements 6.2, 6.3**

- [ ]* 11.3 Write property test for timestamp formatting
  - **Property 15: Timestamp formatting**
  - **Validates: Requirements 6.5, 9.4**

- [ ] 11.4 Add interaction buttons
  - Implement like button with toggle logic
  - Implement comment button to open comment section
  - Implement share button with share dialog
  - Show RSVP button for event posts
  - Update counts in real-time
  - _Requirements: 3.1, 3.5, 4.1, 5.4, 7.1_

- [ ] 11.5 Connect to ORPC mutations
  - Connect like button to like mutation
  - Connect comment button to comment mutation
  - Connect share button to share mutation
  - Connect RSVP button to RSVP mutation
  - Handle loading and error states
  - _Requirements: 3.1, 4.2, 5.5, 7.2_

- [ ] 12. Create comment section component
- [x] 12.1 Create CommentSection component
  - Display list of comments with author info
  - Implement comment input field
  - Connect to ORPC comment mutation
  - Show loading state during submission
  - Update comment list after submission
  - _Requirements: 4.1, 4.2, 4.4_

- [ ] 12.2 Implement comment pagination
  - Load initial comments
  - Add "Load more" button for additional comments
  - _Requirements: 4.1_

- [ ] 13. Create share dialog component
- [ ] 13.1 Create ShareDialog component
  - Display shareable link
  - Implement copy to clipboard functionality
  - Show social media share options
  - Track share when link is copied
  - _Requirements: 7.1, 7.2, 7.5_

- [ ] 14. Implement authentication checks
- [ ] 14.1 Add authentication guards
  - Redirect unauthenticated users to login
  - Preserve intended action for post-login redirect
  - Show authentication required message
  - _Requirements: 9.5_

- [ ] 14.2 Add authorization checks
  - Verify user owns post before allowing delete
  - Check organization membership for org posts
  - _Requirements: 9.1_

- [ ] 15. Add error handling and validation
- [ ] 15.1 Implement client-side error handling
  - Display toast notifications for errors
  - Show inline validation errors on forms
  - Implement retry logic for failed requests
  - Cache failed requests for offline support
  - _Requirements: 8.4_

- [ ] 15.2 Implement server-side error handling
  - Validate all inputs with Zod schemas
  - Return detailed error messages
  - Log errors for debugging
  - Implement rate limiting
  - _Requirements: 1.3, 5.2, 8.5_

- [ ] 16. Optimize performance
- [ ] 16.1 Add database indexes
  - Create index on posts.createdAt
  - Create index on posts.authorId
  - Create composite index on post_likes(postId, userId)
  - _Requirements: 2.1, 10.1_

- [ ] 16.2 Implement caching strategy
  - Configure React Query cache times
  - Cache feed results for 30 seconds
  - Cache user profiles for 5 minutes
  - Invalidate cache on mutations
  - _Requirements: 10.3, 10.5_

- [ ] 16.3 Optimize images
  - Resize images on upload
  - Generate thumbnails for feed
  - Implement lazy loading
  - Add placeholder images
  - _Requirements: 10.4_

- [ ] 17. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 18. Update navigation and routing
- [ ] 18.1 Add post detail route
  - Create route for individual post view
  - Support shareable links
  - _Requirements: 7.3_

- [ ] 18.2 Add profile navigation
  - Make author names/avatars clickable
  - Navigate to user/organization profile
  - _Requirements: 6.4_

- [ ] 19. Final integration and testing
- [ ] 19.1 Test end-to-end post flow
  - Create post → View in feed → Like → Comment → Share
  - Verify all interactions work correctly
  - Test with different user accounts
  - _Requirements: All_

- [ ] 19.2 Test real-time updates
  - Create post in one client
  - Verify appears in another client's feed
  - Test interaction updates across clients
  - _Requirements: 3.3, 4.5_

- [ ] 19.3 Test event flow
  - Create event post
  - RSVP to event
  - Verify RSVP count updates
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 20. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
