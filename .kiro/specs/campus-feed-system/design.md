# Campus Feed System Design Document

## Overview

The Campus Feed System is a social networking platform that enables university students, clubs, and societies to share updates, announcements, and events with their campus community. The system provides a real-time feed of posts with rich interactions including likes, comments, shares, and RSVP functionality for events.

The system is built on the Rovierr platform stack using Next.js for the frontend, Hono for the backend API, Drizzle ORM with PostgreSQL for data persistence, and Centrifugo for real-time updates. It integrates with the existing authentication system and leverages ORPC for type-safe client-server communication.

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│   Web Client    │
│   (Next.js)     │
└────────┬────────┘
         │
         │ ORPC
         ▼
┌─────────────────┐      ┌──────────────┐
│  API Server     │◄────►│ Centrifugo   │
│   (Hono)        │      │ (Real-time)  │
└────────┬────────┘      └──────────────┘
         │
         │ Drizzle ORM
         ▼
┌─────────────────┐      ┌──────────────┐
│   PostgreSQL    │      │ File Storage │
│   (Database)    │      │ (Images)     │
└─────────────────┘      └──────────────┘
```

### Component Architecture

```
Frontend Components:
├── CampusFeedPage (Page)
├── ClubPostPromptCard (Post Creation)
├── ClubPostFeed (Feed Display)
├── PostCard (Individual Post)
├── CommentSection (Comments)
└── EventCard (Event Details)

Backend Services:
├── Post Service (CRUD operations)
├── Interaction Service (Likes, Comments, Shares)
├── Event Service (Event posts & RSVP)
├── Feed Service (Feed generation & pagination)
└── Upload Service (Image handling)

