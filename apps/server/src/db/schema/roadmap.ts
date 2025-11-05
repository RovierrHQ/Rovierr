import { pgEnum, pgTable, text } from 'drizzle-orm/pg-core'
import { primaryId, timestamps } from '../helper'
import { user } from './auth'

const roadmapCommonField = {
  id: primaryId,
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  ...timestamps
}

export const roadmapCategoryEnum = pgEnum('category', [
  'Feature Request',
  'Bug Report',
  'Improvement'
])

export const roadmapStatusEnum = pgEnum('roadmap_status_enum', [
  'publish',
  'preview'
])

//..........................*****

/** ========================
 *  ROADMAP LIKES ENTITY
 *  ======================== */
export const roadmapUpvote = pgTable('roadmap_likes', {
  ...roadmapCommonField,
  roadmapId: text('roadmap_id')
    .notNull()
    .references(() => roadmap.id, { onDelete: 'cascade' })
})

/** ========================
 *  ROADMAP LIKES ENTITY
 *  ======================== */
export const roadmapComments = pgTable('roadmap_comment', {
  ...roadmapCommonField,
  text: text('roadmap_comment').notNull()
})

/** ========================
 *  ROADMAP UPVOTE ENTITY
 *  ======================== */
export const roadmapCommentUpvote = pgTable('roadmap_comment_upvote', {
  ...roadmapCommonField,
  commentId: text('roadmap_comment_id')
    .notNull()
    .references(() => roadmapComments.id, { onDelete: 'cascade' })
})

/** ========================
 *  ROADMAP ENTITY
 *  ======================== */
export const roadmap = pgTable('roadmap', {
  ...roadmapCommonField,
  title: text('title').notNull(),
  status: roadmapStatusEnum('status').notNull(),
  category: roadmapCategoryEnum('category').notNull(),
  description: text('description').notNull()
})
