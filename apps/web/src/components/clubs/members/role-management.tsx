'use client'

import { Button } from '@rov/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@rov/ui/components/card'
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
import { Skeleton } from '@rov/ui/components/skeleton'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Plus, Shield, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { authClient } from '@/lib/auth-client'
import { PermissionEditor } from './permission-editor'

interface RoleManagementProps {
  organizationId: string
}

const createRoleSchema = z.object({
  roleName: z.string().min(1, 'Role name is required').max(50),
  description: z.string().optional()
})

export function RoleManagement({ organizationId }: RoleManagementProps) {
  const queryClient = useQueryClient()
  const [editingRole, setEditingRole] = useState<string | null>(null)
  const [creatingRole, setCreatingRole] = useState(false)

  const {
    data: rolesData,
    isLoading,
    error
  } = useQuery({
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

  // Check if user can manage roles using hasPermission (checks actual user permissions)
  const { data: canManageRolesData } = useQuery({
    queryKey: ['user-permission-roles', organizationId],
    queryFn: async () => {
      try {
        const result = await authClient.organization.hasPermission({
          permissions: {
            ac: ['read', 'create', 'update']
          },
          organizationId
        })
        return result?.data?.success ?? false
      } catch {
        return false
      }
    }
  })
  const canManageRoles = canManageRolesData === true

  const createRoleMutation = useMutation({
    mutationFn: async ({
      roleName,
      permissions
    }: {
      roleName: string
      permissions: Record<string, string[]>
    }) => {
      await authClient.organization.createRole({
        role: roleName,
        permission: permissions,
        organizationId
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['organization-roles', organizationId]
      })
      queryClient.invalidateQueries({
        queryKey: ['organization-members', organizationId]
      })
      setCreatingRole(false)
      toast.success('Role created successfully')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create role')
    }
  })

  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      await authClient.organization.deleteRole({
        roleId,
        organizationId
      } as {
        roleId: string
        organizationId: string
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['organization-roles', organizationId]
      })
      queryClient.invalidateQueries({
        queryKey: ['organization-members', organizationId]
      })
      toast.success('Role deleted successfully')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete role')
    }
  })

  const handleDeleteRole = (roleId: string, roleName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the role "${roleName}"? This action cannot be undone.`
      )
    ) {
      return
    }
    deleteRoleMutation.mutate(roleId)
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
              <Skeleton className="h-20 w-full" key={i.toString()} />
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
            Failed to load roles. Please try again.
          </p>
        </CardContent>
      </Card>
    )
  }

  // All roles (no separation between built-in and custom)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Roles & Permissions</CardTitle>
            <CardDescription>
              Manage roles and their permissions for this organization
            </CardDescription>
          </div>
          {canManageRoles && (
            <Dialog onOpenChange={setCreatingRole} open={creatingRole}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Role
                </Button>
              </DialogTrigger>
              <CreateRoleDialog
                onClose={() => setCreatingRole(false)}
                onCreate={(roleName, permissions) => {
                  createRoleMutation.mutate({ roleName, permissions })
                }}
                organizationId={organizationId}
              />
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {roles.length === 0 ? (
            <div className="py-12 text-center">
              <Shield className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 font-medium text-muted-foreground">
                No roles found
              </p>
              <p className="mb-4 text-muted-foreground text-sm">
                Create roles with specific permissions for this organization
              </p>
              {canManageRoles && (
                <Button onClick={() => setCreatingRole(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Role
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {roles.map((role) => {
                // Only allow deletion of custom roles (not built-in ones)
                const builtInRoles = ['owner', 'admin', 'member']
                const isBuiltIn = builtInRoles.includes(role.role)
                return (
                  <RoleCard
                    canManage={canManageRoles}
                    key={role.id}
                    onDelete={
                      isBuiltIn
                        ? undefined
                        : () => handleDeleteRole(role.id, role.role)
                    }
                    onEdit={() => setEditingRole(role.id)}
                    organizationId={organizationId}
                    role={role}
                  />
                )
              })}
            </div>
          )}
        </div>
      </CardContent>

      {/* Edit Role Dialog */}
      {editingRole && (
        <Dialog
          onOpenChange={(open) => {
            if (!open) setEditingRole(null)
          }}
          open={!!editingRole}
        >
          <EditRoleDialog
            onClose={() => setEditingRole(null)}
            organizationId={organizationId}
            roleId={editingRole}
          />
        </Dialog>
      )}
    </Card>
  )
}

interface RoleCardProps {
  role: {
    id: string
    role: string
    permission: Record<string, string[]> | string
    createdAt: Date | string
  }
  organizationId: string
  canManage: boolean
  onEdit: () => void
  onDelete?: () => void
}

function RoleCard({ role, canManage, onEdit, onDelete }: RoleCardProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="font-medium">{role.role}</div>
            <div className="text-muted-foreground text-sm">
              Created{' '}
              {format(
                role.createdAt instanceof Date
                  ? role.createdAt
                  : new Date(role.createdAt),
                'MMM d, yyyy'
              )}
            </div>
          </div>
        </div>
      </div>
      {canManage && (
        <div className="flex items-center gap-2">
          <Button onClick={onEdit} size="sm" variant="outline">
            Edit Permissions
          </Button>
          {onDelete && (
            <Button onClick={onDelete} size="sm" variant="ghost">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

interface CreateRoleDialogProps {
  organizationId: string
  onCreate: (roleName: string, permissions: Record<string, string[]>) => void
  onClose: () => void
}

function CreateRoleDialog({ onCreate, onClose }: CreateRoleDialogProps) {
  const [permissions, setPermissions] = useState<Record<string, string[]>>({})

  const form = useAppForm({
    validators: {
      onSubmit: createRoleSchema
    },
    defaultValues: {
      roleName: '',
      description: ''
    } as z.infer<typeof createRoleSchema>,
    onSubmit: ({ value }) => {
      onCreate(value.roleName, permissions)
    }
  })

  return (
    <DialogContent className="flex max-h-[calc(100vh-4rem)] max-w-2xl flex-col overflow-hidden p-0">
      <DialogHeader className="sticky top-0 z-10 border-b bg-background px-6 pt-6 pb-4">
        <DialogTitle>Create Custom Role</DialogTitle>
        <DialogDescription>
          Create a new role with custom permissions for this organization
        </DialogDescription>
      </DialogHeader>
      <form
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          <form.AppField
            children={(field) => (
              <field.Text
                label="Role Name"
                placeholder="e.g., Moderator, Editor"
              />
            )}
            name="roleName"
          />

          <form.AppField
            children={(field) => (
              <field.TextArea
                label="Description (Optional)"
                placeholder="Describe what this role can do"
                rows={3}
              />
            )}
            name="description"
          />

          <div>
            <div className="mb-2 font-medium text-sm">Permissions</div>
            <PermissionEditor
              onChange={setPermissions}
              permissions={permissions}
            />
          </div>
        </div>
        <DialogFooter className="sticky bottom-0 border-t bg-background px-6 py-4">
          <Button
            disabled={form.state.isSubmitting}
            onClick={onClose}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button disabled={form.state.isSubmitting} type="submit">
            {form.state.isSubmitting ? 'Creating...' : 'Create Role'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

interface EditRoleDialogProps {
  roleId: string
  organizationId: string
  onClose: () => void
}

function EditRoleDialog({
  roleId,
  organizationId,
  onClose
}: EditRoleDialogProps) {
  const queryClient = useQueryClient()

  const { data: roleData, isLoading } = useQuery({
    queryKey: ['organization-role', organizationId, roleId],
    queryFn: async () => {
      const result = await authClient.organization.getRole({
        query: {
          roleId,
          organizationId
        }
      })
      return result
    }
  })

  // Parse initial permissions from role data
  const getInitialPermissions = () => {
    if (!roleData?.data?.permission) return {}
    const perm = roleData.data.permission
    return typeof perm === 'string' ? JSON.parse(perm) : perm
  }
  const initialPermissions = getInitialPermissions()

  const [permissions, setPermissions] =
    useState<Record<string, string[]>>(initialPermissions)

  // Update permissions when role data loads
  useEffect(() => {
    if (roleData?.data?.permission) {
      const perm = roleData.data.permission
      const parsed = typeof perm === 'string' ? JSON.parse(perm) : perm
      setPermissions(parsed)
    }
  }, [roleData])

  const updateRoleMutation = useMutation({
    mutationFn: async (perms: Record<string, string[]>) => {
      await authClient.organization.updateRole({
        roleId,
        organizationId,
        data: {
          permission: perms
        }
      } as {
        roleId: string
        organizationId: string
        data: { permission: Record<string, string[]> }
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['organization-roles', organizationId]
      })
      queryClient.invalidateQueries({
        queryKey: ['organization-role', organizationId, roleId]
      })
      toast.success('Role permissions updated successfully')
      onClose()
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update role permissions')
    }
  })

  if (isLoading) {
    return (
      <DialogContent className="max-w-2xl">
        <div className="py-8">
          <Skeleton className="h-64 w-full" />
        </div>
      </DialogContent>
    )
  }

  if (!roleData?.data) {
    return (
      <DialogContent className="max-w-2xl">
        <div className="py-8 text-center">
          <p className="text-destructive">Role not found</p>
        </div>
      </DialogContent>
    )
  }

  return (
    <DialogContent className="flex max-h-[calc(100vh-4rem)] max-w-2xl flex-col overflow-hidden p-0">
      <DialogHeader className="sticky top-0 z-10 border-b bg-background px-6 pt-6 pb-4">
        <DialogTitle>Edit Role: {roleData.data.role}</DialogTitle>
        <DialogDescription>Update permissions for this role</DialogDescription>
      </DialogHeader>
      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
        <div>
          <div className="mb-2 font-medium text-sm">Permissions</div>
          <PermissionEditor
            initialPermissions={initialPermissions}
            onChange={setPermissions}
            permissions={permissions}
          />
        </div>
      </div>
      <DialogFooter className="sticky bottom-0 border-t bg-background px-6 py-4">
        <Button
          disabled={updateRoleMutation.isPending}
          onClick={onClose}
          type="button"
          variant="outline"
        >
          Cancel
        </Button>
        <Button
          disabled={updateRoleMutation.isPending}
          onClick={() => updateRoleMutation.mutate(permissions)}
          type="button"
        >
          {updateRoleMutation.isPending ? 'Updating...' : 'Update Permissions'}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
