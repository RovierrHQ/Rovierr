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
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { orpc } from '@/utils/orpc'

interface DeleteApplicationDialogProps {
  applicationId: string
  companyName: string
  positionTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteApplicationDialog({
  applicationId,
  companyName,
  positionTitle,
  open,
  onOpenChange
}: DeleteApplicationDialogProps) {
  const queryClient = useQueryClient()
  const router = useRouter()

  const deleteMutation = useMutation(
    orpc.career.applications.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['career', 'applications', 'list']
        })
        queryClient.invalidateQueries({
          queryKey: ['career', 'applications', 'statistics']
        })
        toast.success('Application deleted successfully')
        onOpenChange(false)
        router.push('/spaces/career/applications')
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to delete application')
      }
    })
  )

  const handleDelete = () => {
    deleteMutation.mutate({ id: applicationId })
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Application</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete your application for{' '}
            <span className="font-semibold">
              {positionTitle} at {companyName}
            </span>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={deleteMutation.isPending}
            onClick={handleDelete}
            type="button"
            variant="destructive"
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
