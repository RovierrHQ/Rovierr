'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@rov/ui/components/avatar'
import { Badge } from '@rov/ui/components/badge'
import { Button } from '@rov/ui/components/button'
import { Card, CardContent } from '@rov/ui/components/card'
import { Input } from '@rov/ui/components/input'
import { Skeleton } from '@rov/ui/components/skeleton'
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query'
import { UserPlus, Users } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import { orpc } from '@/utils/orpc'

export default function PeoplePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const queryClient = useQueryClient()

  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['people', 'list', searchQuery],
      queryFn: async ({ pageParam = 0 }) => {
        return await orpc.people.list.call({
          search: searchQuery || undefined,
          limit: 50,
          offset: pageParam
        })
      },
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.hasMore) {
          return pages.length * 50
        }
        return
      },
      initialPageParam: 0
    })

  const { data: pendingRequests } = useQuery(
    orpc.connection.listPending.queryOptions({
      input: {
        type: 'received',
        limit: 1,
        offset: 0
      }
    })
  )

  const sendConnectionMutation = useMutation(
    orpc.connection.send.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['people', 'list'] })
        toast.success('Connection request sent')
      },
      onError: (error: Error) => {
        if (error.message.includes('SELF_CONNECTION')) {
          toast.error('Cannot connect with yourself')
        } else if (error.message.includes('ALREADY_CONNECTED')) {
          toast.error('Already connected with this user')
        } else if (error.message.includes('PENDING_REQUEST')) {
          toast.error('Connection request already pending')
        } else {
          toast.error('Failed to send connection request')
        }
      }
    })
  )

  const users = data?.pages.flatMap((page) => page.users) ?? []

  const handleConnect = (userId: string) => {
    sendConnectionMutation.mutate({ connectedUserId: userId })
  }

  const getConnectionButton = (user: (typeof users)[0]) => {
    if (user.connectionStatus === 'connected') {
      return (
        <Button disabled size="sm" variant="outline">
          Connected
        </Button>
      )
    }

    if (user.connectionStatus === 'pending_sent') {
      return (
        <Button disabled size="sm" variant="outline">
          Pending
        </Button>
      )
    }

    if (user.connectionStatus === 'pending_received') {
      return (
        <Button disabled size="sm" variant="outline">
          Request Received
        </Button>
      )
    }

    return (
      <Button
        disabled={sendConnectionMutation.isPending}
        onClick={() => handleConnect(user.id)}
        size="sm"
      >
        Connect
      </Button>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl p-6">
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8" />
            <h1 className="font-bold text-3xl">Discover People</h1>
          </div>
          <Button asChild variant="outline">
            <Link href="/people/requests">
              <UserPlus className="mr-2 h-4 w-4" />
              Requests
              {pendingRequests && pendingRequests.total > 0 && (
                <Badge className="ml-2" variant="destructive">
                  {pendingRequests.total}
                </Badge>
              )}
            </Link>
          </Button>
        </div>
        <p className="text-muted-foreground">
          Connect with students and build your network
        </p>
      </div>

      <div className="mb-6">
        <Input
          className="max-w-md"
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, username, or bio..."
          value={searchQuery}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton loaders don't change order
            <Card key={`skeleton-${i}`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {!isLoading && users.length === 0 ? (
        <div className="py-12 text-center">
          <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 font-semibold text-lg">No users found</h3>
          <p className="text-muted-foreground">
            {searchQuery
              ? 'Try adjusting your search query'
              : 'No users available at the moment'}
          </p>
        </div>
      ) : null}

      {!isLoading && users.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
              <Card className="transition-shadow hover:shadow-md" key={user.id}>
                <CardContent className="p-6">
                  <div className="mb-4 flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={user.image || undefined} />
                      <AvatarFallback>
                        {user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="truncate font-semibold">{user.name}</h3>
                        {user.isVerified && (
                          <Badge className="text-xs" variant="secondary">
                            Verified
                          </Badge>
                        )}
                      </div>
                      {user.username && (
                        <p className="truncate text-muted-foreground text-sm">
                          @{user.username}
                        </p>
                      )}
                    </div>
                  </div>

                  {user.bio && (
                    <p className="mb-4 line-clamp-2 text-muted-foreground text-sm">
                      {user.bio}
                    </p>
                  )}

                  {user.interests && user.interests.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-1">
                      {user.interests.slice(0, 3).map((interest) => (
                        <Badge
                          className="text-xs"
                          key={interest}
                          variant="outline"
                        >
                          {interest}
                        </Badge>
                      ))}
                      {user.interests.length > 3 && (
                        <Badge className="text-xs" variant="outline">
                          +{user.interests.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {getConnectionButton(user)}
                    <Button asChild size="sm" variant="ghost">
                      <a href={`/${user.username || user.id}`}>View Profile</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {hasNextPage && (
            <div className="mt-8 text-center">
              <Button
                disabled={isFetchingNextPage}
                onClick={() => fetchNextPage()}
                variant="outline"
              >
                {isFetchingNextPage ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
