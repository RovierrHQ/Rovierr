'use client'

import { Button } from '@rov/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@rov/ui/components/dialog'
import { X } from 'lucide-react'

interface EmailPreviewModalProps {
  open: boolean
  onClose: () => void
  subject: string
  bodyHtml: string
  sampleData: {
    user: {
      name: string
      email: string
      username: string | null
    }
    organization: {
      name: string
    }
  }
}

export function EmailPreviewModal({
  open,
  onClose,
  subject,
  bodyHtml,
  sampleData
}: EmailPreviewModalProps) {
  return (
    <Dialog onOpenChange={onClose} open={open}>
      <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Email Preview</DialogTitle>
          <DialogDescription>
            This is how your email will appear to recipients
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Sample Data Info */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="mb-2 font-medium text-sm">Sample Data Used:</p>
            <div className="grid grid-cols-2 gap-2 text-muted-foreground text-xs">
              <div>
                <span className="font-medium">Name:</span>{' '}
                {sampleData.user.name}
              </div>
              <div>
                <span className="font-medium">Email:</span>{' '}
                {sampleData.user.email}
              </div>
              <div>
                <span className="font-medium">Username:</span>{' '}
                {sampleData.user.username || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Society:</span>{' '}
                {sampleData.organization.name}
              </div>
            </div>
          </div>

          {/* Email Preview */}
          <div className="rounded-lg border bg-background">
            {/* Email Header */}
            <div className="border-b bg-muted/30 p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-muted-foreground">
                    From:
                  </span>
                  <span>Rovierr &lt;noreply@clubs.rovierr.com&gt;</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-muted-foreground">To:</span>
                  <span>{sampleData.user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-muted-foreground">
                    Subject:
                  </span>
                  <span className="font-semibold">{subject}</span>
                </div>
              </div>
            </div>

            {/* Email Body */}
            <div
              className="prose prose-sm max-w-none p-6"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: Preview content is sanitized
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
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
