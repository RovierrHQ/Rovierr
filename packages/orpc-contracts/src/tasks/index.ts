import { oc } from '@orpc/contract'
import { z } from 'zod'

// Common schemas
const taskAssigneeSchema = z.object({
  id: z.string(),
  taskId: z.string(),
  userId: z.string(),
  role: z.string().nullable(),
  assignedAt: z.string()
})

const taskActivityLogSchema = z.object({
  id: z.string(),
  taskId: z.string(),
  userId: z.string(),
  action: z.string(),
  payload: z.record(z.string(), z.any()).nullable(),
  at: z.string()
})

const taskCommentSchema = z.object({
  id: z.string(),
  taskId: z.string(),
  userId: z.string(),
  message: z.string(),
  createdAt: z.string(),
  updatedAt: z.string()
})

const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  contextType: z.enum(['personal', 'club']),
  contextId: z.string(),
  createdBy: z.string(),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['todo', 'in_progress', 'done']),
  visibility: z.enum(['private', 'club', 'assignees']),
  dueAt: z.string().nullable(),
  startAt: z.string().nullable(),
  isAllDay: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  assignees: z.array(taskAssigneeSchema).optional(),
  comments: z.array(taskCommentSchema).optional(),
  activityLog: z.array(taskActivityLogSchema).optional()
})

export const tasks = {
  createTask: oc
    .route({
      method: 'POST',
      description: 'Create a personal or club task with optional assignees',
      summary: 'Create Task',
      tags: ['Tasks']
    })
    .input(
      z.object({
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
    )
    .output(taskSchema)
    .errors({
      INVALID_CONTEXT: {
        data: z.object({
          message: z.string().default('Invalid context')
        })
      },
      UNAUTHORIZED: {
        data: z.object({
          message: z
            .string()
            .default('Unauthorized to create task in this context')
        })
      },
      INVALID_ASSIGNEES: {
        data: z.object({
          message: z.string().default('Invalid assignees')
        })
      }
    }),

  updateTask: oc
    .route({
      method: 'PUT',
      description: 'Update task fields',
      summary: 'Update Task',
      tags: ['Tasks']
    })
    .input(
      z.object({
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
    )
    .output(taskSchema)
    .errors({
      TASK_NOT_FOUND: {
        data: z.object({
          message: z.string().default('Task not found')
        })
      },
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('Unauthorized to update this task')
        })
      }
    }),

  assignUsers: oc
    .route({
      method: 'POST',
      description: 'Add or remove assignees from a task',
      summary: 'Assign Users',
      tags: ['Tasks']
    })
    .input(
      z.object({
        taskId: z.string(),
        userIds: z.array(z.string()),
        action: z.enum(['add', 'remove']).default('add')
      })
    )
    .output(taskSchema)
    .errors({
      TASK_NOT_FOUND: {
        data: z.object({
          message: z.string().default('Task not found')
        })
      },
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('Unauthorized to modify task assignments')
        })
      },
      INVALID_USERS: {
        data: z.object({
          message: z.string().default('Invalid users')
        })
      }
    }),

  getMyTasks: oc
    .route({
      method: 'GET',
      description:
        'Fetch all tasks user can see (personal + assigned + club tasks based on visibility)',
      summary: 'Get My Tasks',
      tags: ['Tasks']
    })
    .input(
      z.object({
        query: z
          .object({
            status: z.enum(['todo', 'in_progress', 'done']).optional(),
            priority: z.enum(['low', 'medium', 'high']).optional(),
            contextType: z.enum(['personal', 'club']).optional(),
            limit: z.number().optional(),
            offset: z.number().optional()
          })
          .optional()
      })
    )
    .output(
      z.object({
        data: z.array(taskSchema),
        meta: z
          .object({
            total: z.number(),
            limit: z.number(),
            offset: z.number()
          })
          .optional()
      })
    ),

  getClubTasks: oc
    .route({
      method: 'GET',
      description: 'Fetch tasks for a specific club',
      summary: 'Get Club Tasks',
      tags: ['Tasks']
    })
    .input(
      z.object({
        clubId: z.string(),
        query: z
          .object({
            status: z.enum(['todo', 'in_progress', 'done']).optional(),
            priority: z.enum(['low', 'medium', 'high']).optional(),
            visibility: z.enum(['private', 'club', 'assignees']).optional(),
            limit: z.number().optional(),
            offset: z.number().optional()
          })
          .optional()
      })
    )
    .output(
      z.object({
        data: z.array(taskSchema),
        meta: z
          .object({
            total: z.number(),
            limit: z.number(),
            offset: z.number()
          })
          .optional()
      })
    )
    .errors({
      INVALID_CLUB: {
        data: z.object({
          message: z.string().default('Invalid club')
        })
      },
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('Unauthorized to view club tasks')
        })
      }
    }),

  getTaskDetails: oc
    .route({
      method: 'GET',
      description:
        'Get single task with relations (assignees, comments, activity)',
      summary: 'Get Task Details',
      tags: ['Tasks']
    })
    .input(
      z.object({
        taskId: z.string()
      })
    )
    .output(taskSchema)
    .errors({
      TASK_NOT_FOUND: {
        data: z.object({
          message: z.string().default('Task not found')
        })
      },
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('Unauthorized to view this task')
        })
      }
    }),

  addComment: oc
    .route({
      method: 'POST',
      description: 'Add comment to task',
      summary: 'Add Comment',
      tags: ['Tasks']
    })
    .input(
      z.object({
        taskId: z.string(),
        message: z.string().min(1)
      })
    )
    .output(taskCommentSchema)
    .errors({
      TASK_NOT_FOUND: {
        data: z.object({
          message: z.string().default('Task not found')
        })
      },
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('Unauthorized to comment on this task')
        })
      }
    }),

  getTaskActivity: oc
    .route({
      method: 'GET',
      description: 'Fetch activity log for a task',
      summary: 'Get Task Activity',
      tags: ['Tasks']
    })
    .input(
      z.object({
        taskId: z.string(),
        query: z
          .object({
            limit: z.number().optional(),
            offset: z.number().optional()
          })
          .optional()
      })
    )
    .output(
      z.object({
        data: z.array(taskActivityLogSchema),
        meta: z
          .object({
            total: z.number(),
            limit: z.number(),
            offset: z.number()
          })
          .optional()
      })
    )
    .errors({
      TASK_NOT_FOUND: {
        data: z.object({
          message: z.string().default('Task not found')
        })
      },
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('Unauthorized to view task activity')
        })
      }
    }),

  deleteTask: oc
    .route({
      method: 'DELETE',
      description: 'Delete a task',
      summary: 'Delete Task',
      tags: ['Tasks']
    })
    .input(
      z.object({
        taskId: z.string()
      })
    )
    .output(
      z.object({
        success: z.boolean()
      })
    )
    .errors({
      TASK_NOT_FOUND: {
        data: z.object({
          message: z.string().default('Task not found')
        })
      },
      UNAUTHORIZED: {
        data: z.object({
          message: z.string().default('Unauthorized to delete this task')
        })
      }
    })
}
