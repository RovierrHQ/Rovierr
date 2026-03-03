import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import { Textarea } from '@rov/ui/components/textarea'
import {
  useQueryClient,
  useQuery as useTanstackQuery
} from '@tanstack/react-query'
import { createFileRoute, useParams, useRouter } from '@tanstack/react-router'
import api, { useMutation as useTreatyMutation } from '@web/lib/api-client'
import { authClient } from '@web/lib/auth-client'
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  Mail,
  Phone,
  User,
  XCircle
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute(
  '/spaces/societies/mine/$clubID/join-requests/$requestId'
)({
  component: JoinRequestDetailPage
})

// ── 1. Status Badge ──────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const className =
    status === 'approved'
      ? 'bg-green-100 text-green-700'
      : status === 'rejected'
        ? 'bg-red-100 text-red-700'
        : 'bg-yellow-100 text-yellow-700'

  return (
    <div
      className={`flex items-center gap-2 rounded-full px-4 py-2 ${className}`}
    >
      {status === 'approved' && <CheckCircle className="h-5 w-5" />}
      {status === 'rejected' && <XCircle className="h-5 w-5" />}
      {status !== 'approved' && status !== 'rejected' && (
        <Loader2 className="h-5 w-5" />
      )}
      <span className="font-semibold capitalize">
        {status.replace('_', ' ')}
      </span>
    </div>
  )
}

// ── 2. Reject Dialog ─────────────────────────────────────────────────────────
function RejectDialog({
  isPending,
  onConfirm,
  onCancel
}: {
  isPending: boolean
  onConfirm: (reason: string) => void
  onCancel: () => void
}) {
  const [reason, setReason] = useState('')

  return (
    <div className="space-y-2 rounded-lg border-2 border-red-200 bg-red-50 p-4">
      <p className="font-medium">Rejection Reason</p>
      <Textarea
        onChange={(e) => setReason(e.target.value)}
        placeholder="Provide a reason for rejection..."
        rows={3}
        value={reason}
      />
      <div className="flex gap-2">
        <Button
          disabled={isPending}
          onClick={() => {
            if (!reason.trim()) {
              toast.error('Please provide a reason for rejection')
              return
            }
            onConfirm(reason)
          }}
          variant="destructive"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Rejecting...
            </>
          ) : (
            'Confirm Rejection'
          )}
        </Button>
        <Button onClick={onCancel} variant="outline">
          Cancel
        </Button>
      </div>
    </div>
  )
}

