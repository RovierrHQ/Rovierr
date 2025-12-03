# Implementation Plan

- [x] 1. Set up database schema and migrations
  - Create database tables for connections, conversations, participants, messages, and presence
  - Add necessary indexes for performance optimization
  - Run migrations and verify schema
  - _Requirements: 2.5, 5.5, 8.5_

- [ ]* 1.1 Write property test for connection table constraints
  - **Property 5: Connection request creation**
  - **Validates: Requirements 2.1, 2.5**

- [x] 2. Create ORPC contracts and schemas
  - Generate Zod schemas from database tables using drizzle-zod
  - Create API-specific schemas in `packages/orpc-contracts/src/connection/schemas.ts`
  - Create API-specific schemas in `packages/orpc-contracts/src/chat/schemas.ts`
  - Define ORPC contracts for people, connection, chat, and presence endpoints
  - Export contracts from main index
  - _Requirements: 1.1, 2.1, 3.3, 4.2, 5.1_

- [x] 3. Implement People Service
  - Create people service in `apps/server/src/services/people/`
  - Implement user listing with pagination
  - Implement user search by name, username, university, program
  - Add connection status enrichment to user profiles
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ]* 3.1 Write property test for search filtering
  - **Property 2: Search filtering accuracy**
  - **Validates: Requirements 1.3**

- [ ]* 3.2 Write property test for pagination
  - **Property 3: Pagination threshold enforcement**
  - **Validates: Requirements 1.4**

- [ ]* 3.3 Write property test for profile completeness
  - **Property 1: User profile display completeness**
  - **Validates: Requirements 1.2**

- [x] 4. Implement Connection Service
  - Create connection service in `apps/server/src/services/connection/`
  - Implement send connection request with validation
  - Implement accept connection request with bidirectional creation
  - Implement reject connection request with cooldown
  - Implement remove connection with bidirectional deletion
  - Implement list pending requests (sent and received)
  - Implement list accepted connections
  - Add automatic expiration for 90-day old requests
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 11.1, 11.2, 11.5_

- [ ]* 4.1 Write property test for duplicate request prevention
  - **Property 7: Duplicate request prevention**
  - **Validates: Requirements 2.3**

- [ ]* 4.2 Write property test for bidirectional connection creation
  - **Property 8: Bidirectional connection creation**
  - **Validates: Requirements 3.3**

- [ ]* 4.3 Write property test for rejection cooldown
  - **Property 9: Connection rejection cooldown**
  - **Validates: Requirements 3.4**

- [ ]* 4.4 Write property test for request expiration
  - **Property 10: Connection request expiration**
  - **Validates: Requirements 3.5**

- [ ]* 4.5 Write property test for bidirectional removal
  - **Property 42: Bidirectional connection removal**
  - **Validates: Requirements 11.2**

- [x] 5. Implement Chat Service
  - Create chat service in `apps/server/src/services/chat/`
  - Implement get or create conversation for connected users
  - Implement list conversations with last message and unread count
  - Implement send message with Centrifugo publishing
  - Implement get messages with pagination
  - Implement mark as read functionality
  - Implement get unread count
  - Implement search messages across conversations
  - Add validation to prevent messaging removed connections
  - _Requirements: 4.2, 4.3, 5.1, 5.2, 5.5, 7.1, 7.3, 8.1, 8.2, 8.5, 9.1, 9.2, 9.3, 11.3, 11.4_

- [ ]* 5.1 Write property test for message delivery
  - **Property 15: Message delivery via Centrifugo**
  - **Validates: Requirements 5.1**

- [ ]* 5.2 Write property test for message persistence
  - **Property 33: Message persistence**
  - **Validates: Requirements 8.5**

- [ ]* 5.3 Write property test for automatic read marking
  - **Property 19: Automatic read marking**
  - **Validates: Requirements 5.5**

- [ ]* 5.4 Write property test for unread count increment
  - **Property 35: Unread count increment**
  - **Validates: Requirements 9.2**

