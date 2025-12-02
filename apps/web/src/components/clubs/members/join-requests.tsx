'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@rov/ui/components/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@rov/ui/components/avatar'
import { Badge } from '@rov/ui/components/badge'
import { Button } from '@rov/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@rov/ui/components/card'
import { Checkbox } from '@rov/ui/components/checkbox'
import { Skeleton } from '@rov/ui/components/skeleton'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Check, ClipboardList, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { orpc } from '@/utils/orpc'

interface JoinRequestsProps {
  organizationId: string
}

export function JoinRequests({ organizationId }: JoinRequestsProps) {
  const queryClient = useQueryClient()
  const [selectedRequests, setSelectedRequests] = useState<Set<string>>(
    new Set()
  )
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [requestToReject, setRequestToReject] = useState<string | null>(null)

  const {
    data: joinRequestsData,
    isLoading,
    error
  } = useQuery(
    orpc.societyRegistration.joinRequest.list.queryOptions({
      input: {
        societyId: organizationId,
        status: ['pending'],
        limit: 100,
        offset: 0
      }
    })
  )

  const approveMutation = useMutation(
    orpc.societyRegistration.joinRequest.approve.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['join-requests', organizationId]
        })
        queryClient.invalidateQueries({
          queryKey: ['organization-members', organizationId]
        })
        toast.success('Join request approved')
        setSelectedRequests(new Set())
      },
      onError: (err: Error) => {
        toast.error(err.message || 'Failed to approve join request')
      }
    })
  )

  const rejectMutation = useMutation(
    orpc.societyRegistration.joinRequest.reject.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['join-requests', organizationId]
        })
        toast.success('Join request rejected')
        setRejectDialogOpen(false)
        setRequestToReject(null)
        setSelectedRequests(new Set())
      },
      onError: (err: Error) => {
        toast.error(err.message || 'Failed to reject join request')
      }
    })
  )

  const bulkApproveMutation = useMutation(
    orpc.societyRegistration.joinRequest.bulkApprove.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['join-requests', organizationId]
        })
        queryClient.invalidateQueries({
          queryKey: ['organization-members', organizationId]
        })
        toast.success('Join requests approved')
        setSelectedRequests(new Set())
      },
      onError: (err: Error) => {
        toast.error(err.message || 'Failed to approve join requests')
      }
    })
  )

  const bulkRejectMutation = useMutation(
    orpc.societyRegistration.joinRequest.bulkReject.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['join-requests', organizationId]
        })
        toast.success('Join requests rejected')
        setSelectedRequests(new Set())
      },
      onError: (err: Error) => {
        toast.error(err.message || 'Failed to reject join requests')
      }
    })
  )

  const handleApprove = async (requestId: string) => {
    await approveMutation.mutateAsync({ id: requestId })
  }

  const handleRejectClick = (requestId: string) => {
    setRequestToReject(requestId)
    setRejectDialogOpen(true)
  }

  const handleConfirmReject = async () => {
    if (!requestToReject) return
    await rejectMutation.mutateAsync({ id: requestToReject })
  }

  const handleBulkApprove = async () => {
    if (selectedRequests.size === 0) return
    await bulkApproveMutation.mutateAsync({
      ids: Array.from(selectedRequests)
    })
  }

  const handleBulkReject = async () => {
    if (selectedRequests.size === 0) return
    await bulkRejectMutation.mutateAsync({
      ids: Array.from(selectedRequests)
    })
  }

  const toggleRequestSelection = (requestId: string) => {
    const newSelected = new Set(selectedRequests)
    if (newSelected.has(requestId)) {
      newSelected.delete(requestId)
    } else {
      newSelected.add(requestId)
    }
    setSelectedRequests(newSelected)
  }

  const toggleSelectAll = () => {
    const requests = joinRequestsData?.requests ?? []
    if (selectedRequests.size === requests.length) {
      setSelectedRequests(new Set())
    } else {
      setSelectedRequests(new Set(requests.map((r) => r.id)))
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="mt-2 h-4 w-96" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton className="h-16 w-full" key={i.toString()} />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">
            Failed to load join requests. Please try again.
          </p>
        </CardContent>
      </Card>
    )
  }

  const requests = joinRequestsData?.requests ?? []

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Join Requests</CardTitle>
            <CardDescription>
              Review and manage requests to join this society
            </CardDescription>
          </div>
          {requests.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                disabled={
                  selectedRequests.size === 0 ||
                  approveMutation.isPending ||
                  rejectMutation.isPending ||
                  bulkApproveMutation.isPending ||
                  bulkRejectMutation.isPending
                }
                onClick={handleBulkApprove}
                size="sm"
                variant="outline"
              >
                <Check className="mr-2 h-4 w-4" />
                Approve Selected ({selectedRequests.size})
              </Button>
              <Button
                disabled={
                  selectedRequests.size === 0 ||
                  approveMutation.isPending ||
                  rejectMutation.isPending ||
                  bulkApproveMutation.isPending ||
                  bulkRejectMutation.isPending
                }
                onClick={handleBulkReject}
                size="sm"
                variant="outline"
              >
                <X className="mr-2 h-4 w-4" />
                Reject Selected ({selectedRequests.size})
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="py-12 text-center">
            <ClipboardList className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-2 font-medium text-muted-foreground">
              No pending join requests
            </p>
            <p className="text-muted-foreground text-sm">
              Users can request to join this society, and their requests will
              appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <Checkbox
                checked={
                  requests.length > 0 &&
                  selectedRequests.size === requests.length
                }
                onCheckedChange={toggleSelectAll}
              />
              <span className="text-muted-foreground text-sm">
                Select all ({requests.length})
              </span>
            </div>
            {requests.map((request) => (
              <div
                className="flex items-center gap-4 rounded-lg border p-4"
                key={request.id}
              >
                <Checkbox
                  checked={selectedRequests.has(request.id)}
                  onCheckedChange={() => toggleRequestSelection(request.id)}
                />
                <Avatar>
                  <AvatarImage
                    alt={request.userName}
                    src={request.userImage ?? ''}
                  />
                  <AvatarFallback>
                    {request.userName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium">{request.userName}</div>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <span>{request.userEmail}</span>
                    <span>•</span>
                    <span>
                      Requested{' '}
                      {format(new Date(request.submittedAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{request.status}</Badge>
                  <Button
                    disabled={
                      approveMutation.isPending ||
                      rejectMutation.isPending ||
                      bulkApproveMutation.isPending ||
                      bulkRejectMutation.isPending
                    }
                    onClick={() => handleApprove(request.id)}
                    size="sm"
                    variant="default"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    disabled={
                      approveMutation.isPending ||
                      rejectMutation.isPending ||
                      bulkApproveMutation.isPending ||
                      bulkRejectMutation.isPending
                    }
                    onClick={() => handleRejectClick(request.id)}
                    size="sm"
                    variant="outline"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <AlertDialog onOpenChange={setRejectDialogOpen} open={rejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Join Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this join request? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmReject}
              variant="destructive"
            >
              Reject Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
