import { relations } from 'drizzle-orm'
import { date, pgTable, text, time, uniqueIndex } from 'drizzle-orm/pg-core'
import { primaryId, timestamps } from '../helper'
import { user } from './auth'

export const posts = pgTable('posts', {
  id: primaryId,
  authorId: text('author_id').notNull(),
  authorType: text('author_type', { enum: ['user', 'organization'] })
    .notNull()
    .default('user'),
  content: text('content').notNull(),
  imageUrl: text('image_url'),
  type: text('type', { enum: ['post', 'event'] })
    .notNull()
    .default('post'),
  visibility: text('visibility', { enum: ['public', 'campus_only', 'private'] })
    .notNull()
    .default('public'),
  ...timestamps
})

export const postsRelations = relations(posts, ({ many, one }) => ({
  likes: many(postLikes),
  comments: many(postComments),
  shares: many(postShares),
  eventPost: one(eventPosts, {
    fields: [posts.id],
    references: [eventPosts.postId]
  })
}))

export const postLikes = pgTable(
  'post_likes',
  {
    id: primaryId,
    postId: text('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: timestamps.createdAt
  },
  (table) => ({
    uniquePostUser: uniqueIndex('post_likes_post_id_user_id_unique').on(
      table.postId,
      table.userId
    )
  })
)

export const postLikesRelations = relations(postLikes, ({ one }) => ({
  post: one(posts, {
    fields: [postLikes.postId],
    references: [posts.id]
  }),
  user: one(user, {
    fields: [postLikes.userId],
    references: [user.id]
  })
}))

export const postComments = pgTable('post_comments', {
  id: primaryId,
  postId: text('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  ...timestamps
})

export const postCommentsRelations = relations(postComments, ({ one }) => ({
  post: one(posts, {
    fields: [postComments.postId],
    references: [posts.id]
  }),
  user: one(user, {
    fields: [postComments.userId],
    references: [user.id]
  })
}))

export const postShares = pgTable('post_shares', {
  id: primaryId,
  postId: text('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamps.createdAt
})

export const postSharesRelations = relations(postShares, ({ one }) => ({
  post: one(posts, {
    fields: [postShares.postId],
    references: [posts.id]
  }),
  user: one(user, {
    fields: [postShares.userId],
    references: [user.id]
  })
}))

export const eventPosts = pgTable('event_posts', {
  id: primaryId,
  postId: text('post_id')
    .notNull()
    .unique()
    .references(() => posts.id, { onDelete: 'cascade' }),
  eventDate: date('event_date').notNull(),
  eventTime: time('event_time').notNull(),
  location: text('location').notNull(),
  ...timestamps
})

export const eventPostsRelations = relations(eventPosts, ({ one, many }) => ({
  post: one(posts, {
    fields: [eventPosts.postId],
    references: [posts.id]
  }),
  rsvps: many(eventRsvps)
}))

export const eventRsvps = pgTable(
  'event_rsvps',
  {
    id: primaryId,
    eventPostId: text('event_post_id')
      .notNull()
      .references(() => eventPosts.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    status: text('status', { enum: ['going', 'interested', 'not_going'] })
      .notNull()
      .default('going'),
    ...timestamps
  },
  (table) => ({
    uniqueEventUser: uniqueIndex('event_rsvps_event_post_id_user_id_unique').on(
      table.eventPostId,
      table.userId
    )
  })
)

export const eventRsvpsRelations = relations(eventRsvps, ({ one }) => ({
  eventPost: one(eventPosts, {
    fields: [eventRsvps.eventPostId],
    references: [eventPosts.id]
  }),
  user: one(user, {
    fields: [eventRsvps.userId],
    references: [user.id]
  })
}))
