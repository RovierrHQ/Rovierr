'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@rov/ui/components/dialog'
import { ApplicationForm } from './application-form'

interface AddApplicationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddApplicationDialog({
  open,
  onOpenChange
}: AddApplicationDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Job Application</DialogTitle>
          <DialogDescription>
            Track a new job application. You can paste a job post URL to
            automatically extract details.
          </DialogDescription>
        </DialogHeader>
        <ApplicationForm
          onCancel={() => onOpenChange(false)}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
