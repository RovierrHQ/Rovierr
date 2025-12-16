import { db } from '@api/db'
import { UNAUTHORIZED } from '@api/lib/common-errors'
import { betterAuth } from '@api/middleware/auth'
import {
  member as memberTable,
  organization as organizationTable,
  taskActivityLog as taskActivityLogTable,
  taskAssignees as taskAssigneesTable,
  taskComments as taskCommentsTable,
  tasks as tasksTable,
  user as userTable
} from '@rov/db'
import { and, desc, eq, inArray, or, sql } from 'drizzle-orm'
import Elysia from 'elysia'
import z from 'zod'
import {
  INVALID_ASSIGNEES,
  INVALID_CLUB,
  INVALID_CONTEXT,
  INVALID_USERS,
  TASK_NOT_FOUND
} from './errors'

// Helper function to check if user can access a task
async function canAccessTask(
  userId: string,
  task: {
    id: string
    contextType: string
    contextId: string
    createdBy: string
    visibility: string
  }
): Promise<boolean> {
  // User created the task
  if (task.createdBy === userId) {
    return true
  }

  // Check if user is assigned
  const assignment = await db.query.taskAssignees.findFirst({
    where: and(
      eq(taskAssigneesTable.taskId, task.id),
      eq(taskAssigneesTable.userId, userId)
    )
  })

  if (assignment) {
    return true
  }

  // For club tasks, check membership and visibility
  if (task.contextType === 'club') {
    // Check if user is a member of the club
    const membership = await db.query.member.findFirst({
      where: and(
        eq(memberTable.organizationId, task.contextId),
        eq(memberTable.userId, userId)
      )
    })

    if (!membership) {
      return false
    }

    // Check visibility rules
    if (task.visibility === 'private') {
      return false // Only creator and assignees can see
    }

    if (task.visibility === 'club' || task.visibility === 'assignees') {
      return true // Club members can see
    }
  }

  // For personal tasks, only creator and assignees can see
  if (task.contextType === 'personal') {
    return false
  }

  return false
}

// Helper function to log activity
async function logActivity(
  taskId: string,
  userId: string,
  action: string,
  payload?: Record<string, unknown>
) {
  await db.insert(taskActivityLogTable).values({
    taskId,
    userId,
    action,
    payload: payload || {}
  })
}

// Helper function to publish real-time update
// async function publishUpdate(
//   taskId: string,
//   contextType: string,
//   contextId: string,
//   event: {
//     type: string
//     taskId: string
//     data?: unknown
//   }
// ) {
//   // Publish to task-specific channel
//   await realtime.publish(`task:${taskId}`, event)
//
//   // Publish to user feed if personal
//   if (contextType === 'personal') {
//     await realtime.publish(`tasks:user:${contextId}`, event)
//   }
//
//   // Publish to club feed if club
//   if (contextType === 'club') {
//     await realtime.publish(`tasks:club:${contextId}`, event)
//   }
// }

