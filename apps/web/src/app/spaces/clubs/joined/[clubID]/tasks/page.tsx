'use client'

import { Badge } from '@rov/ui/components/badge'
import { Button } from '@rov/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@rov/ui/components/card'
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
import { Textarea } from '@rov/ui/components/textarea'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  MessageSquare,
  Plus,
  UserPlus,
  X
} from 'lucide-react'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { orpc } from '@/utils/orpc'

const TasksPage = () => {
  const params = useParams()
  const clubID = params?.clubID as string
  const queryClient = useQueryClient()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<
    'todo' | 'in_progress' | 'done' | 'all'
  >('all')
  const [priorityFilter, setPriorityFilter] = useState<
    'low' | 'medium' | 'high' | 'all'
  >('all')

  // Fetch club tasks
  const { data: tasksData, isLoading: isLoadingTasks } = useQuery(
    orpc.tasks.getClubTasks.queryOptions({
      input: {
        clubId: clubID,
        query: {
          status: statusFilter !== 'all' ? statusFilter : undefined,
          priority: priorityFilter !== 'all' ? priorityFilter : undefined,
          limit: 100
        }
      }
    })
  )

  // Fetch task details when selected
  const { data: taskDetails } = useQuery({
    ...orpc.tasks.getTaskDetails.queryOptions({
      input: { taskId: selectedTask || '' }
    }),
    enabled: !!selectedTask
  })

  // Create task mutation
  const createTaskMutation = useMutation(
    orpc.tasks.createTask.mutationOptions()
  )

  // Update task mutation
  const updateTaskMutation = useMutation(
    orpc.tasks.updateTask.mutationOptions()
  )

  // Add comment mutation
  const addCommentMutation = useMutation(
    orpc.tasks.addComment.mutationOptions()
  )

  const tasks = tasksData?.data || []

  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const title = formData.get('title') as string
    const description = (formData.get('description') as string) || undefined
    const priority =
      (formData.get('priority') as 'low' | 'medium' | 'high') || 'medium'
    const dueAt = formData.get('dueAt') as string
    const startAt = formData.get('startAt') as string
    const isAllDay = formData.get('isAllDay') === 'on'

    if (!title) {
      toast.error('Please fill in the task title')
      return
    }

    try {
      await createTaskMutation.mutateAsync({
        title,
        description,
        contextType: 'club',
        contextId: clubID,
        priority,
        visibility: 'club',
        dueAt: dueAt || undefined,
        startAt: startAt || undefined,
        isAllDay
      })
      toast.success('Task created successfully')
      setShowCreateForm(false)
      e.currentTarget.reset()
      queryClient.invalidateQueries({
        queryKey: orpc.tasks.getClubTasks.queryKey({
          input: { clubId: clubID }
        })
      })
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create task'
      )
    }
  }

  const handleUpdateStatus = async (
    taskId: string,
    newStatus: 'todo' | 'in_progress' | 'done'
  ) => {
    try {
      await updateTaskMutation.mutateAsync({
        taskId,
        status: newStatus
      })
      toast.success('Task status updated')
      queryClient.invalidateQueries({
        queryKey: orpc.tasks.getClubTasks.queryKey({
          input: { clubId: clubID }
        })
      })
      if (selectedTask === taskId) {
        queryClient.invalidateQueries({
          queryKey: orpc.tasks.getTaskDetails.queryKey({
            input: { taskId }
          })
        })
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update task'
      )
    }
  }

  const handleAddComment = async (taskId: string, message: string) => {
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
          input: { clubId: clubID }
        })
      })
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to add comment'
      )
    }
  }

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusIcon = (status: 'todo' | 'in_progress' | 'done') => {
    switch (status) {
      case 'done':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'todo':
        return <Circle className="h-4 w-4 text-gray-400" />
      default:
        return <Circle className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-2xl sm:text-3xl">Tasks</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Manage club tasks and track progress
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <Select
          onValueChange={(value) =>
            setStatusFilter(value as typeof statusFilter)
          }
          value={statusFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value) =>
            setPriorityFilter(value as typeof priorityFilter)
          }
          value={priorityFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Create Task Form */}
      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Task</CardTitle>
            <CardDescription>Add a new task for the club</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCreateTask}>
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Task title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Task description"
                  rows={3}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select defaultValue="medium" name="priority">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueAt">Due Date</Label>
                  <Input id="dueAt" name="dueAt" type="datetime-local" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startAt">Start Date (optional)</Label>
                <Input id="startAt" name="startAt" type="datetime-local" />
              </div>
              <div className="flex items-center gap-2">
                <input
                  className="h-4 w-4 rounded border-gray-300"
                  id="isAllDay"
                  name="isAllDay"
                  type="checkbox"
                />
                <Label className="cursor-pointer" htmlFor="isAllDay">
                  All-day task
                </Label>
              </div>
              <div className="flex gap-2">
                <Button disabled={createTaskMutation.isPending} type="submit">
                  {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
                </Button>
                <Button
                  onClick={() => setShowCreateForm(false)}
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tasks List */}
      {isLoadingTasks && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton className="h-24 w-full" key={i} />
          ))}
        </div>
      )}

      {!isLoadingTasks && tasks.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Circle className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-2 font-medium text-muted-foreground">
              No tasks yet
            </p>
            <p className="text-muted-foreground text-sm">
              Create your first task to get started
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoadingTasks && tasks.length > 0 && (
        <div className="space-y-4">
          {tasks.map((task) => (
            <Card
              className="cursor-pointer transition-all hover:shadow-md"
              key={task.id}
              onClick={() => setSelectedTask(task.id)}
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
                            Due:{' '}
                            {format(new Date(task.dueAt), 'MMM d, yyyy h:mm a')}
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
                        handleUpdateStatus(
                          task.id,
                          value as 'todo' | 'in_progress' | 'done'
                        )
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
          ))}
        </div>
      )}

      {/* Task Detail Dialog */}
      <Dialog
        onOpenChange={(open) => !open && setSelectedTask(null)}
        open={!!selectedTask}
      >
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          {taskDetails ? (
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
                  <Button
                    onClick={() => setSelectedTask(null)}
                    size="icon"
                    variant="ghost"
                  >
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
                        handleUpdateStatus(
                          taskDetails.id,
                          value as 'todo' | 'in_progress' | 'done'
                        )
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
                      if (message && taskDetails) {
                        handleAddComment(taskDetails.id, message)
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
          ) : (
            <div className="flex items-center justify-center py-8">
              <Skeleton className="h-8 w-full" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TasksPage
