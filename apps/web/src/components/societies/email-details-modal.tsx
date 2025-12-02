'use client'

import type { EmailDetails } from '@rov/orpc-contracts'
import { Avatar, AvatarFallback, AvatarImage } from '@rov/ui/components/avatar'
import { Badge } from '@rov/ui/components/badge'
import { Button } from '@rov/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@rov/ui/components/dialog'
import { Separator } from '@rov/ui/components/separator'
import { formatDistanceToNow } from 'date-fns'
import { Calendar, CheckCircle, Mail, User, X, XCircle } from 'lucide-react'

interface EmailDetailsModalProps {
  open: boolean
  onClose: () => void
  email: EmailDetails | null
  isLoading?: boolean
}

export function EmailDetailsModal({
  open,
  onClose,
  email,
  isLoading = false
}: EmailDetailsModalProps) {
  if (isLoading) {
    return (
      <Dialog onOpenChange={onClose} open={open}>
        <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
              <p className="text-muted-foreground text-sm">
                Loading email details...
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!email) {
    return null
  }

  return (
    <Dialog onOpenChange={onClose} open={open}>
      <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Details
          </DialogTitle>
          <DialogDescription>
            View complete information about this sent email
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <User className="h-4 w-4" />
                <span>Sent by</span>
              </div>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={email.sender.image || undefined} />
                  <AvatarFallback>
                    {email.sender.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{email.sender.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {email.sender.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Calendar className="h-4 w-4" />
                <span>Sent</span>
              </div>
              <p className="font-medium">
                {email.sentAt
                  ? formatDistanceToNow(new Date(email.sentAt), {
                      addSuffix: true
                    })
                  : 'N/A'}
              </p>
              {email.sentAt && (
                <p className="text-muted-foreground text-xs">
                  {new Date(email.sentAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Delivery Statistics */}
          <div>
            <h3 className="mb-3 font-semibold">Delivery Statistics</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground text-sm">
                    Total Recipients
                  </span>
                </div>
                <p className="font-bold text-2xl">{email.recipientCount}</p>
              </div>

              <div className="rounded-lg border bg-green-50 p-4 dark:bg-green-950/20">
                <div className="mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-muted-foreground text-sm">
                    Sent Successfully
                  </span>
                </div>
                <p className="font-bold text-2xl text-green-600">
                  {email.successCount}
                </p>
              </div>

              <div className="rounded-lg border bg-red-50 p-4 dark:bg-red-950/20">
                <div className="mb-2 flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-muted-foreground text-sm">Failed</span>
                </div>
                <p className="font-bold text-2xl text-red-600">
                  {email.failureCount}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <Badge
                className="text-sm"
                variant={
                  email.status === 'completed' ? 'default' : 'destructive'
                }
              >
                Status: {email.status}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Email Content */}
          <div>
            <h3 className="mb-3 font-semibold">Email Content</h3>

            {/* Subject */}
            <div className="mb-4">
              <p className="font-medium text-muted-foreground text-sm">
                Subject
              </p>
              <p className="mt-1 font-semibold text-lg">{email.subject}</p>
            </div>

            {/* Body */}
            <div>
              <p className="font-medium text-muted-foreground text-sm">
                Message
              </p>
              <div className="mt-2 rounded-lg border bg-muted/30 p-4">
                <div
                  className="prose prose-sm dark:prose-invert max-w-none"
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: Email content from database
                  dangerouslySetInnerHTML={{ __html: email.bodyHtml }}
                />
              </div>
            </div>
          </div>

          {/* Society Info */}
          <Separator />
          <div>
            <h3 className="mb-2 font-semibold">Society</h3>
            <p className="text-muted-foreground text-sm">
              {email.organization.name}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            <X className="mr-2 h-4 w-4" />
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