- [ ]* 5.5 Write property test for unread count reset
  - **Property 36: Unread count reset**
  - **Validates: Requirements 9.3**

- [ ]* 5.6 Write property test for initial message load limit
  - **Property 29: Initial message load limit**
  - **Validates: Requirements 8.1**

- [ ]* 5.7 Write property test for chat search filtering
  - **Property 25: Chat search filtering**
  - **Validates: Requirements 7.1**

- [ ]* 5.8 Write property test for message history preservation
  - **Property 43: Message history preservation after removal**
  - **Validates: Requirements 11.3**

- [x] 6. Implement Presence Service
  - Create presence service in `apps/server/src/services/presence/`
  - Implement update user status (online/away/offline)
  - Implement get connections status
  - Add automatic status updates on WebSocket connect/disconnect
  - Implement typing indicator broadcast with timeout
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 6.1 Write property test for presence indicator display
  - **Property 20: Presence indicator display**
  - **Validates: Requirements 6.1**

- [ ]* 6.2 Write property test for typing indicator timeout
  - **Property 24: Typing indicator timeout**
  - **Validates: Requirements 6.5**

- [x] 7. Implement ORPC routers
  - Create people router in `apps/server/src/routers/people.ts`
  - Create connection router in `apps/server/src/routers/connection.ts`
  - Create chat router in `apps/server/src/routers/chat.ts`
  - Create presence router in `apps/server/src/routers/presence.ts`
  - Wire routers to main ORPC instance
  - Add authentication middleware to all routes
  - _Requirements: All_

- [x] 8. Checkpoint - Ensure all backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Create People Page UI
  - Create People Page at `apps/web/src/app/people/page.tsx`
  - Implement user grid with profile cards
  - Add search bar with real-time filtering
  - Add filter panel for university, program, etc.
  - Implement infinite scroll pagination
  - Add connection status badges to user cards
  - Add connect button with state management
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 12.3_

- [x] 10. Add People navigation item
  - Update sidebar navigation to include People item
  - Position People item above user profile section
  - Add People icon (Users icon from lucide-react)
  - Implement active state highlighting
  - Ensure space-agnostic positioning
  - _Requirements: 12.1, 12.2, 12.4, 12.5_

- [ ]* 10.1 Write property test for space-agnostic positioning
  - **Property 46: Space-agnostic navigation positioning**
  - **Validates: Requirements 12.5**

- [x] 11. Create Chat Drawer component
  - Create ChatDrawer component at `apps/web/src/components/chat/chat-drawer.tsx`
  - Implement Sheet component from shadcn/ui for drawer
  - Add chat icon button with unread badge
  - Position chat button in navigation sidebar
  - Implement drawer open/close state management
  - Add conversation list view
  - Add empty state when no connections
  - _Requirements: 4.1, 4.2, 4.4, 9.1_

- [ ]* 11.1 Write property test for drawer state preservation
  - **Property 13: Drawer state preservation**
  - **Validates: Requirements 4.4**

- [ ]* 11.2 Write property test for space-agnostic drawer
  - **Property 14: Space-agnostic drawer persistence**
  - **Validates: Requirements 4.5**

- [x] 12. Create Conversation List component
  - Create ConversationList component at `apps/web/src/components/chat/conversation-list.tsx`
  - Display all conversations with avatars
  - Show last message preview
  - Show unread count badges
  - Show online status indicators
  - Implement conversation selection
  - Add search functionality for conversations
  - Sort conversations by last message timestamp
  - _Requirements: 4.2, 7.1, 7.4, 9.2, 9.5_

- [ ]* 12.1 Write property test for conversation list completeness
  - **Property 11: Chat drawer connection list completeness**
  - **Validates: Requirements 4.2**

- [ ]* 12.2 Write property test for conversation reordering
  - **Property 38: Conversation list reordering**
  - **Validates: Requirements 9.5**

