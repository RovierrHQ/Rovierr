'use client'

import type { Application } from '@rov/orpc-contracts'
import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@rov/ui/components/select'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  ExternalLink,
  MapPin,
  Pencil,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { DeleteApplicationDialog } from '@/components/career/delete-application-dialog'
import { EditApplicationDialog } from '@/components/career/edit-application-dialog'
import { orpc } from '@/utils/orpc'

export default function ApplicationDetailPage() {
  const params = useParams()
  const queryClient = useQueryClient()
  const applicationId = params.id as string
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Fetch application details
  const { data: application, isLoading } = useQuery(
    orpc.career.applications.get.queryOptions({
      input: { id: applicationId }
    })
  )

  // Update status mutation
  const updateStatusMutation = useMutation(
    orpc.career.applications.updateStatus.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['career', 'applications', 'get', { id: applicationId }]
        })
        queryClient.invalidateQueries({
          queryKey: ['career', 'applications', 'list']
        })
        queryClient.invalidateQueries({
          queryKey: ['career', 'applications', 'statistics']
        })
        toast.success('Status updated successfully')
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to update status')
      }
    })
  )

  const handleStatusChange = (newStatus: string) => {
    updateStatusMutation.mutate({
      id: applicationId,
      status: newStatus as Application['status']
    })
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'bg-chart-1/10 text-chart-1'
      case 'interview_scheduled':
        return 'bg-chart-2/10 text-chart-2'
      case 'interview_completed':
        return 'bg-chart-3/10 text-chart-3'
      case 'offer_received':
        return 'bg-green-500/10 text-green-500'
      case 'rejected':
        return 'bg-red-500/10 text-red-500'
      case 'withdrawn':
        return 'bg-gray-500/10 text-gray-500'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  // Format status for display
  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <main className="flex-1 px-6 py-8">
        <div className="mb-6">
          <Link href="/spaces/career/applications">
            <Button className="gap-2" size="sm" variant="ghost">
              <ArrowLeft className="h-4 w-4" />
              Back to Applications
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </main>
    )
  }

  if (!application) {
    return (
      <main className="flex-1 px-6 py-8">
        <div className="mb-6">
          <Link href="/spaces/career/applications">
            <Button className="gap-2" size="sm" variant="ghost">
              <ArrowLeft className="h-4 w-4" />
              Back to Applications
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Application not found</div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/spaces/career/applications">
          <Button className="gap-2" size="sm" variant="ghost">
            <ArrowLeft className="h-4 w-4" />
            Back to Applications
          </Button>
        </Link>
      </div>

      {/* Application Details */}
      <div className="mb-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <h1 className="mb-2 font-bold text-3xl text-foreground">
              {application.positionTitle}
            </h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span>{application.companyName}</span>
              </div>
              {application.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{application.location}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              className="gap-2"
              onClick={() => setIsEditDialogOpen(true)}
              size="sm"
              variant="outline"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button
              className="gap-2"
              onClick={() => setIsDeleteDialogOpen(true)}
              size="sm"
              variant="outline"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 font-medium text-sm ${getStatusColor(application.status)}`}
          >
            {formatStatus(application.status)}
          </span>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Calendar className="h-4 w-4" />
            <span>Applied on {formatDate(application.applicationDate)}</span>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Details */}
        <Card className="border-border bg-card p-6 lg:col-span-2">
          <h2 className="mb-4 font-semibold text-foreground text-xl">
            Application Details
          </h2>

          <div className="space-y-4">
            {application.jobPostUrl && (
              <div>
                <p className="mb-1 block font-medium text-foreground text-sm">
                  Job Posting
                </p>
                <a
                  className="flex items-center gap-2 text-chart-1 hover:underline"
                  href={application.jobPostUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Original Posting
                </a>
              </div>
            )}

            {application.salaryRange && (
              <div>
                <p className="mb-1 block font-medium text-foreground text-sm">
                  Salary Range
                </p>
                <p className="text-muted-foreground">
                  {application.salaryRange}
                </p>
              </div>
            )}

            {application.notes && (
              <div>
                <p className="mb-1 block font-medium text-foreground text-sm">
                  Notes
                </p>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {application.notes}
                </p>
              </div>
            )}

            {!(application.salaryRange || application.notes) && (
              <p className="text-muted-foreground text-sm">
                No additional details provided
              </p>
            )}
          </div>
        </Card>

        {/* Status Timeline */}
        <Card className="border-border bg-card p-6">
          <h2 className="mb-4 font-semibold text-foreground text-xl">Status</h2>

          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-card/50 p-3">
              <p className="mb-2 font-medium text-foreground text-sm">
                Current Status
              </p>
              <Select
                disabled={updateStatusMutation.isPending}
                onValueChange={handleStatusChange}
                value={application.status}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="interview_scheduled">
                    Interview Scheduled
                  </SelectItem>
                  <SelectItem value="interview_completed">
                    Interview Completed
                  </SelectItem>
                  <SelectItem value="offer_received">Offer Received</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border border-border bg-card/50 p-3">
              <p className="mb-1 font-medium text-foreground text-sm">
                Application Date
              </p>
              <p className="text-muted-foreground text-sm">
                {formatDate(application.applicationDate)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Edit Dialog */}
      <EditApplicationDialog
        application={application}
        onOpenChange={setIsEditDialogOpen}
        open={isEditDialogOpen}
      />

      {/* Delete Dialog */}
      <DeleteApplicationDialog
        applicationId={application.id}
        companyName={application.companyName}
        onOpenChange={setIsDeleteDialogOpen}
        open={isDeleteDialogOpen}
        positionTitle={application.positionTitle}
      />
    </main>
  )
}
