'use client'

import type { EmailHistoryItem } from '@rov/orpc-contracts'
import { Avatar, AvatarFallback, AvatarImage } from '@rov/ui/components/avatar'
import { Badge } from '@rov/ui/components/badge'
import { Button } from '@rov/ui/components/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@rov/ui/components/table'
import { formatDistanceToNow } from 'date-fns'
import { ChevronLeft, ChevronRight, Eye, Mail } from 'lucide-react'

interface EmailHistoryProps {
  emails: EmailHistoryItem[]
  total: number
  hasMore: boolean
  currentPage: number
  onPageChange: (page: number) => void
  onViewDetails: (emailId: string) => void
  isLoading?: boolean
}

export function EmailHistory({
  emails,
  total,
  hasMore,
  currentPage,
  onPageChange,
  onViewDetails,
  isLoading = false
}: EmailHistoryProps) {
  const pageSize = 50

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
          <p className="text-muted-foreground text-sm">
            Loading email history...
          </p>
        </div>
      </div>
    )
  }

  if (emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Mail className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 font-semibold text-lg">No emails sent yet</h3>
        <p className="max-w-md text-muted-foreground text-sm">
          When you send emails to your society members, they will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Showing {emails.length} of {total} emails
        </p>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>Sender</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {emails.map((email) => (
              <TableRow key={email.id}>
                <TableCell className="max-w-md truncate font-medium">
                  {email.subject}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={email.sender.image || undefined} />
                      <AvatarFallback>
                        {email.sender.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{email.sender.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{email.recipientCount} total</div>
                    {email.successCount > 0 && (
                      <div className="text-green-600 text-xs">
                        {email.successCount} sent
                      </div>
                    )}
                    {email.failureCount > 0 && (
                      <div className="text-destructive text-xs">
                        {email.failureCount} failed
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      email.status === 'completed' ? 'default' : 'destructive'
                    }
                  >
                    {email.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {email.sentAt
                    ? formatDistanceToNow(new Date(email.sentAt), {
                        addSuffix: true
                      })
                    : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    onClick={() => onViewDetails(email.id)}
                    size="sm"
                    variant="ghost"
                  >
                    <Eye className="mr-1 h-4 w-4" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {total > pageSize && (
        <div className="flex items-center justify-between">
          <Button
            disabled={currentPage === 0}
            onClick={() => onPageChange(currentPage - 1)}
            size="sm"
            variant="outline"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          <span className="text-muted-foreground text-sm">
            Page {currentPage + 1} of {Math.ceil(total / pageSize)}
          </span>
          <Button
            disabled={!hasMore}
            onClick={() => onPageChange(currentPage + 1)}
            size="sm"
            variant="outline"
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
