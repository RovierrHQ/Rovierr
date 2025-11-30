# Design Document

## Overview

The Discussion Thread System is a reusable, context-agnostic discussion platform that enables threaded conversations across multiple areas of Rovierr. The system supports course discussions in Academic Space, society discussions, and can be extended to other contexts like events or projects.

The design introduces a flexible thread system with support for nested replies, voting, moderation, anonymous posting, and real-time notifications. The system follows Rovierr's architecture patterns using ORPC for type-safe API contracts, Drizzle ORM for database operations, and Centrifugo for real-time updates.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
│  (Next.js App Router + React Query + TanStack Form)         │
└──────────────────┬──────────────────────────────────────────┘
                   │ ORPC Contracts
┌──────────────────▼──────────────────────────────────────────┐
│                   API Layer (Hono)                           │
│  ┌──────────────┬──────────────┬──────────────────────┐    │
│  │ Thread       │ Reply        │ Vote & Follow        │    │
│  │ Service      │ Service      │ Service              │    │
│  └──────────────┴──────────────┴──────────────────────┘    │
│  ┌──────────────┬──────────────────────────────────────┐   │
│  │ Moderation   │ Notification                         │   │
│  │ Service      │ Service (Centrifugo)                 │   │
│  └──────────────┴──────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│              Database Layer (PostgreSQL)                     │
│  ┌──────────────┬──────────────┬──────────────────────┐    │
│  │ Thread       │ Reply        │ Vote                 │    │
│  │ Tables       │ Tables       │ Tables               │    │
│  └──────────────┴──────────────┴──────────────────────┘    │
│  ┌──────────────┬──────────────────────────────────────┐   │
│  │ Follow       │ Moderator                            │   │
│  │ Tables       │ Tables                               │   │
│  └──────────────┴──────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### System Components

1. **Thread Service**: Manages thread creation, listing, filtering, and search
2. **Reply Service**: Handles nested replies and reply management
3. **Vote Service**: Manages upvotes/downvotes on threads and replies
4. **Follow Service**: Handles thread subscriptions for notifications
5. **Moderation Service**: Provides moderator-specific functionality (endorsements, pinning, locking)
6. **Notification Service**: Handles real-time notifications using Centrifugo for thread updates
7. **Context Access Service**: Validates user access to different contexts (courses, societies)

## Components and Interfaces

### Database Schema

#### Discussion Tables

```typescript
// Thread - Reusable across contexts
export const thread = pgTable('thread', {
  id: primaryId,

  // Context fields - one of these will be set
  courseOfferingId: text('course_offering_id')
    .references(() => courseOffering.id, { onDelete: 'cascade' }),
  societyId: text('society_id')
    .references(() => organization.id, { onDelete: 'cascade' }),
  // Future: eventId, projectId, etc.

  authorId: text('author_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),

  title: text('title').notNull(),
  content: text('content').notNull(),
  isAnonymous: boolean('is_anonymous').default(false),
  isPinned: boolean('is_pinned').default(false),
  isLocked: boolean('is_locked').default(false),
  type: text('type', {
    enum: ['question', 'announcement', 'discussion']
  }).notNull(),
  tags: text('tags').array(),
  viewCount: integer('view_count').default(0),
  ...timestamps
})

// Thread Reply
export const threadReply = pgTable('thread_reply', {
  id: primaryId,
  threadId: text('thread_id')
    .notNull()
    .references(() => thread.id, { onDelete: 'cascade' }),
  authorId: text('author_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  parentReplyId: text('parent_reply_id')
    .references(() => threadReply.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  isAnonymous: boolean('is_anonymous').default(false),
  isEndorsed: boolean('is_endorsed').default(false),
  endorsedBy: text('endorsed_by').references(() => user.id),
  endorsedAt: timestamp('endorsed_at'),
  ...timestamps
})

// Thread Vote
export const threadVote = pgTable('thread_vote', {
  id: primaryId,
  threadId: text('thread_id').references(() => thread.id, {
    onDelete: 'cascade'
  }),
  replyId: text('reply_id').references(() => threadReply.id, {
    onDelete: 'cascade'
  }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  voteType: text('vote_type', { enum: ['up', 'down'] }).notNull(),
  ...timestamps
})

// Thread Follow
export const threadFollow = pgTable('thread_follow', {
  id: primaryId,
  threadId: text('thread_id')
    .notNull()
    .references(() => thread.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  ...timestamps
})

// Note: Moderator permissions are handled by Better Auth organization plugin
// No separate moderator table needed - use organization membership roles and permissions
// Permissions will be added to packages/auth/src/permissions.ts:
//   discussion: ['create', 'moderate']
```

