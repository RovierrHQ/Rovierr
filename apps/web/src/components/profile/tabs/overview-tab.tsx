'use client'

import { Badge } from '@rov/ui/components/badge'
import { Button } from '@rov/ui/components/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@rov/ui/components/card'
import { Link } from '@tanstack/react-router'
import api, { useQuery } from '@web/lib/api-client'
import { Activity, BookOpen, Calendar, TrendingUp, Users } from 'lucide-react'

type Organization = {
  id: string
  name: string
  slug: string | null
  logo: string | null
  createdAt: string
  metadata: unknown
}

type Enrollment = {
  id: string
  isPrimary: boolean
  startedOn: string | null
  graduatedOn: string | null
  studentStatusVerified: boolean
  program: {
    name: string
    degreeLevel: string
  }
  university: {
    name: string
  }
}

type AcademicData = {
  enrollments: Enrollment[]
}

type ActivityItem = {
  id: string
  type: string
  title: string
  description: string | null
  timestamp: string | Date
}

type ActivityData = {
  activities: ActivityItem[]
  total: number
}

export function OverviewTab() {
  const { data: profileInfo } = useQuery({
    queryKey: ['user', 'profile', 'details'],
    queryFn: () => api.user.profile.details.get()
  })

  const { data: academicData } = useQuery<AcademicData>({
    queryKey: ['user', 'profile', 'academic'],
    queryFn: async () => {
      const res = await api.user.profile.academic.get()
      return res as unknown as AcademicData
    }
  })

  const { data: activityData } = useQuery<ActivityData>({
    queryKey: ['user', 'profile', 'activity', 'overview'],
    queryFn: async () => {
      const res = await api.user.profile.activity.get({
        query: { limit: 5, offset: 0 }
      })
      return res as unknown as ActivityData
    }
  })

  const { data: organizations } = useQuery<Organization[]>({
    queryKey: ['organizations', 'list'],
    queryFn: async () => {
      const res = await api.organizations.list.get()
      return res as unknown as Organization[]
    }
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
                    Started{' '}
                    {new Date(primaryEnrollment.startedOn).toLocaleDateString()}
                  </p>
                )}
              </div>
              <Link href="/profile" search={{ tab: 'academics' }}>
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
            <Link href="/profile" search={{ tab: 'activity' }}>
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
                      {new Date(activity.timestamp).toLocaleDateString()}
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
    </div>
  )
}