- [x] 13. Create Conversation View component
  - Create ConversationView component at `apps/web/src/components/chat/conversation-view.tsx`
  - Implement message list with infinite scroll
  - Add message input field with send button
  - Display sender name and timestamp for each message
  - Implement scroll to bottom on new message
  - Add loading states for message sending
  - Add error states with retry button
  - Implement back button to return to conversation list
  - _Requirements: 4.3, 5.2, 5.3, 5.4, 8.1, 8.2, 8.3, 8.4_

- [ ]* 13.1 Write property test for conversation loading
  - **Property 12: Conversation loading**
  - **Validates: Requirements 4.3**

- [ ]* 13.2 Write property test for message display completeness
  - **Property 16: Message display completeness**
  - **Validates: Requirements 5.2**

- [ ]* 13.3 Write property test for scroll position preservation
  - **Property 31: Scroll position preservation**
  - **Validates: Requirements 8.3**

- [x] 14. Implement Centrifugo real-time integration
  - Create Centrifugo client hook in `apps/web/src/hooks/use-centrifugo.ts`
  - Implement connection token generation endpoint
  - Subscribe to user's chat channel (`chat:{userId}`)
  - Subscribe to conversation channels (`conversation:{conversationId}`)
  - Handle new message events
  - Handle typing indicator events
  - Handle presence update events
  - Implement automatic reconnection on disconnect
  - Add connection status indicator
  - _Requirements: 5.1, 6.2, 6.3, 6.4, 10.2_

- [ ]* 14.1 Write property test for single WebSocket connection
  - **Property 39: Single WebSocket connection**
  - **Validates: Requirements 10.2**

- [x] 15. Implement real-time message updates
  - Update ConversationView to handle real-time messages
  - Add optimistic updates for sent messages
  - Update conversation list on new messages
  - Implement message delivery confirmation
  - Add retry logic for failed messages
  - Update unread counts in real-time
  - _Requirements: 5.1, 5.3, 5.4, 9.1, 9.2_

- [ ]* 15.1 Write property test for sending indicator lifecycle
  - **Property 17: Sending indicator lifecycle**
  - **Validates: Requirements 5.3**

- [ ]* 15.2 Write property test for failed message handling
  - **Property 18: Failed message error handling**
  - **Validates: Requirements 5.4**

- [x] 16. Implement presence indicators
  - Create PresenceIndicator component
  - Display online/away/offline status with colored dots
  - Show last seen timestamp for offline users
  - Update presence in real-time via Centrifugo
  - Add presence to conversation list items
  - Add presence to user profile cards
  - _Requirements: 6.1, 6.2, 6.3_

- [ ]* 16.1 Write property test for online status update
  - **Property 21: Real-time online status update**
  - **Validates: Requirements 6.2**

- [ ]* 16.2 Write property test for offline status display
  - **Property 22: Offline status with last seen**
  - **Validates: Requirements 6.3**

- [x] 17. Implement typing indicators
  - Create typing indicator component
  - Broadcast typing events on message input change
  - Implement 3-second timeout for typing indicator
  - Display typing indicator in conversation view
  - Handle multiple users typing (for future group chat)
  - _Requirements: 6.4, 6.5_

- [ ]* 17.1 Write property test for typing indicator broadcast
  - **Property 23: Typing indicator broadcast**
  - **Validates: Requirements 6.4**

- [x] 18. Implement connection request notifications
  - Create notification component for connection requests
  - Display pending requests in notifications area
  - Add accept/reject buttons to request notifications
  - Show sender profile information
  - Update UI on accept/reject
  - Integrate with existing notification system
  - _Requirements: 2.2, 3.1, 3.2_

- [ ]* 18.1 Write property test for connection notification
  - **Property 6: Connection request notification**
  - **Validates: Requirements 2.2**

- [x] 19. Implement connection management UI
  - Add connection status display to user profiles
  - Implement connect button with pending state
  - Add remove connection option to connected profiles
  - Show connection request cooldown message
  - Display connection count on profile
  - Add connections list page
  - _Requirements: 1.5, 2.1, 11.1, 11.2, 11.5_