### ORPC Contract Structure

```typescript
// packages/orpc-contracts/src/discussion/index.ts
export const discussion = {
  threads: {
    create: oc.route({ method: 'POST' })
      .input(createThreadSchema)
      .output(threadSchema),

    list: oc.route({ method: 'GET' })
      .input(listThreadsSchema)
      .output(threadsListSchema),

    get: oc.route({ method: 'GET' })
      .input(z.object({ id: z.string() }))
      .output(fullThreadSchema),

    update: oc.route({ method: 'PATCH' })
      .input(updateThreadSchema)
      .output(threadSchema),

    delete: oc.route({ method: 'DELETE' })
      .input(z.object({ id: z.string() }))
      .output(z.object({ success: z.boolean() })),

    pin: oc.route({ method: 'POST' })
      .input(z.object({ id: z.string() }))
      .output(threadSchema),

    lock: oc.route({ method: 'POST' })
      .input(z.object({ id: z.string() }))
      .output(threadSchema)
  },

  replies: {
    create: oc.route({ method: 'POST' })
      .input(createReplySchema)
      .output(replySchema),

    update: oc.route({ method: 'PATCH' })
      .input(updateReplySchema)
      .output(replySchema),

    delete: oc.route({ method: 'DELETE' })
      .input(z.object({ id: z.string() }))
      .output(z.object({ success: z.boolean() })),

    endorse: oc.route({ method: 'POST' })
      .input(endorseReplySchema)
      .output(replySchema)
  },

  votes: {
    vote: oc.route({ method: 'POST' })
      .input(voteSchema)
      .output(voteResultSchema),

    unvote: oc.route({ method: 'DELETE' })
      .input(unvoteSchema)
      .output(z.object({ success: z.boolean() }))
  },

  follows: {
    follow: oc.route({ method: 'POST' })
      .input(followThreadSchema)
      .output(z.object({ success: z.boolean() })),

    unfollow: oc.route({ method: 'DELETE' })
      .input(unfollowThreadSchema)
      .output(z.object({ success: z.boolean() })),

    list: oc.route({ method: 'GET' })
      .input(z.object({ userId: z.string() }))
      .output(z.object({ threads: z.array(threadSchema) }))
  }
}
```

### Service Layer Architecture

#### Thread Service

```typescript
class ThreadService {
  async createThread(data: CreateThreadInput): Promise<Thread>
  async listThreads(filters: ThreadFilters): Promise<PaginatedThreads>
  async getThread(threadId: string, userId: string): Promise<FullThread>
  async updateThread(threadId: string, updates: ThreadUpdates): Promise<Thread>
  async deleteThread(threadId: string, userId: string): Promise<void>
  async pinThread(threadId: string, moderatorId: string): Promise<Thread>
  async lockThread(threadId: string, moderatorId: string): Promise<Thread>
  private async incrementViewCount(threadId: string): Promise<void>
  private async checkAccess(userId: string, context: ThreadContext): Promise<boolean>
}
```

#### Reply Service

```typescript
class ReplyService {
  async createReply(data: CreateReplyInput): Promise<ThreadReply>
  async updateReply(replyId: string, content: string, userId: string): Promise<ThreadReply>
  async deleteReply(replyId: string, userId: string): Promise<void>
  async endorseReply(replyId: string, moderatorId: string): Promise<ThreadReply>
  private async checkModeratorPermission(userId: string, organizationId: string): Promise<boolean>
}
```

#### Vote Service

