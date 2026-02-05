import { Card, CardContent, CardHeader } from '@rov/ui/components/card'
import { Skeleton } from '@rov/ui/components/skeleton'

export function ProfileHeroSkeleton() {
  return (
    <div className="-mx-4 -mt-6 relative overflow-x-hidden">
      {/* Full-width Hero Banner Skeleton */}
      <div className="relative h-64 w-full overflow-hidden">
        <Skeleton className="h-full w-full rounded-xl" />
        {/* Blur overlay near bottom */}
        <div className="absolute right-0 bottom-0 left-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      {/* Content Container */}
      <div className="-mt-20 relative px-4 sm:px-6">
        <div className="flex flex-col gap-6">
          {/* Stack vertically on mobile, horizontal on larger screens */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
            {/* Avatar skeleton */}
            <div className="relative flex-shrink-0">
              <Skeleton className="h-28 w-28 rounded-full sm:h-40 sm:w-40" />
            </div>

            {/* Name, Bio and Badges skeleton */}
            <div className="w-full flex-1 space-y-3 pt-0 text-center sm:space-y-4 sm:pt-6 sm:text-left">
              {/* Name & Bio */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <Skeleton className="h-8 w-48 sm:h-9" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="mx-auto h-4 w-64 sm:mx-0" />
              </div>

              {/* Badges skeleton */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>

              {/* Handle skeleton */}
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-7 w-7 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function TabContentSkeleton() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    </div>
  )
}

export function ProfilePageSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>

      <main className="mx-auto max-w-2xl space-y-6 py-6">
        <ProfileHeroSkeleton />
        <div className="px-4">
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="px-4">
          <TabContentSkeleton />
        </div>
      </main>
    </div>
  )
}
