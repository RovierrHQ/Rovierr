'use client'

import { useCentrifugo } from '@rov/realtime'
import { Button } from '@rov/ui/components/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@rov/ui/components/card'
import { useQuery } from '@tanstack/react-query'
import { format, isToday, isTomorrow, isYesterday } from 'date-fns'
import { CalendarDays, ExternalLink, MapPin } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { client } from '@/utils/orpc'

export function NextEventWidget() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [watchInfo, setWatchInfo] = useState<{
    channelId: string
    resourceId: string
  } | null>(null)

  // Single query that handles everything
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['upcomingEvents', 1], // 1 day = next 24 hours
    queryFn: () =>
      client.calendar.google.getUpcomingEvents({
        days: 1,
        maxResults: 1
      }),
    // Only refetch on window focus (not every 30s)
    refetchOnWindowFocus: true,
    // Optionally refetch when network reconnects
    refetchOnReconnect: true
  })

  // Listen for OAuth callback completion
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'google-calendar-connected') {
        refetch()
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [refetch])

  // Real-time updates via Centrifugo WebSocket
  const { data: session } = authClient.useSession()

  // Fetch Centrifugo connection token for authenticated WebSocket
  const { data: centrifugoAuth } = useQuery({
    queryKey: ['centrifugoToken'],
    queryFn: () => client.realtime.getConnectionToken(),
    enabled: !!session?.user,
    staleTime: 55 * 60 * 1000, // 55 minutes (token expires in 1 hour)
    refetchInterval: 55 * 60 * 1000 // Refresh token before expiry
  })

  const handleCalendarUpdate = useCallback(
    (message: { type: string; timestamp: number }) => {
      if (message.type === 'calendar_updated') {
        refetch()
      }
    },
    [refetch]
  )

  // Subscribe to calendar updates for this user with authenticated connection
  useCentrifugo(
    {
      url:
        process.env.NEXT_PUBLIC_CENTRIFUGO_URL ||
        'ws://localhost:8000/connection/websocket',
      token: centrifugoAuth?.token // Use signed JWT token for security
    },
    session?.user?.id ? `calendar:${session.user.id}` : '',
    handleCalendarUpdate
  )

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      // Use Better Auth's linkSocial to request calendar scopes
      await authClient.linkSocial({
        provider: 'google',
        callbackURL: `${window.location.origin}/auth/callback`,
        scopes: ['https://www.googleapis.com/auth/calendar']
      })

      // After successful connection, setup webhook watch
      setTimeout(async () => {
        try {
          // Setup Google Calendar push notifications for real-time sync
          await client.calendar.google.watchCalendar()
          refetch()
        } catch {
          // Watch setup failed, but calendar is still connected
          refetch()
        }
      }, 1000)
    } catch {
      // Connection failed or was cancelled
    } finally {
      setIsConnecting(false)
    }
  }

  const getDateDisplay = (date: Date) => {
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    if (isYesterday(date)) return 'Yesterday'
    return format(date, 'EEEE, MMMM do')
  }

  const nextEvent = data?.events[0]

  const handleStartWatch = async () => {
    try {
      const result = await client.calendar.google.watchCalendar()
      setWatchInfo({
        channelId: result.channelId || '',
        resourceId: result.resourceId || ''
      })
      alert('Watch started!')
    } catch (error) {
      alert(`Failed to start watch: ${error}`)
    }
  }

  const handleStopWatch = async () => {
    if (!watchInfo) return
    try {
      await client.calendar.google.stopWatchCalendar(watchInfo)
      setWatchInfo(null)
      alert('Watch stopped!')
    } catch (error) {
      alert(`Failed to stop watch: ${error}`)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-medium text-sm">Next Event</CardTitle>
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
          </div>
        ) : (
          <div>
            {data?.hasCalendarAccess ? (
              <div>
                {/* Temporary debug buttons */}
                <div className="mb-4 flex gap-2">
                  <Button onClick={handleStartWatch} variant="outline">
                    Start Watch
                  </Button>
                  <Button
                    disabled={!watchInfo}
                    onClick={handleStopWatch}
                    variant="outline"
                  >
                    Stop Watch
                  </Button>
                  {watchInfo && (
                    <span className="text-green-600 text-xs">● Watching</span>
                  )}
                </div>

                {nextEvent ? (
                  <div className="space-y-2">
                    <div className="font-semibold text-lg">
                      {nextEvent.title}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {getDateDisplay(nextEvent.start)} at{' '}
                      {format(nextEvent.start, 'h:mm a')}
                    </p>
                    {nextEvent.location && (
                      <p className="flex items-start gap-1 text-muted-foreground text-xs">
                        <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                        <span className="line-clamp-1">
                          {nextEvent.location}
                        </span>
                      </p>
                    )}
                    {nextEvent.description && (
                      <p className="mt-1 line-clamp-2 text-muted-foreground text-xs">
                        {nextEvent.description}
                      </p>
                    )}
                    {nextEvent.htmlLink && (
                      <Button
                        asChild
                        className="mt-2 w-full"
                        size="sm"
                        variant="outline"
                      >
                        <a
                          href={nextEvent.htmlLink}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          <ExternalLink className="mr-2 h-3 w-3" />
                          Open in Google Calendar
                        </a>
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No upcoming events found
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">
                  Connect your calendar to see upcoming events
                </p>
                <Button
                  className="w-full"
                  disabled={isConnecting}
                  onClick={handleConnect}
                  size="sm"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {isConnecting ? 'Connecting...' : 'Connect Google Calendar'}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