```typescript
class VoteService {
  async vote(data: VoteInput): Promise<VoteResult>
  async unvote(data: UnvoteInput): Promise<void>
  async getVoteCount(threadId?: string, replyId?: string): Promise<number>
  async getUserVote(userId: string, threadId?: string, replyId?: string): Promise<Vote | null>
}
```

#### Follow Service

```typescript
class FollowService {
  async followThread(threadId: string, userId: string): Promise<void>
  async unfollowThread(threadId: string, userId: string): Promise<void>
  async getFollowedThreads(userId: string): Promise<Thread[]>
  async isFollowing(threadId: string, userId: string): Promise<boolean>
  async getFollowers(threadId: string): Promise<string[]>
}
```

#### Notification Service

```typescript
class NotificationService {
  async notifyThreadReply(threadId: string, replyAuthorId: string): Promise<void>
  async notifyReplyEndorsed(replyId: string, moderatorId: string): Promise<void>
  async notifyAnnouncement(context: ThreadContext, authorId: string): Promise<void>
  private async sendNotification(userIds: string[], notification: Notification): Promise<void>
}
```

## Data Models

### Core Data Types

```typescript
// Thread Models
interface Thread {
  id: string
  courseOfferingId?: string
  societyId?: string
  authorId: string
  title: string
  content: string
  isAnonymous: boolean
  isPinned: boolean
  isLocked: boolean
  type: 'question' | 'announcement' | 'discussion'
  tags: string[]
  viewCount: number
  createdAt: Date
  updatedAt: Date
}

interface FullThread extends Thread {
  author: ThreadAuthor
  voteCount: number
  replyCount: number
  userVote?: 'up' | 'down'
  isFollowing: boolean
  replies: ThreadReply[]
}

interface ThreadAuthor {
  id: string
  name: string
  username: string
  image?: string
  isModerator: boolean
}

interface ThreadReply {
  id: string
  threadId: string
  authorId: string
  parentReplyId?: string
  content: string
  isAnonymous: boolean
  isEndorsed: boolean
  endorsedBy?: string
  endorsedAt?: Date
  author: ThreadAuthor
  voteCount: number
  userVote?: 'up' | 'down'
  replies: ThreadReply[]
  createdAt: Date
  updatedAt: Date
}

interface ThreadFilters {
  courseOfferingId?: string
  societyId?: string
  type?: 'question' | 'announcement' | 'discussion'
  unanswered?: boolean
  following?: boolean
  search?: string
  sortBy?: 'recent' | 'popular' | 'unanswered'
  limit: number
  offset: number
}

interface ThreadContext {
  courseOfferingId?: string
  societyId?: string
}

// Vote Models
interface Vote {
  id: string
  threadId?: string
  replyId?: string
  userId: string
  voteType: 'up' | 'down'
  createdAt: Date
}

interface VoteResult {
  voteCount: number
  userVote: 'up' | 'down'
}

// Input Schemas
interface CreateThreadInput {
  courseOfferingId?: string
  societyId?: string
  title: string
  content: string
  isAnonymous: boolean
  type: 'question' | 'announcement' | 'discussion'
  tags?: string[]
}

interface CreateReplyInput {
  threadId: string
  parentReplyId?: string
  content: string
  isAnonymous: boolean
}

interface VoteInput {
  threadId?: string
  replyId?: string
  voteType: 'up' | 'down'
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Thread Creation with Context
*For any* valid thread data with a context (courseOfferingId or societyId), creating a thread should associate it with exactly one context
**Validates: Requirements 1.1, 1.3**

### Property 2: Anonymous Thread Author Hiding
*For any* thread created with isAnonymous=true, the author identity should be hidden from non-moderator users
**Validates: Requirements 1.2**

### Property 3: Context Access Control
*For any* user attempting to create a thread, the system should only allow creation if the user has access to that context
**Validates: Requirements 1.4**

### Property 4: Reply Hierarchy Maintenance
*For any* reply created with a parentReplyId, the reply should be correctly linked to its parent in the thread hierarchy
**Validates: Requirements 2.2**

### Property 5: Reply Count Increment
*For any* new reply created on a thread, the thread's reply count should increase by one
**Validates: Requirements 2.4**

### Property 6: Locked Thread Reply Prevention
*For any* thread with isLocked=true, attempting to create a reply should be denied
**Validates: Requirements 2.5**

### Property 7: Vote Uniqueness
*For any* user-thread or user-reply combination, only one vote record should exist at any time
**Validates: Requirements 3.5**

### Property 8: Vote Count Update
*For any* vote change (create, update, delete), the vote count should accurately reflect the sum of upvotes minus downvotes
**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

### Property 9: Moderator Announcement Type
*For any* thread created by a moderator with type='announcement', it should be marked as announcement and displayed prominently
**Validates: Requirements 4.1**

### Property 10: Reply Endorsement Ordering
*For any* thread with endorsed replies, endorsed replies should appear before non-endorsed replies in the response
**Validates: Requirements 4.2**

### Property 11: Moderator Author Visibility
*For any* anonymous thread or reply, moderators should see the actual author information
**Validates: Requirements 4.4**

### Property 12: Thread Follower Notification
*For any* new reply on a followed thread, all users following that thread should receive a notification
**Validates: Requirements 5.1**

### Property 13: Announcement Broadcast
*For any* announcement posted in a context, all members of that context should receive a notification
**Validates: Requirements 5.2**

### Property 14: Thread Author Reply Notification
*For any* reply created on a thread, the thread author should receive a notification
**Validates: Requirements 5.3**

### Property 15: Endorsement Notification
*For any* reply that gets endorsed, the reply author should receive a notification
**Validates: Requirements 5.4**

### Property 16: Auto-follow on Creation
*For any* user creating a thread, the system should automatically create a follow record for that user and thread
**Validates: Requirements 6.3**

### Property 17: Auto-follow on Reply
*For any* user replying to a thread, the system should automatically create a follow record for that user and thread if it doesn't exist
**Validates: Requirements 6.4**

### Property 18: Search Result Matching
*For any* search query, all returned threads should contain the search term in either title or content
**Validates: Requirements 7.1**

### Property 19: Unanswered Filter Accuracy
*For any* unanswered filter applied, all returned threads should have replyCount equal to zero
**Validates: Requirements 7.3**

### Property 20: View Count Increment
*For any* thread viewed by a user, the viewCount should increase by one
**Validates: Requirements 8.1**

### Property 21: Endorsed Reply Sorting
*For any* thread with multiple replies, endorsed replies should appear before non-endorsed replies in the response
**Validates: Requirements 8.3**

### Property 22: User Vote Status Accuracy
*For any* thread or reply viewed by a user, the userVote field should accurately reflect their current vote if one exists
**Validates: Requirements 8.4**

### Property 23: Follow Status Accuracy
*For any* thread viewed by a user, the isFollowing field should accurately reflect whether the user is following that thread
**Validates: Requirements 8.5**

## Error Handling

### Error Types

```typescript
enum DiscussionErrorCode {
  THREAD_NOT_FOUND = 'THREAD_NOT_FOUND',
  REPLY_NOT_FOUND = 'REPLY_NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  THREAD_LOCKED = 'THREAD_LOCKED',
  INVALID_CONTEXT = 'INVALID_CONTEXT',
  DUPLICATE_VOTE = 'DUPLICATE_VOTE',
  NOT_MODERATOR = 'NOT_MODERATOR'
}
```

### Error Handling Strategy

1. **Access Control Errors**: Return 403 Forbidden with specific error code
2. **Not Found Errors**: Return 404 Not Found with entity type
3. **Validation Errors**: Return 400 Bad Request with field-specific errors
4. **Locked Thread Errors**: Return 423 Locked with message
5. **Database Errors**: Log error, return 500 Internal Server Error with generic message

## Testing Strategy

### Unit Testing

Unit tests will cover:
- Thread creation with different contexts
- Reply hierarchy building
- Vote count calculations
- Access control checks
- Moderator permission validation
- Anonymous author hiding logic

### Property-Based Testing

Property-based tests will use **fast-check** (TypeScript/JavaScript PBT library) to verify:
- Vote count consistency across operations
- Reply hierarchy integrity
- Search result accuracy
- Filter correctness
- Notification delivery to all followers

Each property-based test will run a minimum of 100 iterations with randomly generated data.

### Integration Testing

Integration tests will verify:
- End-to-end thread creation and reply flow
- Real-time notification delivery via Centrifugo
- Cross-context thread access control
- Moderator actions across different contexts

### Test Data Generators

```typescript
// Generator for random threads
function generateThread(): Thread {
  return {
    id: fc.uuid(),
    courseOfferingId: fc.option(fc.uuid()),
    societyId: fc.option(fc.uuid()),
    authorId: fc.uuid(),
    title: fc.string({ minLength: 1, maxLength: 200 }),
    content: fc.string({ minLength: 1, maxLength: 5000 }),
    isAnonymous: fc.boolean(),
    isPinned: fc.boolean(),
    isLocked: fc.boolean(),
    type: fc.constantFrom('question', 'announcement', 'discussion'),
    tags: fc.array(fc.string(), { maxLength: 5 }),
    viewCount: fc.nat(),
    createdAt: fc.date(),
    updatedAt: fc.date()
  }
}

