export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskVisibility = 'private' | 'club' | 'assignees'

export interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

export interface TaskAssignee {
  id: string
  userId: string
  user?: User
}

export interface TaskComment {
  id: string
  userId: string
  message: string
  createdAt: string
  user?: User
}

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  visibility: TaskVisibility
  dueAt?: string
  startAt?: string
  isAllDay: boolean
  assignees?: TaskAssignee[]
  comments?: TaskComment[]
  createdAt: string
  updatedAt: string
}
