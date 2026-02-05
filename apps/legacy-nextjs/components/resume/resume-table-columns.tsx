'use client'

import { Badge } from '@rov/ui/components/badge'
import type { ColumnDef } from '@tanstack/react-table'
import { formatDistanceToNow } from 'date-fns'
import { FileText, Sparkles } from 'lucide-react'

type ResumeListItem = {
  id: string
  title: string
  targetPosition: string | null
  status: 'draft' | 'published'
  updatedAt: string
  sourceResumeId: string | null
  optimizedForJobId: string | null
  appliedSuggestions: string[] | null
}

export const columns: ColumnDef<ResumeListItem>[] = [
  {
    header: '#',
    cell: ({ row }) => (
      <p className="w-16">{(row.index + 1).toString().padStart(2, '0')}</p>
    )
  },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => {
      const isOptimized = row.original.sourceResumeId !== null
      const isSource =
        row.original.optimizedForJobId === null &&
        row.original.sourceResumeId === null

      return (
        <div className="flex w-64 items-center gap-2">
          <span className="font-medium">{row.getValue('title')}</span>
          {isOptimized && (
            <Badge
              className="bg-purple-100 text-purple-700 text-xs"
              variant="secondary"
            >
              <Sparkles className="mr-1 h-3 w-3" />
              AI Optimized
            </Badge>
          )}
          {isSource && (
            <Badge className="text-xs" variant="outline">
              <FileText className="mr-1 h-3 w-3" />
              Original
            </Badge>
          )}
        </div>
      )
    }
  },
  {
    accessorKey: 'targetPosition',
    header: 'Position',
    cell: ({ row }) => {
      const targetPosition = row.getValue('targetPosition') as string | null
      const optimizedForJobId = row.original.optimizedForJobId

      return (
        <div className="w-48">
          <span className="text-muted-foreground">
            {targetPosition || 'Not specified'}
          </span>
          {optimizedForJobId && (
            <div className="mt-1 text-purple-600 text-xs">
              Optimized for specific job
            </div>
          )}
        </div>
      )
    }
  },
  {
    accessorKey: 'appliedSuggestions',
    header: 'AI Improvements',
    cell: ({ row }) => {
      const suggestions = row.original.appliedSuggestions || []
      if (suggestions.length === 0) {
        return <span className="text-muted-foreground text-sm">-</span>
      }
      return (
        <Badge className="bg-blue-50 text-blue-700" variant="secondary">
          {suggestions.length} applied
        </Badge>
      )
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <span
          className={`inline-block w-24 rounded-full px-2 py-1 text-xs ${
            status === 'published'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      )
    }
  },
  {
    accessorKey: 'updatedAt',
    header: 'Last Updated',
    cell: ({ row }) => {
      const date = new Date(row.getValue('updatedAt'))
      return (
        <span className="inline-block w-32 text-muted-foreground text-sm">
          {formatDistanceToNow(date, { addSuffix: true })}
        </span>
      )
    }
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: () => {
      // Actions will be handled by the parent component
      return null
    }
  }
]
