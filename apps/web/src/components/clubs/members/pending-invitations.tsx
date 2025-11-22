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
import { Badge } from '@rov/ui/components/badge'
import { Button } from '@rov/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@rov/ui/components/card'
import { Skeleton } from '@rov/ui/components/skeleton'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Mail, RefreshCw, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'
import { InviteMemberDialog } from './invite-member-dialog'

interface PendingInvitationsProps {
  organizationId: string
}

export function PendingInvitations({
  organizationId
}: PendingInvitationsProps) {
  const queryClient = useQueryClient()
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [invitationToCancel, setInvitationToCancel] = useState<string | null>(
    null
  )

  const {
    data: invitations,
    isLoading,
    error
  } = useQuery({
    queryKey: ['organization-invitations', organizationId],
    queryFn: async () => {
      const result = await authClient.organization.listInvitations({
        query: {
          organizationId
        }
      })
      return result?.data ?? []
    }
  })

  // Check if user can invite members using hasPermission (checks actual user permissions)
  const { data: canInviteMembers = false } = useQuery({
    queryKey: ['user-permission-invite', organizationId],
    queryFn: async () => {
      try {
        const result = await authClient.organization.hasPermission({
          permissions: {
            member: ['create']
          },
          organizationId
        })
        return result ?? false
      } catch {
        return false
      }
    }
  })

  const resendInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      // Better Auth doesn't have a direct resend method, but we can use inviteMember with resend flag
      const invitation = invitations?.find((inv) => inv.id === invitationId)
      if (!invitation) throw new Error('Invitation not found')
      await authClient.organization.inviteMember({
        email: invitation.email,
        role: invitation.role ?? 'member',
        organizationId,
        resend: true
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['organization-invitations', organizationId]
      })
      toast.success('Invitation resent successfully')
    },
    onError: (e: Error) => {
      toast.error(e.message || 'Failed to resend invitation')
    }
  })

  const cancelInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      await authClient.organization.cancelInvitation({
        invitationId
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['organization-invitations', organizationId]
      })
      toast.success('Invitation cancelled')
    },
    onError: (e: Error) => {
      toast.error(e.message || 'Failed to cancel invitation')
    }
  })

  const handleResendInvitation = async (invitationId: string) => {
    await resendInvitationMutation.mutateAsync(invitationId)
  }

  const handleCancelInvitationClick = (invitationId: string) => {
    setInvitationToCancel(invitationId)
    setCancelDialogOpen(true)
  }

  const handleConfirmCancel = async () => {
    if (!invitationToCancel) return
    await cancelInvitationMutation.mutateAsync(invitationToCancel)
    setCancelDialogOpen(false)
    setInvitationToCancel(null)
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
            Failed to load invitations. Please try again.
          </p>
        </CardContent>
      </Card>
    )
  }

  const invitationsList = invitations ?? []

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>Manage pending member invitations</CardDescription>
          </div>
          {canInviteMembers && (
            <InviteMemberDialog organizationId={organizationId} />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {invitationsList.length === 0 ? (
          <div className="py-12 text-center">
            <Mail className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-2 font-medium text-muted-foreground">
              No pending invitations
            </p>
            <p className="mb-4 text-muted-foreground text-sm">
              Invite new members to join this organization
            </p>
            {canInviteMembers && (
              <InviteMemberDialog organizationId={organizationId} />
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {invitationsList.map((invitation) => (
              <div
                className="flex items-center justify-between rounded-lg border p-4"
                key={invitation.id}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium">{invitation.email}</div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Badge variant="secondary">{invitation.role}</Badge>
                        <span>•</span>
                        {invitation.expiresAt && (
                          <span>
                            Expires{' '}
                            {format(
                              new Date(invitation.expiresAt),
                              'MMM d, yyyy'
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      invitation.status === 'pending' ||
                      invitation.status === 'accepted'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {invitation.status}
                  </Badge>
                  {invitation.status === 'pending' && canInviteMembers && (
                    <>
                      <Button
                        disabled={
                          resendInvitationMutation.isPending ||
                          cancelInvitationMutation.isPending
                        }
                        onClick={() => handleResendInvitation(invitation.id)}
                        size="sm"
                        variant="ghost"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        disabled={
                          resendInvitationMutation.isPending ||
                          cancelInvitationMutation.isPending
                        }
                        onClick={() =>
                          handleCancelInvitationClick(invitation.id)
                        }
                        size="sm"
                        variant="ghost"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <AlertDialog onOpenChange={setCancelDialogOpen} open={cancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this invitation? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              variant="destructive"
            >
              Yes, cancel invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
