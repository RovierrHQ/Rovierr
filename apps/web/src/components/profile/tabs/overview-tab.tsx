'use client'

import { Badge } from '@rov/ui/components/badge'
import { Button } from '@rov/ui/components/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@rov/ui/components/card'
import { useQuery } from '@tanstack/react-query'
import { Activity, BookOpen, Calendar, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'
import { orpc } from '@/utils/orpc'

export function OverviewTab() {
  const { data: profileInfo } = useQuery(orpc.user.profile.info.queryOptions())
  const { data: academicData } = useQuery(
    orpc.user.profile.academic.queryOptions()
  )
  const { data: activityData } = useQuery({
    ...orpc.user.profile.activity.queryOptions({ limit: 5, offset: 0 }),
    queryKey: ['user', 'profile', 'activity', 'overview']
  })
  const { data: organizations } = useQuery({
    queryFn: () => {
      // TODO: Replace with proper organization list endpoint when available
      return Promise.resolve([])
    },
    queryKey: ['organizations', 'list']
  })

  const primaryEnrollment = academicData?.enrollments.find((e) => e.isPrimary)
  const clubCount = organizations?.length ?? 0
  const activityCount = activityData?.total ?? 0

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Clubs Joined</p>
                <p className="font-bold text-2xl">{clubCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-accent/10 p-3">
                <Activity className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Activities</p>
                <p className="font-bold text-2xl">{activityCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-chart-2/10 p-3">
                <TrendingUp className="h-6 w-6 text-chart-2" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Engagement</p>
                <p className="font-bold text-2xl">
                  {profileInfo?.studentStatusVerified ? 'High' : 'Low'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Primary Enrollment */}
      {primaryEnrollment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Current Program
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div>
                  <h3 className="font-semibold text-lg">
                    {primaryEnrollment.program.name}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {primaryEnrollment.university.name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {primaryEnrollment.program.degreeLevel}
                  </Badge>
                  {primaryEnrollment.studentStatusVerified && (
                    <Badge className="bg-green-500/10 text-green-600">
                      Verified
                    </Badge>
                  )}
                </div>
                {primaryEnrollment.startedOn && (
                  <p className="text-muted-foreground text-sm">
                    Started {primaryEnrollment.startedOn.toLocaleDateString()}
                  </p>
                )}
              </div>
              <Link href="/profile?tab=academics">
                <Button size="sm" variant="outline">
                  View Details
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <Link href="/profile?tab=activity">
              <Button size="sm" variant="ghost">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {activityData && activityData.activities.length > 0 ? (
            <div className="space-y-3">
              {activityData.activities.map((activity) => (
                <div
                  className="flex items-start gap-3 rounded-lg border p-3"
                  key={activity.id}
                >
                  <div className="rounded-full bg-primary/10 p-2">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium text-sm">{activity.title}</p>
                    {activity.description && (
                      <p className="text-muted-foreground text-xs">
                        {activity.description}
                      </p>
                    )}
                    <p className="text-muted-foreground text-xs">
                      {activity.timestamp.toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className="text-xs" variant="outline">
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Activity className="mx-auto mb-2 h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground text-sm">
                No recent activity
              </p>
              <p className="text-muted-foreground text-xs">
                Start engaging with clubs and events to see your activity here
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <Link href="/profile?tab=about">
              <Button className="w-full justify-start" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </Link>
            <Link href="/profile?tab=clubs">
              <Button className="w-full justify-start" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Browse Clubs
              </Button>
            </Link>
            <Link href="/profile?tab=academics">
              <Button className="w-full justify-start" variant="outline">
                <BookOpen className="mr-2 h-4 w-4" />
                Academic Info
              </Button>
            </Link>
            <Link href="/profile?tab=settings">
              <Button className="w-full justify-start" variant="outline">
                <Activity className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
