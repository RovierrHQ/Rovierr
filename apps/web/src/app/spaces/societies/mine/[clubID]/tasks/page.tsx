'use client'

import { Button } from '@rov/ui/components/button'
import { useQueryClient } from '@tanstack/react-query'
import { CreateTaskDialog } from '@web/components/tasks/create-task-dialog'
import { TaskDetailDialog } from '@web/components/tasks/task-detail-dialog'
import { TaskFilters } from '@web/components/tasks/task-filters'
import { TaskList } from '@web/components/tasks/task-list'
import type { Task } from '@web/components/tasks/types'
import api, { useQuery } from '@web/lib/api-client'
import { Plus } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useState } from 'react'

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
    ['tasks', 'club', clubID, statusFilter, priorityFilter],
    () =>
      api.tasks.club({ clubId: clubID }).get({
        query: {
          status: statusFilter !== 'all' ? statusFilter : undefined,
          priority: priorityFilter !== 'all' ? priorityFilter : undefined,
          limit: 100
        }
      }),
    {
      enabled: !!clubID
    }
  )

  const tasks = (tasksData?.data || []) as Task[]

  const handleTaskCreated = () => {
    queryClient.invalidateQueries({
      queryKey: ['tasks', 'club', clubID]
    })
  }

  const handleStatusChange = () => {
    // Status change is handled in TaskCard component
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
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </div>

      <TaskFilters
        onPriorityFilterChange={setPriorityFilter}
        onStatusFilterChange={setStatusFilter}
        priorityFilter={priorityFilter}
        statusFilter={statusFilter}
      />

      <TaskList
        isLoading={isLoadingTasks}
        onStatusChange={handleStatusChange}
        onTaskClick={setSelectedTask}
        organizationId={clubID}
        tasks={tasks}
      />

      <CreateTaskDialog
        onOpenChange={setShowCreateForm}
        onSuccess={handleTaskCreated}
        open={showCreateForm}
        organizationId={clubID}
      />

      <TaskDetailDialog
        onClose={() => setSelectedTask(null)}
        organizationId={clubID}
        taskId={selectedTask}
      />
    </div>
  )
}

export default TasksPage