// Generator for random replies
function generateReply(threadId: string): ThreadReply {
  return {
    id: fc.uuid(),
    threadId,
    authorId: fc.uuid(),
    parentReplyId: fc.option(fc.uuid()),
    content: fc.string({ minLength: 1, maxLength: 5000 }),
    isAnonymous: fc.boolean(),
    isEndorsed: fc.boolean(),
    createdAt: fc.date(),
    updatedAt: fc.date()
  }
}
```

## Performance Considerations

### Database Indexing

```sql
-- Thread indexes
CREATE INDEX idx_thread_course_offering ON thread(course_offering_id);
CREATE INDEX idx_thread_society ON thread(society_id);
CREATE INDEX idx_thread_author ON thread(author_id);
CREATE INDEX idx_thread_created_at ON thread(created_at DESC);
CREATE INDEX idx_thread_type ON thread(type);

-- Reply indexes
CREATE INDEX idx_reply_thread ON thread_reply(thread_id);
CREATE INDEX idx_reply_parent ON thread_reply(parent_reply_id);
CREATE INDEX idx_reply_author ON thread_reply(author_id);

-- Vote indexes
CREATE UNIQUE INDEX idx_vote_user_thread ON thread_vote(user_id, thread_id) WHERE thread_id IS NOT NULL;
CREATE UNIQUE INDEX idx_vote_user_reply ON thread_vote(user_id, reply_id) WHERE reply_id IS NOT NULL;

