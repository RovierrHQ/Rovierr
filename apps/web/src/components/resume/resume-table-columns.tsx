'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { formatDistanceToNow } from 'date-fns'

type ResumeListItem = {
  id: string
  title: string
  targetPosition: string | null
  status: 'draft' | 'published'
  updatedAt: string
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
    cell: ({ row }) => (
      <span className="inline-block w-48 font-medium">
        {row.getValue('title')}
      </span>
    )
  },
  {
    accessorKey: 'targetPosition',
    header: 'Position',
    cell: ({ row }) => (
      <span className="inline-block w-32 text-muted-foreground">
        {row.getValue('targetPosition') || 'Not specified'}
      </span>
    )
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
  }
]
