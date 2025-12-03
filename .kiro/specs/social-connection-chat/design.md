# Design Document

## Overview

The Social Connection and Chat System enables students on the Rovierr platform to discover peers, establish connections, and communicate in real-time. The system consists of three primary components: a People Discovery interface, a Connection Management system, and a Real-time Chat interface powered by Centrifugo.

The design follows a space-agnostic architecture, ensuring consistent availability across all application spaces (Academic, Career, Campus Feed, etc.). The chat interface uses a drawer pattern (slide-out panel) for non-intrusive access while maintaining context within the current space.

### Key Design Principles

1. **Space-Agnostic Architecture**: Connection and chat features remain consistent regardless of the current space
2. **Real-time First**: Leverage Centrifugo for instant message delivery and presence updates
3. **Progressive Enhancement**: Core functionality works without real-time, enhanced with WebSocket when available
4. **Scalable Data Model**: Support for future features (group chat, message reactions, file sharing)
5. **Privacy-Aware**: Respect user connection status and visibility preferences

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (React)                     │
├─────────────────────────────────────────────────────────────┤
│  People Page  │  Connection UI  │  Chat Drawer  │  Presence │
└────────┬──────┴────────┬────────┴───────┬───────┴──────┬────┘
         │               │                │              │
         └───────────────┴────────────────┴──────────────┘
                              │
                    ┌─────────▼──────────┐
                    │   ORPC Contracts   │
                    └─────────┬──────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
    ┌────▼─────┐      ┌──────▼──────┐     ┌──────▼──────┐
    │ People   │      │ Connection  │     │   Chat      │
    │ Service  │      │  Service    │     │  Service    │
    └────┬─────┘      └──────┬──────┘     └──────┬──────┘
         │                   │                    │
         └───────────────────┴────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │  PostgreSQL (DB)   │
                    └────────────────────┘

                    ┌────────────────────┐
                    │   Centrifugo       │
                    │  (Real-time WS)    │
                    └────────────────────┘
```

### Component Interaction Flow

**Connection Request Flow:**
```
User A → People Page → Send Request → Connection Service → DB
                                            ↓
                                      Centrifugo Publish
                                            ↓
                                    User B's Client → Notification
```

**Message Flow:**
```
User A → Chat Drawer → Send Message → Chat Service → DB
                                            ↓
                                      Centrifugo Publish
                                            ↓
                                    User B's Chat Drawer → Display
