'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@rov/ui/components/avatar'
import { Badge } from '@rov/ui/components/badge'
import { Button } from '@rov/ui/components/button'
import { Card, CardContent } from '@rov/ui/components/card'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Users } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export function ClubsTab() {
  const router = useRouter()
  const { data: organizations, isLoading } = useQuery({
    queryFn: async () => {
      const response = await authClient.organization.list()
      if (response.data) {
        return response.data
      }
      if (response.error) {
        throw new Error(response.error.message)
      }
    },
    queryKey: ['organizations', 'list']
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!organizations || organizations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 font-semibold text-lg">No Club Memberships</h3>
            <p className="mb-4 text-muted-foreground text-sm">
              Join clubs to connect with students who share your interests
            </p>
            <Link href="/clubs">
              <Button>
                <Users className="mr-2 h-4 w-4" />
                Discover Clubs
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {organizations.map((org) => (
          <Card
            className="cursor-pointer transition-colors hover:bg-accent"
            key={org.id}
            onClick={() => router.push(`/clubs/${org.slug}`)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 rounded-lg">
                  <AvatarImage alt={org.name} src={org.logo ?? ''} />
                  <AvatarFallback className="rounded-lg">
                    {org.name
                      .split(' ')
                      .map((w: string) => w[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div>
                    <h3 className="font-semibold">{org.name}</h3>
                    {org.slug && (
                      <p className="text-muted-foreground text-xs">
                        @{org.slug}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge className="text-xs" variant="secondary">
                      Member
                    </Badge>
                    {org.metadata && (
                      <Badge className="text-xs" variant="outline">
                        {typeof org.metadata === 'string'
                          ? org.metadata
                          : 'Active'}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-muted-foreground text-xs">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Joined {new Date(org.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Total Clubs</p>
              <p className="font-bold text-2xl">{organizations.length}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Active</p>
              <p className="font-bold text-2xl">{organizations.length}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Leadership Roles</p>
              <p className="font-bold text-2xl">0</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Discover More */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="mb-2 font-semibold">Discover More Clubs</h3>
            <p className="mb-4 text-muted-foreground text-sm">
              Find clubs that match your interests and goals
            </p>
            <Link href="/clubs">
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Browse All Clubs
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
