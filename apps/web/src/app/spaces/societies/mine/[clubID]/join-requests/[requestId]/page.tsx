'use client'

import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import { Textarea } from '@rov/ui/components/textarea'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  Mail,
  Phone,
  User,
  XCircle
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'
import { orpc } from '@/utils/orpc'

const JoinRequestDetailPage = () => {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const societyId = params.clubID as string
  const requestId = params.requestId as string
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [verificationNotes, setVerificationNotes] = useState('')

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

  // Fetch join request details
  const { data: request, isLoading } = useQuery({
    ...orpc.societyRegistration.joinRequest.get.queryOptions({
      input: { id: requestId }
    }),
    enabled: !!requestId && canManage === true
  })

  // Approve mutation
  const approveMutation = useMutation(
    orpc.societyRegistration.joinRequest.approve.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['join-request', requestId]
        })
        toast.success('Join request approved successfully!')
        router.push(`/spaces/societies/mine/${societyId}/join-requests`)
      },
      onError: () => {
        toast.error('Failed to approve join request')
      }
    })
  )

  // Reject mutation
  const rejectMutation = useMutation(
    orpc.societyRegistration.joinRequest.reject.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['join-request', requestId]
        })
        toast.success('Join request rejected')
        router.push(`/spaces/societies/mine/${societyId}/join-requests`)
      },
      onError: () => {
        toast.error('Failed to reject join request')
      }
    })
  )

  // Verify payment mutation
  const verifyPaymentMutation = useMutation(
    orpc.societyRegistration.payment.verify.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['join-request', requestId]
        })
        toast.success('Payment verified successfully!')
      },
      onError: () => {
        toast.error('Failed to verify payment')
      }
    })
  )

  // Mark payment as not verified mutation
  const markNotVerifiedMutation = useMutation(
    orpc.societyRegistration.payment.markNotVerified.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['join-request', requestId]
        })
        toast.success('Payment marked as not verified')
      },
      onError: () => {
        toast.error('Failed to mark payment as not verified')
      }
    })
  )

  const handleApprove = () => {
    approveMutation.mutate({ id: requestId })
  }

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }
    rejectMutation.mutate({ id: requestId, reason: rejectionReason })
  }

  const handleVerifyPayment = () => {
    verifyPaymentMutation.mutate({
      id: requestId,
      notes: verificationNotes || undefined
    })
  }

  const handleMarkNotVerified = () => {
    if (!verificationNotes.trim()) {
      toast.error('Please provide a reason')
      return
    }
    markNotVerifiedMutation.mutate({
      id: requestId,
      reason: verificationNotes
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
            You don't have permission to view this join request.
          </p>
        </Card>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <Card className="p-6">
          <h1 className="mb-2 font-semibold text-2xl">Request Not Found</h1>
          <p className="text-muted-foreground">
            This join request doesn't exist or has been removed.
          </p>
        </Card>
      </div>
    )
  }

  const canApprove =
    request.status === 'pending' || request.status === 'payment_completed'
  const canReject = request.status === 'pending'
  const needsPaymentVerification = request.paymentStatus === 'pending'

  const getStatusClassName = () => {
    if (request.status === 'approved') {
      return 'bg-green-100 text-green-700'
    }
    if (request.status === 'rejected') {
      return 'bg-red-100 text-red-700'
    }
    return 'bg-yellow-100 text-yellow-700'
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Button
          onClick={() =>
            router.push(`/spaces/societies/mine/${societyId}/join-requests`)
          }
          size="sm"
          variant="ghost"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Join Requests
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="mb-2 font-bold text-3xl">Join Request Details</h1>
        <p className="text-muted-foreground">
          Review and manage this membership application
        </p>
      </div>

      <div className="space-y-6">
        {/* Status Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="mb-1 font-semibold text-lg">Status</h2>
              <p className="text-muted-foreground text-sm">
                Current application status
              </p>
            </div>
            <div
              className={`flex items-center gap-2 rounded-full px-4 py-2 ${getStatusClassName()}`}
            >
              {request.status === 'approved' && (
                <CheckCircle className="h-5 w-5" />
              )}
              {request.status === 'rejected' && <XCircle className="h-5 w-5" />}
              {request.status !== 'approved' &&
                request.status !== 'rejected' && (
                  <Loader2 className="h-5 w-5" />
                )}
              <span className="font-semibold capitalize">
                {request.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </Card>

        {/* Applicant Info */}
        <Card className="p-6">
          <h2 className="mb-4 font-semibold text-lg">Applicant Information</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground text-sm">Name</p>
                <p className="font-medium">{request.user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground text-sm">Email</p>
                <p className="font-medium">{request.user.email}</p>
              </div>
            </div>
            {request.user.phoneNumber && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground text-sm">Phone</p>
                  <p className="font-medium">{request.user.phoneNumber}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Form Responses */}
        <Card className="p-6">
          <h2 className="mb-4 font-semibold text-lg">Application Responses</h2>
          <div className="space-y-4">
            {Object.entries(request.formResponse.answers).map(
              ([key, value]) => (
                <div key={key}>
                  <p className="mb-1 font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-muted-foreground">{String(value)}</p>
                </div>
              )
            )}
          </div>
        </Card>

        {/* Payment Section */}
        {request.paymentStatus !== 'not_required' && (
          <Card className="p-6">
            <h2 className="mb-4 font-semibold text-lg">Payment Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-muted-foreground text-sm">Amount</p>
                <p className="font-bold text-2xl">${request.paymentAmount}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Status</p>
                <p className="font-medium capitalize">
                  {request.paymentStatus.replace('_', ' ')}
                </p>
              </div>

              {needsPaymentVerification && (
                <div className="space-y-4 rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4">
                  <p className="font-medium">Payment Verification Required</p>
                  <Textarea
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder="Add notes about payment verification..."
                    rows={3}
                    value={verificationNotes}
                  />
                  <div className="flex gap-2">
                    <Button
                      disabled={verifyPaymentMutation.isPending}
                      onClick={handleVerifyPayment}
                    >
                      {verifyPaymentMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Verify Payment'
                      )}
                    </Button>
                    <Button
                      disabled={markNotVerifiedMutation.isPending}
                      onClick={handleMarkNotVerified}
                      variant="outline"
                    >
                      Mark as Not Verified
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Actions */}
        {(canApprove || canReject) && (
          <Card className="p-6">
            <h2 className="mb-4 font-semibold text-lg">Actions</h2>
            <div className="space-y-4">
              {canApprove && (
                <div>
                  <Button
                    className="w-full"
                    disabled={approveMutation.isPending}
                    onClick={handleApprove}
                    size="lg"
                  >
                    {approveMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve Application
                      </>
                    )}
                  </Button>
                </div>
              )}

              {canReject && (
                <div className="space-y-2">
                  {showRejectDialog ? (
                    <div className="space-y-2 rounded-lg border-2 border-red-200 bg-red-50 p-4">
                      <p className="font-medium">Rejection Reason</p>
                      <Textarea
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Provide a reason for rejection..."
                        rows={3}
                        value={rejectionReason}
                      />
                      <div className="flex gap-2">
                        <Button
                          disabled={rejectMutation.isPending}
                          onClick={handleReject}
                          variant="destructive"
                        >
                          {rejectMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Rejecting...
                            </>
                          ) : (
                            'Confirm Rejection'
                          )}
                        </Button>
                        <Button
                          onClick={() => setShowRejectDialog(false)}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => setShowRejectDialog(true)}
                      size="lg"
                      variant="destructive"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject Application
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Metadata */}
        <Card className="p-6">
          <h2 className="mb-4 font-semibold text-lg">Request Metadata</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground text-sm">Submitted</p>
              <p className="font-medium">
                {new Date(request.submittedAt).toLocaleString()}
              </p>
            </div>
            {request.reviewedAt && (
              <div>
                <p className="text-muted-foreground text-sm">Reviewed</p>
                <p className="font-medium">
                  {new Date(request.reviewedAt).toLocaleString()}
                </p>
              </div>
            )}
            {request.rejectionReason && (
              <div className="sm:col-span-2">
                <p className="text-muted-foreground text-sm">
                  Rejection Reason
                </p>
                <p className="font-medium">{request.rejectionReason}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default JoinRequestDetailPage
