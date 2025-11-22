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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { authClient } from '@/lib/auth-client'

interface ChangeRoleDialogProps {
  member: {
    id: string
    role: string | string[]
    user?: {
      name?: string
      email?: string
    }
  }
  organizationId: string
  trigger: React.ReactNode
}

const changeRoleSchema = z.object({
  role: z.string().min(1, 'Role is required')
})

export function ChangeRoleDialog({
  member,
  organizationId,
  trigger
}: ChangeRoleDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  // Fetch available roles
  const { data: rolesData } = useQuery({
    queryKey: ['organization-roles', organizationId],
    queryFn: async () => {
      const result = await authClient.organization.listRoles({
        query: {
          organizationId
        }
      })
      return result
    }
  })

  const roles = rolesData?.data ?? []
  const currentRole = Array.isArray(member.role) ? member.role[0] : member.role

  const form = useAppForm({
    validators: {
      onSubmit: changeRoleSchema
    },
    defaultValues: {
      role: currentRole ?? 'member'
    } as z.infer<typeof changeRoleSchema>,
    onSubmit: async ({ value }) => {
      try {
        await updateRoleMutation.mutateAsync({
          memberId: member.id,
          role: value.role
        })
        setOpen(false)
      } catch (_error) {
        // Error handled in mutation
      }
    }
  })

  const updateRoleMutation = useMutation({
    mutationFn: async ({
      memberId,
      role
    }: {
      memberId: string
      role: string
    }) => {
      await authClient.organization.updateMemberRole({
        memberId,
        role,
        organizationId
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['organization-members', organizationId]
      })
      toast.success('Member role updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update member role')
    }
  })

  // Build role options (built-in + custom roles)
  const roleOptions = [
    ...roles.map((r) => ({
      label: r.role,
      value: r.role
    }))
  ]

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Role</DialogTitle>
          <DialogDescription>
            Update the role for{' '}
            {member.user?.name ?? member.user?.email ?? 'this member'}
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
                <field.Select
                  label="Role"
                  options={roleOptions}
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
              {form.state.isSubmitting ? 'Updating...' : 'Update Role'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
