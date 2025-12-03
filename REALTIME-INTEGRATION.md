# Real-time Integration with Centrifugo

This document explains how the chat system integrates with Centrifugo for real-time updates.

## Overview

The application uses Centrifugo for WebSocket-based real-time communication. The integration provides:

1. **Real-time messaging** - Instant message delivery in conversations
2. **Presence updates** - Online/offline status of connections
3. **Typing indicators** - Show when users are typing (backend ready, frontend TBD)
4. **Unread count updates** - Live updates of unread message counts

## Architecture

### Backend (Server-side)

The backend uses `@rov/realtime` package which provides:
- `createCentrifugeServerClient()` - Server-side Centrifugo client for publishing messages

**Services that publish to Centrifugo:**

1. **ChatService** (`apps/server/src/services/chat/index.ts`)
   - Publishes to `conversation:{conversationId}` when new messages are sent
   - Publishes to `chat:{userId}` for all participants to update conversation lists

2. **PresenceService** (`apps/server/src/services/presence/index.ts`)
   - Publishes to `chat:{userId}` for all connections when presence changes
   - Broadcasts online/offline/away status updates

### Frontend (Client-side)

The frontend uses `@rov/realtime` package which provides:
- `useCentrifugo()` - React hook for subscribing to Centrifugo channels
- Automatic connection management and reconnection

**Components that subscribe to Centrifugo:**

1. **ConversationView** (`apps/web/src/components/chat/conversation-view.tsx`)
   - Subscribes to `conversation:{conversationId}`
   - Receives real-time messages for the active conversation
   - Automatically scrolls to new messages
   - Filters out own messages to avoid duplicates (optimistic updates)

2. **ChatDrawer** (`apps/web/src/components/chat/chat-drawer.tsx`)
   - Subscribes to `chat:{userId}` (user's personal channel)
   - Receives notifications about new messages in any conversation
   - Invalidates conversation list and unread count queries

3. **usePresence Hook** (`apps/web/src/hooks/use-presence.ts`)
   - Subscribes to `chat:{userId}` for presence updates
   - Updates presence cache for all connections
   - Used by ChatDrawer to keep presence status live

## Channel Structure

### Conversation Channels
- **Pattern**: `conversation:{conversationId}`
- **Purpose**: Real-time messages for a specific conversation
- **Subscribers**: Users viewing that conversation
- **Publishers**: ChatService when messages are sent

**Message Format:**
```typescript
{
  type: 'message',
  message: {
    id: string
    conversationId: string
    senderId: string
    content: string
    type: string
    createdAt: string
    sender: {
      id: string
      name: string
      username: string | null
      image: string | null
    }
  }
}
```

### User Personal Channels
- **Pattern**: `chat:{userId}`
- **Purpose**: Personal notifications and presence updates
- **Subscribers**: The user themselves
- **Publishers**: ChatService (new messages), PresenceService (presence updates)

**Message Formats:**

New message notification:
```typescript
{
  type: 'new_message' | 'message',
  conversationId: string
}
```

Presence update:
```typescript
{
  type: 'presence',
  userId: string,
  status: 'online' | 'away' | 'offline',
  lastSeenAt: string
}
```

## Authentication

The frontend obtains a Centrifugo connection token via:
```typescript
const { data: centrifugoAuth } = useQuery(
  orpc.realtime.getConnectionToken.queryOptions({
    enabled: !!session?.user?.id,
    staleTime: 55 * 60 * 1000 // 55 minutes (token expires in 1 hour)
  })
)
```

This token is then used to authenticate the WebSocket connection:
```typescript
useCentrifugo(
  {
    url: process.env.NEXT_PUBLIC_CENTRIFUGO_URL || 'ws://localhost:8000/connection/websocket',
    token: centrifugoAuth?.token
  },
  channelName,
  onMessage
)
```

## Environment Variables

### Frontend (.env.local)
```bash
NEXT_PUBLIC_CENTRIFUGO_URL=ws://localhost:8000/connection/websocket
```

### Backend (.env)
```bash
CENTRIFUGO_URL=http://localhost:8000
CENTRIFUGO_API_KEY=your-api-key-here
```

## Message Flow Example

### Sending a Message

1. User types message and clicks send
2. Frontend calls `orpc.chat.sendMessage.call()`
3. Backend ChatService:
   - Saves message to database
   - Publishes to `conversation:{conversationId}` channel
   - Publishes notification to `chat:{recipientUserId}` channel
4. Frontend receives message via WebSocket:
   - ConversationView adds message to UI (if viewing that conversation)
   - ChatDrawer invalidates queries to refresh conversation list

### Presence Update

1. User connects/disconnects or changes status
2. Backend PresenceService:
   - Updates presence in database
   - Gets all user's connections
   - Publishes to each connection's `chat:{userId}` channel
3. Frontend receives presence update:
   - usePresence hook updates presence cache
   - UI components can query presence status

## Optimistic Updates

The frontend uses optimistic updates for better UX:

1. When sending a message, it's immediately added to the UI
2. The real-time subscription filters out messages from the current user
3. This prevents duplicate messages while maintaining instant feedback

```typescript
// In sendMutation.onSuccess
queryClient.setQueryData(['chat', 'messages', conversationId], ...)

// In useCentrifugo callback
if (realtimeData.message.senderId !== session?.user?.id) {
  // Only add if not from current user
  queryClient.setQueryData(...)
}
```

## Future Enhancements

1. **Typing Indicators** - Frontend implementation needed
   - Backend already broadcasts typing events
   - Need UI component to show "User is typing..."

2. **Read Receipts** - Show when messages are read
   - Backend support needed
   - Frontend subscription to read status updates

3. **Delivery Status** - Show message delivery status
   - Sent, Delivered, Read indicators

4. **Presence in Conversation** - Show if other user is viewing conversation
   - Real-time "viewing" status

5. **Message Reactions** - Real-time emoji reactions
   - Backend and frontend support needed

## Troubleshooting

### Messages not appearing in real-time

1. Check Centrifugo is running: `docker-compose ps`
2. Check WebSocket connection in browser DevTools Network tab
3. Verify `NEXT_PUBLIC_CENTRIFUGO_URL` is set correctly
4. Check browser console for connection errors

### Presence not updating

1. Verify user is authenticated
2. Check that `usePresence()` hook is called (in ChatDrawer)
3. Verify backend is publishing presence updates
4. Check Centrifugo logs for publish errors

### Duplicate messages

1. Verify optimistic update filtering is working
2. Check that `senderId !== session?.user?.id` condition is correct
3. Ensure only one subscription per conversation

## Testing

To test real-time features:

1. Open two browser windows with different users
2. Send messages between them
3. Verify messages appear instantly in both windows
4. Check presence updates when users connect/disconnect
5. Verify unread counts update in real-time
