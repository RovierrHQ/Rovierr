import { relations } from 'drizzle-orm'
import {
  type AnyPgColumn,
  boolean,
  index,
  pgTable,
  text,
  timestamp
} from 'drizzle-orm/pg-core'
import { primaryId, timestamps } from '../helper'
import { user } from './auth'

/** ========================
 *  CONNECTION
 *  User-to-user connections for networking
 *  ======================== */
export const connection = pgTable(
  'connection',
  {
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
    })
      .notNull()
      .default('pending'),

    // Tracking
    requestedAt: timestamp('requested_at', {
      withTimezone: true,
      mode: 'string'
    })
      .notNull()
      .defaultNow(),

    respondedAt: timestamp('responded_at', {
      withTimezone: true,
      mode: 'string'
    }),

    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'string' }),

    ...timestamps
  },
  (table) => ({
    userIdIdx: index('connection_user_id_idx').on(table.userId),
    connectedUserIdIdx: index('connection_connected_user_id_idx').on(
      table.connectedUserId
    ),
    statusIdx: index('connection_status_idx').on(table.status)
  })
)

/** ========================
 *  CONVERSATION
 *  Chat conversations (direct or group)
 *  ======================== */
export const conversation = pgTable('conversation', {
  id: primaryId,

  // Conversation type
  type: text('type', {
    enum: ['direct', 'group']
  })
    .notNull()
    .default('direct'),

  // Group conversation fields (nullable for direct)
  name: text('name'),
  description: text('description'),
  avatarUrl: text('avatar_url'),

  // Metadata
  lastMessageAt: timestamp('last_message_at', {
    withTimezone: true,
    mode: 'string'
  }),

  ...timestamps
})

/** ========================
 *  CONVERSATION PARTICIPANT
 *  Users participating in conversations
 *  ======================== */
export const conversationParticipant = pgTable(
  'conversation_participant',
  {
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
    })
      .notNull()
      .default('member'),

    // Read tracking
    lastReadAt: timestamp('last_read_at', {
      withTimezone: true,
      mode: 'string'
    }),

    // Notification preferences
    isMuted: boolean('is_muted').default(false).notNull(),

    joinedAt: timestamp('joined_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),

    leftAt: timestamp('left_at', { withTimezone: true, mode: 'string' })
  },
  (table) => ({
    userIdIdx: index('conversation_participant_user_id_idx').on(table.userId),
    conversationIdIdx: index('conversation_participant_conversation_id_idx').on(
      table.conversationId
    )
  })
)

/** ========================
 *  MESSAGE
 *  Chat messages within conversations
 *  ======================== */
export const message = pgTable(
  'message',
  {
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
    })
      .notNull()
      .default('text'),

    // Metadata for non-text messages
    metadata: text('metadata'), // JSON string for file URLs, image URLs, etc.

    // Reply tracking
    replyToMessageId: text('reply_to_message_id').references(
      (): AnyPgColumn => message.id,
      {
        onDelete: 'set null'
      }
    ),

    // Delivery tracking
    deliveredAt: timestamp('delivered_at', {
      withTimezone: true,
      mode: 'string'
    }),

    // Edit tracking
    editedAt: timestamp('edited_at', { withTimezone: true, mode: 'string' }),
    isEdited: boolean('is_edited').default(false).notNull(),

    // Soft delete
    deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'string' }),

    ...timestamps
  },
  (table) => ({
    conversationIdIdx: index('message_conversation_id_idx').on(
      table.conversationId
    ),
    senderIdIdx: index('message_sender_id_idx').on(table.senderId),
    createdAtIdx: index('message_created_at_idx').on(table.createdAt)
  })
)

/** ========================
 *  USER PRESENCE
 *  Online/offline status tracking
 *  ======================== */
export const userPresence = pgTable('user_presence', {
  userId: text('user_id')
    .primaryKey()
    .references(() => user.id, { onDelete: 'cascade' }),

  status: text('status', {
    enum: ['online', 'away', 'offline']
  })
    .notNull()
    .default('offline'),

  lastSeenAt: timestamp('last_seen_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .defaultNow()
})

/** ========================
 *  RELATIONS
 *  ======================== */
export const connectionRelations = relations(connection, ({ one }) => ({
  user: one(user, {
    fields: [connection.userId],
    references: [user.id],
    relationName: 'userConnections'
  }),
  connectedUser: one(user, {
    fields: [connection.connectedUserId],
    references: [user.id],
    relationName: 'connectedToUser'
  })
}))

export const conversationRelations = relations(conversation, ({ many }) => ({
  participants: many(conversationParticipant),
  messages: many(message)
}))

export const conversationParticipantRelations = relations(
  conversationParticipant,
  ({ one }) => ({
    conversation: one(conversation, {
      fields: [conversationParticipant.conversationId],
      references: [conversation.id]
    }),
    user: one(user, {
      fields: [conversationParticipant.userId],
      references: [user.id]
    })
  })
)

export const messageRelations = relations(message, ({ one }) => ({
  conversation: one(conversation, {
    fields: [message.conversationId],
    references: [conversation.id]
  }),
  sender: one(user, {
    fields: [message.senderId],
    references: [user.id]
  }),
  replyToMessage: one(message, {
    fields: [message.replyToMessageId],
    references: [message.id],
    relationName: 'messageReplies'
  })
}))

export const userPresenceRelations = relations(userPresence, ({ one }) => ({
  user: one(user, {
    fields: [userPresence.userId],
    references: [user.id]
  })
}))