-- Follow indexes
CREATE UNIQUE INDEX idx_follow_user_thread ON thread_follow(user_id, thread_id);
CREATE INDEX idx_follow_thread ON thread_follow(thread_id);

-- Note: Moderator permissions use Better Auth organization membership
-- No additional indexes needed for moderators
```

### Caching Strategy

1. **Thread List Cache**: Cache thread lists per context for 5 minutes
2. **Vote Count Cache**: Cache aggregated vote counts for 1 minute
3. **Moderator Status Cache**: Cache moderator permissions for 10 minutes
4. **Follow Status Cache**: Cache user follow status for 5 minutes

### Query Optimization

1. Use `WITH` clauses for complex queries involving vote counts and reply counts
2. Implement cursor-based pagination for large thread lists
3. Lazy load nested replies beyond depth 2
4. Use database views for frequently accessed aggregations

## Real-time Updates

### Centrifugo Channels

```typescript
// Channel naming convention
const threadChannel = `thread:${threadId}`
const contextChannel = `context:${contextType}:${contextId}`

// Events published
interface ThreadEvent {
  type: 'reply_created' | 'reply_endorsed' | 'thread_pinned' | 'thread_locked'
  threadId: string
  data: any
}
```

### Subscription Strategy

1. Users subscribe to threads they're viewing
2. Users subscribe to context channels for their enrolled courses/societies
3. Moderators subscribe to all threads in their contexts
4. Notifications trigger real-time UI updates

## Access Control & Permissions

### Better Auth Integration

The discussion system leverages Better Auth's organization plugin for access control:

1. **Society Discussions**: Use organization membership and roles
   - Members with `discussion:create` permission can create threads/replies
   - Members with `discussion:moderate` permission can endorse, pin, lock threads

2. **Course Discussions**: Use course enrollment
   - Students enrolled in a course can create threads/replies
   - Course instructors/TAs automatically get `discussion:moderate` permission

### Permission Definitions

Add to `packages/auth/src/permissions.ts`:

```typescript
export const statement = {
  organization: ['update', 'delete'],
  member: ['create', 'update', 'delete'],
  invitation: ['create', 'cancel'],
  team: ['create', 'update', 'delete'],
  ac: ['create', 'read', 'update', 'delete'],
  discussion: ['create', 'moderate'] // New permissions
} as const
```

### Permission Checks

```typescript
// Check if user can create discussions
async function canCreateDiscussion(userId: string, context: ThreadContext): Promise<boolean> {
  if (context.societyId) {
    // Check organization membership and permission
    return await checkOrganizationPermission(userId, context.societyId, 'discussion:create')
  }
  if (context.courseOfferingId) {
    // Check course enrollment
    return await checkCourseEnrollment(userId, context.courseOfferingId)
  }
  return false
}

