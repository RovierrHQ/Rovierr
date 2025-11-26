'use client'

import { Badge } from '@rov/ui/components/badge'
import { Button } from '@rov/ui/components/button'
import { Card, CardContent } from '@rov/ui/components/card'
import { useInfiniteQuery } from '@tanstack/react-query'
import {
  Activity,
  Calendar,
  MessageSquare,
  Trophy,
  UserPlus
} from 'lucide-react'
import { orpc } from '@/utils/orpc'

const activityIcons = {
  post: MessageSquare,
  comment: MessageSquare,
  join: UserPlus,
  event: Calendar,
  achievement: Trophy
}

const activityColors = {
  post: 'text-blue-600',
  comment: 'text-green-600',
  join: 'text-purple-600',
  event: 'text-orange-600',
  achievement: 'text-yellow-600'
}

export function ActivityTab() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ['user', 'profile', 'activity'],
      queryFn: async ({ pageParam = 0 }) => {
        return await orpc.user.profile.activity.call({
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const allActivities = data?.pages.flatMap((page) => page.activities) ?? []

  if (allActivities.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Activity className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 font-semibold text-lg">No Activity Yet</h3>
            <p className="text-muted-foreground text-sm">
              Start engaging with clubs and events to see your activity here
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {allActivities.map((activity) => {
        const Icon = activityIcons[activity.type as keyof typeof activityIcons]
        const colorClass =
          activityColors[activity.type as keyof typeof activityColors]

        return (
          <Card key={activity.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className={`rounded-full bg-muted p-3 ${colorClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{activity.title}</h3>
                      {activity.description && (
                        <p className="text-muted-foreground text-sm">
                          {activity.description}
                        </p>
                      )}
                    </div>
                    <Badge className="shrink-0 text-xs" variant="outline">
                      {activity.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <Calendar className="h-3 w-3" />
                    <span>{activity.timestamp.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
            variant="outline"
          >
            {isFetchingNextPage ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  )
}
