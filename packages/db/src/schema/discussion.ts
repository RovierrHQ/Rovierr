import { relations } from 'drizzle-orm'
import {
  type AnyPgColumn,
  boolean,
  integer,
  pgTable,
  text,
  timestamp
} from 'drizzle-orm/pg-core'
import { primaryId, timestamps } from '../helper'
import { user } from './auth'

/** ========================
 *  THREAD
 *  Reusable discussion thread across contexts
 *  ======================== */
export const thread = pgTable('thread', {
  id: primaryId,

  // Context fields - flexible for any entity type
  contextType: text('context_type', {
    enum: ['course', 'society', 'event', 'project']
  }).notNull(),
  contextId: text('context_id').notNull(),

  authorId: text('author_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),

  title: text('title').notNull(),
  content: text('content').notNull(),
  isAnonymous: boolean('is_anonymous').default(false).notNull(),
  isPinned: boolean('is_pinned').default(false).notNull(),
  isLocked: boolean('is_locked').default(false).notNull(),
  type: text('type', {
    enum: ['question', 'announcement', 'discussion']
  }).notNull(),
  tags: text('tags').array(),
  viewCount: integer('view_count').default(0).notNull(),

  ...timestamps
})

/** ========================
 *  THREAD REPLY
 *  Nested replies to threads
 *  ======================== */
export const threadReply = pgTable('thread_reply', {
  id: primaryId,

  threadId: text('thread_id')
    .notNull()
    .references(() => thread.id, { onDelete: 'cascade' }),

  authorId: text('author_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),

  parentReplyId: text('parent_reply_id').references(
    (): AnyPgColumn => threadReply.id,
    {
      onDelete: 'cascade'
    }
  ),

  content: text('content').notNull(),
  isAnonymous: boolean('is_anonymous').default(false).notNull(),
  isEndorsed: boolean('is_endorsed').default(false).notNull(),

  endorsedBy: text('endorsed_by').references(() => user.id, {
    onDelete: 'set null'
  }),
  endorsedAt: timestamp('endorsed_at', { withTimezone: true, mode: 'string' }),

  ...timestamps
})

/** ========================
 *  THREAD VOTE
 *  Upvotes/downvotes on threads and replies
 *  ======================== */
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

/** ========================
 *  THREAD FOLLOW
 *  User subscriptions to threads for notifications
 *  ======================== */
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

/** ========================
 *  RELATIONS
 *  ======================== */
export const threadRelations = relations(thread, ({ one, many }) => ({
  author: one(user, {
    fields: [thread.authorId],
    references: [user.id]
  }),
  replies: many(threadReply),
  votes: many(threadVote),
  follows: many(threadFollow)
}))

export const threadReplyRelations = relations(threadReply, ({ one, many }) => ({
  thread: one(thread, {
    fields: [threadReply.threadId],
    references: [thread.id]
  }),
  author: one(user, {
    fields: [threadReply.authorId],
    references: [user.id]
  }),
  parentReply: one(threadReply, {
    fields: [threadReply.parentReplyId],
    references: [threadReply.id],
    relationName: 'replyToReply'
  }),
  childReplies: many(threadReply, {
    relationName: 'replyToReply'
  }),
  endorsedByUser: one(user, {
    fields: [threadReply.endorsedBy],
    references: [user.id]
  }),
  votes: many(threadVote)
}))

export const threadVoteRelations = relations(threadVote, ({ one }) => ({
  thread: one(thread, {
    fields: [threadVote.threadId],
    references: [thread.id]
  }),
  reply: one(threadReply, {
    fields: [threadVote.replyId],
    references: [threadReply.id]
  }),
  user: one(user, {
    fields: [threadVote.userId],
    references: [user.id]
  })
}))

export const threadFollowRelations = relations(threadFollow, ({ one }) => ({
  thread: one(thread, {
    fields: [threadFollow.threadId],
    references: [thread.id]
  }),
  user: one(user, {
    fields: [threadFollow.userId],
    references: [user.id]
  })
}))
