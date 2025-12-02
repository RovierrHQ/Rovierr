'use client'

import { Card, CardContent } from '@rov/ui/components/card'
import { Skeleton } from '@rov/ui/components/skeleton'
import { Circle } from 'lucide-react'
import { TaskCard } from './task-card'
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
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton className="h-24 w-full" key={i} />
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Circle className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="mb-2 font-medium text-muted-foreground">No tasks yet</p>
          <p className="text-muted-foreground text-sm">
            Create your first task to get started
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          onClick={() => onTaskClick(task.id)}
          onStatusChange={onStatusChange}
          organizationId={organizationId}
          task={task}
        />
      ))}
    </div>
  )
}
