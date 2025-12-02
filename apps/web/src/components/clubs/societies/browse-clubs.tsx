'use client'

import { Badge } from '@rov/ui/components/badge'
import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import { Input } from '@rov/ui/components/input'
import { Skeleton } from '@rov/ui/components/skeleton'
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient
} from '@tanstack/react-query'
import { CheckCircle2, Clock, GraduationCap, Plus, Users } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'
import { orpc } from '@/utils/orpc'

// Helper function to get icon from tags or default
const getIconFromTags = (tags: string[] | null | undefined): string => {
  if (!tags || tags.length === 0) return '🏛️'
  const firstTag = tags[0]?.toLowerCase() ?? ''
  if (firstTag.includes('tech') || firstTag.includes('technology')) return '💻'
  if (firstTag.includes('art') || firstTag.includes('arts')) return '📸'
  if (firstTag.includes('sport')) return '⚽'
  if (firstTag.includes('academic')) return '🎓'
  if (firstTag.includes('business')) return '💼'
  return '🏛️'
}

// Helper function to get category from tags or default
const getCategoryFromTags = (tags: string[] | null | undefined): string => {
  if (!tags || tags.length === 0) return 'General'
  return tags[0] ?? 'General'
}

const BrowseClubs = () => {
  const queryClient = useQueryClient()
  const { data: session } = authClient.useSession()

  // Get all organizations
  const { data, isLoading, isError } = useQuery(
    orpc.studentOrganizations.listAllOrganizations.queryOptions({
      input: {
        query: {
          page: 1,
          limit: 50
        }
      }
    })
  )

  // Get user's organizations to filter out clubs they're already members of
  const { data: userOrganizations } = authClient.useListOrganizations()

  // Get join request statuses for all clubs
  const allOrganizations = data?.data ?? []
  const userOrgIds = useMemo(
    () => new Set(userOrganizations?.map((org) => org.id) ?? []),
    [userOrganizations]
  )

  // Show all organizations (don't filter out member clubs)
  const organizations = allOrganizations

  // Check join request statuses for all organizations
  const joinRequestStatuses = useQueries({
    queries: allOrganizations.map((org) => ({
      queryKey: ['join-request-status', org.id, session?.user?.id],
      queryFn: async () => {
        if (!session?.user?.id) return null
        try {
          return await orpc.societyRegistration.joinRequest.getUserStatus.call({
            societyId: org.id,
            userId: session.user.id
          })
        } catch {
          return null
        }
      },
      enabled: !!session?.user?.id && allOrganizations.length > 0
    }))
  })

  // Create a map of organization ID to join request status
  const joinRequestStatusMap = useMemo(() => {
    const map = new Map<
      string,
      {
        hasRequest: boolean
        status: string | null
      }
    >()
    allOrganizations.forEach((org, index) => {
      const status = joinRequestStatuses[index]?.data
      if (status) {
        map.set(org.id, {
          hasRequest: status.hasRequest,
          status: status.status
        })
      }
    })
    return map
  }, [allOrganizations, joinRequestStatuses])

  // Join request mutation
  const joinRequestMutation = useMutation(
    orpc.societyRegistration.joinRequest.simpleRequestToJoin.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['studentOrganizations', 'listAllOrganizations']
        })
        queryClient.invalidateQueries({
          queryKey: ['join-request-status']
        })
        toast.success('Join request sent successfully!')
      },
      onError: (error: Error) => {
        if (error.message.includes('already a member')) {
          toast.error('You are already a member of this club')
        } else if (error.message.includes('pending join request')) {
          toast.error('You already have a pending join request')
        } else {
          toast.error('Failed to send join request')
        }
      }
    })
  )

  const handleJoinRequest = async (clubId: string) => {
    if (!session?.user?.id) {
      toast.error('Please sign in to join clubs')
      return
    }
    await joinRequestMutation.mutateAsync({ societyId: clubId })
  }

  if (isLoading) {
    return (
      <div>
        <div className="mb-6">
          <div className="mb-4 flex items-center gap-4">
            <Input className="flex-1" placeholder="Search clubs..." />
            <Button asChild>
              <Link href="/spaces/societies/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Club
              </Link>
            </Button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Badge className="cursor-pointer" variant="default">
              All
            </Badge>
            <Badge className="cursor-pointer" variant="outline">
              Technology
            </Badge>
            <Badge className="cursor-pointer" variant="outline">
              Arts
            </Badge>
            <Badge className="cursor-pointer" variant="outline">
              Sports
            </Badge>
            <Badge className="cursor-pointer" variant="outline">
              Academic
            </Badge>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card className="p-6" key={index.toString()}>
              <div className="flex items-start gap-4">
                <Skeleton className="h-10 w-10 shrink-0" />
                <div className="flex-1">
                  <Skeleton className="mb-1 h-5 w-32" />
                  <Skeleton className="mb-3 h-4 w-24" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Failed to load clubs. Please try again later.
      </div>
    )
  }

  if (organizations.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <div className="mb-4 flex items-center gap-4">
            <Input className="flex-1" placeholder="Search clubs..." />
            <Button asChild>
              <Link href="/spaces/societies/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Club
              </Link>
            </Button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Badge className="cursor-pointer" variant="default">
              All
            </Badge>
            <Badge className="cursor-pointer" variant="outline">
              Technology
            </Badge>
            <Badge className="cursor-pointer" variant="outline">
              Arts
            </Badge>
            <Badge className="cursor-pointer" variant="outline">
              Sports
            </Badge>
            <Badge className="cursor-pointer" variant="outline">
              Academic
            </Badge>
          </div>
        </div>
        <div className="py-8 text-center text-muted-foreground">
          No clubs found. Be the first to create one!
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <div className="mb-4 flex items-center gap-4">
          <Input className="flex-1" placeholder="Search clubs..." />
          <Button asChild>
            <Link href="/spaces/clubs/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Club
            </Link>
          </Button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Badge className="cursor-pointer" variant="default">
            All
          </Badge>
          <Badge className="cursor-pointer" variant="outline">
            Technology
          </Badge>
          <Badge className="cursor-pointer" variant="outline">
            Arts
          </Badge>
          <Badge className="cursor-pointer" variant="outline">
            Sports
          </Badge>
          <Badge className="cursor-pointer" variant="outline">
            Academic
          </Badge>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {organizations.map((club) => {
          const isMember = userOrgIds.has(club.id)
          const joinRequestStatus = joinRequestStatusMap.get(club.id)
          const hasPendingRequest =
            joinRequestStatus?.hasRequest &&
            (joinRequestStatus.status === 'pending' ||
              joinRequestStatus.status === 'payment_pending')

          const renderJoinButton = () => {
            if (isMember) {
              return (
                <Button asChild className="w-full" size="sm" variant="outline">
                  <Link href={`/spaces/societies/mine/${club.id}`}>
                    <Users className="mr-2 h-4 w-4" />
                    View Club
                  </Link>
                </Button>
              )
            }
            if (hasPendingRequest) {
              return (
                <Button className="w-full" disabled size="sm" variant="outline">
                  <Clock className="mr-2 h-4 w-4" />
                  Request Pending
                </Button>
              )
            }
            if (joinRequestMutation.isPending) {
              return (
                <Button className="w-full" disabled size="sm">
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </Button>
              )
            }
            return (
              <Button
                className="w-full"
                onClick={() => handleJoinRequest(club.id)}
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Request to Join
              </Button>
            )
          }

          return (
            <Card className="p-6" key={club.id}>
              <div className="flex items-start gap-4">
                <div className="text-4xl">{getIconFromTags(club.tags)}</div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="font-semibold">{club.name}</h3>
                    {isMember && (
                      <Badge variant="secondary">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Member
                      </Badge>
                    )}
                    {club.isVerified && (
                      <Badge
                        className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        variant="outline"
                      >
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="mb-2 space-y-1 text-muted-foreground text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5" />
                      <span>{club.memberCount} members</span>
                      <span>•</span>
                      <span>{getCategoryFromTags(club.tags)}</span>
                    </div>
                    {club.institutionName && (
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-3.5 w-3.5" />
                        <span>{club.institutionName}</span>
                        {club.type === 'university' && (
                          <>
                            <span>•</span>
                            <Badge className="text-xs" variant="secondary">
                              Official
                            </Badge>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  {renderJoinButton()}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default BrowseClubs
