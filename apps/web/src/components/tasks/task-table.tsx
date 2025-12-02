'use client'

import { Badge } from '@rov/ui/components/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@rov/ui/components/select'
import { Skeleton } from '@rov/ui/components/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@rov/ui/components/table'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Calendar, MessageSquare, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { orpc } from '@/utils/orpc'
import type { Task } from './types'
import { getPriorityColor, getStatusIcon } from './utils'

interface TaskTableProps {
  tasks: Task[]
  isLoading: boolean
  organizationId: string
  onTaskClick: (taskId: string) => void
  onStatusChange: (taskId: string, status: Task['status']) => void
}

export function TaskTable({
  tasks,
  isLoading,
  organizationId,
  onTaskClick,
  onStatusChange
}: TaskTableProps) {
  const queryClient = useQueryClient()

  const updateTaskMutation = useMutation(
    orpc.tasks.updateTask.mutationOptions()
  )

  const handleStatusChange = async (
    taskId: string,
    newStatus: Task['status']
  ) => {
    try {
      await updateTaskMutation.mutateAsync({
        taskId,
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
          input: { taskId }
        })
      })
      onStatusChange(taskId, newStatus)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update task'
      )
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton className="h-16 w-full" key={i} />
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="mb-2 font-medium text-muted-foreground">No tasks yet</p>
        <p className="text-muted-foreground text-sm">
          Create your first task to get started
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Status</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Assignees</TableHead>
            <TableHead>Comments</TableHead>
            <TableHead className="w-[140px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow
              className="cursor-pointer"
              key={task.id}
              onClick={() => onTaskClick(task.id)}
            >
              <TableCell>
                <div className="flex items-center">
                  {getStatusIcon(task.status)}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{task.title}</div>
                  {task.description && (
                    <div className="line-clamp-1 text-muted-foreground text-sm">
                      {task.description}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
              </TableCell>
              <TableCell>
                {task.dueAt ? (
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {format(new Date(task.dueAt), 'MMM d, yyyy')}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">—</span>
                )}
              </TableCell>
              <TableCell>
                {task.assignees && task.assignees.length > 0 ? (
                  <div className="flex items-center gap-1 text-sm">
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                    <span>{task.assignees.length}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">—</span>
                )}
              </TableCell>
              <TableCell>
                {task.comments && task.comments.length > 0 ? (
                  <div className="flex items-center gap-1 text-sm">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span>{task.comments.length}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">—</span>
                )}
              </TableCell>
              <TableCell
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <Select
                  onValueChange={(value) =>
                    handleStatusChange(task.id, value as Task['status'])
                  }
                  value={task.status}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
