'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@rov/ui/components/select'
import type { TaskPriority, TaskStatus } from './types'

interface TaskFiltersProps {
  statusFilter: TaskStatus | 'all'
  priorityFilter: TaskPriority | 'all'
  onStatusFilterChange: (value: TaskStatus | 'all') => void
  onPriorityFilterChange: (value: TaskPriority | 'all') => void
}

export function TaskFilters({
  statusFilter,
  priorityFilter,
  onStatusFilterChange,
  onPriorityFilterChange
}: TaskFiltersProps) {
  return (
    <div className="mb-6 flex gap-4">
      <Select
        onValueChange={(value) =>
          onStatusFilterChange(value as typeof statusFilter)
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
          onPriorityFilterChange(value as typeof priorityFilter)
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
  )
}
