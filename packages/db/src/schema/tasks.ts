import { relations } from 'drizzle-orm'
import { boolean, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { primaryId, timestamps } from '../helper'
import { user } from './auth'

/** ========================
 *  TASKS
 *  ======================== */
export const tasks = pgTable('tasks', {
  id: primaryId,
  title: text('title').notNull(),
  description: text('description'),
  contextType: text('context_type').notNull(), // "personal" | "club"
  contextId: text('context_id').notNull(), // user_id if personal, club_id if club
  createdBy: text('created_by')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  priority: text('priority', {
    enum: ['low', 'medium', 'high']
  })
    .default('medium')
    .notNull(),
  status: text('status', {
    enum: ['todo', 'in_progress', 'done']
  })
    .default('todo')
    .notNull(),
  visibility: text('visibility', {
    enum: ['private', 'club', 'assignees']
  })
    .default('assignees')
    .notNull(),
  dueAt: timestamp('due_at', { withTimezone: true, mode: 'string' }),
  startAt: timestamp('start_at', { withTimezone: true, mode: 'string' }),
  isAllDay: boolean('is_all_day').default(false).notNull(),
  ...timestamps
})

/** ========================
 *  TASK ASSIGNEES
 *  ======================== */
export const taskAssignees = pgTable('task_assignees', {
  id: primaryId,
  taskId: text('task_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  role: text('role'), // optional: "owner" | "editor" | "viewer"
  assignedAt: timestamp('assigned_at', {
    withTimezone: true,
    mode: 'string'
  })
    .defaultNow()
    .notNull()
})

/** ========================
 *  TASK ACTIVITY LOG
 *  ======================== */
export const taskActivityLog = pgTable('task_activity_log', {
  id: primaryId,
  taskId: text('task_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  action: text('action').notNull(), // "created", "status_changed", "commented", "assigned", etc.
  payload: jsonb('payload').default({}),
  at: timestamp('at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull()
})

/** ========================
 *  TASK COMMENTS
 *  ======================== */
export const taskComments = pgTable('task_comments', {
  id: primaryId,
  taskId: text('task_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  message: text('message').notNull(),
  ...timestamps
})

/** ========================
 *  USER CALENDAR CONNECTIONS
 *  ======================== */
export const userCalendarConnections = pgTable('user_calendar_connections', {
  id: primaryId,
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull(), // "google"
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'string' }),
  syncEnabled: boolean('sync_enabled').default(true).notNull(),
  syncDirection: text('sync_direction'), // "one_way_app_to_google" | "two_way"
  ...timestamps
})

/** ========================
 *  TASK CALENDAR EVENTS
 *  ======================== */
export const taskCalendarEvents = pgTable('task_calendar_events', {
  id: primaryId,
  taskId: text('task_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull(), // "google"
  calendarEventId: text('calendar_event_id').notNull(),
  syncedAt: timestamp('synced_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull()
})

// Relations
export const tasksRelations = relations(tasks, ({ one, many }) => ({
  creator: one(user, {
    fields: [tasks.createdBy],
    references: [user.id]
  }),
  assignees: many(taskAssignees),
  activityLog: many(taskActivityLog),
  comments: many(taskComments),
  calendarEvents: many(taskCalendarEvents)
}))

export const taskAssigneesRelations = relations(taskAssignees, ({ one }) => ({
  task: one(tasks, {
    fields: [taskAssignees.taskId],
    references: [tasks.id]
  }),
  user: one(user, {
    fields: [taskAssignees.userId],
    references: [user.id]
  })
}))

export const taskActivityLogRelations = relations(
  taskActivityLog,
  ({ one }) => ({
    task: one(tasks, {
      fields: [taskActivityLog.taskId],
      references: [tasks.id]
    }),
    user: one(user, {
      fields: [taskActivityLog.userId],
      references: [user.id]
    })
  })
)

export const taskCommentsRelations = relations(taskComments, ({ one }) => ({
  task: one(tasks, {
    fields: [taskComments.taskId],
    references: [tasks.id]
  }),
  user: one(user, {
    fields: [taskComments.userId],
    references: [user.id]
  })
}))

export const userCalendarConnectionsRelations = relations(
  userCalendarConnections,
  ({ one }) => ({
    user: one(user, {
      fields: [userCalendarConnections.userId],
      references: [user.id]
    })
  })
)

export const taskCalendarEventsRelations = relations(
  taskCalendarEvents,
  ({ one }) => ({
    task: one(tasks, {
      fields: [taskCalendarEvents.taskId],
      references: [tasks.id]
    }),
    user: one(user, {
      fields: [taskCalendarEvents.userId],
      references: [user.id]
    })
  })
)
