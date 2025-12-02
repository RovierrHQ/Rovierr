'use client'

import { Badge } from '@rov/ui/components/badge'
import { Button } from '@rov/ui/components/button'
import { Card, CardContent } from '@rov/ui/components/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@rov/ui/components/dialog'
import { Input } from '@rov/ui/components/input'
import { Label } from '@rov/ui/components/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@rov/ui/components/select'
import { Skeleton } from '@rov/ui/components/skeleton'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { MessageSquare, X } from 'lucide-react'
import { toast } from 'sonner'
import { orpc } from '@/utils/orpc'
import type { Task } from './types'
import { getPriorityColor } from './utils'

interface TaskDetailDialogProps {
  taskId: string | null
  organizationId: string
  onClose: () => void
}

export function TaskDetailDialog({
  taskId,
  organizationId,
  onClose
}: TaskDetailDialogProps) {
  const queryClient = useQueryClient()

  const { data: taskDetails, isLoading } = useQuery({
    ...orpc.tasks.getTaskDetails.queryOptions({
      input: { taskId: taskId || '' }
    }),
    enabled: !!taskId
  })

  const updateTaskMutation = useMutation(
    orpc.tasks.updateTask.mutationOptions()
  )

  const addCommentMutation = useMutation(
    orpc.tasks.addComment.mutationOptions()
  )

  const handleUpdateStatus = async (newStatus: Task['status']) => {
    if (!taskId) return

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
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update task'
      )
    }
  }

  const handleAddComment = async (message: string) => {
    if (!taskId) return

    try {
      await addCommentMutation.mutateAsync({
        taskId,
        message
      })
      toast.success('Comment added')
      queryClient.invalidateQueries({
        queryKey: orpc.tasks.getTaskDetails.queryKey({
          input: { taskId }
        })
      })
      queryClient.invalidateQueries({
        queryKey: orpc.tasks.getClubTasks.queryKey({
          input: { clubId: organizationId }
        })
      })
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to add comment'
      )
    }
  }

  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={!!taskId}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Skeleton className="h-8 w-full" />
          </div>
        )}
        {!isLoading && taskDetails && (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <DialogTitle className="mb-2 text-2xl">
                    {taskDetails.title}
                  </DialogTitle>
                  <DialogDescription>
                    {taskDetails.description || 'No description'}
                  </DialogDescription>
                </div>
                <Button onClick={onClose} size="icon" variant="ghost">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              {/* Task Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Status</Label>
                  <Select
                    onValueChange={(value) =>
                      handleUpdateStatus(value as Task['status'])
                    }
                    value={taskDetails.status}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Badge className={getPriorityColor(taskDetails.priority)}>
                    {taskDetails.priority}
                  </Badge>
                </div>
              </div>

              {/* Dates */}
              {(taskDetails.dueAt || taskDetails.startAt) && (
                <div className="space-y-2">
                  <Label>Dates</Label>
                  <div className="flex flex-wrap gap-4 text-sm">
                    {taskDetails.startAt && (
                      <div>
                        <span className="text-muted-foreground">Start: </span>
                        {format(
                          new Date(taskDetails.startAt),
                          'MMM d, yyyy h:mm a'
                        )}
                      </div>
                    )}
                    {taskDetails.dueAt && (
                      <div>
                        <span className="text-muted-foreground">Due: </span>
                        {format(
                          new Date(taskDetails.dueAt),
                          'MMM d, yyyy h:mm a'
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Assignees */}
              {taskDetails.assignees && taskDetails.assignees.length > 0 && (
                <div className="space-y-2">
                  <Label>Assignees</Label>
                  <div className="flex flex-wrap gap-2">
                    {taskDetails.assignees.map((assignee) => (
                      <Badge key={assignee.id} variant="secondary">
                        {assignee.userId}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments */}
              <div className="space-y-4">
                <Label>Comments</Label>
                <div className="space-y-3">
                  {taskDetails.comments && taskDetails.comments.length > 0 ? (
                    taskDetails.comments.map((comment) => (
                      <Card key={comment.id}>
                        <CardContent className="p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-muted-foreground text-sm">
                              {comment.userId}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {format(
                                new Date(comment.createdAt),
                                'MMM d, yyyy h:mm a'
                              )}
                            </span>
                          </div>
                          <p className="text-sm">{comment.message}</p>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No comments yet
                    </p>
                  )}
                </div>

                {/* Add Comment Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    const message = formData.get('message') as string
                    if (message) {
                      handleAddComment(message)
                      e.currentTarget.reset()
                    }
                  }}
                >
                  <div className="flex gap-2">
                    <Input
                      className="flex-1"
                      name="message"
                      placeholder="Add a comment..."
                    />
                    <Button
                      disabled={addCommentMutation.isPending}
                      type="submit"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
