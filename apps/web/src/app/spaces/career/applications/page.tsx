'use client'

import type { Application } from '@rov/orpc-contracts'
import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import { Input } from '@rov/ui/components/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@rov/ui/components/select'
import { useQuery } from '@tanstack/react-query'
import {
  Briefcase,
  Clock,
  ExternalLink,
  FileText,
  Plus,
  Search
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { AddApplicationDialog } from '@/components/career/add-application-dialog'
import { orpc } from '@/utils/orpc'

export default function ApplicationsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<
    Application['status'] | undefined
  >(undefined)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Fetch applications
  const { data: applicationsData, isLoading } = useQuery(
    orpc.career.applications.list.queryOptions({
      input: {
        search: searchQuery || undefined,
        status: statusFilter,
        sortBy: 'recent',
        limit: 50,
        offset: 0
      }
    })
  )

  // Fetch statistics
  const { data: statistics } = useQuery(
    orpc.career.applications.statistics.queryOptions({
      input: {}
    })
  )

  const applications = applicationsData?.applications ?? []

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
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  return (
    <main className="flex-1 px-6 py-8">
      <div className="mb-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="mb-2 font-bold text-3xl text-foreground">
              My Applications
            </h2>
            <p className="text-muted-foreground">
              Track and manage your job applications
            </p>
          </div>
          <Button
            className="gap-2"
            onClick={() => setIsAddDialogOpen(true)}
            size="lg"
          >
            <Plus className="h-5 w-5" />
            Add Application
          </Button>
        </div>

        {/* Statistics Dashboard */}
        {statistics && (
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <Card className="border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">
                    Total Applications
                  </p>
                  <p className="mt-1 font-bold text-2xl text-foreground">
                    {statistics.total}
                  </p>
                </div>
                <Briefcase className="h-8 w-8 text-chart-1" />
              </div>
            </Card>

            <Card className="border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">
                    Upcoming Interviews
                  </p>
                  <p className="mt-1 font-bold text-2xl text-foreground">
                    {statistics.upcomingInterviews}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-chart-2" />
              </div>
            </Card>

            <Card className="border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">
                    Pending Responses
                  </p>
                  <p className="mt-1 font-bold text-2xl text-foreground">
                    {statistics.pendingResponses}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-chart-3" />
              </div>
            </Card>

            <Card className="border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Offers</p>
                  <p className="mt-1 font-bold text-2xl text-foreground">
                    {statistics.byStatus.offer_received || 0}
                  </p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
                  <span className="font-bold text-green-500 text-lg">✓</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute top-3 left-3 h-5 w-5 text-muted-foreground" />
            <Input
              className="h-11 pl-10"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company or position..."
              type="text"
              value={searchQuery}
            />
          </div>
          <Select
            onValueChange={(value) =>
              setStatusFilter(
                value === 'all' ? undefined : (value as Application['status'])
              )
            }
            value={statusFilter || 'all'}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
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
      </div>

      {/* Applications List */}
      {isLoading && (
        <div className="text-center text-muted-foreground">Loading...</div>
      )}

      {!isLoading && applications.length === 0 && (
        <Card className="border-border bg-card p-12 text-center">
          <Briefcase className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 font-semibold text-foreground text-lg">
            No applications yet
          </h3>
          <p className="mb-6 text-muted-foreground">
            Start tracking your job applications to stay organized
          </p>
          <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Your First Application
          </Button>
        </Card>
      )}

      {!isLoading && applications.length > 0 && (
        <div className="space-y-4">
          {applications.map((application) => (
            <Card
              className="border-border bg-card p-6 transition-shadow hover:shadow-md"
              key={application.id}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">
                        {application.positionTitle}
                      </h3>
                      <p className="text-muted-foreground">
                        {application.companyName}
                        {application.location && ` • ${application.location}`}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 font-medium text-xs ${getStatusColor(application.status)}`}
                    >
                      {formatStatus(application.status)}
                    </span>
                  </div>

                  <div className="mb-4 flex items-center gap-2 text-muted-foreground text-sm">
                    <Clock className="h-4 w-4" />
                    <span>
                      Applied {formatDate(application.applicationDate)}
                    </span>
                  </div>

                  {application.notes && (
                    <p className="mb-4 line-clamp-2 text-muted-foreground text-sm">
                      {application.notes}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Link
                      href={`/spaces/career/applications/${application.id}`}
                    >
                      <Button
                        className="gap-2 bg-transparent"
                        size="sm"
                        variant="outline"
                      >
                        <FileText className="h-3 w-3" />
                        View Details
                      </Button>
                    </Link>
                    {application.jobPostUrl && (
                      <Button
                        className="gap-2 bg-transparent"
                        onClick={() =>
                          window.open(application.jobPostUrl || '', '_blank')
                        }
                        size="sm"
                        variant="outline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Job Post
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Application Dialog */}
      <AddApplicationDialog
        onOpenChange={setIsAddDialogOpen}
        open={isAddDialogOpen}
      />
    </main>
  )
}
