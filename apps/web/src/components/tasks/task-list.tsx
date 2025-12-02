'use client'

import { TaskTable } from './task-table'
import type { Task } from './types'

interface TaskListProps {
  tasks: Task[]
  isLoading: boolean
  organizationId: string
  onTaskClick: (taskId: string) => void
  onStatusChange: (taskId: string, status: Task['status']) => void
}

export function TaskList({
  tasks,
  isLoading,
  organizationId,
  onTaskClick,
  onStatusChange
}: TaskListProps) {
  return (
    <TaskTable
      isLoading={isLoading}
      onStatusChange={onStatusChange}
      onTaskClick={onTaskClick}
      organizationId={organizationId}
      tasks={tasks}
    />
  )
}
