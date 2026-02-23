import { Button } from '@rov/ui/components/button'
import {
  queryOptions,
  useQueryClient,
  useSuspenseQuery
} from '@tanstack/react-query'
import {
  createFileRoute,
  useNavigate,
  useParams,
  useSearch
} from '@tanstack/react-router'
import { CreateTaskDialog } from '@web/components/tasks/create-task-dialog'
import { TaskDetailDialog } from '@web/components/tasks/task-detail-dialog'
import { TaskFilters } from '@web/components/tasks/task-filters'
import { TaskList } from '@web/components/tasks/task-list'
import type { Task } from '@web/components/tasks/types'
import api from '@web/lib/api-client'
import { Plus } from 'lucide-react'
import { useState } from 'react'

// 1. Define the Search Params Schema for type-safety
type TaskSearch = {
  status: 'todo' | 'in_progress' | 'done' | 'all'
  priority: 'low' | 'medium' | 'high' | 'all'
}

// 2. Define Query Options (Reusable for Loader + Component)
const tasksQueryOptions = (clubId: string, search: TaskSearch) =>
  queryOptions({
    queryKey: ['tasks', 'getClubTasks', { clubId, ...search }],
    queryFn: async () => {
      const res = await api.tasks.club({ clubId }).get({
        query: {
          limit: 100,
          status: search.status !== 'all' ? search.status : undefined,
          priority: search.priority !== 'all' ? search.priority : undefined
        }
      })
      return (res.data || []) as Task[]
    }
  })

// 3. Configure the Route
export const Route = createFileRoute('/spaces/societies/mine/$clubID/tasks')({
  // Validate and provide defaults for URL search params
  validateSearch: (search: Record<string, unknown>): TaskSearch => ({
    status: (search.status as TaskSearch['status']) || 'all',
    priority: (search.priority as TaskSearch['priority']) || 'all'
  }),
  // Pre-fetch data while the route is loading
  loader: ({ context, params, deps }) =>
    context.queryClient.ensureQueryData(
      tasksQueryOptions(params.clubID, deps as TaskSearch)
    ),
  loaderDeps: ({ search }): TaskSearch => ({
    status: search.status,
    priority: search.priority
  }),
  component: TasksPage
})

function TasksPage() {
  // Use TanStack Router hooks instead of Next.js
  const params = useParams({ from: '/spaces/societies/mine/$clubID/tasks' })
  const search = useSearch({ from: '/spaces/societies/mine/$clubID/tasks' })
  const navigate = useNavigate({ from: '/spaces/societies/mine/$clubID/tasks' })
  const clubID = params.clubID
  const { status, priority } = search
  const queryClient = useQueryClient()

  // Local UI state for modals
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedTask, setSelectedTask] = useState<string | null>(null)

  // 4. Fetch data (uses the cache populated by the loader)
  const { data: tasks } = useSuspenseQuery(
    tasksQueryOptions(clubID, { status, priority })
  )

  // 5. Update filters via URL navigation
  const updateFilters = (updates: Partial<TaskSearch>) => {
    navigate({
      search: (prev) => ({ ...prev, ...updates })
    })
  }

  const handleTaskCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['tasks', 'getClubTasks'] })
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
        onPriorityFilterChange={(val) =>
          updateFilters({ priority: val as any })
        }
        onStatusFilterChange={(val) => updateFilters({ status: val as any })}
        priorityFilter={priority}
        statusFilter={status}
      />

      <TaskList
        isLoading={false}
        onStatusChange={() => {}} // useSuspenseQuery means we are loaded or handled by a boundary
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
