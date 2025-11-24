'use client'

import { Button } from '@rov/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@rov/ui/components/dialog'
import { Input } from '@rov/ui/components/input'
import { Label } from '@rov/ui/components/label'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'

interface CreateTeamDialogProps {
  organizationId: string
  trigger?: React.ReactNode
}

export function CreateTeamDialog({
  organizationId,
  trigger
}: CreateTeamDialogProps) {
  const [open, setOpen] = useState(false)
  const [teamName, setTeamName] = useState('')
  const queryClient = useQueryClient()

  const createTeamMutation = useMutation({
    mutationFn: async (name: string) => {
      const result = await authClient.organization.createTeam({
        name,
        organizationId
      })
      // Handle error response
      if (result && 'error' in result) {
        throw new Error(result.error?.message || 'Failed to create team')
      }
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['organization-teams', organizationId]
      })
      toast.success('Team created successfully')
      setTeamName('')
      setOpen(false)
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create team')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamName.trim()) {
      toast.error('Team name is required')
      return
    }
    createTeamMutation.mutate(teamName.trim())
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
          <DialogDescription>
            Create a new team to organize members within this organization.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                autoFocus
                disabled={createTeamMutation.isPending}
                id="team-name"
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g., Development Team"
                value={teamName}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={createTeamMutation.isPending}
              onClick={() => setOpen(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={createTeamMutation.isPending} type="submit">
              {createTeamMutation.isPending ? 'Creating...' : 'Create Team'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
