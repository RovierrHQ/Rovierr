'use client'

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
import { Input } from '@rov/ui/components/input'
import { Label } from '@rov/ui/components/label'
import { useMutation } from '@tanstack/react-query'
import { AlertTriangle, FileText, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { orpc } from '@/utils/orpc'

interface ApplySuggestionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedSuggestions: string[]
  sourceResumeId: string
  jobApplicationId: string
  onSuccess?: (newResumeId: string) => void
}

export function ApplySuggestionsDialog({
  open,
  onOpenChange,
  selectedSuggestions,
  sourceResumeId,
  jobApplicationId,
  onSuccess
}: ApplySuggestionsDialogProps) {
  const [title, setTitle] = useState('')

  // Create optimized resume mutation
  const createOptimizedMutation = useMutation(
    orpc.career.ai.createOptimizedResume.mutationOptions({
      onSuccess: (data) => {
        toast.success('Optimized resume created successfully')
        onOpenChange(false)
        setTitle('')
        if (onSuccess) {
          onSuccess(data.id)
        }
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to create optimized resume')
      }
    })
  )

  const handleCreate = () => {
    if (!title.trim()) {
      toast.error('Please enter a title for the optimized resume')
      return
    }

    createOptimizedMutation.mutate({
      sourceResumeId,
      jobApplicationId,
      selectedSuggestions,
      title: title.trim()
    })
  }

  const handleCancel = () => {
    onOpenChange(false)
    setTitle('')
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create Optimized Resume
          </DialogTitle>
          <DialogDescription>
            Apply the selected suggestions to create a new, optimized version of
            your resume.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning */}
          <div className="flex items-start gap-3 rounded-md border border-yellow-200 bg-yellow-50 p-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800">
                Creating a new version
              </p>
              <p className="text-yellow-700">
                This will create a new resume with the applied suggestions. Your
                original resume will remain unchanged.
              </p>
            </div>
          </div>

          {/* Selected suggestions count */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Applying:</span>
            <Badge variant="secondary">
              {selectedSuggestions.length} suggestion
              {selectedSuggestions.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {/* Resume title input */}
          <div className="space-y-2">
            <Label htmlFor="resume-title">Resume Title</Label>
            <Input
              disabled={createOptimizedMutation.isPending}
              id="resume-title"
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Software Engineer - TechCorp"
              value={title}
            />
            <p className="text-muted-foreground text-xs">
              Give your optimized resume a descriptive title to help you
              identify it later.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            disabled={createOptimizedMutation.isPending}
            onClick={handleCancel}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={createOptimizedMutation.isPending || !title.trim()}
            onClick={handleCreate}
          >
            {createOptimizedMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Optimized Resume'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