// Check if user can moderate discussions
async function canModerateDiscussion(userId: string, context: ThreadContext): Promise<boolean> {
  if (context.societyId) {
    // Check organization membership and permission
    return await checkOrganizationPermission(userId, context.societyId, 'discussion:moderate')
  }
  if (context.courseOfferingId) {
    // Check if user is course instructor/TA
    return await checkCourseInstructor(userId, context.courseOfferingId)
  }
  return false
}
```

## Security Considerations

1. **Anonymous Post Protection**: Store author ID but hide in API responses for non-moderators
2. **Context Access Validation**: Always verify user has access to context before allowing operations
3. **Moderator Verification**: Use Better Auth permissions to check moderator status before allowing privileged operations
4. **Rate Limiting**: Implement rate limits on thread/reply creation (e.g., 10 threads per hour)
5. **Content Sanitization**: Sanitize HTML/markdown content to prevent XSS attacks
6. **SQL Injection Prevention**: Use parameterized queries via Drizzle ORM

## Migration Strategy

### Phase 1: Database Schema
1. Create new tables: `thread`, `thread_reply`, `thread_vote`, `thread_follow`, `context_moderator`
2. Add indexes for performance
3. Set up foreign key constraints

### Phase 2: ORPC Contracts
1. Define schemas in `packages/orpc-contracts/src/discussion`
2. Generate TypeScript types
3. Export contracts for client and server use

### Phase 3: Service Implementation
1. Implement Thread Service
2. Implement Reply Service
3. Implement Vote Service
4. Implement Follow Service
5. Implement Notification Service

### Phase 4: API Routes
1. Create Hono routes in `apps/server/src/routes/discussion`
2. Wire up services to routes
3. Add authentication middleware
4. Add access control middleware

### Phase 5: Client Implementation
1. Create React components for thread list
2. Create thread detail view with replies
3. Implement voting UI
4. Implement follow/unfollow functionality
5. Add real-time updates via Centrifugo

### Phase 6: Integration
1. Integrate with Academic Space (course discussions)
2. Integrate with Society pages (society discussions)
3. Add navigation between contexts
4. Test end-to-end flows

## Future Enhancements

1. **Rich Text Editor**: Support for markdown, code blocks, images
2. **Mentions**: @mention users in replies
3. **Reactions**: Quick emoji reactions to threads/replies
4. **Thread Templates**: Pre-defined templates for common question types
5. **AI Moderation**: Automatic flagging of inappropriate content
6. **Thread Analytics**: View counts, engagement metrics for moderators
7. **Thread Archiving**: Archive old threads to improve performance
8. **Thread Merging**: Merge duplicate threads
9. **Best Answer Selection**: Allow thread authors to mark best answer
10. **Thread Bookmarking**: Save threads for later reading