```

## Components and Interfaces

### 1. Database Schema

#### Connection Table
```typescript
export const connection = pgTable('connection', {
  id: primaryId,

  // User relationship
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),

  connectedUserId: text('connected_user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),

  // Connection metadata
  status: text('status', {
    enum: ['pending', 'accepted', 'rejected', 'blocked']
  }).notNull().default('pending'),

  // Tracking
  requestedAt: timestamp('requested_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .defaultNow(),

  respondedAt: timestamp('responded_at', { withTimezone: true, mode: 'string' }),

  expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'string' }),

  ...timestamps
})
```

#### Conversation Table
```typescript
export const conversation = pgTable('conversation', {
  id: primaryId,

  // Conversation type
  type: text('type', {
    enum: ['direct', 'group']
  }).notNull().default('direct'),

  // Group conversation fields (nullable for direct)
  name: text('name'),
  description: text('description'),
  avatarUrl: text('avatar_url'),

  // Metadata
  lastMessageAt: timestamp('last_message_at', { withTimezone: true, mode: 'string' }),

  ...timestamps
})
```

#### Conversation Participant Table
```typescript
export const conversationParticipant = pgTable('conversation_participant', {
  id: primaryId,

  conversationId: text('conversation_id')
    .notNull()
    .references(() => conversation.id, { onDelete: 'cascade' }),

  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),

  // Participant metadata
  role: text('role', {
    enum: ['member', 'admin']
  }).notNull().default('member'),

  // Read tracking
  lastReadAt: timestamp('last_read_at', { withTimezone: true, mode: 'string' }),

  // Notification preferences
  isMuted: boolean('is_muted').default(false).notNull(),

  joinedAt: timestamp('joined_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .defaultNow(),

  leftAt: timestamp('left_at', { withTimezone: true, mode: 'string' })
})
```

#### Message Table
```typescript
export const message = pgTable('message', {
  id: primaryId,

  conversationId: text('conversation_id')
    .notNull()
    .references(() => conversation.id, { onDelete: 'cascade' }),

  senderId: text('sender_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),

  // Message content
  content: text('content').notNull(),

  // Message type for future extensibility
  type: text('type', {
    enum: ['text', 'image', 'file', 'system']
  }).notNull().default('text'),

  // Metadata for non-text messages
  metadata: text('metadata'), // JSON string for file URLs, image URLs, etc.

  // Reply tracking
  replyToMessageId: text('reply_to_message_id').references(
    (): AnyPgColumn => message.id,
    { onDelete: 'set null' }
  ),

  // Delivery tracking
  deliveredAt: timestamp('delivered_at', { withTimezone: true, mode: 'string' }),

  // Edit tracking
  editedAt: timestamp('edited_at', { withTimezone: true, mode: 'string' }),
  isEdited: boolean('is_edited').default(false).notNull(),

  // Soft delete
  deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'string' }),

  ...timestamps
})
```

#### User Presence Table
```typescript
export const userPresence = pgTable('user_presence', {
  userId: text('user_id')
    .primaryKey()
    .references(() => user.id, { onDelete: 'cascade' }),

  status: text('status', {
    enum: ['online', 'away', 'offline']
  }).notNull().default('offline'),

  lastSeenAt: timestamp('last_seen_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .defaultNow()
})
```

### 2. ORPC Contracts

#### People Contract
```typescript
export const people = {
  list: oc
    .route({
      method: 'GET',
      description: 'List all users with optional filters',
      summary: 'List Users',
      tags: ['People']
    })
    .input(listUsersSchema)
    .output(
      z.object({
        users: z.array(publicUserSchema),
        total: z.number(),
        hasMore: z.boolean()
      })
    ),

  search: oc
    .route({
      method: 'GET',
      description: 'Search users by name, username, university, or program',
      summary: 'Search Users',
      tags: ['People']
    })
    .input(searchUsersSchema)
    .output(
      z.object({
        users: z.array(publicUserSchema),
        total: z.number()
      })
    )
}
```

#### Connection Contract
```typescript
export const connection = {
  send: oc
    .route({
      method: 'POST',
      description: 'Send a connection request to another user',
      summary: 'Send Connection Request',
      tags: ['Connection']
    })
    .input(sendConnectionRequestSchema)
    .output(connectionSchema)
    .errors({
      ALREADY_CONNECTED: {
        data: z.object({
          message: z.string().default('Already connected with this user')
        })
      },
      PENDING_REQUEST: {
        data: z.object({
          message: z.string().default('Connection request already pending')
        })
      },
      SELF_CONNECTION: {
        data: z.object({
          message: z.string().default('Cannot connect with yourself')
        })
      }
    }),

  accept: oc
    .route({
      method: 'POST',
      description: 'Accept a connection request',
      summary: 'Accept Connection',
      tags: ['Connection']
    })
    .input(z.object({ connectionId: z.string() }))
    .output(connectionSchema),

  reject: oc
    .route({
      method: 'POST',
      description: 'Reject a connection request',
      summary: 'Reject Connection',
      tags: ['Connection']
    })
    .input(z.object({ connectionId: z.string() }))
    .output(z.object({ success: z.boolean() })),

  remove: oc
    .route({
      method: 'DELETE',
      description: 'Remove an existing connection',
      summary: 'Remove Connection',
      tags: ['Connection']
    })
    .input(z.object({ connectionId: z.string() }))
    .output(z.object({ success: z.boolean() })),

  listPending: oc
    .route({
      method: 'GET',
      description: 'List pending connection requests',
      summary: 'List Pending Requests',
      tags: ['Connection']
    })
    .input(z.object({
      type: z.enum(['received', 'sent']),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0)
    }))
    .output(
      z.object({
        connections: z.array(connectionWithUserSchema),
        total: z.number(),
        hasMore: z.boolean()
      })
    ),

  listConnections: oc
    .route({
      method: 'GET',
      description: 'List accepted connections',
      summary: 'List Connections',
      tags: ['Connection']
    })
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0)
    }))
    .output(
      z.object({
        connections: z.array(connectionWithUserSchema),
        total: z.number(),
        hasMore: z.boolean()
      })
    )
}
```

#### Chat Contract
```typescript
export const chat = {
  getOrCreateConversation: oc
    .route({
      method: 'POST',
      description: 'Get existing or create new conversation with a user',
      summary: 'Get/Create Conversation',
      tags: ['Chat']
    })
    .input(z.object({ userId: z.string() }))
    .output(conversationWithParticipantsSchema)
    .errors({
      NOT_CONNECTED: {
        data: z.object({
          message: z.string().default('Not connected with this user')
        })
      }
    }),

  listConversations: oc
    .route({
      method: 'GET',
      description: 'List all conversations for the current user',
      summary: 'List Conversations',
      tags: ['Chat']
    })
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0)
    }))
    .output(
      z.object({
        conversations: z.array(conversationWithLastMessageSchema),
        total: z.number(),
        hasMore: z.boolean()
      })
    ),

  sendMessage: oc
    .route({
      method: 'POST',
      description: 'Send a message in a conversation',
      summary: 'Send Message',
      tags: ['Chat']
    })
    .input(sendMessageSchema)
    .output(messageSchema)
    .errors({
      NOT_PARTICIPANT: {
        data: z.object({
          message: z.string().default('Not a participant in this conversation')
        })
      }
    }),

  getMessages: oc
    .route({
      method: 'GET',
      description: 'Get messages from a conversation',
      summary: 'Get Messages',
      tags: ['Chat']
    })
    .input(getMessagesSchema)
    .output(
      z.object({
        messages: z.array(messageWithSenderSchema),
        hasMore: z.boolean()
      })
    ),

  markAsRead: oc
    .route({
      method: 'POST',
      description: 'Mark messages as read in a conversation',
      summary: 'Mark As Read',
      tags: ['Chat']
    })
    .input(z.object({ conversationId: z.string() }))
    .output(z.object({ success: z.boolean() })),

  getUnreadCount: oc
    .route({
      method: 'GET',
      description: 'Get total unread message count',
      summary: 'Get Unread Count',
      tags: ['Chat']
    })
    .output(z.object({ count: z.number() })),

  searchMessages: oc
    .route({
      method: 'GET',
      description: 'Search messages across all conversations',
      summary: 'Search Messages',
      tags: ['Chat']
    })
    .input(searchMessagesSchema)
    .output(
      z.object({
        results: z.array(messageSearchResultSchema),
        total: z.number()
      })
    )
}
```

#### Presence Contract
```typescript
export const presence = {
  updateStatus: oc
    .route({
      method: 'POST',
      description: 'Update user online status',
      summary: 'Update Status',
      tags: ['Presence']
    })
    .input(z.object({
      status: z.enum(['online', 'away', 'offline'])
    }))
    .output(z.object({ success: z.boolean() })),

  getConnectionsStatus: oc
    .route({
      method: 'GET',
      description: 'Get online status of all connections',
      summary: 'Get Connections Status',
      tags: ['Presence']
    })
    .output(
      z.object({
        statuses: z.array(userPresenceSchema)
      })
    )
}
```

### 3. React Components

#### People Page Component
```typescript
// apps/web/src/app/people/page.tsx
'use client'

