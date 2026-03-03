'use client'

import { Button } from '@rov/ui/components/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@rov/ui/components/card'
import { authClient } from '@web/lib/auth-client'
import { CalendarDays, ExternalLink } from 'lucide-react'
import { useState } from 'react'

export function NextEventWidget() {
  const [isConnecting, setIsConnecting] = useState(false)
  const { data: session } = authClient.useSession()

  const handleConnect = async () => {
    if (!session?.user?.id) return

    setIsConnecting(true)
    try {
      // TODO: Implement actual calendar connection when API is available
      // For now, just show a placeholder
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch {
      // Connection failed or was cancelled
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-medium text-sm">Next Event</CardTitle>
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">
            Connect your calendar to see upcoming events
          </p>
          <Button
            className="w-full"
            disabled={isConnecting || !session?.user?.id}
            onClick={handleConnect}
            size="sm"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            {isConnecting ? 'Connecting...' : 'Connect Google Calendar'}
          </Button>
          {!session?.user?.id && (
            <p className="text-muted-foreground text-xs text-center">
              Please log in to connect your calendar
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
