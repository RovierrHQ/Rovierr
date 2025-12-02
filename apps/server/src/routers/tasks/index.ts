import { ORPCError } from '@orpc/server'
import {
  member as memberTable,
  organization as organizationTable,
  taskActivityLog as taskActivityLogTable,
  taskAssignees as taskAssigneesTable,
  taskComments as taskCommentsTable,
  tasks as tasksTable,
  user as userTable
} from '@rov/db'
import { and, desc, eq, inArray, or, type SQL, sql } from 'drizzle-orm'
import { db } from '@/db'
import { protectedProcedure } from '@/lib/orpc'

// import realtime from '@/lib/realtime'

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

export const tasks = {
  createTask: protectedProcedure.tasks.createTask.handler(
    async ({ input, context }) => {
      try {
        console.log('[createTask] Starting task creation', { input })
        const userId = context.session.user.id
        console.log('[createTask] User ID:', userId)

        // Validate context
        if (input.contextType === 'personal') {
          console.log('[createTask] Personal task validation')
          // For personal tasks, contextId must be the user's ID
          if (input.contextId !== userId) {
            console.log('[createTask] ERROR: Personal task context mismatch')
            throw new ORPCError('INVALID_CONTEXT', {
              message: 'Personal task context must match user ID'
            })
          }
        } else if (input.contextType === 'club') {
          console.log(
            '[createTask] Club task validation, clubId:',
            input.contextId
          )
          // Verify club exists and user is a member
          const club = await db.query.organization.findFirst({
            where: eq(organizationTable.id, input.contextId)
          })
          console.log('[createTask] Club found:', !!club)

          if (!club) {
            console.log('[createTask] ERROR: Club not found')
            throw new ORPCError('INVALID_CONTEXT', {
              message: 'Club not found'
            })
          }

          const membership = await db.query.member.findFirst({
            where: and(
              eq(memberTable.organizationId, input.contextId),
              eq(memberTable.userId, userId)
            )
          })
          console.log('[createTask] Membership found:', !!membership)

          if (!membership) {
            console.log('[createTask] ERROR: User not a member')
            throw new ORPCError('UNAUTHORIZED', {
              message: 'You must be a member of the club to create tasks'
            })
          }
        }

        // Create task
        console.log('[createTask] Inserting task into database')
        const taskValues = {
          title: input.title,
          description: input.description || null,
          contextType: input.contextType,
          contextId: input.contextId,
          createdBy: userId,
          priority: input.priority,
          status: input.status,
          visibility: input.visibility,
          dueAt: input.dueAt || null,
          startAt: input.startAt || null,
          isAllDay: input.isAllDay
        }
        console.log('[createTask] Task values:', taskValues)

        const [task] = await db
          .insert(tasksTable)
          .values(taskValues)
          .returning()
        console.log('[createTask] Task created:', task?.id)

        if (!task) {
          console.log('[createTask] ERROR: Task creation returned null')
          throw new ORPCError('INTERNAL_SERVER_ERROR', {
            message: 'Failed to create task'
          })
        }

        // Auto-assign creator for personal tasks
        if (input.contextType === 'personal') {
          console.log('[createTask] Auto-assigning creator for personal task')
          await db.insert(taskAssigneesTable).values({
            taskId: task.id,
            userId,
            role: 'owner'
          })
          console.log('[createTask] Creator assigned')
        }

        // Assign additional users if provided
        if (input.assigneeIds && input.assigneeIds.length > 0) {
          console.log('[createTask] Assigning users:', input.assigneeIds)
          // Verify all assignees exist
          const assignees = await db.query.user.findMany({
            where: inArray(userTable.id, input.assigneeIds)
          })
          console.log(
            '[createTask] Found assignees:',
            assignees.length,
            'of',
            input.assigneeIds.length
          )

          if (assignees.length !== input.assigneeIds.length) {
            console.log('[createTask] ERROR: Some assignees not found')
            throw new ORPCError('INVALID_ASSIGNEES', {
              message: 'One or more assignees not found'
            })
          }

          // For club tasks, verify assignees are club members
          if (input.contextType === 'club') {
            console.log('[createTask] Verifying assignees are club members')
            const memberships = await db.query.member.findMany({
              where: and(
                eq(memberTable.organizationId, input.contextId),
                inArray(memberTable.userId, input.assigneeIds)
              )
            })
            console.log(
              '[createTask] Found memberships:',
              memberships.length,
              'of',
              input.assigneeIds.length
            )

            if (memberships.length !== input.assigneeIds.length) {
              console.log(
                '[createTask] ERROR: Not all assignees are club members'
              )
              throw new ORPCError('INVALID_ASSIGNEES', {
                message: 'All assignees must be club members'
              })
            }
          }

          console.log('[createTask] Inserting assignees')
          await db.insert(taskAssigneesTable).values(
            input.assigneeIds.map((assigneeId) => ({
              taskId: task.id,
              userId: assigneeId
            }))
          )
          console.log('[createTask] Assignees inserted')
        }

        // Log activity
        console.log('[createTask] Logging activity')
        try {
          await logActivity(task.id, userId, 'created', {
            title: task.title
          })
          console.log('[createTask] Activity logged')
        } catch (error) {
          console.error('[createTask] ERROR logging activity:', error)
          // Continue even if activity logging fails
        }

        // Fetch full task with relations
        console.log('[createTask] Fetching full task with relations')
        const fullTask = await db.query.tasks.findFirst({
          where: eq(tasksTable.id, task.id),
          with: {
            assignees: true,
            comments: true
          }
        })
        console.log('[createTask] Full task fetched:', !!fullTask)

        if (!fullTask) {
          console.log('[createTask] ERROR: Failed to fetch created task')
          throw new ORPCError('INTERNAL_SERVER_ERROR', {
            message: 'Failed to fetch created task'
          })
        }

        // Publish real-time update
        // await publishUpdate(task.id, task.contextType, task.contextId, {
        //   type: 'task_created',
        //   taskId: task.id,
        //   data: fullTask
        // })

        console.log('[createTask] Task creation successful, returning task')
        const result = {
          ...fullTask,
          contextType: fullTask.contextType as 'personal' | 'club'
        }
        console.log('[createTask] Returning result:', {
          id: result.id,
          title: result.title
        })
        return result
      } catch (error) {
        console.error('[createTask] UNHANDLED ERROR:', error)
        console.error(
          '[createTask] Error stack:',
          error instanceof Error ? error.stack : 'No stack'
        )
        console.error(
          '[createTask] Error name:',
          error instanceof Error ? error.name : 'Unknown'
        )
        console.error(
          '[createTask] Error message:',
          error instanceof Error ? error.message : String(error)
        )
        throw error
      }
    }
  ),

  updateTask: protectedProcedure.tasks.updateTask.handler(
    async ({ input, context }) => {
      const userId = context.session.user.id

      // Fetch task
      const task = await db.query.tasks.findFirst({
        where: eq(tasksTable.id, input.taskId)
      })

      if (!task) {
        throw new ORPCError('TASK_NOT_FOUND', {
          message: 'Task not found'
        })
      }

      // Check authorization
      const hasAccess = await canAccessTask(userId, task)
      if (!hasAccess) {
        throw new ORPCError('UNAUTHORIZED', {
          message: 'Unauthorized to update this task'
        })
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
        throw new ORPCError('UNAUTHORIZED', {
          message: 'Only creator and assignees can update tasks'
        })
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

      if (input.title !== undefined) updateData.title = input.title
      if (input.description !== undefined)
        updateData.description = input.description || null
      if (input.priority !== undefined) updateData.priority = input.priority
      if (input.status !== undefined) updateData.status = input.status
      if (input.visibility !== undefined)
        updateData.visibility = input.visibility
      if (input.dueAt !== undefined) updateData.dueAt = input.dueAt || null
      if (input.startAt !== undefined)
        updateData.startAt = input.startAt || null
      if (input.isAllDay !== undefined) updateData.isAllDay = input.isAllDay

      // Update task
      const [updatedTask] = await db
        .update(tasksTable)
        .set(updateData)
        .where(eq(tasksTable.id, input.taskId))
        .returning()

      if (!updatedTask) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Failed to update task'
        })
      }

      // Log activity
      await logActivity(task.id, userId, 'updated', {
        changes: updateData
      })

      // Fetch full task with relations
      const fullTask = await db.query.tasks.findFirst({
        where: eq(tasksTable.id, task.id),
        with: {
          assignees: true,
          comments: true
        }
      })

      if (!fullTask) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Failed to fetch updated task'
        })
      }

      // Publish real-time update
      // await publishUpdate(task.id, task.contextType, task.contextId, {
      //   type: 'task_updated',
      //   taskId: task.id,
      //   data: fullTask
      // })

      return {
        ...fullTask,
        contextType: fullTask.contextType as 'personal' | 'club'
      }
    }
  ),

  assignUsers: protectedProcedure.tasks.assignUsers.handler(
    async ({ input, context }) => {
      const userId = context.session.user.id

      // Fetch task
      const task = await db.query.tasks.findFirst({
        where: eq(tasksTable.id, input.taskId)
      })

      if (!task) {
        throw new ORPCError('TASK_NOT_FOUND', {
          message: 'Task not found'
        })
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
        throw new ORPCError('UNAUTHORIZED', {
          message: 'Unauthorized to modify task assignments'
        })
      }

      // Verify all users exist
      const users = await db.query.user.findMany({
        where: inArray(userTable.id, input.userIds)
      })

      if (users.length !== input.userIds.length) {
        throw new ORPCError('INVALID_USERS', {
          message: 'One or more users not found'
        })
      }

      // For club tasks, verify users are club members
      if (task.contextType === 'club') {
        const memberships = await db.query.member.findMany({
          where: and(
            eq(memberTable.organizationId, task.contextId),
            inArray(memberTable.userId, input.userIds)
          )
        })

        if (memberships.length !== input.userIds.length) {
          throw new ORPCError('INVALID_USERS', {
            message: 'All users must be club members'
          })
        }
      }

      if (input.action === 'add') {
        // Add assignees (skip if already assigned)
        const existingAssignments = await db.query.taskAssignees.findMany({
          where: and(
            eq(taskAssigneesTable.taskId, input.taskId),
            inArray(taskAssigneesTable.userId, input.userIds)
          )
        })

        const existingUserIds = new Set(
          existingAssignments.map((a) => a.userId)
        )
        const newUserIds = input.userIds.filter(
          (id) => !existingUserIds.has(id)
        )

        if (newUserIds.length > 0) {
          await db.insert(taskAssigneesTable).values(
            newUserIds.map((assigneeId) => ({
              taskId: input.taskId,
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
              eq(taskAssigneesTable.taskId, input.taskId),
              inArray(taskAssigneesTable.userId, input.userIds)
            )
          )
      }

      // Log activity
      await logActivity(task.id, userId, 'assignees_changed', {
        action: input.action,
        userIds: input.userIds
      })

      // Fetch full task with relations
      const fullTask = await db.query.tasks.findFirst({
        where: eq(tasksTable.id, task.id),
        with: {
          assignees: true,
          comments: true
        }
      })

      if (!fullTask) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Failed to fetch task'
        })
      }

      // Publish real-time update
      // await publishUpdate(task.id, task.contextType, task.contextId, {
      //   type: 'task_assignees_changed',
      //   taskId: task.id,
      //   data: fullTask
      // })

      return {
        ...fullTask,
        contextType: fullTask.contextType as 'personal' | 'club'
      }
    }
  ),

  getMyTasks: protectedProcedure.tasks.getMyTasks.handler(
    async ({ input, context }) => {
      const userId = context.session.user.id
      const {
        status,
        priority,
        contextType,
        limit = 50,
        offset = 0
      } = input.query || {}

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
        conditions.push(
          and(
            eq(tasksTable.contextType, 'club'),
            inArray(tasksTable.contextId, clubIds),
            or(
              eq(tasksTable.visibility, 'club'),
              eq(tasksTable.visibility, 'assignees')
            ) as SQL<unknown>
          ) as SQL<unknown>
        )
      }

      // Apply filters
      const whereConditions = conditions.length > 0 ? [or(...conditions)] : []

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
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)

      const total = Number(countResult?.count ?? 0)

      // Get tasks
      const taskList = await db.query.tasks.findMany({
        where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
        with: {
          assignees: true,
          comments: true
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
    }
  ),

  getClubTasks: protectedProcedure.tasks.getClubTasks.handler(
    async ({ input, context }) => {
      const userId = context.session.user.id
      const {
        status,
        priority,
        visibility,
        limit = 50,
        offset = 0
      } = input.query || {}

      // Verify club exists and user is a member
      const club = await db.query.organization.findFirst({
        where: eq(organizationTable.id, input.clubId)
      })

      if (!club) {
        throw new ORPCError('INVALID_CLUB', {
          message: 'Club not found'
        })
      }

      const membership = await db.query.member.findFirst({
        where: and(
          eq(memberTable.organizationId, input.clubId),
          eq(memberTable.userId, userId)
        )
      })

      if (!membership) {
        throw new ORPCError('UNAUTHORIZED', {
          message: 'You must be a member of the club to view tasks'
        })
      }

      // Build conditions
      const whereConditions = [
        eq(tasksTable.contextType, 'club'),
        eq(tasksTable.contextId, input.clubId)
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

      // Get tasks
      const taskList = await db.query.tasks.findMany({
        where: and(...whereConditions),
        with: {
          assignees: true,
          comments: true
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
    }
  ),

  getTaskDetails: protectedProcedure.tasks.getTaskDetails.handler(
    async ({ input, context }) => {
      const userId = context.session.user.id

      // Fetch task
      const task = await db.query.tasks.findFirst({
        where: eq(tasksTable.id, input.taskId),
        with: {
          assignees: true,
          comments: true,
          activityLog: {
            orderBy: desc(taskActivityLogTable.at),
            limit: 50
          }
        }
      })

      if (!task) {
        throw new ORPCError('TASK_NOT_FOUND', {
          message: 'Task not found'
        })
      }

      // Check authorization
      const hasAccess = await canAccessTask(userId, task)
      if (!hasAccess) {
        throw new ORPCError('UNAUTHORIZED', {
          message: 'Unauthorized to view this task'
        })
      }

      return {
        ...task,
        contextType: task.contextType as 'personal' | 'club',
        activityLog: task.activityLog?.map((log) => ({
          ...log,
          payload: (log.payload as Record<string, unknown> | null) ?? null
        }))
      }
    }
  ),

  addComment: protectedProcedure.tasks.addComment.handler(
    async ({ input, context }) => {
      const userId = context.session.user.id

      // Fetch task
      const task = await db.query.tasks.findFirst({
        where: eq(tasksTable.id, input.taskId)
      })

      if (!task) {
        throw new ORPCError('TASK_NOT_FOUND', {
          message: 'Task not found'
        })
      }

      // Check authorization
      const hasAccess = await canAccessTask(userId, task)
      if (!hasAccess) {
        throw new ORPCError('UNAUTHORIZED', {
          message: 'Unauthorized to comment on this task'
        })
      }

      // Create comment
      const [comment] = await db
        .insert(taskCommentsTable)
        .values({
          taskId: input.taskId,
          userId,
          message: input.message
        })
        .returning()

      if (!comment) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Failed to create comment'
        })
      }

      // Log activity
      await logActivity(task.id, userId, 'commented', {
        commentId: comment.id
      })

      // Publish real-time update
      // await publishUpdate(task.id, task.contextType, task.contextId, {
      //   type: 'task_comment_added',
      //   taskId: task.id,
      //   data: comment
      // })

      return comment
    }
  ),

  getTaskActivity: protectedProcedure.tasks.getTaskActivity.handler(
    async ({ input, context }) => {
      const userId = context.session.user.id
      const { limit = 50, offset = 0 } = input.query || {}

      // Fetch task
      const task = await db.query.tasks.findFirst({
        where: eq(tasksTable.id, input.taskId)
      })

      if (!task) {
        throw new ORPCError('TASK_NOT_FOUND', {
          message: 'Task not found'
        })
      }

      // Check authorization
      const hasAccess = await canAccessTask(userId, task)
      if (!hasAccess) {
        throw new ORPCError('UNAUTHORIZED', {
          message: 'Unauthorized to view task activity'
        })
      }

      // Get total count
      const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(taskActivityLogTable)
        .where(eq(taskActivityLogTable.taskId, input.taskId))

      const total = Number(countResult?.count ?? 0)

      // Get activity log
      const activity = await db.query.taskActivityLog.findMany({
        where: eq(taskActivityLogTable.taskId, input.taskId),
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
    }
  ),

  deleteTask: protectedProcedure.tasks.deleteTask.handler(
    async ({ input, context }) => {
      const userId = context.session.user.id

      // Fetch task
      const task = await db.query.tasks.findFirst({
        where: eq(tasksTable.id, input.taskId)
      })

      if (!task) {
        throw new ORPCError('TASK_NOT_FOUND', {
          message: 'Task not found'
        })
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
            throw new ORPCError('UNAUTHORIZED', {
              message: 'Only creator or club admins can delete tasks'
            })
          }
        } else {
          throw new ORPCError('UNAUTHORIZED', {
            message: 'Only creator can delete tasks'
          })
        }
      }

      // Delete task (cascade will handle related records)
      await db.delete(tasksTable).where(eq(tasksTable.id, input.taskId))

      // Publish real-time update
      // await publishUpdate(task.id, task.contextType, task.contextId, {
      //   type: 'task_deleted',
      //   taskId: task.id
      // })

      return {
        success: true
      }
    }
  )
}
