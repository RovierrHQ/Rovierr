import { buttonVariants } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import { Skeleton } from '@rov/ui/components/skeleton'
import { cn } from '@rov/ui/lib/utils'
import { createFileRoute, Link } from '@tanstack/react-router'
import { authClient } from '@web/lib/auth-client'
import {
  Calendar,
  ChevronRight,
  Compass,
  Home,
  Plus,
  TrendingUp,
  Users
} from 'lucide-react'

export const Route = createFileRoute('/spaces/societies/')({
  component: SocietiesIndex
})

function SocietiesIndex() {
  const { data: organizations, isPending } = authClient.useListOrganizations()

  if (isPending) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Societies</h1>
            <p className="text-muted-foreground">
              Manage your societies and discover new ones
            </p>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card className="p-6" key={`stats-skeleton-${i}`}>
              <Skeleton className="mb-2 h-8 w-8" />
              <Skeleton className="mb-1 h-6 w-20" />
              <Skeleton className="h-4 w-16" />
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <Skeleton className="mb-4 h-6 w-32" />
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    className="flex items-center gap-4"
                    key={`society-skeleton-${i}`}
                  >
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="mb-1 h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div>
            <Card className="p-6">
              <Skeleton className="mb-4 h-6 w-24" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    className="flex items-center gap-3"
                    key={`activity-skeleton-${i}`}
                  >
                    <Skeleton className="h-8 w-8 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const joinedCount = organizations?.length || 0
  const activeSocieties = organizations?.slice(0, 3) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Societies</h1>
          <p className="text-muted-foreground">
            Manage your societies and discover new ones
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            className={cn(buttonVariants({ variant: 'outline' }))}
            to="/spaces/societies/discover/browse-clubs"
          >
            <Compass className="mr-2 h-4 w-4" />
            Discover
          </Link>
          <Link
            className={cn(buttonVariants({}))}
            to="/spaces/societies/create"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Society
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{joinedCount}</p>
              <p className="text-sm text-muted-foreground">Joined Societies</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">Active This Week</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold">5</p>
              <p className="text-sm text-muted-foreground">Upcoming Events</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2">
            <Home className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-2xl font-bold">Campus Feed</p>
              <p className="text-sm text-muted-foreground">24 New Posts</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Your Societies */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your Societies</h2>
              <Link
                className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
                to="/spaces/societies/mine"
              >
                View all
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {activeSocieties.length > 0 ? (
              <div className="space-y-4">
                {activeSocieties.map((society) => (
                  <div
                    className="flex items-center gap-4 rounded-lg border p-4"
                    key={society.id}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Users className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{society.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {society.memberCount || 0} members
                      </p>
                    </div>
                    <Link
                      className={cn(
                        buttonVariants({ variant: 'outline', size: 'sm' })
                      )}
                      to={
                        `/spaces/societies/mine/${society.id}` as `/spaces/societies/mine/${string}`
                      }
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-semibold">No societies yet</h3>
                <p className="text-muted-foreground">
                  Join or create a society to get started
                </p>
                <div className="mt-4 flex gap-2 justify-center">
                  <Link
                    className={cn(buttonVariants({ variant: 'outline' }))}
                    to="/spaces/societies/discover/browse-clubs"
                  >
                    Browse Societies
                  </Link>
                  <Link
                    className={cn(buttonVariants({}))}
                    to="/spaces/societies/create"
                  >
                    Create Society
                  </Link>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                className={cn(
                  buttonVariants({ variant: 'ghost' }),
                  'w-full justify-start'
                )}
                to="/spaces/societies/campus-feed"
              >
                <Home className="mr-2 h-4 w-4" />
                Campus Feed
              </Link>
              <Link
                className={cn(
                  buttonVariants({ variant: 'ghost' }),
                  'w-full justify-start'
                )}
                to="/spaces/societies/discover/events"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Browse Events
              </Link>
              <Link
                className={cn(
                  buttonVariants({ variant: 'ghost' }),
                  'w-full justify-start'
                )}
                to="/spaces/societies/discover/network"
              >
                <Users className="mr-2 h-4 w-4" />
                Network
              </Link>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="text-sm">New event posted in Tech Club</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <div className="flex-1">
                  <p className="text-sm">You joined Photography Society</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <div className="flex-1">
                  <p className="text-sm">Career Fair tomorrow</p>
                  <p className="text-xs text-muted-foreground">2 days ago</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
