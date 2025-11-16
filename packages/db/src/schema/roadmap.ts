import { relations } from 'drizzle-orm'
import { pgEnum, pgTable, text } from 'drizzle-orm/pg-core'
import { primaryId, timestamps } from '../helper'
import { user } from './auth'

export const roadmapCategoryEnum = pgEnum('category', [
  'feature-request',
  'bug-report',
  'improvement'
])

export const roadmapStatusEnum = pgEnum('roadmap_status_enum', [
  'publish',
  'preview'
])

/** ========================
 *  ROADMAP LIKES ENTITY
 *  ======================== */
export const roadmapUpvote = pgTable('roadmap_upvote', {
  id: primaryId,
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  roadmapId: text('roadmap_id')
    .notNull()
    .references(() => roadmap.id, { onDelete: 'cascade' }),
  ...timestamps
})

/** ========================
 *  ROADMAP COMMENTS ENTITY
 *  ======================== */
export const roadmapComments = pgTable('roadmap_comment', {
  id: primaryId,
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  roadmapId: text('roadmap_id')
    .notNull()
    .references(() => roadmap.id, { onDelete: 'cascade' }),
  text: text('roadmap_comment').notNull(),
  ...timestamps
})

/** ========================
 *  ROADMAP UPVOTE ENTITY
 *  ======================== */
export const roadmapCommentUpvote = pgTable('roadmap_comment_upvote', {
  id: primaryId,
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  commentId: text('roadmap_comment_id')
    .notNull()
    .references(() => roadmapComments.id, { onDelete: 'cascade' }),
  roadmapId: text('roadmap_id')
    .notNull()
    .references(() => roadmap.id, { onDelete: 'cascade' }),
  ...timestamps
})

/** ========================
 *  ROADMAP ENTITY
 *  ======================== */
export const roadmap = pgTable('roadmap', {
  id: primaryId,
  // tags: text('tags').array().default([]),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  status: roadmapStatusEnum('status').notNull(),
  category: roadmapCategoryEnum('category').notNull(),
  description: text('description').notNull(),
  ...timestamps
})

export const roadmapRelation = relations(roadmap, ({ one, many }) => ({
  user: one(user, {
    fields: [roadmap.userId],
    references: [user.id]
  }),
  upvotes: many(roadmapUpvote),
  comments: many(roadmapComments)
}))

export const roadmapUpvoteRelation = relations(roadmapUpvote, ({ one }) => ({
  roadmap: one(roadmap, {
    fields: [roadmapUpvote.roadmapId],
    references: [roadmap.id]
  }),
  user: one(user, {
    fields: [roadmapUpvote.userId],
    references: [user.id]
  })
}))

export const roadmapCommentsRelation = relations(
  roadmapComments,
  ({ one, many }) => ({
    user: one(user, {
      fields: [roadmapComments.userId],
      references: [user.id]
    }),
    roadmap: one(roadmap, {
      fields: [roadmapComments.roadmapId],
      references: [roadmap.id]
    }),
    upvotes: many(roadmapCommentUpvote)
  })
)

export const roadmapCommentUpvoteRelation = relations(
  roadmapCommentUpvote,
  ({ one }) => ({
    user: one(user, {
      fields: [roadmapCommentUpvote.userId],
      references: [user.id]
    }),
    comment: one(roadmapComments, {
      fields: [roadmapCommentUpvote.commentId],
      references: [roadmapComments.id]
    }),
    roadmap: one(roadmap, {
      fields: [roadmapCommentUpvote.roadmapId],
      references: [roadmap.id]
    })
  })
)
