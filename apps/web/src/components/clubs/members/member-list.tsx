'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@rov/ui/components/avatar'
import { Badge } from '@rov/ui/components/badge'
import { Button } from '@rov/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@rov/ui/components/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@rov/ui/components/dropdown-menu'
import { Input } from '@rov/ui/components/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@rov/ui/components/select'
import { Skeleton } from '@rov/ui/components/skeleton'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { MoreVertical, Search, Trash2, UserCog } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'
import { ChangeRoleDialog } from './change-role-dialog'
import { InviteMemberDialog } from './invite-member-dialog'

interface MemberListProps {
  organizationId: string
}

export function MemberList({ organizationId }: MemberListProps) {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [page, setPage] = useState(0)
  const limit = 20

  // Fetch members
  const {
    data: membersData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['organization-members', organizationId, page, roleFilter],
    queryFn: async () => {
      const result = await authClient.organization.listMembers({
        query: {
          limit,
          offset: page * limit,
          sortBy: 'createdAt',
          sortDirection: 'desc',
          ...(roleFilter !== 'all' && {
            filterField: 'role',
            filterOperator: 'eq',
            filterValue: roleFilter
          }),
          organizationId
        }
      })
      return result
    }
  })

  const members = membersData?.data?.members ?? []
  const totalMembers = membersData?.data?.total ?? 0

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (memberIdOrEmail: string) => {
      await authClient.organization.removeMember({
        memberIdOrEmail,
        organizationId
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['organization-members', organizationId]
      })
      toast.success('Member removed successfully')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to remove member')
    }
  })

  // Check if user can manage members using hasPermission (checks actual user permissions)
  const { data: canManageMembers = false } = useQuery({
    queryKey: ['user-permission-manage', organizationId],
    queryFn: async () => {
      try {
        const result = await authClient.organization.hasPermission({
          permissions: {
            member: ['delete', 'update']
          },
          organizationId
        })
        return result ?? false
      } catch {
        return false
      }
    }
  })

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

  // Filter members by search query
  const filteredMembers = members.filter(
    (member: {
      user?: {
        name?: string
        email?: string
      }
    }) => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      const name = member.user?.name?.toLowerCase() ?? ''
      const email = member.user?.email?.toLowerCase() ?? ''
      return name.includes(query) || email.includes(query)
    }
  )

  const handleRemoveMember = (memberId: string, memberName: string) => {
    if (
      !confirm(
        `Are you sure you want to remove ${memberName} from this organization?`
      )
    ) {
      return
    }
    removeMemberMutation.mutate(memberId)
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
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-32" />
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
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
            Failed to load members. Please try again.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Members ({totalMembers})</CardTitle>
            <CardDescription>
              Manage organization members and their roles
            </CardDescription>
          </div>
          {canInviteMembers && (
            <InviteMemberDialog organizationId={organizationId} />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search members by name or email..."
                value={searchQuery}
              />
            </div>
            <Select onValueChange={setRoleFilter} value={roleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Members Table */}
          {filteredMembers.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                {searchQuery || roleFilter !== 'all'
                  ? 'No members found matching your filters'
                  : 'No members found'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 text-left font-medium text-sm">
                      Member
                    </th>
                    <th className="p-4 text-left font-medium text-sm">Role</th>
                    <th className="p-4 text-left font-medium text-sm">
                      Joined
                    </th>
                    {canManageMembers && (
                      <th className="p-4 text-right font-medium text-sm">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map(
                    (member: {
                      id: string
                      role: string | string[]
                      createdAt: Date | string
                      user?: {
                        name?: string
                        email?: string
                        image?: string | null
                      }
                    }) => (
                      <tr
                        className="border-b transition-colors hover:bg-muted/50"
                        key={member.id}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                alt={member.user?.name ?? ''}
                                src={member.user?.image ?? undefined}
                              />
                              <AvatarFallback>
                                {member.user?.name
                                  ?.split(' ')
                                  .map((n: string) => n[0])
                                  .join('')
                                  .toUpperCase()
                                  .slice(0, 2) ?? 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {member.user?.name ?? 'Unknown User'}
                              </div>
                              <div className="text-muted-foreground text-sm">
                                {member.user?.email ?? ''}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="secondary">
                            {Array.isArray(member.role)
                              ? member.role.join(', ')
                              : (member.role ?? 'member')}
                          </Badge>
                        </td>
                        <td className="p-4 text-muted-foreground text-sm">
                          {member.createdAt
                            ? format(new Date(member.createdAt), 'MMM d, yyyy')
                            : 'N/A'}
                        </td>
                        {canManageMembers && (
                          <td className="p-4">
                            <div className="flex justify-end">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="ghost">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <ChangeRoleDialog
                                    member={member}
                                    organizationId={organizationId}
                                    trigger={
                                      <DropdownMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                      >
                                        <UserCog className="mr-2 h-4 w-4" />
                                        Change Role
                                      </DropdownMenuItem>
                                    }
                                  />
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() =>
                                      handleRemoveMember(
                                        member.id,
                                        member.user?.name ?? 'this member'
                                      )
                                    }
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Remove Member
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        )}
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalMembers > limit && (
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Showing {page * limit + 1} to{' '}
                {Math.min((page + 1) * limit, totalMembers)} of {totalMembers}{' '}
                members
              </p>
              <div className="flex gap-2">
                <Button
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  size="sm"
                  variant="outline"
                >
                  Previous
                </Button>
                <Button
                  disabled={(page + 1) * limit >= totalMembers}
                  onClick={() => setPage((p) => p + 1)}
                  size="sm"
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
