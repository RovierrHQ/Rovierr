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
import { Skeleton } from '@rov/ui/components/skeleton'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@rov/ui/components/tabs'
import { CheckCircle2, Clock, Mail, Plus, Users } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'
import { authClient } from '@/lib/auth-client'

export default function MySocietiesPage() {
  const { data: organizations, isPending: isLoadingOrgs } =
    authClient.useListOrganizations()

  // Separate societies into categories
  const { joined, invited, requested } = useMemo(() => {
    const joinedSocieties = organizations ?? []
    const invitedSocieties: Array<{
      id: string
      name: string
      organizationId: string
      role: string
      expiresAt: Date
    }> = []
    const requestedSocieties: Array<{
      id: string
      name: string
      organizationId: string
    }> = []

    // TODO: Fetch actual invitations for the user's email
    // This would require a backend endpoint that queries invitations by email
    // For now, we'll show an empty state for invitations

    return {
      joined: joinedSocieties,
      invited: invitedSocieties,
      requested: requestedSocieties
    }
  }, [organizations])

  if (isLoadingOrgs) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Skeleton className="mb-2 h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="mt-2 h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-2 font-bold text-3xl">My Societies</h1>
          <p className="text-muted-foreground">
            Manage your societies, invitations, and join requests
          </p>
        </div>
        <Button asChild>
          <Link href="/spaces/societies/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Society
          </Link>
        </Button>
      </div>

      <Tabs className="w-full" defaultValue="joined">
        <TabsList>
          <TabsTrigger value="joined">
            <Users className="mr-2 h-4 w-4" />
            Joined ({joined.length})
          </TabsTrigger>
          <TabsTrigger value="invited">
            <Mail className="mr-2 h-4 w-4" />
            Invited ({invited.length})
          </TabsTrigger>
          <TabsTrigger value="requested">
            <Clock className="mr-2 h-4 w-4" />
            Requested ({requested.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent className="mt-6" value="joined">
          {joined.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 font-semibold text-lg">No societies yet</h3>
                <p className="mb-4 text-center text-muted-foreground">
                  You haven't joined any societies yet. Discover and join
                  societies to get started.
                </p>
                <div className="flex gap-2">
                  <Button asChild variant="outline">
                    <Link href="/spaces/societies/discover/browse-clubs">
                      Browse Societies
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/spaces/societies/create">Create Society</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {joined.map((society) => (
                <Card
                  className="transition-shadow hover:shadow-md"
                  key={society.id}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            alt={society.name}
                            src={
                              (society as { logo?: string })?.logo ?? undefined
                            }
                          />
                          <AvatarFallback>
                            {society.name
                              .split(' ')
                              .map((w) => w[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="line-clamp-1 text-base">
                            {society.name}
                          </CardTitle>
                          <CardDescription className="line-clamp-1">
                            {(society as { description?: string })
                              ?.description ?? 'No description'}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Member
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full" variant="outline">
                      <Link href={`/spaces/societies/mine/${society.id}`}>
                        View Society
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent className="mt-6" value="invited">
          {invited.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Mail className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 font-semibold text-lg">
                  No pending invitations
                </h3>
                <p className="mb-4 text-center text-muted-foreground">
                  You don't have any pending invitations at the moment.
                </p>
                <Button asChild variant="outline">
                  <Link href="/spaces/societies/discover/browse-clubs">
                    Browse Societies
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {invited.map((invitation) => (
                <Card
                  className="transition-shadow hover:shadow-md"
                  key={invitation.id}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {invitation.name
                              .split(' ')
                              .map((w) => w[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="line-clamp-1 text-base">
                            {invitation.name}
                          </CardTitle>
                          <CardDescription>
                            Invited as {invitation.role}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline">
                        <Mail className="mr-1 h-3 w-3" />
                        Invited
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 space-y-2">
                      <p className="text-muted-foreground text-sm">
                        Expires:{' '}
                        {new Date(invitation.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={async () => {
                          // Accept invitation
                          try {
                            await authClient.organization.acceptInvitation({
                              invitationId: invitation.id
                            })
                            // Refresh the page
                            window.location.reload()
                          } catch {
                            // Error handling would be done via toast in production
                          }
                        }}
                      >
                        Accept
                      </Button>
                      <Button size="icon" variant="outline">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent className="mt-6" value="requested">
          {requested.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 font-semibold text-lg">
                  No pending requests
                </h3>
                <p className="mb-4 text-center text-muted-foreground">
                  You don't have any pending join requests at the moment.
                </p>
                <Button asChild variant="outline">
                  <Link href="/spaces/societies/discover/browse-clubs">
                    Browse Societies
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {requested.map((request) => (
                <Card
                  className="transition-shadow hover:shadow-md"
                  key={request.id}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {request.name
                              .split(' ')
                              .map((w) => w[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="line-clamp-1 text-base">
                            {request.name}
                          </CardTitle>
                          <CardDescription>
                            Waiting for approval
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline">
                        <Clock className="mr-1 h-3 w-3" />
                        Pending
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full" variant="outline">
                      <Link href="/spaces/societies/discover/browse-clubs">
                        View Society
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