Database Tables:
├── posts
├── post_likes
├── post_comments
├── post_shares
├── event_posts
└── event_rsvps
```

## Components and Interfaces

### Database Schema

#### Posts Table
```typescript
posts {
  id: string (PK)
  authorId: string (FK -> user.id or organization.id)
  authorType: 'user' | 'organization'
  content: text
  imageUrl: string | null
  type: 'post' | 'event'
  visibility: 'public' | 'campus_only' | 'private'
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### Post Likes Table
```typescript
post_likes {
  id: string (PK)
  postId: string (FK -> posts.id)
  userId: string (FK -> user.id)
  createdAt: timestamp
}
// Unique constraint on (postId, userId)
```

#### Post Comments Table
```typescript
post_comments {
  id: string (PK)
  postId: string (FK -> posts.id)
  userId: string (FK -> user.id)
  content: text
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### Post Shares Table
```typescript
post_shares {
  id: string (PK)
  postId: string (FK -> posts.id)
  userId: string (FK -> user.id)
  createdAt: timestamp
}
```

#### Event Posts Table
```typescript
event_posts {
  id: string (PK)
  postId: string (FK -> posts.id, unique)
  eventDate: date
  eventTime: time
  location: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### Event RSVPs Table
```typescript
event_rsvps {
  id: string (PK)
  eventPostId: string (FK -> event_posts.id)
  userId: string (FK -> user.id)
  status: 'going' | 'interested' | 'not_going'
  createdAt: timestamp
  updatedAt: timestamp
}
// Unique constraint on (eventPostId, userId)
```

### ORPC Contracts

#### Post Contracts
```typescript
// packages/orpc-contracts/src/campus-feed/index.ts

export const campusFeed = {
  // Create a new post
  create: oc.route({
    method: 'POST',
    summary: 'Create Post',
    tags: ['Campus Feed']
  })
  .input(createPostSchema)
  .output(postWithAuthorSchema)
  .errors({
    UNAUTHORIZED: { data: z.object({ message: z.string() }) },
    VALIDATION_ERROR: { data: z.object({ message: z.string(), errors: z.record(z.string()) }) }
  }),

  // Get feed with pagination
  list: oc.route({
    method: 'GET',
    summary: 'List Posts',
    tags: ['Campus Feed']
  })
  .input(listPostsSchema)
  .output(z.object({
    posts: z.array(postWithDetailsSchema),
    total: z.number(),
    hasMore: z.boolean()
  })),

  // Get single post
  get: oc.route({
    method: 'GET',
    summary: 'Get Post',
    tags: ['Campus Feed']
  })
  .input(z.object({ id: z.string() }))
  .output(postWithDetailsSchema)
  .errors({
    NOT_FOUND: { data: z.object({ message: z.string() }) }
  }),

  // Like a post
  like: oc.route({
    method: 'POST',
    summary: 'Like Post',
    tags: ['Campus Feed']
  })
  .input(z.object({ postId: z.string() }))
  .output(z.object({ liked: z.boolean(), likeCount: z.number() })),

  // Comment on a post
  comment: oc.route({
    method: 'POST',
    summary: 'Comment on Post',
    tags: ['Campus Feed']
  })
  .input(createCommentSchema)
  .output(commentWithAuthorSchema),

  // Get comments for a post
  getComments: oc.route({
    method: 'GET',
    summary: 'Get Comments',
    tags: ['Campus Feed']
  })
  .input(z.object({ postId: z.string(), limit: z.number().optional(), offset: z.number().optional() }))
  .output(z.object({
    comments: z.array(commentWithAuthorSchema),
    total: z.number()
  })),

  // Share a post
  share: oc.route({
    method: 'POST',
    summary: 'Share Post',
    tags: ['Campus Feed']
  })
  .input(z.object({ postId: z.string() }))
  .output(z.object({ shareUrl: z.string(), shareCount: z.number() })),

  // RSVP to an event
  rsvp: oc.route({
    method: 'POST',
    summary: 'RSVP to Event',
    tags: ['Campus Feed']
  })
  .input(rsvpSchema)
  .output(z.object({ status: z.string(), rsvpCount: z.number() }))
}
```

### Frontend Components

#### ClubPostPromptCard
- Displays user avatar and prompt text
- Opens post creation dialog on click
- Handles post submission
- Shows image upload preview
- Validates content before submission

#### ClubPostFeed
- Fetches posts using ORPC query
- Implements infinite scroll with React Query
- Displays posts in reverse chronological order
- Handles loading and error states
- Updates in real-time via Centrifugo

#### PostCard
- Displays post content, author info, and timestamp
- Shows like, comment, and share counts
- Handles interaction button clicks
- Renders event details for event posts
- Shows RSVP button for events

#### CommentSection
- Displays list of comments
- Provides comment input field
- Handles comment submission
- Shows comment author info

### Backend Services

#### Post Service
```typescript
class PostService {
  async createPost(data: CreatePostInput, userId: string): Promise<Post>
  async getPost(postId: string): Promise<PostWithDetails>
  async listPosts(filters: ListPostsInput): Promise<PaginatedPosts>
  async deletePost(postId: string, userId: string): Promise<void>
}
```

#### Interaction Service
```typescript
class InteractionService {
  async toggleLike(postId: string, userId: string): Promise<LikeResult>
  async addComment(postId: string, userId: string, content: string): Promise<Comment>
  async getComments(postId: string, pagination: Pagination): Promise<PaginatedComments>
  async sharePost(postId: string, userId: string): Promise<ShareResult>
}
```

#### Event Service
```typescript
class EventService {
  async createEventPost(postData: CreatePostInput, eventData: EventDetails, userId: string): Promise<EventPost>
  async rsvpToEvent(eventPostId: string, userId: string, status: RSVPStatus): Promise<RSVPResult>
  async getEventRSVPs(eventPostId: string): Promise<RSVP[]>
}
```

## Data Models

### Post Model
```typescript
interface Post {
  id: string
  authorId: string
  authorType: 'user' | 'organization'
  content: string
  imageUrl: string | null
  type: 'post' | 'event'
  visibility: 'public' | 'campus_only' | 'private'
  createdAt: Date
  updatedAt: Date
}

interface PostWithDetails extends Post {
  author: {
    id: string
    name: string
    avatar: string | null
    role: string // e.g., "Computer Science, Year 3" or "Official Club"
  }
  likeCount: number
  commentCount: number
  shareCount: number
  isLikedByCurrentUser: boolean
  eventDetails?: EventDetails
  rsvpCount?: number
  currentUserRSVP?: RSVPStatus
}
```

### Comment Model
```typescript
interface Comment {
  id: string
  postId: string
  userId: string
  content: string
  createdAt: Date
  updatedAt: Date
}

interface CommentWithAuthor extends Comment {
  author: {
    id: string
    name: string
    avatar: string | null
  }
}
```

### Event Details Model
```typescript
interface EventDetails {
  id: string
  postId: string
  eventDate: string // ISO date
  eventTime: string // HH:MM format
  location: string
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Post creation adds to feed
*For any* valid post content and authenticated user, creating a post should result in that post appearing in the feed with the correct author information and content.
**Validates: Requirements 1.2, 1.4, 1.5**

### Property 2: Empty content rejection
*For any* string composed entirely of whitespace characters, attempting to create a post should be rejected and no post should be created in the database.
**Validates: Requirements 1.3**

### Property 3: Feed chronological ordering
*For any* set of posts with different creation timestamps, the feed should return them in reverse chronological order (newest first).
**Validates: Requirements 2.1**

### Property 4: Post data completeness
*For any* post retrieved from the feed, it should include all required fields: author information (name, avatar, role), content, timestamp, and interaction counts (likes, comments, shares).
**Validates: Requirements 2.2, 6.1**

### Property 5: Like toggle behavior
*For any* post, liking it should increment the like count by 1 and mark it as liked; liking it again should decrement the count by 1 and remove the like (round-trip to original state).
**Validates: Requirements 3.1, 3.2**

### Property 6: Like count accuracy
*For any* post, the displayed like count should always equal the actual number of unique users who have liked the post.
**Validates: Requirements 3.4**

### Property 7: Liked state indication
*For any* post that the current user has liked, the post should include a liked indicator in the rendered output.
**Validates: Requirements 3.5**

### Property 8: Comment addition
*For any* post and valid comment content, adding a comment should increment the comment count by 1 and the comment should appear in the post's comment list.
**Validates: Requirements 4.2**

### Property 9: Comment count accuracy
*For any* post, the displayed comment count should equal the actual number of comments on that post.
**Validates: Requirements 4.3**

### Property 10: Comment data completeness
*For any* comment retrieved, it should include the commenter's name, avatar, and the comment text.
**Validates: Requirements 4.4**

### Property 11: Event post validation
*For any* event post creation attempt, if required event fields (date, time, location) are missing, the post creation should be rejected.
**Validates: Requirements 5.2**

### Property 12: Event post rendering
*For any* event post, the rendered output should include event details (date, time, location) in a highlighted format and an RSVP button.
**Validates: Requirements 5.3, 5.4**

### Property 13: RSVP recording
*For any* event post and user, RSVPing should record the user's attendance status and increment the RSVP count.
**Validates: Requirements 5.5**

### Property 14: Author type rendering
*For any* post, if the author is a student, the role should display major and year; if the author is an organization, the role should display "Official Club".
**Validates: Requirements 6.2, 6.3**

### Property 15: Timestamp formatting
*For any* post, the displayed timestamp should be in relative time format (e.g., "2 hours ago", "1 day ago").
**Validates: Requirements 6.5, 9.4**

### Property 16: Share link generation
*For any* post, sharing it should generate a valid shareable link that, when accessed, displays the correct post.
**Validates: Requirements 7.2, 7.3**

### Property 17: Share count tracking
*For any* post, sharing it should increment the share count by 1.
**Validates: Requirements 7.4**

### Property 18: Image upload round-trip
*For any* valid image file, uploading it and creating a post should result in the post having the correct image URL that can be retrieved.
**Validates: Requirements 8.3**

### Property 19: Image validation
*For any* file upload, if the file type is not an accepted image format or exceeds size limits, the upload should be rejected.
**Validates: Requirements 8.5**

### Property 20: Author attribution
*For any* post created by an authenticated user, the post's author ID should match the authenticated user's ID.
**Validates: Requirements 9.1**

### Property 21: UTC timestamp recording
*For any* post created, the creation timestamp should be recorded in UTC format.
**Validates: Requirements 9.2**

### Property 22: Author profile inclusion
*For any* post retrieved, it should include the author's current profile information (name, avatar, role).
**Validates: Requirements 9.3**

## Error Handling

### Client-Side Error Handling

1. **Network Errors**
   - Display toast notification with retry option
   - Cache failed requests for retry
   - Show cached content when offline

2. **Validation Errors**
   - Display inline error messages on form fields
   - Prevent submission until errors are resolved
   - Highlight invalid fields

3. **Authentication Errors**
   - Redirect to login page
   - Preserve intended action for post-login redirect
   - Display session expired message

4. **Upload Errors**
   - Show error message with specific reason (file too large, invalid type)
   - Allow user to select different file
   - Provide upload progress indicator

### Server-Side Error Handling

1. **Database Errors**
   - Log error details for debugging
   - Return generic error message to client
   - Implement retry logic for transient failures

2. **Authorization Errors**
   - Verify user authentication before operations
   - Check user permissions for organization posts
   - Return 401/403 with appropriate message

3. **Validation Errors**
   - Validate all inputs using Zod schemas
   - Return detailed validation errors
   - Sanitize user input to prevent XSS

4. **Rate Limiting**
   - Implement rate limits on post creation (e.g., 10 posts per hour)
   - Return 429 status with retry-after header
   - Display rate limit message to user

## Testing Strategy

### Unit Testing

Unit tests will cover specific examples and edge cases:

1. **Post Creation**
   - Test creating a post with valid content
   - Test rejection of empty/whitespace content
   - Test post creation with image
   - Test event post creation with all required fields

2. **Interactions**
   - Test liking a post
   - Test unliking a post
   - Test adding a comment
   - Test RSVP to event

3. **Feed Display**
   - Test feed with pagination threshold (21 posts)
   - Test empty feed state
   - Test feed with mixed post types

4. **Authentication**
   - Test unauthenticated user redirect
   - Test post creation with authenticated user

### Property-Based Testing

Property-based tests will verify universal properties across all inputs using **fast-check** (JavaScript/TypeScript property testing library). Each test will run a minimum of 100 iterations.

1. **Property 1: Post creation adds to feed**
   - Generate random valid post content
   - Create post
   - Verify post appears in feed with correct data
   - **Feature: campus-feed-system, Property 1: Post creation adds to feed**

2. **Property 2: Empty content rejection**
   - Generate random whitespace-only strings
   - Attempt to create post
   - Verify post creation is rejected
   - **Feature: campus-feed-system, Property 2: Empty content rejection**

3. **Property 3: Feed chronological ordering**
   - Generate random posts with different timestamps
   - Fetch feed
   - Verify posts are in reverse chronological order
   - **Feature: campus-feed-system, Property 3: Feed chronological ordering**

4. **Property 4: Post data completeness**
   - Generate random posts
   - Fetch posts from feed
   - Verify all required fields are present
   - **Feature: campus-feed-system, Property 4: Post data completeness**

5. **Property 5: Like toggle behavior**
   - Generate random posts
   - Like post, verify count increments
   - Unlike post, verify count decrements to original
   - **Feature: campus-feed-system, Property 5: Like toggle behavior**

6. **Property 6: Like count accuracy**
   - Generate random posts
   - Have random number of users like the post
   - Verify displayed count matches actual unique likes
   - **Feature: campus-feed-system, Property 6: Like count accuracy**

7. **Property 8: Comment addition**
   - Generate random posts and comments
   - Add comment
   - Verify comment count increments and comment appears
   - **Feature: campus-feed-system, Property 8: Comment addition**

8. **Property 11: Event post validation**
   - Generate event posts with missing required fields
   - Attempt to create post
   - Verify creation is rejected
   - **Feature: campus-feed-system, Property 11: Event post validation**

9. **Property 14: Author type rendering**
   - Generate posts from students and organizations
   - Verify role display matches author type
   - **Feature: campus-feed-system, Property 14: Author type rendering**

10. **Property 16: Share link generation**
    - Generate random posts
    - Share post
    - Access generated link
    - Verify correct post is displayed
    - **Feature: campus-feed-system, Property 16: Share link generation**

11. **Property 19: Image validation**
    - Generate invalid file types and oversized files
    - Attempt upload
    - Verify upload is rejected
    - **Feature: campus-feed-system, Property 19: Image validation**

12. **Property 20: Author attribution**
    - Generate random posts with different users
    - Create posts
    - Verify author ID matches authenticated user
    - **Feature: campus-feed-system, Property 20: Author attribution**

### Integration Testing

Integration tests will verify the interaction between components:

1. **End-to-End Post Flow**
   - Create post → Verify in feed → Like post → Comment on post → Share post

2. **Real-time Updates**
   - Create post in one client → Verify appears in another client's feed

3. **Event RSVP Flow**
   - Create event post → RSVP to event → Verify RSVP count updates

4. **Image Upload Flow**
   - Upload image → Create post with image → Verify image displays in feed

### Testing Library

We will use **fast-check** for property-based testing in TypeScript. Fast-check provides:
- Arbitrary generators for creating random test data
- Shrinking to find minimal failing examples
- Configurable test iterations
- Integration with Jest/Vitest

Example property test structure:
```typescript
import fc from 'fast-check'

test('Property 1: Post creation adds to feed', () => {
  fc.assert(
    fc.asyncProperty(
      fc.string({ minLength: 1, maxLength: 1000 }),
      async (content) => {
        const post = await createPost({ content })
        const feed = await getFeed()
        expect(feed.posts).toContainEqual(
          expect.objectContaining({ id: post.id, content })
        )
      }
    ),
    { numRuns: 100 }
  )
})
```

## Real-time Updates

### Centrifugo Integration

The system will use Centrifugo for real-time updates:

1. **Post Creation**
   - Publish to `campus-feed` channel when new post is created
   - All connected clients receive update and prepend post to feed

2. **Interactions**
   - Publish to `post:{postId}:interactions` channel when likes/comments change
   - Clients subscribed to specific post receive count updates

3. **Event RSVPs**
   - Publish to `event:{eventId}:rsvps` channel when RSVP status changes
   - Update RSVP count in real-time for all viewers

### Channel Structure

```
campus-feed                    # New posts
post:{postId}:interactions     # Likes, comments, shares
event:{eventId}:rsvps          # RSVP updates
```

## Performance Considerations

1. **Database Indexing**
   - Index on `posts.createdAt` for chronological sorting
   - Index on `posts.authorId` for author queries
   - Composite index on `post_likes(postId, userId)` for like checks

2. **Query Optimization**
   - Use `JOIN` to fetch author info with posts in single query
   - Aggregate interaction counts in database query
   - Implement cursor-based pagination for large feeds

3. **Caching Strategy**
   - Cache feed results for 30 seconds using React Query
   - Cache user profile data for 5 minutes
   - Invalidate cache on mutations

4. **Image Optimization**
   - Resize images on upload to max 1920px width
   - Generate thumbnails for feed display
   - Use lazy loading for images
   - Implement progressive image loading

5. **Pagination**
   - Load 20 posts per page
   - Implement infinite scroll with intersection observer
   - Prefetch next page when user is 80% through current page

## Security Considerations

1. **Authentication**
   - Verify user authentication for all write operations
   - Use session tokens from better-auth

2. **Authorization**
   - Verify user owns post before allowing edits/deletes
   - Check organization membership for organization posts

3. **Input Sanitization**
   - Sanitize all user input to prevent XSS
   - Validate image uploads for malicious content
   - Limit post content length to prevent abuse

4. **Rate Limiting**
   - Limit post creation to 10 per hour per user
   - Limit likes/comments to 100 per hour per user
   - Implement exponential backoff for repeated failures

5. **Content Moderation**
   - Flag posts with inappropriate content
   - Allow users to report posts
   - Implement admin review queue

## Future Enhancements

1. **Rich Text Editor**
   - Support for formatting (bold, italic, links)
   - Mention users with @ syntax
   - Hashtag support for topics

2. **Post Reactions**
   - Multiple reaction types beyond likes
   - Emoji reactions

3. **Post Editing**
   - Allow users to edit their posts
   - Show edit history

4. **Post Pinning**
   - Allow admins to pin important posts to top of feed

5. **Feed Filtering**
   - Filter by post type (posts, events)
   - Filter by author type (students, organizations)
   - Search posts by content

6. **Notifications**
   - Notify users when their posts are liked/commented
   - Notify users of event reminders

7. **Analytics**
   - Track post engagement metrics
   - Provide insights to organization admins
