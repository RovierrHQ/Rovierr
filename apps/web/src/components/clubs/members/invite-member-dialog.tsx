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
import { useAppForm } from '@rov/ui/components/form/index'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { UserPlus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { authClient } from '@/lib/auth-client'

interface InviteMemberDialogProps {
  organizationId: string
  trigger?: React.ReactNode
}

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.string().min(1, 'Role is required')
})

export function InviteMemberDialog({
  organizationId,
  trigger
}: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const form = useAppForm({
    validators: {
      onSubmit: inviteSchema
    },
    defaultValues: {
      email: '',
      role: 'member'
    } as z.infer<typeof inviteSchema>,
    onSubmit: async ({ value }) => {
      try {
        await inviteMutation.mutateAsync({
          email: value.email,
          role: value.role
        })
        setOpen(false)
        form.reset()
      } catch (_error) {
        // Error handled in mutation
      }
    }
  })

  const inviteMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      await authClient.organization.inviteMember({
        email,
        role: role as 'member' | 'admin' | 'owner',
        organizationId
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['organization-members', organizationId]
      })
      queryClient.invalidateQueries({
        queryKey: ['organization-invitations', organizationId]
      })
      toast.success('Invitation sent successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send invitation')
    }
  })

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>
            Send an invitation to join this organization. The user will receive
            an email with instructions.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <div className="space-y-4 py-4">
            <form.AppField
              children={(field) => (
                <field.Text
                  label="Email Address"
                  placeholder="user@example.com"
                  type="email"
                />
              )}
              name="email"
            />

            <form.AppField
              children={(field) => (
                <field.Select
                  label="Role"
                  options={[
                    { label: 'Member', value: 'member' },
                    { label: 'Admin', value: 'admin' },
                    { label: 'Owner', value: 'owner' }
                  ]}
                  placeholder="Select a role"
                />
              )}
              name="role"
            />
          </div>
          <DialogFooter>
            <Button
              disabled={form.state.isSubmitting}
              onClick={() => setOpen(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={form.state.isSubmitting} type="submit">
              {form.state.isSubmitting ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
