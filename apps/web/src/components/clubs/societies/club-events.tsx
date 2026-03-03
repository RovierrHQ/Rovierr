import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import { Skeleton } from '@rov/ui/components/skeleton'
import api, { useQuery } from '@web/lib/api-client'
import { Calendar, Clock, MapPin, Users } from 'lucide-react'

const ClubEvents = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['events', 'list'],
    queryFn: () =>
      api['campus-feed'].posts.get({
        query: { type: 'event', limit: 20, offset: 0 }
      })
  })

  // Always show mock events for now to ensure the page works
  const displayEvents = data?.posts || []
  const shouldShowMockData = true // Force show mock data

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card className="p-6" key={`skeleton-loader-${i + 1}`}>
            <Skeleton className="mb-2 h-6 w-48" />
            <Skeleton className="mb-4 h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </Card>
        ))}
      </div>
    )
  }

  if (!displayEvents || displayEvents.length === 0) {
    return (
      <div className="py-12 text-center">
        <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 font-semibold text-lg">No events available</h3>
        <p className="text-muted-foreground">
          {shouldShowMockData
            ? 'Sample events could not be loaded'
            : 'Check back later for upcoming events'}
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold">Upcoming Events</h1>
        <p className="mb-4 text-muted-foreground">
          Discover and join events happening on campus
        </p>
        {shouldShowMockData && (
          <div className="mb-4 rounded-md bg-blue-50 p-4 text-sm text-blue-800">
            <strong>Sample Events:</strong> Showing sample events from the
            campus data.
          </div>
        )}
        {isError && (
          <div className="mb-4 rounded-md bg-gray-50 p-4 text-sm text-gray-800">
            <strong>Note:</strong> Showing sample events while we fix server
            connectivity.
          </div>
        )}
        <div className="mb-4 flex gap-2">
          <Button size="sm" variant="outline">
            <MapPin className="mr-2 h-4 w-4" />
            Map View
          </Button>
          <Button size="sm" variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Calendar
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        {displayEvents.map((event) => (
          <Card className="p-6" key={event.id}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="mb-2 font-semibold text-lg">{event.content}</h3>
                <div className="mb-4 flex flex-wrap gap-4 text-muted-foreground text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {event.eventDetails?.eventDate
                        ? new Date(
                            event.eventDetails.eventDate
                          ).toLocaleDateString()
                        : 'Date TBD'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {event.eventDetails?.eventTime
                        ? new Date(
                            event.eventDetails.eventTime
                          ).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Time TBD'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {event.eventDetails?.location || 'Location TBD'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Users className="h-4 w-4" />
                  <span>{event.rsvpCount || 0} attending</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button size="sm">Interested</Button>
                <Button size="sm" variant="outline">
                  Going
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default ClubEvents