// ── 3. Payment Verification ──────────────────────────────────────────────────
function PaymentVerification({
  isVerifying,
  isMarking,
  onVerify,
  onMarkNotVerified
}: {
  isVerifying: boolean
  isMarking: boolean
  onVerify: (notes?: string) => void
  onMarkNotVerified: (reason: string) => void
}) {
  const [notes, setNotes] = useState('')

  return (
    <div className="space-y-4 rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4">
      <p className="font-medium">Payment Verification Required</p>
      <Textarea
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add notes about payment verification..."
        rows={3}
        value={notes}
      />
      <div className="flex gap-2">
        <Button
          disabled={isVerifying}
          onClick={() => onVerify(notes || undefined)}
        >
          {isVerifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify Payment'
          )}
        </Button>
        <Button
          disabled={isMarking}
          onClick={() => {
            if (!notes.trim()) {
              toast.error('Please provide a reason')
              return
            }
            onMarkNotVerified(notes)
          }}
          variant="outline"
        >
          Mark as Not Verified
        </Button>
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
function JoinRequestDetailPage() {
  const params = useParams({
    from: '/spaces/societies/mine/$clubID/join-requests/$requestId'
  })
  const router = useRouter()
  const queryClient = useQueryClient()
  const societyId = params.clubID
  const requestId = params.requestId
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  // Check if user has permission
  const { data: canManage } = useTanstackQuery({
    queryKey: ['user-permission-settings', societyId],
    queryFn: async () => {
      try {
        const result = await authClient.organization.hasPermission({
          permissions: { organization: ['update'] },
          organizationId: societyId
        })
        return result.data
      } catch {
        return false
      }
    },
    enabled: !!societyId
  })

  // Fetch join request details
  const { data: request, isLoading } = useTanstackQuery({
    queryKey: ['registration', 'joinRequest', 'get', requestId],
    queryFn: async () => {
      const res = await api.society.registration['join-request']({
        id: requestId
      }).get()
      return res.data
    },
    enabled: !!requestId
  })

  // Approve mutation
  const approveMutation = useTreatyMutation(
    (variables: { id: string }) =>
      api.society.registration['join-request']({
        id: variables.id
      }).approve.post(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['join-request', requestId] })
        toast.success('Join request approved successfully!')
        router.navigate({
          to: '/spaces/societies/mine/$clubID/join-requests',
          params: { clubID: societyId }
        })
      },
      onError: () => {
        toast.error('Failed to approve join request')
      }
    }
  )

  // Reject mutation
  const rejectMutation = useTreatyMutation(
    (variables: { id: string; reason: string }) =>
      api.society.registration['join-request']({
        id: variables.id
      }).reject.post({ reason: variables.reason }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['join-request', requestId] })
        toast.success('Join request rejected')
        router.navigate({
          to: '/spaces/societies/mine/$clubID/join-requests',
          params: { clubID: societyId }
        })
      },
      onError: () => {
        toast.error('Failed to reject join request')
      }
    }
  )

  // Verify payment mutation
  const verifyPaymentMutation = useTreatyMutation(
    (variables: { id: string; notes?: string }) =>
      api.society.registration['join-request']
        .payment({ id: variables.id })
        .verify.post({ notes: variables.notes }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['join-request', requestId] })
        toast.success('Payment verified successfully!')
      },
      onError: () => {
        toast.error('Failed to verify payment')
      }
    }
  )

  // Mark payment as not verified mutation
  const markNotVerifiedMutation = useTreatyMutation(
    (variables: { id: string; reason: string }) =>
      api.society.registration['join-request']
        .payment({ id: variables.id })
        .unverify.post({ reason: variables.reason }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['join-request', requestId] })
        toast.success('Payment marked as not verified')
      },
      onError: () => {
        toast.error('Failed to mark payment as not verified')
      }
    }
  )

  // ── Loading / Access / Not Found guards ─────────────────────────────────
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
            You don&apos;t have permission to view this join request.
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
            This join request doesn&apos;t exist or has been removed.
          </p>
        </Card>
      </div>
    )
  }

  // ── Data ─────────────────────────────────────────────────────────────────
  const req = request
  const canApprove =
    req.status === 'pending' || req.status === 'payment_completed'
  const canReject = req.status === 'pending'
  const needsPaymentVerification = req.paymentStatus === 'pending'

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Back button */}
      <div className="mb-6">
        <Button
          onClick={() =>
            router.navigate({
              to: '/spaces/societies/mine/$clubID/join-requests',
              params: { clubID: societyId }
            })
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
            <StatusBadge status={req.status} />
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
                <p className="font-medium">{req.user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground text-sm">Email</p>
                <p className="font-medium">{req.user.email}</p>
              </div>
            </div>
            {req.user.phoneNumber && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground text-sm">Phone</p>
                  <p className="font-medium">{req.user.phoneNumber}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Form Responses */}
        <Card className="p-6">
          <h2 className="mb-4 font-semibold text-lg">Application Responses</h2>
          <div className="space-y-4">
            {req.formResponse &&
              Object.entries(req.formResponse.answers).map(([key, value]) => (
                <div key={key}>
                  <p className="mb-1 font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-muted-foreground">{String(value)}</p>
                </div>
              ))}
          </div>
        </Card>

        {/* Payment Section */}
        {req.paymentStatus !== 'not_required' && (
          <Card className="p-6">
            <h2 className="mb-4 font-semibold text-lg">Payment Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-muted-foreground text-sm">Amount</p>
                <p className="font-bold text-2xl">${req.paymentAmount}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Status</p>
                <p className="font-medium capitalize">
                  {req.paymentStatus.replace('_', ' ')}
                </p>
              </div>
              {needsPaymentVerification && (
                <PaymentVerification
                  isMarking={markNotVerifiedMutation.isPending}
                  isVerifying={verifyPaymentMutation.isPending}
                  onMarkNotVerified={(reason) =>
                    markNotVerifiedMutation.mutate({ id: requestId, reason })
                  }
                  onVerify={(notes) =>
                    verifyPaymentMutation.mutate({ id: requestId, notes })
                  }
                />
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
                <Button
                  className="w-full"
                  disabled={approveMutation.isPending}
                  onClick={() => approveMutation.mutate({ id: requestId })}
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
              )}

              {canReject && (
                <div className="space-y-2">
                  {showRejectDialog ? (
                    <RejectDialog
                      isPending={rejectMutation.isPending}
                      onCancel={() => setShowRejectDialog(false)}
                      onConfirm={(reason) =>
                        rejectMutation.mutate({ id: requestId, reason })
                      }
                    />
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
                {new Date(req.submittedAt).toLocaleString()}
              </p>
            </div>
            {req.reviewedAt && (
              <div>
                <p className="text-muted-foreground text-sm">Reviewed</p>
                <p className="font-medium">
                  {new Date(req.reviewedAt).toLocaleString()}
                </p>
              </div>
            )}
            {req.rejectionReason && (
              <div className="sm:col-span-2">
                <p className="text-muted-foreground text-sm">
                  Rejection Reason
                </p>
                <p className="font-medium">{req.rejectionReason}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