export const tasks = new Elysia({ name: 'tasks' }).use(betterAuth).group(
  '/tasks',
  {
    auth: true
  },
  (app) =>
    app
      .post(
        '/create',
        async ({ body, user }) => {
          const userId = user.id

          if (body.contextType === 'personal') {
            // Validate context
            // For personal tasks, contextId must be the user's ID
            if (body.contextId !== userId) {
              throw new INVALID_CONTEXT()
            }
          } else if (body.contextType === 'club') {
            // Verify club exists and user is a member
            const club = await db.query.organization.findFirst({
              where: eq(organizationTable.id, body.contextId)
            })

            if (!club) {
              throw new INVALID_CONTEXT('Club not found')
            }

            const membership = await db.query.member.findFirst({
              where: and(
                eq(memberTable.organizationId, body.contextId),
                eq(memberTable.userId, userId)
              )
            })

            if (!membership) {
              throw new UNAUTHORIZED(
                'You must be a member of the club to create tasks'
              )
            }
          }

          // Create task
          const [task] = await db
            .insert(tasksTable)
            .values({
              title: body.title,
              description: body.description || null,
              contextType: body.contextType,
              contextId: body.contextId,
              createdBy: userId,
              priority: body.priority,
              status: body.status,
              visibility: body.visibility,
              dueAt: body.dueAt || null,
              startAt: body.startAt || null,
              isAllDay: body.isAllDay
            })
            .returning()

          if (body.contextType === 'personal') {
            // Auto-assign creator for personal tasks
            await db.insert(taskAssigneesTable).values({
              taskId: task.id,
              userId,
              role: 'owner'
            })
          }

          if (body.assigneeIds && body.assigneeIds.length > 0) {
            // Assign additional users if provided
            // Verify all assignees exist
            const assignees = await db.query.user.findMany({
              where: inArray(userTable.id, body.assigneeIds)
            })

            if (assignees.length !== body.assigneeIds.length) {
              throw new INVALID_ASSIGNEES()
            }

            // For club tasks, verify assignees are club members
            if (body.contextType === 'club') {
              const memberships = await db.query.member.findMany({
                where: and(
                  eq(memberTable.organizationId, body.contextId),
                  inArray(memberTable.userId, body.assigneeIds)
                )
              })

              if (memberships.length !== body.assigneeIds.length) {
                throw new INVALID_ASSIGNEES(
                  'All assignees must be club members'
                )
              }
            }

            await db.insert(taskAssigneesTable).values(
              body.assigneeIds.map((assigneeId) => ({
                taskId: task.id,
                userId: assigneeId
              }))
            )
          }

          // Log activity
          try {
            await logActivity(task.id, userId, 'created', {
              title: task.title
            })
          } catch {
            // Continue even if activity logging fails
          }

          // Fetch full task with relations including user data
          const fullTask = await db.query.tasks.findFirst({
            where: eq(tasksTable.id, task.id),
            with: {
              assignees: {
                with: {
                  user: true
                }
              },
              comments: {
                with: {
                  user: true
                }
              }
            }
          })

          return {
            ...fullTask,
            contextType: fullTask?.contextType
          }
        },
        {
          body: z.object({
            title: z.string().min(1),
            description: z.string().optional(),
            contextType: z.enum(['personal', 'club']),
            contextId: z.string(),
            priority: z.enum(['low', 'medium', 'high']).default('medium'),
            status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
            visibility: z
              .enum(['private', 'club', 'assignees'])
              .default('assignees'),
            dueAt: z.string().optional(),
            startAt: z.string().optional(),
            isAllDay: z.boolean().default(false),
            assigneeIds: z.array(z.string()).optional()
          })
        }
      )
      .put(
        '/update',
        async ({ body, user }) => {
          const userId = user.id

          // Fetch task
          const task = await db.query.tasks.findFirst({
            where: eq(tasksTable.id, body.taskId)
          })

          if (!task) {
            throw new TASK_NOT_FOUND()
          }

          // Check authorization
          const hasAccess = await canAccessTask(userId, task)
          if (!hasAccess) {
            throw new UNAUTHORIZED('Unauthorized to update this task')
          }

          // Check if user can edit (creator or assignee with edit permissions)
          const isCreator = task.createdBy === userId
          const assignment = await db.query.taskAssignees.findFirst({
            where: and(
              eq(taskAssigneesTable.taskId, task.id),
              eq(taskAssigneesTable.userId, userId)
            )
          })

          if (!(isCreator || assignment)) {
            throw new UNAUTHORIZED(
              'Only creator and assignees can update tasks'
            )
          }

          // Build update payload
          const updateData: {
            title?: string
            description?: string | null
            priority?: 'low' | 'medium' | 'high'
            status?: 'todo' | 'in_progress' | 'done'
            visibility?: 'private' | 'club' | 'assignees'
            dueAt?: string | null
            startAt?: string | null
            isAllDay?: boolean
          } = {}

          if (body.title !== undefined) updateData.title = body.title
          if (body.description !== undefined)
            updateData.description = body.description || null
          if (body.priority !== undefined) updateData.priority = body.priority
          if (body.status !== undefined) updateData.status = body.status
          if (body.visibility !== undefined)
            updateData.visibility = body.visibility
          if (body.dueAt !== undefined) updateData.dueAt = body.dueAt || null
          if (body.startAt !== undefined)
            updateData.startAt = body.startAt || null
          if (body.isAllDay !== undefined) updateData.isAllDay = body.isAllDay

          // Update task
          const [updatedTask] = await db
            .update(tasksTable)
            .set(updateData)
            .where(eq(tasksTable.id, body.taskId))
            .returning()

          if (!updatedTask) {
            throw new Error('Failed to update task')
          }

          // Log activity
          try {
            await logActivity(task.id, userId, 'updated', {
              changes: updateData
            })
          } catch {
            // Continue even if activity logging fails
          }

          // Fetch full task with relations including user data
          const fullTask = await db.query.tasks.findFirst({
            where: eq(tasksTable.id, task.id),
            with: {
              assignees: {
                with: {
                  user: true
                }
              },
              comments: {
                with: {
                  user: true
                }
              }
            }
          })

          if (!fullTask) {
            throw new Error('Failed to fetch updated task')
          }

          return {
            ...fullTask,
            contextType: fullTask.contextType as 'personal' | 'club'
          }
        },
        {
          body: z.object({
            taskId: z.string(),
            title: z.string().min(1).optional(),
            description: z.string().optional(),
            priority: z.enum(['low', 'medium', 'high']).optional(),
            status: z.enum(['todo', 'in_progress', 'done']).optional(),
            visibility: z.enum(['private', 'club', 'assignees']).optional(),
            dueAt: z.string().nullable().optional(),
            startAt: z.string().nullable().optional(),
            isAllDay: z.boolean().optional()
          })
        }
      )
      .post(
        '/assign',
        async ({ body, user }) => {
          const userId = user.id

          // Fetch task
          const task = await db.query.tasks.findFirst({
            where: eq(tasksTable.id, body.taskId)
          })

          if (!task) {
            throw new TASK_NOT_FOUND()
          }

          // Check authorization - only creator or club admins can assign
          const isCreator = task.createdBy === userId
          let canAssign = isCreator

          if (!canAssign && task.contextType === 'club') {
            // Check if user is club admin
            const membership = await db.query.member.findFirst({
              where: and(
                eq(memberTable.organizationId, task.contextId),
                eq(memberTable.userId, userId)
              )
            })

            if (membership && membership.role === 'admin') {
              canAssign = true
            }
          }

          if (!canAssign) {
            throw new UNAUTHORIZED('Unauthorized to modify task assignments')
          }

          // Verify all users exist
          const users = await db.query.user.findMany({
            where: inArray(userTable.id, body.userIds)
          })

          if (users.length !== body.userIds.length) {
            throw new INVALID_USERS()
          }

          // For club tasks, verify users are club members
          if (task.contextType === 'club') {
            const memberships = await db.query.member.findMany({
              where: and(
                eq(memberTable.organizationId, task.contextId),
                inArray(memberTable.userId, body.userIds)
              )
            })

            if (memberships.length !== body.userIds.length) {
              throw new INVALID_USERS('All users must be club members')
            }
          }

          if (body.action === 'add') {
            // Add assignees (skip if already assigned)
            const existingAssignments = await db.query.taskAssignees.findMany({
              where: and(
                eq(taskAssigneesTable.taskId, body.taskId),
                inArray(taskAssigneesTable.userId, body.userIds)
              )
            })

            const existingUserIds = new Set(
              existingAssignments.map((a) => a.userId)
            )
            const newUserIds = body.userIds.filter(
              (id) => !existingUserIds.has(id)
            )

            if (newUserIds.length > 0) {
              await db.insert(taskAssigneesTable).values(
                newUserIds.map((assigneeId) => ({
                  taskId: body.taskId,
                  userId: assigneeId
                }))
              )
            }
          } else {
            // Remove assignees
            await db
              .delete(taskAssigneesTable)
              .where(
                and(
                  eq(taskAssigneesTable.taskId, body.taskId),
                  inArray(taskAssigneesTable.userId, body.userIds)
                )
              )
          }

          // Log activity
          try {
            await logActivity(task.id, userId, 'assignees_changed', {
              action: body.action,
              userIds: body.userIds
            })
          } catch {
            // Continue even if activity logging fails
          }

          // Fetch full task with relations including user data
          const fullTask = await db.query.tasks.findFirst({
            where: eq(tasksTable.id, task.id),
            with: {
              assignees: {
                with: {
                  user: true
                }
              },
              comments: {
                with: {
                  user: true
                }
              }
            }
          })

          if (!fullTask) {
            throw new Error('Failed to fetch task')
          }

          return {
            ...fullTask,
            contextType: fullTask.contextType as 'personal' | 'club'
          }
        },
        {
          body: z.object({
            taskId: z.string(),
            userIds: z.array(z.string()),
            action: z.enum(['add', 'remove']).default('add')
          })
        }
      )
      .get(
        '/my',
        async ({ query, user }) => {
          const userId = user.id
          const {
            status,
            priority,
            contextType,
            limit = 50,
            offset = 0
          } = query || {}

          // Build conditions for tasks user can see
          const conditions = [
            // Tasks created by user
            eq(tasksTable.createdBy, userId),
            // Tasks assigned to user
            sql`EXISTS (
            SELECT 1 FROM ${taskAssigneesTable}
            WHERE ${taskAssigneesTable.taskId} = ${tasksTable.id}
            AND ${taskAssigneesTable.userId} = ${userId}
          )`
          ]

          // For club tasks, add condition for club membership
          const userClubs = await db.query.member.findMany({
            where: eq(memberTable.userId, userId),
            columns: {
              organizationId: true
            }
          })

          const clubIds = userClubs.map((m) => m.organizationId)

          if (clubIds.length > 0) {
            const clubCondition = and(
              eq(tasksTable.contextType, 'club'),
              inArray(tasksTable.contextId, clubIds),
              or(
                eq(tasksTable.visibility, 'club'),
                eq(tasksTable.visibility, 'assignees')
              )
            )
            if (clubCondition) {
              conditions.push(clubCondition)
            }
          }

          // Apply filters
          const whereConditions =
            conditions.length > 0 ? [or(...conditions)] : []

          if (status) {
            whereConditions.push(eq(tasksTable.status, status))
          }

          if (priority) {
            whereConditions.push(eq(tasksTable.priority, priority))
          }

          if (contextType) {
            whereConditions.push(eq(tasksTable.contextType, contextType))
          }

          // Get total count
          const [countResult] = await db
            .select({ count: sql<number>`count(*)` })
            .from(tasksTable)
            .where(
              whereConditions.length > 0 ? and(...whereConditions) : undefined
            )

          const total = Number(countResult?.count ?? 0)

          // Get tasks with user relations
          const taskList = await db.query.tasks.findMany({
            where:
              whereConditions.length > 0 ? and(...whereConditions) : undefined,
            with: {
              assignees: {
                with: {
                  user: true
                }
              },
              comments: {
                with: {
                  user: true
                }
              }
            },
            orderBy: desc(tasksTable.createdAt),
            limit,
            offset
          })

          return {
            data: taskList.map((task) => ({
              ...task,
              contextType: task.contextType as 'personal' | 'club'
            })),
            meta: {
              total,
              limit,
              offset
            }
          }
        },
        {
          query: z.object({
            status: z.enum(['todo', 'in_progress', 'done']).optional(),
            priority: z.enum(['low', 'medium', 'high']).optional(),
            contextType: z.enum(['personal', 'club']).optional(),
            limit: z.number().optional(),
            offset: z.number().optional()
          })
        }
      )
      .get(
        '/club/:clubId',
        async ({ params, query, user }) => {
          const userId = user.id
          const {
            status,
            priority,
            visibility,
            limit = 50,
            offset = 0
          } = query || {}

          // Verify club exists and user is a member
          const club = await db.query.organization.findFirst({
            where: eq(organizationTable.id, params.clubId)
          })

          if (!club) {
            throw new INVALID_CLUB()
          }

          const membership = await db.query.member.findFirst({
            where: and(
              eq(memberTable.organizationId, params.clubId),
              eq(memberTable.userId, userId)
            )
          })

          if (!membership) {
            throw new UNAUTHORIZED(
              'You must be a member of the club to view tasks'
            )
          }

          // Build conditions
          const whereConditions = [
            eq(tasksTable.contextType, 'club'),
            eq(tasksTable.contextId, params.clubId)
          ]

          if (status) {
            whereConditions.push(eq(tasksTable.status, status))
          }

          if (priority) {
            whereConditions.push(eq(tasksTable.priority, priority))
          }

          if (visibility) {
            whereConditions.push(eq(tasksTable.visibility, visibility))
          }

          // Get total count
          const [countResult] = await db
            .select({ count: sql<number>`count(*)` })
            .from(tasksTable)
            .where(and(...whereConditions))

          const total = Number(countResult?.count ?? 0)

          // Get tasks with user relations
          const taskList = await db.query.tasks.findMany({
            where: and(...whereConditions),
            with: {
              assignees: {
                with: {
                  user: true
                }
              },
              comments: {
                with: {
                  user: true
                }
              }
            },
            orderBy: desc(tasksTable.createdAt),
            limit,
            offset
          })

          return {
            data: taskList.map((task) => ({
              ...task,
              contextType: task.contextType as 'personal' | 'club'
            })),
            meta: {
              total,
              limit,
              offset
            }
          }
        },
        {
          params: z.object({
            clubId: z.string()
          }),
          query: z.object({
            status: z.enum(['todo', 'in_progress', 'done']).optional(),
            priority: z.enum(['low', 'medium', 'high']).optional(),
            visibility: z.enum(['private', 'club', 'assignees']).optional(),
            limit: z.number().optional(),
            offset: z.number().optional()
          })
        }
      )
      .get(
        '/:taskId',
        async ({ params, user }) => {
          const userId = user.id

          // Fetch task with user relations
          const task = await db.query.tasks.findFirst({
            where: eq(tasksTable.id, params.taskId),
            with: {
              assignees: {
                with: {
                  user: true
                }
              },
              comments: {
                with: {
                  user: true
                }
              },
              activityLog: {
                orderBy: desc(taskActivityLogTable.at),
                limit: 50
              }
            }
          })

          if (!task) {
            throw new TASK_NOT_FOUND()
          }

          // Check authorization
          const hasAccess = await canAccessTask(userId, task)
          if (!hasAccess) {
            throw new UNAUTHORIZED('Unauthorized to view this task')
          }

          // Ensure user data is properly included in assignees and comments
          return {
            ...task,
            contextType: task.contextType as 'personal' | 'club',
            assignees: task.assignees?.map((assignee) => ({
              ...assignee,
              user: assignee.user || null
            })),
            comments: task.comments?.map((comment) => ({
              ...comment,
              user: comment.user || null
            })),
            activityLog: task.activityLog?.map((log) => ({
              ...log,
              payload: (log.payload as Record<string, unknown> | null) ?? null
            }))
          }
        },
        {
          params: z.object({
            taskId: z.string()
          })
        }
      )
      .post(
        '/:taskId/comment',
        async ({ params, body, user }) => {
          const userId = user.id

          // Fetch task
          const task = await db.query.tasks.findFirst({
            where: eq(tasksTable.id, params.taskId)
          })

          if (!task) {
            throw new TASK_NOT_FOUND()
          }

          // Check authorization
          const hasAccess = await canAccessTask(userId, task)
          if (!hasAccess) {
            throw new UNAUTHORIZED('Unauthorized to comment on this task')
          }

          // Create comment
          const [comment] = await db
            .insert(taskCommentsTable)
            .values({
              taskId: params.taskId,
              userId,
              message: body.message
            })
            .returning()

          if (!comment) {
            throw new Error('Failed to create comment')
          }

          // Log activity
          try {
            await logActivity(task.id, userId, 'commented', {
              commentId: comment.id
            })
          } catch {
            // Continue even if activity logging fails
          }

          // Fetch comment with user relation
          const fullComment = await db.query.taskComments.findFirst({
            where: eq(taskCommentsTable.id, comment.id),
            with: {
              user: true
            }
          })

          return fullComment || comment
        },
        {
          params: z.object({
            taskId: z.string()
          }),
          body: z.object({
            message: z.string().min(1)
          })
        }
      )
      .get(
        '/:taskId/activity',
        async ({ params, query, user }) => {
          const userId = user.id
          const { limit = 50, offset = 0 } = query || {}

          // Fetch task
          const task = await db.query.tasks.findFirst({
            where: eq(tasksTable.id, params.taskId)
          })

          if (!task) {
            throw new TASK_NOT_FOUND()
          }

          // Check authorization
          const hasAccess = await canAccessTask(userId, task)
          if (!hasAccess) {
            throw new UNAUTHORIZED('Unauthorized to view task activity')
          }

          // Get total count
          const [countResult] = await db
            .select({ count: sql<number>`count(*)` })
            .from(taskActivityLogTable)
            .where(eq(taskActivityLogTable.taskId, params.taskId))

          const total = Number(countResult?.count ?? 0)

          // Get activity log
          const activity = await db.query.taskActivityLog.findMany({
            where: eq(taskActivityLogTable.taskId, params.taskId),
            orderBy: desc(taskActivityLogTable.at),
            limit,
            offset
          })

          return {
            data: activity.map((log) => ({
              ...log,
              payload: (log.payload as Record<string, unknown> | null) ?? null,
              taskId: log.taskId,
              userId: log.userId
            })),
            meta: {
              total,
              limit,
              offset
            }
          }
        },
        {
          params: z.object({
            taskId: z.string()
          }),
          query: z.object({
            limit: z.number().optional(),
            offset: z.number().optional()
          })
        }
      )
      .delete(
        '/:taskId',
        async ({ params, user }) => {
          const userId = user.id

          // Fetch task
          const task = await db.query.tasks.findFirst({
            where: eq(tasksTable.id, params.taskId)
          })

          if (!task) {
            throw new TASK_NOT_FOUND()
          }

          // Only creator can delete
          if (task.createdBy !== userId) {
            // For club tasks, check if user is admin
            if (task.contextType === 'club') {
              const membership = await db.query.member.findFirst({
                where: and(
                  eq(memberTable.organizationId, task.contextId),
                  eq(memberTable.userId, userId)
                )
              })

              if (!membership || membership.role !== 'admin') {
                throw new UNAUTHORIZED(
                  'Only creator or club admins can delete tasks'
                )
              }
            } else {
              throw new UNAUTHORIZED('Only creator can delete tasks')
            }
          }

          // Delete task (cascade will handle related records)
          await db.delete(tasksTable).where(eq(tasksTable.id, params.taskId))

          return {
            success: true
          }
        },
        {
          params: z.object({
            taskId: z.string()
          })
        }
      )
)