- [ ]* 19.1 Write property test for connection status visibility
  - **Property 4: Connection status visibility**
  - **Validates: Requirements 1.5**

- [ ]* 19.2 Write property test for remove option visibility
  - **Property 41: Remove connection option visibility**
  - **Validates: Requirements 11.1**

- [x] 20. Implement chat search functionality
  - Add search input to conversation list
  - Implement search by contact name
  - Implement search by message content
  - Highlight matching text in results
  - Navigate to matching message on result click
  - Clear search and restore full list
  - Show "no results" state
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]* 20.1 Write property test for search result highlighting
  - **Property 26: Search result highlighting**
  - **Validates: Requirements 7.2**

- [ ]* 20.2 Write property test for search navigation
  - **Property 27: Search result navigation**
  - **Validates: Requirements 7.3**

- [ ]* 20.3 Write property test for search reset
  - **Property 28: Search reset behavior**
  - **Validates: Requirements 7.4**

- [x] 21. Implement notification sounds
  - Add notification sound file to public assets
  - Create sound playback utility
  - Play sound on new message (if enabled)
  - Add settings toggle for notification sounds
  - Respect browser notification permissions
  - _Requirements: 9.4_

- [ ]* 21.1 Write property test for notification sound playback
  - **Property 37: Notification sound playback**
  - **Validates: Requirements 9.4**

- [x] 22. Implement pagination for large connection lists
  - Add pagination to connection list in chat drawer
  - Implement virtual scrolling for 100+ connections
  - Add load more button or infinite scroll
  - Show connection count indicator
  - _Requirements: 10.5_

- [ ]* 22.1 Write property test for connection list pagination
  - **Property 40: Connection list pagination**
  - **Validates: Requirements 10.5**

- [x] 23. Add error handling and loading states
  - Add loading skeletons for People Page
  - Add loading states for chat drawer
  - Add error boundaries for components
  - Implement retry logic for failed requests
  - Show user-friendly error messages
  - Add offline mode indicator
  - _Requirements: All_

- [x] 24. Implement rate limiting
  - Add rate limiting middleware to connection endpoints
  - Add rate limiting to message endpoints
  - Add rate limiting to search endpoints
  - Display rate limit errors to users
  - Implement client-side request throttling
  - _Requirements: 2.1, 5.1, 7.1_

- [x] 25. Add security validations
  - Validate connection status before allowing chat
  - Prevent self-connection attempts
  - Validate user permissions for all actions
  - Sanitize message content
  - Implement CSRF protection
  - Add input validation for all forms
  - _Requirements: 2.4, 11.3, 11.4_

- [ ]* 25.1 Write property test for removed connection messaging error
  - **Property 44: Removed connection messaging error**
  - **Validates: Requirements 11.4**

- [ ]* 25.2 Write property test for re-connection ability
  - **Property 45: Re-connection ability**
  - **Validates: Requirements 11.5**

- [x] 26. Checkpoint - Ensure all frontend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 27. Add database indexes
  - Create indexes for connection lookups
  - Create indexes for message queries
  - Create indexes for conversation participant lookups
  - Create indexes for presence lookups
  - Verify query performance improvements
  - _Requirements: 10.1, 10.3_

- [x] 28. Configure Centrifugo
  - Set up Centrifugo configuration file
  - Configure channel namespaces
  - Set up presence tracking
  - Configure message history
  - Set up token authentication
  - Test WebSocket connections
  - _Requirements: 5.1, 6.1, 6.2, 6.3_

- [x] 29. Add environment variables
  - Add Centrifugo configuration to .env.example
  - Add feature flags for future enhancements
  - Add rate limit configurations
  - Document all environment variables
  - _Requirements: All_

- [x] 30. Final integration testing
  - Test complete connection flow end-to-end
  - Test complete chat flow end-to-end
  - Test real-time presence updates
  - Test search functionality
  - Test pagination and infinite scroll
  - Test error scenarios
  - Test on multiple browsers
  - Test mobile responsiveness
  - _Requirements: All_

- [x] 31. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
