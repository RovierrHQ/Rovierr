import { CheckCircle2, Circle, Clock } from 'lucide-react'
import type { TaskPriority, TaskStatus } from './types'

export function getPriorityColor(taskPriority: TaskPriority): string {
  switch (taskPriority) {
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

export function getStatusIcon(status: TaskStatus): React.ReactElement {
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