export default function PeoplePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({})

  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['people', 'list', searchQuery, filters],
    queryFn: async ({ pageParam = 0 }) => {
      return await orpc.people.list.call({
        search: searchQuery,
        ...filters,
        limit: 50,
        offset: pageParam
      })
    },
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.hasMore) {
        return pages.length * 50
      }
      return undefined
    },
    initialPageParam: 0
  })

  return (
    <div className="container mx-auto p-6">
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <FilterPanel filters={filters} onChange={setFilters} />
      <UserGrid users={data?.pages.flatMap(p => p.users) ?? []} />
      {hasNextPage && <LoadMoreButton onClick={fetchNextPage} />}
    </div>
  )
}
```

#### Chat Drawer Component
```typescript
// apps/web/src/components/chat/chat-drawer.tsx
'use client'

export function ChatDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)

  const { data: conversations } = useQuery(
    orpc.chat.listConversations.queryOptions({ limit: 50, offset: 0 })
  )

  const { data: unreadCount } = useQuery(
    orpc.chat.getUnreadCount.queryOptions()
  )

  // Subscribe to real-time updates
  useCentrifugo(
    {
      url: process.env.NEXT_PUBLIC_CENTRIFUGO_URL!,
      token: connectionToken
    },
    `chat:${userId}`,
    handleNewMessage
  )

  return (
    <>
      <ChatButton onClick={() => setIsOpen(true)} unreadCount={unreadCount?.count} />

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px]">
          {selectedConversation ? (
            <ConversationView
              conversationId={selectedConversation}
              onBack={() => setSelectedConversation(null)}
            />
          ) : (
            <ConversationList
              conversations={conversations?.conversations ?? []}
              onSelect={setSelectedConversation}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
```

#### Conversation View Component
```typescript
// apps/web/src/components/chat/conversation-view.tsx
'use client'

export function ConversationView({ conversationId, onBack }: Props) {
  const [messageInput, setMessageInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: messages, fetchNextPage } = useInfiniteQuery({
    queryKey: ['chat', 'messages', conversationId],
    queryFn: async ({ pageParam }) => {
      return await orpc.chat.getMessages.call({
        conversationId,
        limit: 50,
        before: pageParam
      })
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore && lastPage.messages.length > 0) {
        return lastPage.messages[0].id
      }
      return undefined
    },
    initialPageParam: undefined
  })

  const sendMutation = useMutation(
    orpc.chat.sendMessage.mutationOptions({
      onSuccess: () => {
        setMessageInput('')
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
    })
  )

  // Subscribe to new messages
  useCentrifugo(
    {
      url: process.env.NEXT_PUBLIC_CENTRIFUGO_URL!,
      token: connectionToken
    },
    `conversation:${conversationId}`,
    (message) => {
      queryClient.setQueryData(
        ['chat', 'messages', conversationId],
        (old: any) => {
          // Add new message to the list
          return {
            ...old,
            pages: old.pages.map((page: any, i: number) =>
              i === old.pages.length - 1
                ? { ...page, messages: [...page.messages, message] }
                : page
            )
          }
        }
      )
    }
  )

  const handleSend = () => {
    if (!messageInput.trim()) return

    sendMutation.mutate({
      conversationId,
      content: messageInput,
      type: 'text'
    })
  }

  return (
    <div className="flex flex-col h-full">
      <ConversationHeader onBack={onBack} />
      <MessageList
        messages={messages?.pages.flatMap(p => p.messages) ?? []}
        onLoadMore={fetchNextPage}
      />
      <MessageInput
        value={messageInput}
        onChange={setMessageInput}
        onSend={handleSend}
        disabled={sendMutation.isPending}
      />
      <div ref={messagesEndRef} />
    </div>
  )
}
```

## Data Models

### TypeScript Types

```typescript
// Connection Types
export interface Connection {
  id: string
  userId: string
  connectedUserId: string
  status: 'pending' | 'accepted' | 'rejected' | 'blocked'
  requestedAt: string
  respondedAt: string | null
  expiresAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ConnectionWithUser extends Connection {
  user: PublicUser
}

// Conversation Types
export interface Conversation {
  id: string
  type: 'direct' | 'group'
  name: string | null
  description: string | null
  avatarUrl: string | null
  lastMessageAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ConversationParticipant {
  id: string
  conversationId: string
  userId: string
  role: 'member' | 'admin'
  lastReadAt: string | null
  isMuted: boolean
  joinedAt: string
  leftAt: string | null
}

export interface ConversationWithParticipants extends Conversation {
  participants: Array<ConversationParticipant & { user: PublicUser }>
}

export interface ConversationWithLastMessage extends Conversation {
  lastMessage: Message | null
  unreadCount: number
  otherParticipant: PublicUser // For direct conversations
}

// Message Types
export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  type: 'text' | 'image' | 'file' | 'system'
  metadata: string | null
  replyToMessageId: string | null
  deliveredAt: string | null
  editedAt: string | null
  isEdited: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface MessageWithSender extends Message {
  sender: PublicUser
  replyToMessage: Message | null
}

// User Types
export interface PublicUser {
  id: string
  name: string
  username: string | null
  displayUsername: string | null
  image: string | null
  bio: string | null
  university: string | null
  program: string | null
  isVerified: boolean
}

// Presence Types
export interface UserPresence {
  userId: string
  status: 'online' | 'away' | 'offline'
  lastSeenAt: string
  updatedAt: string
}

// Real-time Event Types
export interface NewMessageEvent {
  type: 'new_message'
  message: MessageWithSender
  conversationId: string
}

export interface TypingEvent {
  type: 'typing'
  userId: string
  conversationId: string
  isTyping: boolean
}

export interface PresenceEvent {
  type: 'presence'
  userId: string
  status: 'online' | 'away' | 'offline'
  lastSeenAt: string
}

export interface ConnectionEvent {
  type: 'connection_request' | 'connection_accepted' | 'connection_removed'
  connection: ConnectionWithUser
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: User profile display completeness
*For any* user profile displayed in the People Page, the rendered output SHALL contain username, profile picture, university, program, and bio fields
**Validates: Requirements 1.2**

### Property 2: Search filtering accuracy
*For any* search query and user list, the filtered results SHALL only include users where the query matches at least one of: name, username, university, or program
**Validates: Requirements 1.3**

### Property 3: Pagination threshold enforcement
*For any* user list with more than 50 users, the initial load SHALL return exactly 50 users and indicate that more results are available
**Validates: Requirements 1.4**

### Property 4: Connection status visibility
*For any* two users where one views the other's profile, the system SHALL display the current connection status (not connected, pending, or connected)
**Validates: Requirements 1.5**

### Property 5: Connection request creation
*For any* two unconnected users, when one sends a connection request to the other, the system SHALL create a pending connection record with sender ID, recipient ID, and timestamp
**Validates: Requirements 2.1, 2.5**

### Property 6: Connection request notification
*For any* connection request created, the system SHALL invoke the notification function with the recipient's user ID and request details
**Validates: Requirements 2.2**

### Property 7: Duplicate request prevention
*For any* existing pending connection request between two users, attempting to create another request in the same direction SHALL be rejected
**Validates: Requirements 2.3**

### Property 8: Bidirectional connection creation
*For any* pending connection request, when accepted, the system SHALL create connection records in both directions (user A to user B and user B to user A)
**Validates: Requirements 3.3**

### Property 9: Connection rejection cooldown
*For any* rejected connection request, the system SHALL prevent the sender from sending a new request to the same user for 30 days
**Validates: Requirements 3.4**

### Property 10: Connection request expiration
*For any* connection request created more than 90 days ago with status still pending, the system SHALL mark it as expired
**Validates: Requirements 3.5**

### Property 11: Chat drawer connection list completeness
*For any* user with accepted connections, when the chat drawer opens, the system SHALL display all connections with their online status and last message preview
**Validates: Requirements 4.2**

### Property 12: Conversation loading
*For any* connection selected in the chat list, the system SHALL load the conversation history containing messages between the two users
**Validates: Requirements 4.3**

### Property 13: Drawer state preservation
*For any* open conversation in the chat drawer, closing and reopening the drawer SHALL restore the same conversation state
**Validates: Requirements 4.4**

### Property 14: Space-agnostic drawer persistence
*For any* open chat drawer, navigating between application spaces SHALL not close the drawer
**Validates: Requirements 4.5**

### Property 15: Message delivery via Centrifugo
*For any* message sent by a user, the system SHALL publish the message to the recipient's Centrifugo channel
**Validates: Requirements 5.1**

### Property 16: Message display completeness
*For any* received message displayed in a conversation, the rendered output SHALL include sender name, message content, and timestamp
**Validates: Requirements 5.2**

### Property 17: Sending indicator lifecycle
*For any* message being sent, the system SHALL display a sending indicator that remains visible until delivery confirmation is received
**Validates: Requirements 5.3**

### Property 18: Failed message error handling
*For any* message that fails to send, the system SHALL display an error indicator and provide a retry action
**Validates: Requirements 5.4**

### Property 19: Automatic read marking
*For any* message received while the user is viewing its conversation, the system SHALL mark the message as read
**Validates: Requirements 5.5**

### Property 20: Presence indicator display
*For any* user with connections, when opening the chat drawer, the system SHALL display online status indicators for all connections
**Validates: Requirements 6.1**

### Property 21: Real-time online status update
*For any* connection that comes online, the system SHALL update their status indicator to "online" in real-time via Centrifugo
**Validates: Requirements 6.2**

### Property 22: Offline status with last seen
*For any* connection that goes offline, the system SHALL update their status indicator to display the last seen timestamp
**Validates: Requirements 6.3**

### Property 23: Typing indicator broadcast
*For any* user typing a message in a conversation, the system SHALL broadcast a typing indicator to the recipient via Centrifugo
**Validates: Requirements 6.4**

### Property 24: Typing indicator timeout
*For any* user who stops typing, the system SHALL remove the typing indicator after 3 seconds of inactivity
**Validates: Requirements 6.5**

### Property 25: Chat search filtering
*For any* search query entered in the chat search field, the results SHALL only include conversations where the query matches the contact name or message content
**Validates: Requirements 7.1**

### Property 26: Search result highlighting
*For any* search result displayed, the matching text SHALL be highlighted in the conversation preview
**Validates: Requirements 7.2**

### Property 27: Search result navigation
*For any* search result clicked, the system SHALL open that conversation and scroll to the matching message
**Validates: Requirements 7.3**

### Property 28: Search reset behavior
*For any* active search, when the search field is cleared, the system SHALL restore the full conversation list
**Validates: Requirements 7.4**

### Property 29: Initial message load limit
*For any* conversation opened, the system SHALL load exactly the 50 most recent messages
**Validates: Requirements 8.1**

### Property 30: Pagination on scroll
*For any* conversation with more than 50 messages, when the user scrolls to the top, the system SHALL load the previous 50 messages
**Validates: Requirements 8.2**

### Property 31: Scroll position preservation
*For any* message pagination event, the system SHALL maintain the user's current scroll position relative to the visible messages
**Validates: Requirements 8.3**

### Property 32: Pagination boundary indicator
*For any* conversation where all messages have been loaded, the system SHALL display a "beginning of conversation" indicator
**Validates: Requirements 8.4**

### Property 33: Message persistence
*For any* message sent or received, the system SHALL persist the message to the database immediately
**Validates: Requirements 8.5**

### Property 34: Notification badge display
*For any* message received while the chat drawer is closed, the system SHALL display a notification badge on the chat icon
**Validates: Requirements 9.1**

### Property 35: Unread count increment
*For any* message received in a conversation that is not currently open, the system SHALL increment the unread count for that conversation
**Validates: Requirements 9.2**

### Property 36: Unread count reset
*For any* conversation with unread messages, when opened, the system SHALL reset the unread count to zero
**Validates: Requirements 9.3**

### Property 37: Notification sound playback
*For any* message received when notification sounds are enabled in settings, the system SHALL play a notification sound
**Validates: Requirements 9.4**

### Property 38: Conversation list reordering
*For any* new message received, the system SHALL move that conversation to the top of the conversation list
**Validates: Requirements 9.5**

### Property 39: Single WebSocket connection
*For any* user connected to chat, the system SHALL establish exactly one WebSocket connection regardless of the number of conversations
**Validates: Requirements 10.2**

### Property 40: Connection list pagination
*For any* user with more than 100 connections, the system SHALL paginate the connection list in the chat drawer
**Validates: Requirements 10.5**

### Property 41: Remove connection option visibility
*For any* connected user's profile viewed, the system SHALL display an option to remove the connection
**Validates: Requirements 11.1**

### Property 42: Bidirectional connection removal
*For any* connection removed, the system SHALL delete connection records in both directions and notify the other user
**Validates: Requirements 11.2**

### Property 43: Message history preservation after removal
*For any* connection removed, the system SHALL preserve existing message history but prevent new messages from being sent
**Validates: Requirements 11.3**

### Property 44: Removed connection messaging error
*For any* attempt to send a message to a removed connection, the system SHALL display an error message indicating the connection has been removed
**Validates: Requirements 11.4**

### Property 45: Re-connection ability
*For any* removed connection, both users SHALL be able to send new connection requests to each other
**Validates: Requirements 11.5**

### Property 46: Space-agnostic navigation positioning
*For any* navigation between application spaces, the People navigation item SHALL remain in the same position in the sidebar
**Validates: Requirements 12.5**

## Error Handling

### Connection Errors

**Duplicate Connection Request**
- Error Code: `ALREADY_CONNECTED` or `PENDING_REQUEST`
- HTTP Status: 409 Conflict
- Response: `{ message: "Connection request already exists" }`
- Client Action: Update UI to show pending state

**Self Connection Attempt**
- Error Code: `SELF_CONNECTION`
- HTTP Status: 400 Bad Request
- Response: `{ message: "Cannot connect with yourself" }`
- Client Action: Display error toast, prevent action

**Connection Not Found**
- Error Code: `NOT_FOUND`
- HTTP Status: 404 Not Found
- Response: `{ message: "Connection not found" }`
- Client Action: Refresh connection list

### Chat Errors

**Not Connected**
- Error Code: `NOT_CONNECTED`
- HTTP Status: 403 Forbidden
- Response: `{ message: "Not connected with this user" }`
- Client Action: Prompt user to send connection request

**Not Participant**
- Error Code: `NOT_PARTICIPANT`
- HTTP Status: 403 Forbidden
- Response: `{ message: "Not a participant in this conversation" }`
- Client Action: Redirect to conversation list

**Message Send Failure**
- Error Code: `SEND_FAILED`
- HTTP Status: 500 Internal Server Error
- Response: `{ message: "Failed to send message", retryable: true }`
- Client Action: Show retry button, queue message for retry

**WebSocket Connection Failure**
- Error Code: `WS_CONNECTION_FAILED`
- Client-side error
- Client Action: Attempt reconnection with exponential backoff, show offline indicator

### Real-time Errors

**Centrifugo Connection Lost**
- Client Action: Attempt reconnection every 5 seconds (max 5 attempts)
- UI Feedback: Show "Reconnecting..." indicator
- Fallback: Poll for new messages every 30 seconds

**Token Expiration**
- Client Action: Request new connection token from server
- UI Feedback: Transparent to user, no interruption

**Channel Subscription Failure**
- Client Action: Log error, retry subscription after 10 seconds
- Fallback: Use HTTP polling for updates

## Testing Strategy

### Unit Testing

**Connection Service Tests**
- Test connection request creation with valid users
- Test duplicate request prevention
- Test self-connection rejection
- Test connection acceptance flow
- Test connection rejection with cooldown
- Test connection removal and bidirectional deletion
- Test connection expiration after 90 days

**Chat Service Tests**
- Test conversation creation between connected users
- Test message sending and persistence
- Test message retrieval with pagination
- Test unread count calculation
- Test read status updates
- Test conversation list ordering by last message
- Test search functionality across conversations

**Presence Service Tests**
- Test status update (online/away/offline)
- Test last seen timestamp updates
- Test bulk status retrieval for connections
- Test typing indicator broadcast and timeout

### Property-Based Testing

The system will use **fast-check** (for TypeScript/JavaScript) as the property-based testing library. Each property-based test will run a minimum of 100 iterations to ensure comprehensive coverage across random inputs.

**Property Test Configuration**
```typescript
import fc from 'fast-check'

// Configure all property tests to run 100+ iterations
fc.assert(
  fc.property(/* generators */, /* test function */),
  { numRuns: 100 }
)
```

**Test Tagging Convention**
Each property-based test must include a comment tag referencing the design document:
```typescript
// Feature: social-connection-chat, Property 5: Connection request creation
```

**Connection Property Tests**
- Property 5: Connection request creation - Generate random user pairs, verify connection record creation
- Property 7: Duplicate request prevention - Generate existing connections, verify rejection of duplicates
- Property 8: Bidirectional connection creation - Generate pending requests, verify both directions created on accept
- Property 9: Connection rejection cooldown - Generate rejected connections, verify 30-day cooldown enforcement
- Property 10: Connection request expiration - Generate old connections, verify 90-day expiration

**Chat Property Tests**
- Property 15: Message delivery via Centrifugo - Generate random messages, verify Centrifugo publish called
- Property 19: Automatic read marking - Generate messages in active conversation, verify read status
- Property 29: Initial message load limit - Generate conversations with varying message counts, verify 50-message limit
- Property 33: Message persistence - Generate random messages, verify database storage
- Property 35: Unread count increment - Generate messages in inactive conversations, verify count increases
- Property 36: Unread count reset - Generate conversations with unread messages, verify reset on open

**Search Property Tests**
- Property 2: Search filtering accuracy - Generate random user lists and queries, verify only matching users returned
- Property 25: Chat search filtering - Generate random conversations and queries, verify only matching conversations returned

**Pagination Property Tests**
- Property 3: Pagination threshold enforcement - Generate user lists of varying sizes, verify 50-user pages
- Property 40: Connection list pagination - Generate users with varying connection counts, verify pagination at 100

**Presence Property Tests**
- Property 20: Presence indicator display - Generate users with random connection counts, verify all statuses displayed
- Property 24: Typing indicator timeout - Generate typing events, verify timeout after 3 seconds

### Integration Testing

**End-to-End Connection Flow**
1. User A sends connection request to User B
2. Verify User B receives notification
3. User B accepts request
4. Verify both users see each other as connected
5. Verify both can initiate chat

**End-to-End Chat Flow**
1. Connected users open chat drawer
2. User A sends message to User B
3. Verify message appears in User B's conversation in real-time
4. Verify unread count updates
5. User B opens conversation
6. Verify unread count resets
7. User B replies
8. Verify message appears in User A's conversation

**Real-time Presence Flow**
1. User A opens chat drawer
2. User B comes online
3. Verify User A sees User B's status update to "online"
4. User B starts typing
5. Verify User A sees typing indicator
6. User B stops typing
7. Verify typing indicator disappears after 3 seconds

### Performance Testing

**Load Testing Scenarios**
- 1000 concurrent users sending messages
- 10,000 users with active WebSocket connections
- Message delivery latency under load (target: <100ms)
- Database query performance with 1M+ messages
- Pagination performance with large conversation histories

**Scalability Metrics**
- WebSocket connections per server instance
- Messages per second throughput
- Database connection pool utilization
- Centrifugo channel subscription limits

## Security Considerations

### Authentication & Authorization

**Connection Requests**
- Users can only send requests to other registered users
- Users cannot send requests to themselves
- Connection status is verified before allowing chat

**Message Access**
- Users can only view messages in conversations they are participants of
- Removed connections cannot send new messages
- Message history is preserved but access is restricted after connection removal

**Presence Information**
- Online status is only visible to connected users
- Last seen timestamp respects user privacy settings
- Typing indicators only sent to conversation participants

### Data Privacy

**Personal Information**
- Only public profile fields are displayed in People Page
- Email and phone numbers are never exposed
- Bio and social links respect user visibility settings

**Message Content**
- Messages are stored encrypted at rest
- Message content is only accessible to conversation participants
- Deleted messages are soft-deleted and can be recovered by admins if needed

### Rate Limiting

**Connection Requests**
- Maximum 50 connection requests per user per day
- Maximum 10 requests per hour to prevent spam
- Rejected requests have 30-day cooldown

**Messages**
- Maximum 100 messages per conversation per minute
- Maximum 1000 messages per user per hour
- Rate limits reset every hour

**API Endpoints**
- People search: 60 requests per minute per user
- Connection list: 30 requests per minute per user
- Message retrieval: 120 requests per minute per user

### WebSocket Security

**Connection Token**
- JWT tokens generated with HMAC-SHA256
- Tokens expire after 1 hour
- Tokens include user ID in `sub` claim
- Tokens are validated on every WebSocket connection

**Channel Authorization**
- Users can only subscribe to their own channels (`chat:{userId}`)
- Conversation channels verified against participant list
- Presence channels restricted to connections only

## Future Enhancements

### Group Chat (Phase 2)

**Requirements**
- Create group conversations with multiple participants
- Add/remove participants from groups
- Group admin roles and permissions
- Group naming and avatar customization

**Database Changes**
- Conversation table already supports `type: 'group'`
- Add group-specific fields (name, description, avatar)
- Participant roles already supported

### Rich Media Support (Phase 3)

**Requirements**
- Image sharing in messages
- File attachments (PDF, documents)
- Voice messages
- Link previews

**Implementation**
- S3 integration for file storage
- Message metadata field for file URLs
- Client-side file upload with progress
- Thumbnail generation for images

### Message Reactions (Phase 4)

**Requirements**
- React to messages with emojis
- View who reacted to a message
- Remove reactions

**Database Changes**
- New `message_reaction` table
- Real-time reaction updates via Centrifugo

### Video/Voice Calls (Phase 5)

**Requirements**
- One-on-one video calls
- One-on-one voice calls
- Call history and duration tracking

**Implementation**
- WebRTC integration
- Signaling server for call setup
- TURN/STUN servers for NAT traversal

## Deployment Considerations

### Database Migrations

**Migration Order**
1. Create `connection` table
2. Create `conversation` table
3. Create `conversation_participant` table
4. Create `message` table
5. Create `user_presence` table
6. Add indexes for performance

**Indexes Required**
```sql
-- Connection lookups
CREATE INDEX idx_connection_user_id ON connection(user_id);
CREATE INDEX idx_connection_connected_user_id ON connection(connected_user_id);
CREATE INDEX idx_connection_status ON connection(status);

-- Message queries
CREATE INDEX idx_message_conversation_id ON message(conversation_id);
CREATE INDEX idx_message_created_at ON message(created_at DESC);
CREATE INDEX idx_message_sender_id ON message(sender_id);

-- Conversation participant lookups
CREATE INDEX idx_conversation_participant_user_id ON conversation_participant(user_id);
CREATE INDEX idx_conversation_participant_conversation_id ON conversation_participant(conversation_id);

-- Presence lookups
CREATE INDEX idx_user_presence_status ON user_presence(status);
```

### Centrifugo Configuration

**Channel Naming Convention**
- User channels: `chat:{userId}`
- Conversation channels: `conversation:{conversationId}`
- Presence channels: `presence:{userId}`

**Centrifugo Config**
```json
{
  "token_hmac_secret_key": "your-secret-key",
  "api_key": "your-api-key",
  "namespaces": [
    {
      "name": "chat",
      "presence": true,
      "join_leave": true,
      "history_size": 100,
      "history_ttl": "24h"
    },
    {
      "name": "conversation",
      "presence": true,
      "history_size": 50,
      "history_ttl": "1h"
    }
  ]
}
```

### Environment Variables

```bash
# Centrifugo
CENTRIFUGO_URL=ws://localhost:8000/connection/websocket
CENTRIFUGO_API_KEY=your-api-key
CENTRIFUGO_HMAC_SECRET_KEY=your-secret-key

# Feature Flags
ENABLE_GROUP_CHAT=false
ENABLE_MESSAGE_REACTIONS=false
ENABLE_RICH_MEDIA=false

# Rate Limits
CONNECTION_REQUEST_DAILY_LIMIT=50
CONNECTION_REQUEST_HOURLY_LIMIT=10
MESSAGE_PER_CONVERSATION_LIMIT=100
MESSAGE_PER_USER_HOURLY_LIMIT=1000
```

### Monitoring & Observability

**Metrics to Track**
- Active WebSocket connections
- Messages sent per second
- Message delivery latency (p50, p95, p99)
- Connection request acceptance rate
- Unread message count distribution
- Search query performance
- Database query latency

**Alerts**
- WebSocket connection failures > 5%
- Message delivery latency > 500ms
- Database connection pool exhaustion
- Centrifugo channel subscription failures
- Rate limit violations

### Rollout Strategy

**Phase 1: Beta Testing**
- Enable for 100 selected users
- Monitor performance and gather feedback
- Fix critical bugs

**Phase 2: Gradual Rollout**
- Enable for 10% of users
- Monitor metrics and error rates
- Increase to 25%, 50%, 75% over 2 weeks

**Phase 3: Full Release**
- Enable for all users
- Announce feature via in-app notification
- Provide user guide and documentation
