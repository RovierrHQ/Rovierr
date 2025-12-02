'use client'

import { Badge } from '@rov/ui/components/badge'
import { Card, CardContent } from '@rov/ui/components/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@rov/ui/components/select'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Calendar, MessageSquare, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { orpc } from '@/utils/orpc'
import type { Task } from './types'
import { getPriorityColor, getStatusIcon } from './utils'

interface TaskCardProps {
  task: Task
  organizationId: string
  onStatusChange: (taskId: string, status: Task['status']) => void
  onClick: () => void
}

export function TaskCard({
  task,
  organizationId,
  onStatusChange,
  onClick
}: TaskCardProps) {
  const queryClient = useQueryClient()

  const updateTaskMutation = useMutation(
    orpc.tasks.updateTask.mutationOptions()
  )

  const handleStatusChange = async (newStatus: Task['status']) => {
    try {
      await updateTaskMutation.mutateAsync({
        taskId: task.id,
        status: newStatus
      })
      toast.success('Task status updated')
      queryClient.invalidateQueries({
        queryKey: orpc.tasks.getClubTasks.queryKey({
          input: { clubId: organizationId }
        })
      })
      queryClient.invalidateQueries({
        queryKey: orpc.tasks.getTaskDetails.queryKey({
          input: { taskId: task.id }
        })
      })
      onStatusChange(task.id, newStatus)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update task'
      )
    }
  }

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              {getStatusIcon(task.status)}
              <h3 className="font-semibold text-lg">{task.title}</h3>
              <Badge className={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
            </div>
            {task.description && (
              <p className="text-muted-foreground text-sm">
                {task.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
              {task.dueAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Due: {format(new Date(task.dueAt), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
              )}
              {task.assignees && task.assignees.length > 0 && (
                <div className="flex items-center gap-1">
                  <UserPlus className="h-4 w-4" />
                  <span>{task.assignees.length} assignee(s)</span>
                </div>
              )}
              {task.comments && task.comments.length > 0 && (
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{task.comments.length} comment(s)</span>
                </div>
              )}
            </div>
          </div>
          <div
            className="ml-4"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Select
              onValueChange={(value) =>
                handleStatusChange(value as Task['status'])
              }
              value={task.status}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
