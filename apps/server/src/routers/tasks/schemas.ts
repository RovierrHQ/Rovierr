import { z } from 'zod'

// ============================================================================
// Shared Schemas
// ============================================================================

export const taskPrioritySchema = z.enum(['low', 'medium', 'high'])
export const taskStatusSchema = z.enum(['todo', 'in_progress', 'done'])
export const taskVisibilitySchema = z.enum(['private', 'club', 'assignees'])
export const contextTypeSchema = z.enum(['personal', 'club'])

// ============================================================================
// Input Schemas
// ============================================================================

export const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  contextType: contextTypeSchema,
  contextId: z.string(),
  priority: taskPrioritySchema.default('medium'),
  status: taskStatusSchema.default('todo'),
  visibility: taskVisibilitySchema.default('assignees'),
  dueAt: z.string().optional(),
  startAt: z.string().optional(),
  isAllDay: z.boolean().default(false),
  assigneeIds: z.array(z.string()).optional()
})

export const updateTaskSchema = z.object({
  taskId: z.string(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  priority: taskPrioritySchema.optional(),
  status: taskStatusSchema.optional(),
  visibility: taskVisibilitySchema.optional(),
  dueAt: z.string().nullable().optional(),
  startAt: z.string().nullable().optional(),
  isAllDay: z.boolean().optional()
})

export const assignUsersSchema = z.object({
  taskId: z.string(),
  userIds: z.array(z.string()),
  action: z.enum(['add', 'remove']).default('add')
})

export const getMyTasksQuerySchema = z.object({
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  contextType: contextTypeSchema.optional(),
  limit: z.coerce.number().optional(),
  offset: z.coerce.number().optional()
})

export const getClubTasksQuerySchema = z.object({
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  visibility: taskVisibilitySchema.optional(),
  limit: z.coerce.number().optional(),
  offset: z.coerce.number().optional()
})

export const getTaskDetailsParamsSchema = z.object({
  taskId: z.string()
})

export const addCommentSchema = z.object({
  message: z.string().min(1)
})

export const getTaskActivityQuerySchema = z.object({
  limit: z.coerce.number().optional(),
  offset: z.coerce.number().optional()
})

// ============================================================================
// Type Exports
// ============================================================================

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type AssignUsersInput = z.infer<typeof assignUsersSchema>
export type GetMyTasksQuery = z.infer<typeof getMyTasksQuerySchema>
export type GetClubTasksQuery = z.infer<typeof getClubTasksQuerySchema>
export type GetTaskActivityQuery = z.infer<typeof getTaskActivityQuerySchema>
