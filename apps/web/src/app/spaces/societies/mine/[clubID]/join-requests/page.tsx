'use client'

import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import { Checkbox } from '@rov/ui/components/checkbox'
import { Input } from '@rov/ui/components/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@rov/ui/components/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@rov/ui/components/table'
import { Textarea } from '@rov/ui/components/textarea'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  CheckCircle,
  CheckSquare,
  Clock,
  Loader2,
  Search,
  XCircle
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'
import { orpc } from '@/utils/orpc'

const JoinRequestsPage = () => {
  const params = useParams()
  const router = useRouter()
  const societyId = params.clubID as string

  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0)
  const limit = 20

  // Bulk operations state
  const [selectedRequests, setSelectedRequests] = useState<Set<string>>(
    new Set()
  )
  const [showBulkRejectDialog, setShowBulkRejectDialog] = useState(false)
  const [bulkRejectionReason, setBulkRejectionReason] = useState('')

  const queryClient = useQueryClient()

  // Check if user has permission
  const { data: canManage } = useQuery({
    queryKey: ['user-permission-settings', societyId],
    queryFn: async () => {
      try {
        const result = await authClient.organization.hasPermission({
          permissions: {
            organization: ['update']
          },
          organizationId: societyId
        })
        return result?.data?.success ?? false
      } catch {
        return false
      }
    },
    enabled: !!societyId
  })

  // Fetch join requests
  const { data, isLoading } = useQuery({
    ...orpc.societyRegistration.joinRequest.list.queryOptions({
      input: {
        societyId,
        status:
          statusFilter === 'all'
            ? undefined
            : ([statusFilter] as Array<
                | 'pending'
                | 'approved'
                | 'rejected'
                | 'payment_pending'
                | 'payment_completed'
              >),
        paymentStatus:
          paymentFilter === 'all'
            ? undefined
            : ([paymentFilter] as Array<
                'not_required' | 'pending' | 'verified' | 'not_verified'
              >),
        limit,
        offset: page * limit
      }
    }),
    enabled: !!societyId && canManage === true
  })

  // Bulk approve mutation
  const bulkApproveMutation = useMutation(
    orpc.societyRegistration.joinRequest.bulkApprove.mutationOptions({
      onSuccess: (result) => {
        queryClient.invalidateQueries({
          queryKey: ['societyRegistration', 'joinRequest', 'list']
        })
        setSelectedRequests(new Set())
        toast.success(
          `Successfully approved ${result.successful} request(s)${result.failed > 0 ? `. ${result.failed} failed.` : ''}`
        )
      },
      onError: () => {
        toast.error('Failed to approve requests')
      }
    })
  )

  // Bulk reject mutation
  const bulkRejectMutation = useMutation(
    orpc.societyRegistration.joinRequest.bulkReject.mutationOptions({
      onSuccess: (result) => {
        queryClient.invalidateQueries({
          queryKey: ['societyRegistration', 'joinRequest', 'list']
        })
        setSelectedRequests(new Set())
        setShowBulkRejectDialog(false)
        setBulkRejectionReason('')
        toast.success(
          `Successfully rejected ${result.successful} request(s)${result.failed > 0 ? `. ${result.failed} failed.` : ''}`
        )
      },
      onError: () => {
        toast.error('Failed to reject requests')
      }
    })
  )

  const handleSelectAll = () => {
    if (selectedRequests.size === filteredRequests.length) {
      setSelectedRequests(new Set())
    } else {
      setSelectedRequests(new Set(filteredRequests.map((r) => r.id)))
    }
  }

  const handleSelectRequest = (requestId: string) => {
    const newSelected = new Set(selectedRequests)
    if (newSelected.has(requestId)) {
      newSelected.delete(requestId)
    } else {
      newSelected.add(requestId)
    }
    setSelectedRequests(newSelected)
  }

  const handleBulkApprove = () => {
    if (selectedRequests.size === 0) {
      toast.error('Please select at least one request')
      return
    }
    bulkApproveMutation.mutate({ ids: Array.from(selectedRequests) })
  }

  const handleBulkReject = () => {
    if (selectedRequests.size === 0) {
      toast.error('Please select at least one request')
      return
    }
    if (!bulkRejectionReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }
    bulkRejectMutation.mutate({
      ids: Array.from(selectedRequests),
      reason: bulkRejectionReason
    })
  }

  if (isLoading || canManage === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!canManage) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <Card className="p-6">
          <h1 className="mb-2 font-semibold text-2xl">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to view join requests.
          </p>
          <Button asChild className="mt-4" variant="outline">
            <Link href={`/spaces/societies/mine/${societyId}`}>
              Back to Dashboard
            </Link>
          </Button>
        </Card>
      </div>
    )
  }

  const filteredRequests =
    data?.requests.filter((request) => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return (
        request.userName.toLowerCase().includes(query) ||
        request.userEmail.toLowerCase().includes(query)
      )
    }) || []

  const getStatusBadge = (
    status: string
  ): { icon: React.ReactNode; color: string; label: string } => {
    switch (status) {
      case 'pending':
        return {
          icon: <Clock className="h-4 w-4" />,
          color: 'text-yellow-600',
          label: 'Pending'
        }
      case 'approved':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          color: 'text-green-600',
          label: 'Approved'
        }
      case 'rejected':
        return {
          icon: <XCircle className="h-4 w-4" />,
          color: 'text-red-600',
          label: 'Rejected'
        }
      case 'payment_pending':
        return {
          icon: <Clock className="h-4 w-4" />,
          color: 'text-orange-600',
          label: 'Payment Pending'
        }
      case 'payment_completed':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          color: 'text-blue-600',
          label: 'Payment Completed'
        }
      default:
        return {
          icon: <Clock className="h-4 w-4" />,
          color: 'text-gray-600',
          label: status
        }
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Button
          onClick={() => router.push(`/spaces/societies/mine/${societyId}`)}
          size="sm"
          variant="ghost"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="mb-2 font-bold text-3xl">Join Requests</h1>
        <p className="text-muted-foreground">
          Manage membership applications for your society
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6 p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              value={searchQuery}
            />
          </div>

          <Select onValueChange={setStatusFilter} value={statusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="payment_pending">Payment Pending</SelectItem>
              <SelectItem value="payment_completed">
                Payment Completed
              </SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={setPaymentFilter} value={paymentFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payment Status</SelectItem>
              <SelectItem value="not_required">Not Required</SelectItem>
              <SelectItem value="pending">Payment Pending</SelectItem>
              <SelectItem value="verified">Payment Verified</SelectItem>
              <SelectItem value="not_verified">Not Verified</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Bulk Actions Toolbar */}
      {selectedRequests.size > 0 && (
        <Card className="mb-4 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-primary" />
              <span className="font-medium">
                {selectedRequests.size} request(s) selected
              </span>
            </div>
            <div className="flex gap-2">
              {showBulkRejectDialog ? (
                <div className="flex items-center gap-2">
                  <Textarea
                    className="h-10 min-w-[300px]"
                    onChange={(e) => setBulkRejectionReason(e.target.value)}
                    placeholder="Rejection reason..."
                    value={bulkRejectionReason}
                  />
                  <Button
                    disabled={bulkRejectMutation.isPending}
                    onClick={handleBulkReject}
                    size="sm"
                    variant="destructive"
                  >
                    {bulkRejectMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Rejecting...
                      </>
                    ) : (
                      'Confirm Reject'
                    )}
                  </Button>
                  <Button
                    onClick={() => setShowBulkRejectDialog(false)}
                    size="sm"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    disabled={bulkApproveMutation.isPending}
                    onClick={handleBulkApprove}
                    size="sm"
                    variant="default"
                  >
                    {bulkApproveMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve Selected
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setShowBulkRejectDialog(true)}
                    size="sm"
                    variant="destructive"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject Selected
                  </Button>
                  <Button
                    onClick={() => setSelectedRequests(new Set())}
                    size="sm"
                    variant="outline"
                  >
                    Clear Selection
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Results */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      filteredRequests.length > 0 &&
                      selectedRequests.size === filteredRequests.length
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Applicant</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center" colSpan={7}>
                    <div className="py-8 text-muted-foreground">
                      No join requests found
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((request) => {
                  const statusBadge = getStatusBadge(request.status)
                  const canSelect =
                    request.status === 'pending' ||
                    request.status === 'payment_completed'
                  return (
                    <TableRow key={request.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRequests.has(request.id)}
                          disabled={!canSelect}
                          onCheckedChange={() =>
                            handleSelectRequest(request.id)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {request.userName}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {request.userEmail}
                      </TableCell>
                      <TableCell>
                        <div
                          className={`flex items-center gap-1 ${statusBadge.color}`}
                        >
                          {statusBadge.icon}
                          <span className="text-sm">{statusBadge.label}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {request.paymentStatus === 'not_required'
                            ? 'N/A'
                            : request.paymentAmount || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(request.submittedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button asChild size="sm" variant="outline">
                          <Link
                            href={`/spaces/societies/mine/${societyId}/join-requests/${request.id}`}
                          >
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {data && data.total > limit && (
          <div className="flex items-center justify-between border-t p-4">
            <div className="text-muted-foreground text-sm">
              Showing {page * limit + 1} to{' '}
              {Math.min((page + 1) * limit, data.total)} of {data.total}{' '}
              requests
            </div>
            <div className="flex gap-2">
              <Button
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                size="sm"
                variant="outline"
              >
                Previous
              </Button>
              <Button
                disabled={!data.hasMore}
                onClick={() => setPage(page + 1)}
                size="sm"
                variant="outline"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

export default JoinRequestsPage
